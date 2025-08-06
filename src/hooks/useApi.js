// This file is deprecated - Firebase services handle API calls directly
// Keeping for backward compatibility but functionality moved to firebaseService.js

export default function useApi() {
  console.warn('useApi is deprecated - use Firebase services directly');
  
  return {
    apiCall: () => {
      throw new Error('useApi is deprecated - use Firebase services directly');
    },
    loading: false,
    error: null
  };
} 