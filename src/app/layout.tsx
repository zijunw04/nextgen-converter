import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/navbar";
const inter = Inter({ subsets: ["latin"] });
import { SessionProvider } from "next-auth/react"

export const metadata: Metadata = {
    title: "NextGen Converter",
    description: `Cutting-edge tool designed for effortless conversion of audio, video, and image files. With a user-friendly interface, this converter allows you to drag and drop files for quick processing!`,
    keywords: "image converter, video converter, audio converter, unlimited image converter, unlimited video converter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <meta name="google-site-verification" content="V8lmEvFOdYBlChgR6pYABBZBhI1EFnPb1YuxTTdHXMU" />
            <body suppressHydrationWarning className={inter.className}>
                <SessionProvider>
                    {children}
                </SessionProvider>
            </body>
        </html>
    );
}
