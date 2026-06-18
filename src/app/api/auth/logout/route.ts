import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  proxyBackendApi,
} from "@/api/fetch";
import { cookies } from "next/headers";

export const POST = async (request: Request) => {
  const response = await proxyBackendApi({
    method: "POST",
    path: "/auth/logout",
    authorization: request.headers.get("authorization"),
  });

  if (response.ok) {
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_TOKEN_COOKIE_NAME);
    cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
  }

  return response;
};
