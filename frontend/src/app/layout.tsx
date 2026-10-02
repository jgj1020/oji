import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/components/SplashScreen";

export const metadata: Metadata = {
  title: "OJI - 오늘 뭐 하지?",
  description: "상황에 맞는 장소와 활동을 추천하는 OJI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <SplashScreen />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
