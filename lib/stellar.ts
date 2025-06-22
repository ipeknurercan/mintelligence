// lib/stellar.ts
// Önce require ile dene
const StellarSdk = require('stellar-sdk')

// Type definitions for better TypeScript support
interface Balance {
  asset_type: string
  balance: string
  asset_code?: string
  asset_issuer?: string
}

// Stellar network configurations
export const STELLAR_CONFIG = {
  testnet: {
    server: new StellarSdk.Server('https://horizon-testnet.stellar.org'),
    network: StellarSdk.Networks.TESTNET,
    name: 'testnet'
  },
  mainnet: {
    server: new StellarSdk.Server('https://horizon.stellar.org'),
    network: StellarSdk.Networks.PUBLIC,
    name: 'mainnet'
  }
}

// MINT Token Asset Configuration
export const MINT_TOKEN = {
  testnet: {
    code: 'MINT',
    issuer: 'GAOG7VY7G4KCQKUIGX7HBWKL35CQHKP7Q4BBL6Z2ZAOJ2ASGSTJQMVSS', 
    asset: new StellarSdk.Asset('MINT', 'GAOG7VY7G4KCQKUIGX7HBWKL35CQHKP7Q4BBL6Z2ZAOJ2ASGSTJQMVSS')
  },
  mainnet: {
    code: 'MINT',
    // DİKKAT: Mainnet issuer adresi düzeltildi (sonundaki 'ERE' kaldırıldı)
    issuer: 'GAOG7VY7G4KCQKUIGX7HBWKL35CQHKP7Q4BBL6Z2ZAOJ2ASGSTJQMVSS', 
    asset: new StellarSdk.Asset('MINT', 'GAOG7VY7G4KCQKUIGX7HBWKL35CQHKP7Q4BBL6Z2ZAOJ2ASGSTJQMVSS')
  }
}

// Server keypair for signing transactions (KEEP SECRET!)
const SERVER_SECRET = process.env.STELLAR_SERVER_SECRET || ''
const SERVER_KEYPAIR = StellarSdk.Keypair.fromSecret(SERVER_SECRET)

/**
 * Get account balance for a given address
 */
export async function getAccountBalance(address: string, network: 'testnet' | 'mainnet' = 'testnet'): Promise<{
  xlm: string
  mint: string
  error?: string
}> {
  try {
    const server = STELLAR_CONFIG[network].server
    const account: any = await server.loadAccount(address)
    
    let xlmBalance = '0'
    let mintBalance = '0'
    
    // Use any type to avoid TypeScript issues
    const balances = account.balances as Balance[]
    
    balances.forEach((balance: Balance) => {
      if (balance.asset_type === 'native') {
        xlmBalance = balance.balance
      } else if (
        balance.asset_type === 'credit_alphanum4' &&
        balance.asset_code === 'MINT' &&
        balance.asset_issuer === MINT_TOKEN[network].issuer
      ) {
        mintBalance = balance.balance
      }
    })
    
    return { xlm: xlmBalance, mint: mintBalance }
  } catch (error) {
    console.error('Failed to get account balance:', error)
    return { 
      xlm: '0', 
      mint: '0', 
      error: error instanceof Error ? error.message : 'Balance fetch failed'
    }
  }
}

/**
 * Send MINT tokens to a user
 */
export async function sendMintTokens(
  recipientAddress: string, 
  amount: string, 
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{
  success: boolean
  transactionHash?: string
  error?: string
}> {
  try {
    const server = STELLAR_CONFIG[network].server
    const networkPassphrase = STELLAR_CONFIG[network].network
    const mintAsset = MINT_TOKEN[network].asset
    
    // Load server account
    const serverAccount = await server.loadAccount(SERVER_KEYPAIR.publicKey())
    
    // Load recipient account to ensure it exists
    try {
      await server.loadAccount(recipientAddress)
    } catch (error) {
      return { 
        success: false, 
        error: 'Recipient account not found. Please fund the account with XLM first.' 
      }
    }
    
    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(serverAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: networkPassphrase,
    })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: recipientAddress,
        asset: mintAsset,
        amount: amount
      })
    )
    .addMemo(StellarSdk.Memo.text('Mintelligence Quiz Reward'))
    .setTimeout(30)
    .build()
    
    // Sign transaction
    transaction.sign(SERVER_KEYPAIR)
    
    // Submit transaction
    const result = await server.submitTransaction(transaction)
    
    console.log('Token transfer successful:', result.hash)
    
    return {
      success: true,
      transactionHash: result.hash
    }
    
  } catch (error) {
    console.error('Failed to send MINT tokens:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Token transfer failed'
    }
  }
}

