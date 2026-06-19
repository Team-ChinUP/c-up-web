"use server";

import { getApiErrorMessage } from "@/api/error";
import { getWebBaseUrl, ACCESS_TOKEN_COOKIE_NAME } from "@/api/fetch";
import type { ApiResponse, MyRoomResponseDto } from "@/api/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const getRoomId = (response: ApiResponse<MyRoomResponseDto>) => {
  if ("data" in response && response.data?.roomId) {
    return response.data.roomId;
  }

  return null;
};

const redirectToStartWithError = (message: string): never => {
  redirect(`/start?error=${encodeURIComponent(message)}`);
};

const requestRoom = async (
  method: "GET" | "POST",
  path: "/api/room/me" | "/api/room",
  authorization: string,
) => {
  const baseUrl = await getWebBaseUrl();

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: authorization,
    },
    cache: "no-store",
  });

  return (await response.json()) as ApiResponse<MyRoomResponseDto>;
};

export default async function EnterRoomAction() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!accessToken) {
    redirect(`/sign-in?error=${encodeURIComponent("로그인이 필요합니다.")}`);
  }

  const authorization = `Bearer ${accessToken}`;
  const myRoomResponse = await requestRoom("GET", "/api/room/me", authorization);
  const existingRoomId = getRoomId(myRoomResponse);

  if (existingRoomId) {
    redirect(`/main/${existingRoomId}`);
  }

  const createdRoomResponse = await requestRoom("POST", "/api/room", authorization);
  const createdRoomId = getRoomId(createdRoomResponse);

  if (createdRoomId) {
    redirect(`/main/${createdRoomId}`);
  }

  redirectToStartWithError(
    getApiErrorMessage(createdRoomResponse, undefined, "방 생성에 실패했습니다."),
  );
}
