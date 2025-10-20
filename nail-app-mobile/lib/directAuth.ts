import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';

// Direct authentication API calls bypassing Supabase client issues

export async function directSignUp(email: string, password: string, metadata?: any) {
  if (__DEV__) {
    console.log('Direct signup attempt');
  }
  
  // Create a promise that will timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout after 10s')), 10000);
  });
  
  // Create the fetch promise
  const fetchPromise = fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      email,
      password,
      data: metadata,
    }),
  });
  
  try {
    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
    
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
    
    if (__DEV__) {
      console.log('Direct signup response status:', response.status);
    }
    
    if (!response.ok) {
      throw new Error(data.msg || data.error_description || data.message || 'Signup failed');
    }
    
    return { data, error: null };
  } catch (error: any) {
    if (__DEV__) {
      console.error('Direct signup error:', error.message);
    }
    return { data: null, error: error.message };
  }
}

export async function directSignIn(email: string, password: string) {
  try {
    if (__DEV__) {
      console.log('Direct signin attempt');
    }
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    
    const data = await response.json();
    
    if (__DEV__) {
      console.log('Direct signin response status:', response.status);
    }
    
    if (!response.ok) {
      throw new Error(data.msg || data.error_description || 'Signin failed');
    }
    
    return { data, error: null };
  } catch (error: any) {
    if (__DEV__) {
      console.error('Direct signin error:', error.message);
    }
    return { data: null, error: error.message };
  }
}