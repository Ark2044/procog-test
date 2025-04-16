import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import UserGuide from "@/components/UserGuide";
import getOrCreateDB from "@/models/server/dbSetup";
import getOrCreateStorage from "@/models/server/storageSetup";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

// Initialize database in development
if (process.env.NODE_ENV === "development") {
  getOrCreateDB().catch(console.error);
  getOrCreateStorage().catch(console.error);
}

export const metadata: Metadata = {
  title: "ProCog - Risk Management",
  description: "Professional risk management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} antialiased`}
        style={{ margin: 0, display: "flex", flexDirection: "column" }}
      >
        <Header />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#ffffff",
              color: "#374151",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
            },
          }}
        />
        {/* Removed min-height and nested flex containers that cause spacing issues */}
        <div style={{ display: "contents" }}>{children}</div>
        <UserGuide position="bottom-right" />
        <Footer />
      </body>
    </html>
  );
}
