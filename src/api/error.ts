import type { ApiResponse } from "@/api/types";

const DEFAULT_ERROR_MESSAGE = "알 수 없는 오류가 발생했습니다.";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getUnknownErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (isRecord(error) && typeof error.message === "string" && error.message) {
    return error.message;
  }

  return null;
};

export const getApiErrorMessage = (
  response?: ApiResponse<unknown>,
  error?: unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
) => {
  if (response?.message) {
    return response.message;
  }

  const errorMessage = getUnknownErrorMessage(error);

  if (errorMessage) {
    return errorMessage;
  }

  return fallbackMessage;
};