/**
 * Create NFT Certificate Asset
 */
export async function createNFTCertificate(
  recipientAddress: string,
  certificateId: string,
  metadata: {
    name: string
    description: string
    image: string
    attributes: Array<{ trait_type: string; value: string }>
  },
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{
  success: boolean
  transactionHash?: string
  assetCode?: string
  error?: string
}> {
  try {
    const server = STELLAR_CONFIG[network].server
    const networkPassphrase = STELLAR_CONFIG[network].network
    
    // Create unique asset code for NFT (max 12 characters)
    const assetCode = `CERT${certificateId}`.substring(0, 12)
    const nftAsset = new StellarSdk.Asset(assetCode, SERVER_KEYPAIR.publicKey())
    
    // Load server account
    const serverAccount = await server.loadAccount(SERVER_KEYPAIR.publicKey())
    
    // Load recipient account
    try {
      await server.loadAccount(recipientAddress)
    } catch (error) {
      return { 
        success: false, 
        error: 'Recipient account not found. Please fund the account with XLM first.' 
      }
    }
    
    // Build transaction to create and send NFT
    const transaction = new StellarSdk.TransactionBuilder(serverAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: networkPassphrase,
    })
    // Send 1 unit of the NFT to recipient
    .addOperation(
      StellarSdk.Operation.payment({
        destination: recipientAddress,
        asset: nftAsset,
        amount: '1'
      })
    )
    // Set home domain for metadata (sadece server account için)
    .addOperation(
      StellarSdk.Operation.setOptions({
        homeDomain: 'mintelligence.app'
      })
    )
    .addMemo(StellarSdk.Memo.text(`NFT Certificate: ${certificateId}`))
    .setTimeout(30)
    .build()
    
    // Sign transaction
    transaction.sign(SERVER_KEYPAIR)
    
    // Submit transaction
    const result = await server.submitTransaction(transaction)
    
    console.log('NFT certificate created:', result.hash)
    
    return {
      success: true,
      transactionHash: result.hash,
      assetCode: assetCode
    }
    
  } catch (error) {
    console.error('Failed to create NFT certificate:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'NFT creation failed'
    }
  }
}

/**
 * Check if account exists and is funded
 */
export async function checkAccountExists(
  address: string, 
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{
  exists: boolean
  funded: boolean
  error?: string
}> {
  try {
    const server = STELLAR_CONFIG[network].server
    const account: any = await server.loadAccount(address)
    
    // Check if account has minimum XLM balance with proper typing
    const balances = account.balances as Balance[]
    const xlmBalance = balances.find((b: Balance) => b.asset_type === 'native')
    const isFunded = xlmBalance && parseFloat(xlmBalance.balance) >= 1
    
    return {
      exists: true,
      funded: !!isFunded
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Account not found')) {
      return {
        exists: false,
        funded: false
      }
    }
    
    return {
      exists: false,
      funded: false,
      error: error instanceof Error ? error.message : 'Account check failed'
    }
  }
}

/**
 * Create trustline for MINT token
 * NOT: Bu fonksiyon frontend'den kullanıcının imzasıyla çağrılmalı
 */
export async function createTrustline(
  userAddress: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Bu fonksiyon frontend'den kullanıcının private key'i ile çağrılmalı
    // Server-side'da kullanıcı adına trustline oluşturamayız
    
    return {
      success: false,
      error: 'Trustline creation must be done from the frontend with user signature'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Trustline creation failed'
    }
  }
}

/**
 * Frontend için trustline oluşturma yardımcı fonksiyonu
 * Bu fonksiyon sadece gerekli bilgileri döner
 */
export function getTrustlineInfo(network: 'testnet' | 'mainnet' = 'testnet') {
  return {
    asset: MINT_TOKEN[network].asset,
    issuer: MINT_TOKEN[network].issuer,
    code: MINT_TOKEN[network].code,
    networkPassphrase: STELLAR_CONFIG[network].network
  }
}