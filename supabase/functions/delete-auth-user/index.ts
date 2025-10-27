import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

type DeleteAuthUserRequest = {
  userId?: string
}

const DEFAULT_ALLOWED_ORIGINS = ['https://nailglow.app', 'https://www.nailglow.app'] as const

const normalizeOrigin = (origin: string) => {
  try {
    const url = new URL(origin)
    return `${url.protocol}//${url.host}`
  } catch {
    return origin.replace(/\/?$/, '')
  }
}

const allowNativeClients = Deno.env.get('ACCOUNT_DELETE_ALLOW_NATIVE') !== 'false'

const allowedOrigins = (() => {
  const raw = Deno.env.get('ACCOUNT_DELETE_ALLOWED_ORIGINS')
  const defaults = DEFAULT_ALLOWED_ORIGINS.map((origin) => normalizeOrigin(origin))
  if (!raw) {
    console.warn('ACCOUNT_DELETE_ALLOWED_ORIGINS not set; using default production origins')
    return defaults
  }
  const parsed = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
    .map((origin) => normalizeOrigin(origin))
  if (!parsed.length) {
    console.warn('ACCOUNT_DELETE_ALLOWED_ORIGINS resolved to empty list; falling back to defaults')
    return defaults
  }
  return Array.from(new Set(parsed))
})()

const isOriginAllowed = (origin: string | null) => {
  if (!origin) {
    return allowNativeClients
  }
  try {
    const normalized = normalizeOrigin(origin)
    return allowedOrigins.includes(normalized)
  } catch {
    return false
  }
}

const resolveAllowOrigin = (origin: string | null) => {
  if (!origin) {
    return allowNativeClients ? '' : ''
  }
  const normalized = normalizeOrigin(origin)
  return allowedOrigins.includes(normalized) ? normalized : ''
}

const buildCorsHeaders = (origin: string | null, includeOrigin = true): Record<string, string> => {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  }

  if (includeOrigin) {
    const resolved = resolveAllowOrigin(origin)
    if (resolved) {
      headers['Access-Control-Allow-Origin'] = resolved
    }
  }

  return headers
}

const jsonResponse = (
  status: number,
  payload: Record<string, unknown>,
  origin: string | null,
  includeOrigin = true,
) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...buildCorsHeaders(origin, includeOrigin),
      'Content-Type': 'application/json',
    },
  })

serve(async (req) => {
  const origin = req.headers.get('Origin')
  const originAllowed = isOriginAllowed(origin)

  if (req.method === 'OPTIONS') {
    if (!originAllowed) {
      return new Response('Origin not allowed', {
        status: 403,
        headers: buildCorsHeaders(origin, false),
      })
    }
    return new Response('ok', { headers: buildCorsHeaders(origin) })
  }

  if (!originAllowed) {
    console.warn('delete-auth-user rejected request from disallowed origin', origin)
    return jsonResponse(403, { error: 'origin_not_allowed' }, origin, false)
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'method_not_allowed' }, origin)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    console.error('delete-auth-user missing configuration', {
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasServiceRoleKey: Boolean(serviceRoleKey),
      hasAnonKey: Boolean(anonKey),
    })
    return jsonResponse(500, { error: 'server_config_missing' }, origin)
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader) {
    return jsonResponse(401, { error: 'missing_authorization' }, origin)
  }

  let body: DeleteAuthUserRequest | null = null
  try {
    body = (await req.json()) as DeleteAuthUserRequest
  } catch {
    body = null
  }

  if (!body?.userId) {
    return jsonResponse(400, { error: 'missing_user_id' }, origin)
  }

  const supabaseUserClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  })

  const { data: userData, error: getUserError } = await supabaseUserClient.auth.getUser()

  if (getUserError || !userData?.user) {
    console.error('delete-auth-user could not retrieve user from token', getUserError)
    return jsonResponse(401, { error: 'unauthorized' }, origin)
  }

  if (userData.user.id !== body.userId) {
    return jsonResponse(403, { error: 'forbidden' }, origin)
  }

  const supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { error: deleteError } = await supabaseAdminClient.auth.admin.deleteUser(userData.user.id)

  if (deleteError) {
    console.error('delete-auth-user failed to delete auth user', deleteError)
    return jsonResponse(500, { error: 'delete_failed' }, origin)
  }

  return jsonResponse(200, { success: true }, origin)
})
