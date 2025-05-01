import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import '../globals.css'
import Sidebar from "@/components/Sidebar";
import { ChatUIProvider } from "@/contexts/ChatUIContext";



export const metadata: Metadata = {
  title: "Instagram",
  description: "This app is created using next js and typescript",

};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (

    <html lang="en">
      <body
  className={`${poppins.className} flex items-start justify-start w-full h-screen`}
  suppressHydrationWarning
>
  <ChatUIProvider>
<Sidebar/>
        {children}
        </ChatUIProvider>
      </body>
    </html>
   
   
  );
}
