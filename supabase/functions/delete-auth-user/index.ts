import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type DeleteAuthUserRequest = {
  userId?: string;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    console.error('Missing Supabase configuration for delete-auth-user function.');
    return new Response('Server configuration error', { status: 500, headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader) {
    return new Response('Missing authorization', { status: 401, headers: corsHeaders });
  }

  const body = (await req.json().catch(() => null)) as DeleteAuthUserRequest | null;
  const requestedUserId = body?.userId;

  if (!requestedUserId) {
    return new Response('Missing userId', { status: 400, headers: corsHeaders });
  }

  const supabaseUserClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });

  const {
    data: { user },
    error: getUserError,
  } = await supabaseUserClient.auth.getUser();

  if (getUserError || !user) {
    console.error('Could not retrieve user from access token:', getUserError);
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  if (user.id !== requestedUserId) {
    return new Response('Forbidden', { status: 403, headers: corsHeaders });
  }

  const supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error: deleteError } = await supabaseAdminClient.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error('Failed to delete auth user:', deleteError);
    return new Response('Failed to delete user', { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
});
