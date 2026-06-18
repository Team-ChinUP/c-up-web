"use server";

import { getApiErrorMessage } from "@/api/error";
import { getWebBaseUrl } from "@/api/fetch";
import type { ActionResult, ApiResponse, Gender, SignUpRequestDto } from "@/api/types";

const getFormValue = (formData: FormData, key: keyof SignUpRequestDto | "passwordConfirm") => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const normalizeGender = (value: string): Gender | null => {
  if (value === "MALE" || value === "남자") {
    return "MALE";
  }

  if (value === "FEMALE" || value === "여자") {
    return "FEMALE";
  }

  return null;
};

export default async function SignUpAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const gender = normalizeGender(getFormValue(formData, "gender"));
  const password = getFormValue(formData, "password");
  const passwordConfirm = getFormValue(formData, "passwordConfirm");

  if (!gender) {
    return {
      state: false,
      message: "성별은 MALE/FEMALE 또는 남자/여자로 입력해주세요.",
    };
  }

  if (password !== passwordConfirm) {
    return {
      state: false,
      message: "비밀번호가 일치하지 않습니다.",
    };
  }

  const payload: SignUpRequestDto = {
    email: getFormValue(formData, "email"),
    password,
    name: getFormValue(formData, "name"),
    gender,
  };

  if (!payload.email || !payload.name || !payload.password) {
    return {
      state: false,
      message: "필수 값(email, name, password)을 입력해주세요.",
    };
  }

  try {
    const baseUrl = await getWebBaseUrl();
    const response = await fetch(`${baseUrl}/api/auth/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = (await response.json()) as ApiResponse<null>;

    return {
      state: response.ok,
      message: response.ok
        ? result.message
        : getApiErrorMessage(result, undefined, "회원가입에 실패했습니다."),
    };
  } catch (error) {
    return {
      state: false,
      message: getApiErrorMessage(undefined, error, "회원가입에 실패했습니다."),
    };
  }
}
