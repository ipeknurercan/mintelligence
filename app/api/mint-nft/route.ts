// app/api/mint-nft/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createNFTCertificate, checkAccountExists } from '@/lib/stellar'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      recipientAddress, 
      certificateData, 
      network = 'testnet' 
    } = body

    // Validate inputs
    if (!recipientAddress || !certificateData) {
      return NextResponse.json(
        { success: false, error: 'Missing recipientAddress or certificateData' },
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

    // Check if recipient account exists
    console.log(`Checking account for NFT: ${recipientAddress}`)
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

    // Generate unique certificate ID
    const certificateId = Date.now().toString()
    
    // Prepare NFT metadata
    const metadata = {
      name: `Mintelligence Certificate #${certificateId}`,
      description: `Web3 öğrenme sertifikası - ${certificateData.completedQuizzes} quiz tamamlandı`,
      image: `https://your-domain.com/certificates/${certificateId}.png`, // You can generate this
      attributes: [
        {
          trait_type: "Platform",
          value: "Mintelligence"
        },
        {
          trait_type: "Completed Quizzes",
          value: certificateData.completedQuizzes.toString()
        },
        {
          trait_type: "Score",
          value: certificateData.totalScore?.toString() || "Perfect"
        },
        {
          trait_type: "Date Earned",
          value: new Date().toISOString()
        },
        {
          trait_type: "Network",
          value: network
        }
      ]
    }

    // Create NFT certificate
    console.log(`Creating NFT certificate for ${recipientAddress}`)
    const result = await createNFTCertificate(
      recipientAddress, 
      certificateId, 
      metadata, 
      network
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: `NFT certificate successfully created`,
      transactionHash: result.transactionHash,
      certificateId: certificateId,
      assetCode: result.assetCode,
      recipient: recipientAddress,
      metadata: metadata,
      network: network
    })

  } catch (error) {
    console.error('Mint NFT API error:', error)
    
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