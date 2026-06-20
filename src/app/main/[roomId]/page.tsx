import { ACCESS_TOKEN_COOKIE_NAME } from "@/api/fetch";
import VoiceChatRoom from "@/components/chat/voice-chat-room";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type MainPageProps = {
  params: Promise<{
    roomId: string;
  }>;
};

const getSocketUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_BASE_URL ??
    "http://localhost:8080"
  ).replace(/\/$/, "");
};

export default async function Main({ params }: MainPageProps) {
  const { roomId } = await params;
  const parsedRoomId = Number(roomId);
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (!accessToken || !Number.isInteger(parsedRoomId)) {
    redirect("/sign-in?error=로그인이 필요합니다.");
  }

  return (
    <div className="flex flex-col gap-32 items-center">
      <VoiceChatRoom
        roomId={parsedRoomId}
        accessToken={accessToken}
        socketUrl={getSocketUrl()}
      />
    </div>
  );
}
