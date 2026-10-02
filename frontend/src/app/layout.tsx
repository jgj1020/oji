import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "OJI - 오늘 뭐 하지?",
  description: "조건만 고르면 오늘 하기 좋은 걸 추천해주는 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}<BottomNav /></body>
    </html>
  );
}