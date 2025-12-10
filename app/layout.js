import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/provider";
import { Toaster } from "react-hot-toast";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'ShopLux - Online Shopping for Fashion & Electronics',
  description: 'Discover premium fashion items and cutting-edge electronics at ShopLux. Shop the latest trends in clothing, accessories, and technology.',
  keywords: 'online shopping, fashion, electronics, clothing, accessories, technology',

};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Toaster/>
          {children}
        </Providers>
      </body>
    </html>
  );
}
