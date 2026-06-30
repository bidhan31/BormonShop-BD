import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "@/lib/CartContext";
import { AuthProvider } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";

// Inter for body text, Poppins for display/headings — both self-hosted via next/font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BormonShop BD | Premium Bangladeshi Fashion",
    template: "%s | BormonShop BD",
  },
  description:
    "Shop premium t-shirts, shirts, pants, and hoodies. Curated fashion, delivered across Bangladesh. Cash on Delivery & online payment available.",
  keywords: ["BormonShop BD", "clothing Bangladesh", "premium fashion BD", "t-shirts Dhaka"],
  openGraph: {
    title: "BormonShop BD | Premium Bangladeshi Fashion",
    description: "Curated premium clothing, delivered across Bangladesh.",
    type: "website",
    locale: "en_BD",
  },
};

import { ThemeProvider } from "./ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning is needed because next-themes updates the class attribute on html
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans bg-primary text-ink antialiased`}
      >
        <ThemeProvider>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            <AuthProvider>
              <CartProvider>
                <Navbar />
                {children}
                <Footer />
                <CartDrawer />
              </CartProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
