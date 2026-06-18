"use server";

import type { ActionResult } from "@/api/types";

export default async function SendTextAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const text = formData.get("text");

  if (typeof text !== "string" || !text.trim()) {
    return {
      state: false,
      message: "메시지를 입력해주세요.",
    };
  }

  return {
    state: true,
    message: "메시지를 전송했습니다.",
  };
}
