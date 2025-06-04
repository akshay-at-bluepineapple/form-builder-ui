export function useDelete() {
  const deleteRequest = async (url) => {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to delete');
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { deleteRequest };
}
