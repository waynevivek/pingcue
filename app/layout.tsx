import type { Metadata } from "next";
import { Calistoga, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const calistoga = Calistoga({
  weight: "400",
  variable: "--font-calistoga",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PingCue — Polite Invoice Chasers for Freelancers",
  description:
    "Send payment links by email or WhatsApp? PingCue automatically sends escalating payment reminders so you get paid without an invoicing suite.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${calistoga.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          defer
          src="https://www.ship-or-die.com/hackathon/verify.js"
          data-site="a35f839d5bfd45b002946ef70cb6b46e10a59388"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
