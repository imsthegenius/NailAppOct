// Custom fetch implementation for React Native with Supabase
export const customFetch = (url: string, options: RequestInit = {}) => {
  // Ensure headers are properly formatted
  const headers = new Headers(options.headers || {});
  
  // Add default headers if not present
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Create new options with formatted headers
  const newOptions: RequestInit = {
    ...options,
    headers: Object.fromEntries(headers.entries()),
  };
  
  // Log the request for debugging
  console.log('Custom fetch request:', {
    url,
    method: newOptions.method || 'GET',
    headers: newOptions.headers,
  });
  
  // Use global fetch with timeout handling
  return Promise.race([
    fetch(url, newOptions),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 30000)
    )
  ]).catch((error) => {
    console.error('Custom fetch error:', error);
    throw error;
  });
};