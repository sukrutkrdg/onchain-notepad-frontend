'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';

const config = createConfig({
  autoConnect: true,
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {typeof window !== 'undefined' ? (
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <ConnectKitProvider>
                {children}
              </ConnectKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        ) : (
          <div>{children}</div>
        )}
      </body>
    </html>
  );
}