
import "./globals.css";
import type { Metadata } from "next";
// Font
import { Inter, Noto_Sans_Thai, Geist } from "next/font/google";
// Components
import Sidebar from "./components/Sidebar";
import { cn } from "@/src/app/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


/* -------------------- Font configuration -------------------- */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoThai = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-thai",
  weight: ["400", "700"],
  display: "swap",
});

/* -------------------- Metadata -------------------- */

export const metadata: Metadata = {
  title: "Admin Carpark",
  description: "Admin Carpark",
};

/* -------------------- Root layout component -------------------- */

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={cn("font-sans", geist.variable)}>
      <body
        className={`${inter.variable} ${notoThai.variable} m-0 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

export default RootLayout;