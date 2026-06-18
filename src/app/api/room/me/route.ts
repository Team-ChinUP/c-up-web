import { proxyBackendApi } from "@/api/fetch";

export const GET = async (request: Request) => {
  return proxyBackendApi({
    method: "GET",
    path: "/room/me",
    authorization: request.headers.get("authorization"),
  });
};
