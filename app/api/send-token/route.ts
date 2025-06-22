// app/api/send-token/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sendMintTokens, checkAccountExists } from '@/lib/stellar'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientAddress, amount, network = 'testnet' } = body

    // Validate inputs
    if (!recipientAddress || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing recipientAddress or amount' },
        { status: 400 }
      )
    }

    // Validate network
    if (network !== 'testnet' && network !== 'mainnet') {
      return NextResponse.json(
        { success: false, error: 'Invalid network. Must be testnet or mainnet' },
        { status: 400 }
      )
    }

    // Validate amount
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Check if recipient account exists
    console.log(`Checking account: ${recipientAddress}`)
    const accountCheck = await checkAccountExists(recipientAddress, network)
    
    if (!accountCheck.exists) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Recipient account not found. Please fund your account with XLM first.' 
        },
        { status: 400 }
      )
    }

    if (!accountCheck.funded) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Recipient account needs more XLM for transaction fees.' 
        },
        { status: 400 }
      )
    }

    // Send MINT tokens
    console.log(`Sending ${amount} MINT tokens to ${recipientAddress}`)
    const result = await sendMintTokens(recipientAddress, amount, network)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: `Successfully sent ${amount} MINT tokens`,
      transactionHash: result.transactionHash,
      recipient: recipientAddress,
      amount: amount,
      network: network
    })

  } catch (error) {
    console.error('Send token API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}