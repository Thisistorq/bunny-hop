"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>The Bunny Hop — Spring Cycling Adventure</title>
        <meta
          name="description"
          content="Complete checkpoints across the event route and claim your place on the leaderboard."
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
