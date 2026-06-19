import MotionBox from "@/components/global/motion-box";
import EnterRoomForm from "@/components/room/enter-room-form";

type StartPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function Home({ searchParams }: StartPageProps) {
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-32 items-center">
      <MotionBox />
      <EnterRoomForm errorMessage={params?.error} />
    </div>
  );
}
