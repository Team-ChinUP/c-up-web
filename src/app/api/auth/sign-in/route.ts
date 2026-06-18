import { proxyBackendApi } from "@/api/fetch";

export const POST = async (request: Request) => {
  return proxyBackendApi({
    method: "POST",
    path: "/auth/sign-in",
    body: await request.text(),
  });
};
