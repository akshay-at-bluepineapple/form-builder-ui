import { useState } from 'react';

export function usePost(url) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const post = async (data) => {
    setLoading(true);
    setError(null);
    console.log(url, data, 'post data and url');
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      console.log(response, 'post response');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'POST request failed');
      }
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { post, loading, error };
}
