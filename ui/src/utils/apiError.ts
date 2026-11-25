import axios from 'axios';

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as { error?: string } | undefined;
    return apiError?.error || fallback;
  }

  return fallback;
};
