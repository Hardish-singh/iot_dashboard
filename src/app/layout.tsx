import type { Metadata } from "next";

import "./globals.css";

import { Lato, Inconsolata } from 'next/font/google';

const lato = Lato({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-lato',
});
const inconsolata = Inconsolata({ 
  subsets: ['latin'], 
  variable: '--font-inconsolata',
});

export const metadata: Metadata = {
  title: "SolarView - Real-Time Solar Device Monitoring",
  description:
    "SolarView is a real-time monitoring dashboard for solar-powered devices. Track power output, voltage, and energy savings with visual analytics, responsive UI, and seamless device integration.",
  keywords:
    "SolarView, Solar Device Monitoring, Real-Time Dashboard, Renewable Energy, IoT, Green Tech, Codestam Technologies, Solar Analytics",
  authors: [{ name: "SolarView", url: "https://iot-dashboard-ahlv.vercel.app/" }],
  openGraph: {
    title: "SolarView - Real-Time Solar Device Monitoring",
    description:
      "SolarView provides a live dashboard to monitor your solar devices. Visualize energy performance with real-time charts and smart analytics, accessible anywhere.",
    url: "https://iot-dashboard-ahlv.vercel.app/",
    siteName: "SolarView",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "SolarView Dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@codestamtech",
    title: "SolarView - Real-Time Solar Device Monitoring",
    description:
      "Track your solar energy performance with SolarView—live updates, beautiful charts, and smart device integration for users and admins.",
    images: ["/logo.png"],
    creator: "@codestamtech",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body
        className={`${lato.variable} ${inconsolata.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
