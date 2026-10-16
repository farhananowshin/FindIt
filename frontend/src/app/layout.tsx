import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FindIt — Explainable Multimodal Campus Lost & Found",
  description:
    "AI-powered multimodal lost and found matching system for university campuses. Uses CLIP visual embeddings, Sentence Transformers, and spatiotemporal matching with human-in-the-loop admin verification.",
};

import { AuthProvider } from "../context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
