import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

type ProxyMethod = "GET" | "POST";

type ProxyOptions = {
  method: ProxyMethod;
  path: string;
  body?: string;
  authorization?: string | null;
};

export const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

const getApiBaseUrl = () => {
  const apiBaseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!apiBaseUrl) {
    throw new Error("API_BASE_URL 또는 NEXT_PUBLIC_API_URL 환경변수를 설정해주세요.");
  }

  return apiBaseUrl.replace(/\/$/, "");
};

export const getWebBaseUrl = async () => {
  const headerStore = await headers();
  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("요청 host 정보를 확인할 수 없습니다.");
  }

  return `${protocol}://${host}`;
};

export const getAccessTokenAuthorization = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  return accessToken ? `Bearer ${accessToken}` : null;
};

export const proxyBackendApi = async ({
  method,
  path,
  body,
  authorization,
}: ProxyOptions) => {
  try {
    const headers = new Headers({
      Accept: "application/json",
    });

    if (body !== undefined) {
      headers.set("Content-Type", "application/json");
    }

    const cookieAuthorization = await getAccessTokenAuthorization();
    const resolvedAuthorization = authorization ?? cookieAuthorization;

    if (resolvedAuthorization) {
      headers.set("Authorization", resolvedAuthorization);
    }

    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const message = await response.text();
    return NextResponse.json(
      {
        status: response.status,
        message,
      },
      { status: response.status },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "API 요청 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        status: 500,
        message,
      },
      { status: 500 },
    );
  }
};
