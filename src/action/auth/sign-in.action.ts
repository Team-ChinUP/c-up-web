"use server";

import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  getWebBaseUrl,
} from "@/api/fetch";
import { getApiErrorMessage } from "@/api/error";
import type {
  ActionResult,
  ApiResponse,
  SignInRequestDto,
  SignInResponseDto,
} from "@/api/types";
import { cookies } from "next/headers";

const getFormValue = (formData: FormData, key: keyof SignInRequestDto) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const isSignInSuccessResponse = (
  response: ApiResponse<SignInResponseDto>,
): response is ApiResponse<SignInResponseDto> & { data: SignInResponseDto } => {
  return "data" in response && Boolean(response.data?.accessToekn && response.data.refreshToken);
};

export default async function SignInAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const payload: SignInRequestDto = {
    email: getFormValue(formData, "email"),
    password: getFormValue(formData, "password"),
  };

  if (!payload.email || !payload.password) {
    return {
      state: false,
      message: "email과 password는 필수입니다.",
    };
  }

  try {
    const baseUrl = await getWebBaseUrl();
    const response = await fetch(`${baseUrl}/api/auth/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = (await response.json()) as ApiResponse<SignInResponseDto>;

    if (!response.ok || !isSignInSuccessResponse(result)) {
      return {
        state: false,
        message: getApiErrorMessage(result, undefined, "로그인에 실패했습니다."),
      };
    }

    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };

    cookieStore.set(ACCESS_TOKEN_COOKIE_NAME, result.data.accessToekn, {
      ...cookieOptions,
      maxAge: 60 * 30,
    });
    cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, result.data.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 14,
    });

    return {
      state: true,
      message: result.message,
    };
  } catch (error) {
    return {
      state: false,
      message: getApiErrorMessage(undefined, error, "로그인에 실패했습니다."),
    };
  }
}
