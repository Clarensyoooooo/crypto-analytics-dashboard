"use client"

import { useState } from "react"
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
} from "lucide-react"

export default function KijinDashboard() {
  const [selectedCoin, setSelectedCoin] = useState("bitcoin")
  const [timeframe, setTimeframe] = useState("7d")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const coins = [
    { value: "bitcoin", label: "Bitcoin (BTC)" },
    { value: "ethereum", label: "Ethereum (ETH)" },
    { value: "solana", label: "Solana (SOL)" },
    { value: "cardano", label: "Cardano (ADA)" },
  ]

  const timeframes = [
    { value: "1d", label: "1D" },
    { value: "7d", label: "7D" },
    { value: "1m", label: "1M" },
  ]

  const stats = [
    { label: "Current Price", value: "$67,842.50", change: "+2.4%", icon: DollarSign, positive: true },
    { label: "24h Volume", value: "$28.4B", change: "+12.8%", icon: Volume2, positive: true },
    { label: "Moving Average (7d)", value: "$65,230.00", change: "+4.0%", icon: LineChart, positive: true },
    { label: "RSI Score", value: "32.5", change: "Oversold", icon: Gauge, positive: false },
  ]

  const logicReasons = [
    { text: "RSI is oversold (below 35)", checked: true },
    { text: "Price crossed above 7d SMA", checked: true },
    { text: "Volume spiking +12.8% above average", checked: true },
    { text: "MACD showing bullish divergence", checked: true },
    { text: "Support level held at $65,000", checked: true },
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
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

            <div className="flex rounded-lg border border-slate-700 bg-slate-800">
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
              onClick={handleRefresh}
              className="border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:text-slate-100"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
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
              <CardDescription className="text-slate-400">Candlestick chart with volume overlay</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Candlestick Chart Placeholder */}
              <div className="relative h-[300px] w-full rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="mx-auto mb-2 h-12 w-12 text-slate-600" />
                    <p className="text-sm text-slate-500">Candlestick Chart Area</p>
                    <p className="text-xs text-slate-600">Integrate with TradingView or Recharts</p>
                  </div>
                </div>
                {/* Simulated chart grid lines */}
                <div className="absolute inset-4 flex flex-col justify-between">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-px w-full bg-slate-800" />
                  ))}
                </div>
                {/* Simulated candlesticks */}
                <div className="absolute bottom-8 left-8 right-8 flex items-end justify-around gap-2">
                  {[60, 45, 70, 55, 80, 65, 75, 50, 85, 70, 90, 75].map((h, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-2 rounded-sm ${i % 3 === 0 ? "bg-red-500" : "bg-emerald-500"}`}
                        style={{ height: `${h}px` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <Card key={stat.label} className="border-slate-700 bg-slate-900/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <stat.icon className="h-5 w-5 text-slate-500" />
                        <span
                          className={`text-xs font-medium ${stat.positive ? "text-emerald-400" : "text-amber-400"}`}
                        >
                          {stat.change}
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-slate-100">{stat.value}</p>
                      <p className="text-sm text-slate-400">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
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
                  AI Price Forecast
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Machine learning prediction for the next 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-6 text-center">
                    <p className="text-sm text-slate-400">Predicted Price (24h)</p>
                    <p className="mt-2 text-4xl font-bold text-cyan-400">$71,250.00</p>
                    <div className="mt-2 flex items-center justify-center gap-1 text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">+5.02% from current</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                    <div>
                      <p className="text-sm text-slate-400">Confidence Score</p>
                      <p className="text-2xl font-bold text-slate-100">87%</p>
                    </div>
                    <div className="h-16 w-16">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#1e293b"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#22d3ee"
                          strokeWidth="3"
                          strokeDasharray="87, 100"
                        />
                      </svg>
                    </div>
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
                  Likelihood analysis based on technical indicators
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
                      <span className="text-lg font-bold text-emerald-400">72%</span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        style={{ width: "72%" }}
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
                      <span className="text-lg font-bold text-red-400">28%</span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400"
                        style={{ width: "28%" }}
                      />
                    </div>
                  </div>

                  {/* Visual Bar Chart */}
                  <div className="mt-6 flex h-40 items-end justify-center gap-8">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-20 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400"
                        style={{ height: "144px" }}
                      />
                      <span className="text-sm text-slate-400">Uptrend</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-20 rounded-t-lg bg-gradient-to-t from-red-600 to-red-400"
                        style={{ height: "56px" }}
                      />
                      <span className="text-sm text-slate-400">Downtrend</span>
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

          <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-slate-800/80 to-emerald-950/30">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-slate-100">Strategic Insight</CardTitle>
              <CardDescription className="text-slate-400">
                AI-powered recommendation based on multi-factor analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Main Recommendation Badge */}
              <div className="flex flex-col items-center justify-center gap-4 py-6">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl" />
                  <Badge className="relative border-0 bg-gradient-to-r from-emerald-600 to-emerald-400 px-8 py-4 text-2xl font-bold text-slate-900 shadow-lg shadow-emerald-500/25">
                    RECOMMENDATION: STRONG BUY
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">High conviction signal detected</span>
                </div>
              </div>

              {/* Logic Reasons Checklist */}
              <div className="mx-auto max-w-xl">
                <h4 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Logic Reasons
                </h4>
                <div className="space-y-3">
                  {logicReasons.map((reason, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/50 p-3 transition-colors hover:border-emerald-500/30"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                      <span className="text-slate-200">{reason.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
                <Button className="w-full bg-emerald-600 text-slate-100 hover:bg-emerald-500 sm:w-auto">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Execute Trade
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100 sm:w-auto bg-transparent"
                >
                  View Full Analysis
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
            © 2025 Kijin Analytics. Data for informational purposes only. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  )
}
