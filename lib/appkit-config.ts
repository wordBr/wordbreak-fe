// Reown AppKit + wagmi adapter setup. wagmi is built directly on viem (same team, same
// primitives — useWalletClient()/getWalletClient() return real viem WalletClient objects), so
// it's a layer above the app's existing viem usage rather than a second, unrelated Ethereum
// library. Chosen over the plain-viem-compatible alternative (Privy) because AppKit reuses the
// WalletConnect project ID already configured and gives one unified modal for injected wallets,
// WalletConnect QR pairing, and email/social login.

import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { celo, celoSepolia, type AppKitNetwork } from "@reown/appkit/networks";
import { CHAIN_ID, WC_PROJECT_ID } from "./config";

export const network: AppKitNetwork = CHAIN_ID === 42220 ? celo : celoSepolia;
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [network];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId: WC_PROJECT_ID,
  networks,
});
