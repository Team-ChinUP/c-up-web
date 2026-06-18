"use client";

import { toast } from "react-toastify";

const getToastId = (type: string, message: string) => `${type}:${message}`;

const showToast = (
  type: "success" | "error" | "info" | "warning",
  message: string,
) => {
  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    return;
  }

  const toastId = getToastId(type, normalizedMessage);

  if (toast.isActive(toastId)) {
    return;
  }

  toast[type](normalizedMessage, {
    toastId,
  });
};

export const showSuccess = (message: string) => {
  showToast("success", message);
};

export const showError = (message: string) => {
  showToast("error", message);
};

export const showInfo = (message: string) => {
  showToast("info", message);
};

export const showWarning = (message: string) => {
  showToast("warning", message);
};
