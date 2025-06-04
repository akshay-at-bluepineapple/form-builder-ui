import { useState } from 'react';

export const usePut = (url) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const put = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log(response, 'response for put');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'PUT request failed');
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

  return { put, loading, error };
};
