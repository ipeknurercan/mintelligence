'use client'
import { useState, useEffect } from 'react'
import { Wallet, Trophy, BookOpen, Star, Award, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useWalletStore } from '@/stores/wallet-store'

// Toast notification component
const Toast = ({ 
  message, 
  type, 
  onClose 
}: { 
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = {
    success: 'bg-green-500/10 border-green-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-blue-500/10 border-blue-500/20'
  }[type]

  const textColor = {
    success: 'text-green-300',
    error: 'text-red-300', 
    info: 'text-blue-300'
  }[type]

  const Icon = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle
  }[type]

  return (
    <div className={`fixed top-4 right-4 ${bgColor} border rounded-lg p-4 flex items-center space-x-3 z-50 backdrop-blur-sm`}>
      <Icon className={`w-5 h-5 ${textColor}`} />
      <p className={textColor}>{message}</p>
      <button onClick={onClose} className={`${textColor} hover:opacity-70`}>×</button>
    </div>
  )
}

export default function Mintelligence() {
  const {
    isConnected,
    address,
    balance,
    network,
    isLoading,
    error,
    connect,
    disconnect,
    clearError,
    checkConnection
  } = useWalletStore()

  const [tokens, setTokens] = useState(0)
  const [completedCourses, setCompletedCourses] = useState(0)
  const [currentQuiz, setCurrentQuiz] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null)
  const [mintBalance, setMintBalance] = useState('0')
  const [nftCount, setNftCount] = useState(0)

  // Initial connection check
  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  // Update tokens when connected and fetch real balance
  useEffect(() => {
    if (isConnected && address) {
      fetchMintBalance()
    } else {
      setTokens(0)
      setCompletedCourses(0)
      setQuizAnswers({})
      setMintBalance('0')
      setNftCount(0)
    }
  }, [isConnected, address])

  // Fetch real MINT token balance
  const fetchMintBalance = async () => {
    if (!address) return

    try {
      const response = await fetch('/api/get-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address, 
          network: network || 'testnet' 
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMintBalance(data.mint || '0')
        setTokens(parseFloat(data.mint || '0'))
      }
    } catch (error) {
      console.error('Failed to fetch MINT balance:', error)
    }
  }

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connect()
      showToast('Wallet connected successfully!', 'success')
    } catch (error: any) {
      showToast(error.message || 'Wallet connection failed', 'error')
    }
  }

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type })
  }

  // Handle quiz answer with real API calls
  const handleQuizAnswer = async (quizId: number, answerIndex: number, correctIndex: number, reward: number) => {
    if (quizAnswers[quizId] !== undefined) return // Already answered

    setQuizAnswers(prev => ({ ...prev, [quizId]: answerIndex }))

    if (answerIndex === correctIndex) {
      // Correct answer - send real tokens!
      try {
        // Show loading
        alert('🎉 Correct answer! Sending tokens...')
        
        // API call to send real MINT tokens
        const response = await fetch('/api/send-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientAddress: address,
            amount: reward.toString(),
            network: network
          })
        })

        const data = await response.json()

        if (data.success) {
          // Update local state
          setTokens(prev => prev + reward)
          setCompletedCourses(prev => {
            const newCount = prev + 1
            
            // Check if user earned NFT certificate (every 3 quizzes)
            if (newCount % 3 === 0) {
              // Mint NFT certificate
              mintNFTCertificate(newCount)
            }
            
            return newCount
          })
          
          // Success message
          alert(`🚀 Success! ${reward} MINT tokens sent to your wallet!\n\nTransaction: ${data.transactionHash?.slice(0, 8)}...`)
        } else {
          // API error but still update local state for demo
          setTokens(prev => prev + reward)
          setCompletedCourses(prev => prev + 1)
          alert(`⚠️ Token sending issue: ${data.error}\n\nHowever, your local token count has been updated.`)
        }
        
      } catch (error) {
        console.error('Token send error:', error)
        // Still update local state for demo
        setTokens(prev => prev + reward)
        setCompletedCourses(prev => prev + 1)
        alert(`❌ Error occurred during token sending\n\nHowever, your local token count has been updated.`)
      }
    } else {
      // Wrong answer feedback
      setTimeout(() => {
        alert('❌ Wrong answer! Try again. 😔')
      }, 100)
    }
  }

  // NFT Certificate minting function
  const mintNFTCertificate = async (completedCount: number) => {
    try {
      alert(`🏆 Congratulations! You've completed ${completedCount} quizzes!\n\nCreating your NFT certificate...`)
      
      const response = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientAddress: address,
          certificateData: {
            completedQuizzes: completedCount,
            totalScore: tokens + 50 // Current tokens + current reward
          },
          network: network
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`🎖️ NFT Certificate Created!\n\nCertificate ID: ${data.certificateId}\nTransaction: ${data.transactionHash?.slice(0, 8)}...`)
      } else {
        alert(`⚠️ NFT creation issue: ${data.error}`)
      }
      
    } catch (error) {
      console.error('NFT mint error:', error)
      alert(`❌ Error occurred while creating NFT certificate`)
    }
  }

  // Handle NFT minting
  const handleNFTMint = async (certificateNumber: number) => {
    if (!address) return

    showToast('🏆 Minting NFT Certificate...', 'info')

    try {
      const response = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          network: network || 'testnet',
          certificateId: `${Date.now()}-${certificateNumber}`,
          completedQuizzes: completedCourses
        })
      })

      const result = await response.json()

      if (result.success) {
        setNftCount(prev => prev + 1)
        showToast(
          `🎖️ NFT Certificate minted successfully! Asset: ${result.assetCode}`, 
          'success'
        )
      } else {
        showToast(`NFT mint failed: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('NFT mint error:', error)
      showToast('Error occurred during NFT mint', 'error')
    }
  }

  // Demo quiz questions
  const quizzes = [
    {
      id: 1,
      title: "Web3 Fundamentals",
      question: "What is the fundamental characteristic of blockchain?",
      options: ["Centralized structure", "Immutability", "Slow transactions", "Expensive transactions"],
      correct: 1,
      reward: 50
    },
    {
      id: 2,
      title: "What is a Smart Contract?",
      question: "In which language are smart contracts written?",
      options: ["HTML", "Python", "Solidity/Rust", "Java"],
      correct: 2,
      reward: 75
    },
    {
      id: 3,
      title: "NFT Concept",
      question: "What does NFT stand for?",
      options: ["New File Type", "Non-Fungible Token", "Network File Transfer", "Next Finance Tech"],
      correct: 1,
      reward: 100
    },
    {
      id: 4,
      title: "DeFi Protocols",
      question: "What is the main purpose of DeFi?",
      options: ["Centralized finance", "Traditional banking", "Decentralized finance", "Crypto mining"],
      correct: 2,
      reward: 125
    },
    {
      id: 5,
      title: "Stellar Network",
      question: "What is Stellar's native token?",
      options: ["BTC", "ETH", "XLM", "ADA"],
      correct: 2,
      reward: 150
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Mintelligence</h1>
            <span className="text-purple-300 text-sm">Learn Web3 & Earn</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Network Badge */}
            {isConnected && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                network === 'mainnet' 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
              }`}>
                {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
              </span>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            )}

            {/* Connect/Disconnect Button */}
            <button
              onClick={isConnected ? disconnect : handleConnectWallet}
              disabled={isLoading || isProcessing}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Wallet className="w-5 h-5" />
              )}
              <span>
                {isLoading 
                  ? 'Connecting...' 
                  : isConnected 
                    ? `${address?.slice(0,6)}...` 
                    : 'Connect Wallet'
                }
              </span>
            </button>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-300">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300 text-sm underline"
            >
              Close
            </button>
          </div>
        )}

        {/* Dashboard Stats */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <Star className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-white/70 text-sm">MINT Token</p>
                  <p className="text-2xl font-bold text-white">{parseFloat(mintBalance).toFixed(0)}</p>
                  <p className="text-xs text-white/50">From blockchain</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-white/70 text-sm">Completed Quizzes</p>
                  <p className="text-2xl font-bold text-white">{completedCourses}</p>
                  <p className="text-xs text-white/50">Total: {quizzes.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <Award className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-white/70 text-sm">NFT Certificates</p>
                  <p className="text-2xl font-bold text-white">{Math.floor(completedCourses/3)}</p>
                  <p className="text-xs text-white/50">Every 3 quizzes = 1 NFT</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3">
                <Wallet className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-white/70 text-sm">XLM Balance</p>
                  <p className="text-2xl font-bold text-white">{parseFloat(balance).toFixed(2)}</p>
                  <p className="text-xs text-white/50">Native token</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          {!isConnected ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Welcome to the Web3 World!</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Learn blockchain technologies, complete quizzes and earn real rewards. 
                Get MINT tokens and NFT certificates for every achievement!
              </p>
              <button
                onClick={handleConnectWallet}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Wallet className="w-5 h-5" />
                )}
                <span>{isLoading ? 'Connecting...' : 'Start with Freighter'}</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Learn & Earn with Quizzes</h3>
                <div className="text-sm text-white/70">
                  Progress: {completedCourses}/{quizzes.length} Quizzes Completed
                </div>
              </div>
              
              <div className="grid gap-4">
                {quizzes.map((quiz, index) => {
                  const isAnswered = quizAnswers[quiz.id] !== undefined
                  const userAnswer = quizAnswers[quiz.id]
                  const isCorrect = userAnswer === quiz.correct

                  return (
                    <div key={quiz.id} className={`rounded-lg p-6 border transition-all ${
                      isAnswered 
                        ? isCorrect 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{quiz.title}</h4>
                          <p className="text-white/70">{quiz.question}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isAnswered && (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                            }`}>
                              {isCorrect ? '✓ Correct' : '✗ Wrong'}
                            </span>
                          )}
                          <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                            +{quiz.reward} MINT
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {quiz.options.map((option, optIndex) => {
                          const isSelected = userAnswer === optIndex
                          const isCorrectOption = optIndex === quiz.correct
                          
                          return (
                            <button
                              key={optIndex}
                              disabled={isAnswered || isProcessing}
                              className={`w-full text-left p-3 rounded-lg transition-colors ${
                                isAnswered
                                  ? isSelected
                                    ? isCorrect
                                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                    : isCorrectOption
                                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                      : 'bg-white/5 text-white/70'
                                  : isProcessing
                                    ? 'bg-white/5 text-white/50 cursor-not-allowed'
                                    : 'bg-white/5 hover:bg-white/10 text-white cursor-pointer'
                              }`}
                              onClick={() => !isAnswered && !isProcessing && handleQuizAnswer(quiz.id, optIndex, quiz.correct, quiz.reward)}
                            >
                              {option}
                              {isAnswered && isCorrectOption && <span className="ml-2 text-green-400">✓</span>}
                              {isAnswered && isSelected && !isCorrect && <span className="ml-2 text-red-400">✗</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Progress Info */}
              <div className="mt-8 bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center text-sm text-white/70">
                  <span>For next NFT certificate: {3 - (completedCourses % 3)} quizzes remaining</span>
                  <span>Every correct answer = Real MINT tokens!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}