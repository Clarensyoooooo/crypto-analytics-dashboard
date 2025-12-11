"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Brain,
  Target,
  CheckCircle2,
  Zap,
  DollarSign,
  Volume2,
  LineChart,
  Gauge,
  AlertTriangle
} from "lucide-react"

// --- ANALYTICS UTILITIES ---

// 1. Calculate RSI (Relative Strength Index)
const calculateRSI = (prices: number[], period = 14) => {
  if (prices.length < period + 1) return 50
  
  let gains = 0
  let losses = 0

  for (let i = 1; i <= period; i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1]
    if (change > 0) gains += change
    else losses += Math.abs(change)
  }

  const avgGain = gains / period
  const avgLoss = losses / period
  
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

// 2. Simple Linear Regression for "AI Forecast"
const calculateForecast = (prices: number[]) => {
  const n = prices.length
  if (n < 2) return prices[0] || 0

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += prices[i]
    sumXY += i * prices[i]
    sumXX += i * i
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  // Predict next step (n)
  return slope * n + intercept
}


export default function KijinDashboard() {
  const [selectedCoin, setSelectedCoin] = useState("bitcoin")
  const [timeframe, setTimeframe] = useState("7d")
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Data State
  const [loading, setLoading] = useState(true)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange24h, setPriceChange24h] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [history, setHistory] = useState<number[]>([])
  const [rsi, setRsi] = useState(50)
  
  // Derived Analytics State
  const [forecastPrice, setForecastPrice] = useState(0)
  const [trendDirection, setTrendDirection] = useState<"UP" | "DOWN">("UP")
  const [confidenceScore, setConfidenceScore] = useState(0)
  const [recommendation, setRecommendation] = useState("HOLD")
  const [logicReasons, setLogicReasons] = useState<{text: string, checked: boolean}[]>([])

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true)
    setIsRefreshing(true)
    try {
      // 1. Fetch Price & 24h Stats
      const priceRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${selectedCoin}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`
      )
      const priceData = await priceRes.json()
      const coinData = priceData[selectedCoin]
      
      if (!coinData) throw new Error("No data found")

      setCurrentPrice(coinData.usd)
      setPriceChange24h(coinData.usd_24h_change)
      setVolume24h(coinData.usd_24h_vol)

      // 2. Fetch History for Analytics (30 days for robust RSI)
      const historyRes = await fetch(
        `https://api.coingecko.com/api/v3/coins/${selectedCoin}/market_chart?vs_currency=usd&days=30&interval=daily`
      )
      const historyData = await historyRes.json()
      const prices = historyData.prices.map((p: any) => p[1]) // Extract just price values
      setHistory(prices)

      // --- RUN ANALYTICS ---
      
      // A. Descriptive
      const calculatedRSI = calculateRSI(prices)
      setRsi(calculatedRSI)

      // B. Predictive
      const recentPrices = prices.slice(-7) // Last 7 days for trend
      const nextDayPrediction = calculateForecast(recentPrices)
      setForecastPrice(nextDayPrediction)
      
      const isBullish = nextDayPrediction > prices[prices.length - 1]
      setTrendDirection(isBullish ? "UP" : "DOWN")
      
      // Calculate Confidence (based on volatility - lower volatility = higher confidence)
      const volatility = Math.abs(Math.max(...recentPrices) - Math.min(...recentPrices)) / Math.max(...recentPrices)
      const confidence = Math.max(10, Math.min(98, (1 - volatility) * 100))
      setConfidenceScore(Math.round(confidence))

      // C. Prescriptive
      const ma7 = recentPrices.reduce((a: number, b: number) => a + b, 0) / 7
      const priceVsMA = prices[prices.length - 1] > ma7
      
      const reasons = []
      let rec = "HOLD"
      
      if (calculatedRSI < 30) {
        reasons.push({ text: "RSI is Oversold (Buy Signal)", checked: true })
        rec = "BUY"
      } else if (calculatedRSI > 70) {
        reasons.push({ text: "RSI is Overbought (Sell Signal)", checked: true })
        rec = "SELL"
      } else {
        reasons.push({ text: "RSI is Neutral", checked: true })
      }

      if (priceVsMA) {
        reasons.push({ text: "Price is above 7-day Moving Average", checked: true })
        if (rec === "BUY") rec = "STRONG BUY"
        else if (rec === "HOLD") rec = "ACCUMULATE"
      } else {
        reasons.push({ text: "Price is below 7-day Moving Average", checked: true })
        if (rec === "SELL") rec = "STRONG SELL"
      }

      if (isBullish) {
         reasons.push({ text: "AI Model predicts upward trend", checked: true })
      } else {
         reasons.push({ text: "AI Model predicts downward trend", checked: true })
      }

      setRecommendation(rec)
      setLogicReasons(reasons)

    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedCoin])


  const coins = [
    { value: "bitcoin", label: "Bitcoin (BTC)" },
    { value: "ethereum", label: "Ethereum (ETH)" },
    { value: "solana", label: "Solana (SOL)" },
    { value: "ripple", label: "XRP (XRP)" },
    { value: "dogecoin", label: "Dogecoin (DOGE)" },
  ]

  const timeframes = [
    { value: "1d", label: "1D" },
    { value: "7d", label: "7D" },
    { value: "1m", label: "1M" },
  ]

  // Format Helpers
  const formatUSD = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
  
  const formatCompact = (val: number) => 
    new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short", style: 'currency', currency: 'USD' }).format(val)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Activity className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">Kijin Analytics</h1>
              <p className="text-xs text-slate-400">Advanced Crypto Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedCoin} onValueChange={setSelectedCoin}>
              <SelectTrigger className="w-[180px] border-slate-700 bg-slate-800 text-slate-100">
                <SelectValue placeholder="Select coin" />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-800 text-slate-100">
                {coins.map((coin) => (
                  <SelectItem key={coin.value} value={coin.value} className="focus:bg-slate-700 focus:text-slate-100">
                    {coin.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="hidden sm:flex rounded-lg border border-slate-700 bg-slate-800">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    timeframe === tf.value
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-slate-400 hover:text-slate-100"
                  } ${tf.value === "1d" ? "rounded-l-lg" : ""} ${tf.value === "1m" ? "rounded-r-lg" : ""}`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isRefreshing}
              className="border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-slate-100"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing" : "Refresh"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        
        {/* Error / Loading State Handling can go here if needed */}
        
        {/* Section 1: Descriptive Analytics */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-slate-100">Descriptive Analytics</h2>
            <Badge variant="outline" className="border-slate-600 text-slate-400">
              The Past
            </Badge>
          </div>

          <Card className="border-slate-800 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-slate-100">
                Price Chart - {coins.find((c) => c.value === selectedCoin)?.label}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Real-time market data & technical indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Chart Placeholder - Now Dynamic-ish */}
              <div className="relative h-[300px] w-full rounded-lg border border-slate-700 bg-slate-900/50 p-4 overflow-hidden">
                 {/* Visualizing the "history" state as simple bars */}
                <div className="absolute inset-0 flex items-end justify-between px-4 pb-0 pt-8 gap-1 opacity-80">
                  {history.slice(-30).map((price, i) => {
                     const min = Math.min(...history)
                     const max = Math.max(...history)
                     const range = max - min
                     const heightPercent = ((price - min) / range) * 80 + 10 // scale to 10-90%
                     const isUp = i > 0 && price >= history[i-1]
                     
                     return (
                        <div 
                          key={i} 
                          className={`flex-1 rounded-t-sm transition-all duration-500 ${isUp ? 'bg-emerald-500/50' : 'bg-red-500/50'}`}
                          style={{ height: `${heightPercent}%` }}
                        />
                     )
                  })}
                </div>
                
                {/* Overlay Text */}
                <div className="absolute top-4 left-4 z-10">
                   <p className="text-3xl font-bold text-slate-100 tracking-tight">
                     {loading ? "..." : formatUSD(currentPrice)}
                   </p>
                   <p className={`flex items-center text-sm font-medium ${priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {priceChange24h >= 0 ? <TrendingUp className="mr-1 h-3 w-3"/> : <TrendingDown className="mr-1 h-3 w-3"/>}
                      {loading ? "..." : `${priceChange24h.toFixed(2)}% (24h)`}
                   </p>
                </div>
              </div>

              {/* Dynamic Stats Grid */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-700 bg-slate-900/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <DollarSign className="h-5 w-5 text-slate-500" />
                        <span className={`text-xs font-medium ${priceChange24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {priceChange24h.toFixed(1)}%
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-slate-100">{loading ? "..." : formatUSD(currentPrice)}</p>
                      <p className="text-sm text-slate-400">Current Price</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-700 bg-slate-900/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <Volume2 className="h-5 w-5 text-slate-500" />
                        <span className="text-xs font-medium text-emerald-400">High Liq.</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-slate-100">{loading ? "..." : formatCompact(volume24h)}</p>
                      <p className="text-sm text-slate-400">24h Volume</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-700 bg-slate-900/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <LineChart className="h-5 w-5 text-slate-500" />
                         <span className="text-xs font-medium text-slate-400">7d Avg</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-slate-100">
                         {loading ? "..." : formatUSD(history.slice(-7).reduce((a,b) => a+b, 0) / 7)}
                      </p>
                      <p className="text-sm text-slate-400">Moving Average</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-700 bg-slate-900/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <Gauge className="h-5 w-5 text-slate-500" />
                        <span className={`text-xs font-medium ${rsi > 70 ? "text-red-400" : rsi < 30 ? "text-emerald-400" : "text-amber-400"}`}>
                          {rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral"}
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-slate-100">{loading ? "..." : rsi.toFixed(1)}</p>
                      <p className="text-sm text-slate-400">RSI Score</p>
                    </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Predictive Analytics */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-slate-100">Predictive Analytics</h2>
            <Badge variant="outline" className="border-slate-600 text-slate-400">
              The Future
            </Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* AI Price Forecast */}
            <Card className="border-slate-800 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Zap className="h-5 w-5 text-cyan-400" />
                  AI Price Forecast (24h)
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Linear Regression Model on 7d Volatility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-6 text-center">
                    <p className="text-sm text-slate-400">Predicted Price</p>
                    <p className="mt-2 text-4xl font-bold text-cyan-400">
                      {loading ? "Calculating..." : formatUSD(forecastPrice)}
                    </p>
                    <div className={`mt-2 flex items-center justify-center gap-1 ${forecastPrice > currentPrice ? 'text-emerald-400' : 'text-red-400'}`}>
                      {forecastPrice > currentPrice ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span className="text-sm font-medium">
                        {loading ? "..." : `${((forecastPrice - currentPrice) / currentPrice * 100).toFixed(2)}%`} from current
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                    <div>
                      <p className="text-sm text-slate-400">Confidence Score</p>
                      <p className="text-2xl font-bold text-slate-100">{loading ? "-" : confidenceScore}%</p>
                    </div>
                    {/* Simple Donut Visualization */}
                    <div className="h-12 w-12 rounded-full border-4 border-slate-700 border-t-cyan-400 rotate-45"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trend Probability */}
            <Card className="border-slate-800 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Target className="h-5 w-5 text-cyan-400" />
                  Trend Probability
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Likelihood analysis based on SMA Cross
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Uptrend */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <span className="font-medium text-slate-100">Uptrend</span>
                      </div>
                      <span className="text-lg font-bold text-emerald-400">
                        {trendDirection === "UP" ? "High" : "Low"}
                      </span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000"
                        style={{ width: trendDirection === "UP" ? "75%" : "25%" }}
                      />
                    </div>
                  </div>

                  {/* Downtrend */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-400" />
                        <span className="font-medium text-slate-100">Downtrend</span>
                      </div>
                      <span className="text-lg font-bold text-red-400">
                         {trendDirection === "DOWN" ? "High" : "Low"}
                      </span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-1000"
                        style={{ width: trendDirection === "DOWN" ? "75%" : "25%" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 3: Prescriptive Analytics */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-slate-100">Prescriptive Analytics</h2>
            <Badge variant="outline" className="border-slate-600 text-slate-400">
              The Action
            </Badge>
          </div>

          <Card className={`border-2 bg-gradient-to-br from-slate-800/80 to-emerald-950/30 ${recommendation.includes("BUY") ? "border-emerald-500/30" : recommendation.includes("SELL") ? "border-red-500/30" : "border-amber-500/30"}`}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-slate-100">Strategic Insight</CardTitle>
              <CardDescription className="text-slate-400">
                Automated recommendation based on multi-factor analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Main Recommendation Badge */}
              <div className="flex flex-col items-center justify-center gap-4 py-6">
                <div className="relative">
                  <div className={`absolute -inset-4 rounded-full blur-xl opacity-20 ${recommendation.includes("BUY") ? "bg-emerald-500" : recommendation.includes("SELL") ? "bg-red-500" : "bg-amber-500"}`} />
                  <Badge className={`relative border-0 px-8 py-4 text-2xl font-bold text-slate-900 shadow-lg ${
                      recommendation.includes("BUY") ? "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-emerald-500/25" 
                      : recommendation.includes("SELL") ? "bg-gradient-to-r from-red-600 to-red-400 shadow-red-500/25"
                      : "bg-gradient-to-r from-amber-500 to-amber-300 shadow-amber-500/25"
                  }`}>
                    {loading ? "ANALYZING..." : `RECOMMENDATION: ${recommendation}`}
                  </Badge>
                </div>
              </div>

              {/* Logic Reasons Checklist */}
              <div className="mx-auto max-w-xl">
                <h4 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Logic Reasons
                </h4>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center text-slate-500">Processing market data...</div>
                  ) : (
                    logicReasons.map((reason, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/50 p-3 transition-colors hover:border-slate-600"
                      >
                        <CheckCircle2 className={`h-5 w-5 shrink-0 ${recommendation.includes("BUY") ? "text-emerald-400" : recommendation.includes("SELL") ? "text-red-400" : "text-amber-400"}`} />
                        <span className="text-slate-200">{reason.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                <Button className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 sm:w-auto">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Execute on Exchange
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100 sm:w-auto bg-transparent"
                >
                  View Full Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm text-slate-500">
            © 2025 Kijin Analytics. Data provided by CoinGecko API (Demo).
          </p>
        </div>
      </footer>
    </div>
  )
}