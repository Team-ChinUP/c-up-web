import { proxyBackendApi } from "@/api/fetch";

export const POST = async (request: Request) => {
  return proxyBackendApi({
    method: "POST",
    path: "/auth/reissue",
    body: await request.text(),
  });
};
