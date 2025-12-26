import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "血压追踪器",
  description: "一款用于追踪和分析血压数据的应用。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`min-h-screen font-sans antialiased ${inter.variable}`}
      >
        {children}
      </body>
    </html>
  );
}