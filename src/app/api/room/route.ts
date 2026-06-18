import { proxyBackendApi } from "@/api/fetch";

export const POST = async (request: Request) => {
  return proxyBackendApi({
    method: "POST",
    path: "/room",
    authorization: request.headers.get("authorization"),
  });
};
