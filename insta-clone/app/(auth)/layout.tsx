import type { Metadata } from "next";

import '../globals.css'


export const metadata: Metadata = {
  title: "Login -  Instagram",
  description: "This app is created using next js and typescript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body

        suppressHydrationWarning
      >
        {children}
      </body>
      </html>
  );
}
