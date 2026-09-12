import type { Metadata } from "next";
import "./globals.css";
import "./instrument.css";
import { Manrope } from 'next/font/google';

const interfaceFont = Manrope({subsets:['latin'],weight:['400','500','600','700'],variable:'--font-cardio-ui',display:'swap'});

export const metadata: Metadata = {
  title: "CardioSense — A transparent risk instrument",
  description:
    "Explore the exported Logistic Regression model on UCI Heart Disease inputs, with signed contributions and local browser inference. Research demonstration.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${interfaceFont.variable} bg-cardio-950 text-slate-100 min-h-screen selection:bg-rose-500/30 selection:text-rose-200`}>
        {children}
      </body>
    </html>
  );
}
