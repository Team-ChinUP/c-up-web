import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/header";

const pretendardLight = localFont({
  src: "../../public/fonts/pretendard/Pretendard-Light.woff2",
  variable: "--font-pretendard-light",
  display: "swap",
});

const pretendardSemiBold = localFont({
  src: "../../public/fonts/pretendard/Pretendard-SemiBold.woff2",
  variable: "--font-pretendard-semibold",
  display: "swap",
});


export const metadata: Metadata = {
  title: "C:UP",
  description:
    "C:UP는 AI 음성 대화 서비스로 \'차드\'와 대화하며 긍정적인 삶의 태도를 지닐 수 있게 도와줍니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pretendardLight.variable} ${pretendardSemiBold.variable} h-full antialiased`}
    >
      <body className="bg-background min-h-full flex flex-col font-pretendard-light">
        <header>
          <Header />
        </header>
        <main className="flex flex-col px-160 pt-32">
          {children}
        </main>
      </body>
    </html>
  );
}
