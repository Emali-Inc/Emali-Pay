import type { Metadata } from "next";
import { Inter,IBM_Plex_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"],variable:'--font-inter' });
const ibmPlexSerif = IBM_Plex_Serif({
  subsets:['latin'],
  weight:['700','400'],
  variable:'--font-ibm-plex-serif'
})

//Change the meta data:
export const metadata: Metadata = {
  title: "Emali Pay",
  description: "Emali Pay is modern banking platform for everyone.",
  icons: {
    icon: '/icons/logo.svg'
  }
};

//The Root Layout was created by Nextjs
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*Customizing the style Allowing us to use the font in the entire application**/}
      <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>{children}</body>
    </html>
  );
}
