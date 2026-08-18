import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CardioSense AI — Heart Disease Risk Prediction Station",
  description: "An interactive clinical decision support system for coronary artery disease prediction trained on the 920-patient UCI Heart Disease dataset.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cardio-950 text-slate-100 min-h-screen selection:bg-rose-500/30 selection:text-rose-200">
        {children}
      </body>
    </html>
  );
}
