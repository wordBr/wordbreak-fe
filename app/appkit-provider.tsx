"use client";

import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, cookieToInitialState, type Config } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { wagmiAdapter, networks } from "@/lib/appkit-config";
import { WC_PROJECT_ID } from "@/lib/config";

const queryClient = new QueryClient();

if (WC_PROJECT_ID) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId: WC_PROJECT_ID,
    networks,
    metadata: {
      name: "WordBreak",
      description: "Spell words. Smash bricks. Win cUSD.",
      url: "https://wordbreak-fe.vercel.app",
      icons: ["https://wordbreak-fe.vercel.app/icon.png"],
    },
    features: { email: true, socials: ["google", "x", "discord"], emailShowWallets: true },
    allWallets: "SHOW",
  });
}

export function AppKitProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
