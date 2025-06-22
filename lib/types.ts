// lib/types.ts
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  publicKey: string | null;
  balance: string;
  network: 'testnet' | 'mainnet';
}