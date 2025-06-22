// app/api/get-balance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAccountBalance } from '@/lib/stellar'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, network = 'testnet' } = body

    // Validate input
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    if (!address.startsWith('G') || address.length !== 56) {
      return NextResponse.json(
        { error: 'Invalid Stellar address format' },
        { status: 400 }
      )
    }

    console.log(`Fetching balance for ${address} on ${network}`)

    // Get account balance from Stellar
    const result = await getAccountBalance(address, network)

    if (result.error) {
      return NextResponse.json(
        { 
          error: result.error,
          xlm: '0',
          mint: '0'
        },
        { status: 200 } // Don't error on account not found
      )
    }

    return NextResponse.json({
      success: true,
      xlm: result.xlm,
      mint: result.mint,
      address,
      network
    })

  } catch (error) {
    console.error('Balance API error:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to fetch balance',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}