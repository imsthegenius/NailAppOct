import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';

// Alternative Supabase connection using XMLHttpRequest

export function signUpWithXHR(
  email: string,
  password: string,
  metadata: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${SUPABASE_URL}/auth/v1/signup`;
    
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (__DEV__) {
          console.log('XHR Status:', xhr.status);
        }
        
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({ data: response, error: null });
          } catch (e) {
            reject(new Error('Invalid response'));
          }
        } else if (xhr.status === 0) {
          reject(new Error('Network request failed - cannot reach server'));
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            resolve({ data: null, error: error.msg || error.error_description || 'Request failed' });
          } catch (e) {
            reject(new Error(`Request failed with status ${xhr.status}`));
          }
        }
      }
    };
    
    xhr.onerror = function() {
      console.error('XHR Network Error');
      reject(new Error('Network request failed'));
    };
    
    xhr.ontimeout = function() {
      console.error('XHR Timeout');
      reject(new Error('Request timeout'));
    };
    
    xhr.timeout = 10000; // 10 second timeout
    
    const body = JSON.stringify({
      email,
      password,
      data: metadata,
    });
    
    console.log('Sending XHR request to Supabase...');
    xhr.send(body);
  });
}