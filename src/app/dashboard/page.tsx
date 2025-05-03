"use client"
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  Zap,
  Sun,
  BatteryFull,
  Battery,
  AlertTriangle,
  Clock,
  CalendarDays,
  Gauge
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface PowerData {
  date: string
  time: string
  inputPower: number
  outputPower: number
  solarPower: number
  inputEnergy: number
  outputEnergy: number
  solarEnergy: number
  inputVoltage: number
  inputCurrent: number
  outputVoltage: number
  outputCurrent: number
  solarVoltage: number
  solarCurrent: number
  battVoltage: number
  energySaved: number
  timestamp?: string
}

const COLORS = {
  input: '#3b82f6',
  output: '#10b981',
  solar: '#f59e0b',
  battery: '#8b5cf6'
}

type TimeRange = '24h' | '7d' | 'all' | 'custom';

export default function Dashboard() {
  const [data, setData] = useState<PowerData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredData, setFilteredData] = useState<PowerData[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const [selected24hDate, setSelected24hDate] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sheet')
        const result = await response.json()
        setData(result)
        
        // Extract unique dates from the data
        const dates = [...new Set(result.map((item: PowerData) => item.date))] as string[]
        setAvailableDates(dates)
        
        if (dates.length > 0) {
          setSelectedDate(dates[dates.length - 1])
          setSelected24hDate(dates[dates.length - 1]) // Set initial 24h date to most recent
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (selectedDate && data.length > 0) {
      const dateFiltered = data.filter(item => item.date === selectedDate)
      const times = [...new Set(dateFiltered.map(item => item.time))] as string[]
      setAvailableTimes(times)
      if (times.length > 0) {
        setSelectedTime(times[0]) 
      }
    }
  }, [selectedDate, data])

  useEffect(() => {
    if (data.length === 0) return

    let filtered = data
    
    // Apply time range filter
    if (timeRange === '24h') {
      if (selected24hDate) {
        filtered = filtered.filter(item => item.date === selected24hDate)
      } else {
        // Default to last 24 hours if no date selected
        const now = new Date()
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        filtered = filtered.filter(item => {
          const itemDate = new Date(`${item.date} ${item.time}`)
          return itemDate >= twentyFourHoursAgo
        })
      }
    } else if (timeRange === '7d') {
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(item => {
        const itemDate = new Date(`${item.date} ${item.time}`)
        return itemDate >= sevenDaysAgo
      })
    } else if (timeRange === 'custom') {
      // Filter by selected date if one is selected
      if (selectedDate) {
        filtered = filtered.filter(item => item.date === selectedDate)
      }

      // Filter by selected time if one is selected
      if (selectedTime) {
        filtered = filtered.filter(item => item.time === selectedTime)
      }
    }
    // 'all' time range - no additional filtering needed

    // Apply search filter if present
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.timestamp?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.time.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredData(filtered)
  }, [timeRange, selectedDate, selectedTime, selected24hDate, searchQuery, data])

  const calculateAverages = () => {
    if (filteredData.length === 0) return {}
    
    const sums = filteredData.reduce((acc, curr) => {
      return {
        inputPower: acc.inputPower + curr.inputPower,
        outputPower: acc.outputPower + curr.outputPower,
        solarPower: acc.solarPower + curr.solarPower,
        inputEnergy: acc.inputEnergy + curr.inputEnergy,
        outputEnergy: acc.outputEnergy + curr.outputEnergy,
        solarEnergy: acc.solarEnergy + curr.solarEnergy,
        inputVoltage: acc.inputVoltage + curr.inputVoltage,
        inputCurrent: acc.inputCurrent + curr.inputCurrent,
        outputVoltage: acc.outputVoltage + curr.outputVoltage,
        outputCurrent: acc.outputCurrent + curr.outputCurrent,
        solarVoltage: acc.solarVoltage + curr.solarVoltage,
        solarCurrent: acc.solarCurrent + curr.solarCurrent,
        battVoltage: acc.battVoltage + curr.battVoltage,
        energySaved: acc.energySaved + curr.energySaved,
      }
    }, {
      inputPower: 0, outputPower: 0, solarPower: 0,
      inputEnergy: 0, outputEnergy: 0, solarEnergy: 0,
      inputVoltage: 0, inputCurrent: 0,
      outputVoltage: 0, outputCurrent: 0,
      solarVoltage: 0, solarCurrent: 0,
      battVoltage: 0, energySaved: 0
    })

    return Object.fromEntries(
      Object.entries(sums).map(([key, value]) => [
        key, 
        filteredData.length > 0 ? value / filteredData.length : 0
      ])
    )
  }

  const averages = calculateAverages()

  const efficiency = filteredData.length > 0 
    ? ((averages.outputPower / (averages.inputPower || 1)) * 100) || 0 
    : 0

  const solarContribution = filteredData.length > 0
    ? ((averages.solarPower / (averages.inputPower || 1)) * 100) || 0
    : 0

  const energySavedTotal = filteredData.reduce((sum, item) => sum + item.energySaved, 0)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  // Prepare data for pie chart
  const pieData = [
    { name: 'Input', value: averages.inputPower || 0 },
    { name: 'Output', value: averages.outputPower || 0 },
    { name: 'Solar', value: averages.solarPower || 0 }
  ]

  // Group data by date for weekly analysis
  const dailyData = data.reduce((acc, item) => {
    const date = item.date
    if (!acc[date]) {
      acc[date] = {
        date,
        inputPower: 0,
        outputPower: 0,
        solarPower: 0,
        inputEnergy: 0,
        outputEnergy: 0,
        solarEnergy: 0,
        count: 0
      }
    }
    acc[date].inputPower += item.inputPower
    acc[date].outputPower += item.outputPower
    acc[date].solarPower += item.solarPower
    acc[date].inputEnergy += item.inputEnergy
    acc[date].outputEnergy += item.outputEnergy
    acc[date].solarEnergy += item.solarEnergy
    acc[date].count += 1
    return acc
  }, {} as Record<string, any>)

  const dailyAverages = Object.values(dailyData).map(day => ({
    date: day.date,
    inputPower: day.inputPower / day.count,
    outputPower: day.outputPower / day.count,
    solarPower: day.solarPower / day.count,
    inputEnergy: day.inputEnergy,
    outputEnergy: day.outputEnergy,
    solarEnergy: day.solarEnergy
  }))

  // Group data by hour for daily analysis
  const getHourlyData = (dateData: PowerData[]) => {
    return dateData.reduce((acc, item) => {
      const hour = item.time.split(':')[0]
      if (!acc[hour]) {
        acc[hour] = {
          hour: `${hour}:00`,
          inputPower: 0,
          outputPower: 0,
          solarPower: 0,
          count: 0
        }
      }
      acc[hour].inputPower += item.inputPower
      acc[hour].outputPower += item.outputPower
      acc[hour].solarPower += item.solarPower
      acc[hour].count += 1
      return acc
    }, {} as Record<string, any>)
  }

  const hourlyAverages = Object.values(getHourlyData(
    timeRange === '24h' && selected24hDate 
      ? data.filter(item => item.date === selected24hDate)
      : filteredData
  )).map(hour => ({
    hour: hour.hour,
    inputPower: hour.inputPower / hour.count,
    outputPower: hour.outputPower / hour.count,
    solarPower: hour.solarPower / hour.count
  }))

  // Determine which data to show in charts based on time range
  const getChartData = () => {
    if (timeRange === '24h') {
      return hourlyAverages
    } else if (timeRange === '7d') {
      return dailyAverages.slice(-7) // Last 7 days
    } else if (timeRange === 'all') {
      return dailyAverages
    }
    return filteredData
  }

  const getXAxisKey = () => {
    if (timeRange === '24h') return 'hour'
    if (timeRange === '7d' || timeRange === 'all') return 'date'
    return selectedTime ? 'time' : 'date'
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '24h': return selected24hDate ? `24 Hours (${selected24hDate})` : '24 Hours'
      case '7d': return '7 Days'
      case 'all': return 'All Data'
      case 'custom': return 'Custom Range'
      default: return ''
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Solar Power Dashboard</h1>
          <p className="text-muted-foreground">Monitoring your solar power system</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Input
            placeholder="Search by date or time..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                <SelectValue placeholder="Select range">
                  {timeRange === '24h' ? '24 Hours' :
                   timeRange === 'all' ? 'All Data' : 'Custom Range'}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="all">All Data</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {timeRange === '24h' && (
            <Select value={selected24hDate} onValueChange={setSelected24hDate}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <SelectValue placeholder="Select date">
                    {selected24hDate || "Select date"}
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {timeRange === 'custom' && (
            <>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <SelectValue placeholder="Select date">
                      {selectedDate || "Select date"}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <SelectValue placeholder="Select time">
                      {selectedTime || "Select time"}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">No data found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or time range selection
          </p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8"
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    System Efficiency
                  </CardTitle>
                  <Zap className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {efficiency.toFixed(1)}%
                  </div>
                  <Progress value={efficiency} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {efficiency > 85 ? 'Excellent' : efficiency > 70 ? 'Good' : 'Needs attention'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Solar Contribution
                  </CardTitle>
                  <Sun className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {solarContribution.toFixed(1)}%
                  </div>
                  <Progress value={solarContribution} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {solarContribution > 50 ? 'High' : solarContribution > 20 ? 'Moderate' : 'Low'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Energy Saved
                  </CardTitle>
                  <BatteryFull className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {energySavedTotal.toFixed(2)} kWh
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Equivalent to {Math.round(energySavedTotal * 0.7)} kg CO₂ saved
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Battery Voltage
                  </CardTitle>
                  <Battery className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {averages.battVoltage?.toFixed(2)} V
                  </div>
                  <div className="mt-1">
                    <Badge variant={averages.battVoltage > 12.5 ? 'default' : 'destructive'}>
                      {averages.battVoltage > 12.5 ? 'Healthy' : 'Low'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Power Charts */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Power Flow (W) - {getTimeRangeLabel()}</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey={getXAxisKey()} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value} W`, '']}
                      labelFormatter={(label) => {
                        if (timeRange === '24h') return `Hour: ${label}`
                        // if (timeRange === '7d' || timeRange === 'all') return `Date: ${label}`
                        return selectedTime ? `Time: ${label}` : `Date: ${label}`
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="inputPower" 
                      stroke={COLORS.input} 
                      strokeWidth={2}
                      dot={false}
                      name="Input Power"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="outputPower" 
                      stroke={COLORS.output} 
                      strokeWidth={2}
                      dot={false}
                      name="Output Power"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="solarPower" 
                      stroke={COLORS.solar} 
                      strokeWidth={2}
                      dot={false}
                      name="Solar Power"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Energy Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.name === 'Input' ? COLORS.input :
                          entry.name === 'Output' ? COLORS.output :
                          COLORS.solar
                        } />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number, name: string) => [`${value} W`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Voltage/Current Charts */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Voltage Measurements (V) - {getTimeRangeLabel()}</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey={getXAxisKey()} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value} V`, '']}
                      labelFormatter={(label) => {
                        if (timeRange === '24h') return `Hour: ${label}`
                        if (timeRange === '7d' || timeRange === 'all') return `Date: ${label}`
                        return selectedTime ? `Time: ${label}` : `Date: ${label}`
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="inputVoltage" 
                      stroke={COLORS.input} 
                      strokeWidth={2}
                      dot={false}
                      name="Input Voltage"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="outputVoltage" 
                      stroke={COLORS.output} 
                      strokeWidth={2}
                      dot={false}
                      name="Output Voltage"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="solarVoltage" 
                      stroke={COLORS.solar} 
                      strokeWidth={2}
                      dot={false}
                      name="Solar Voltage"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="battVoltage" 
                      stroke={COLORS.battery} 
                      strokeWidth={2}
                      dot={false}
                      name="Battery Voltage"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Measurements (A) - {getTimeRangeLabel()}</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey={getXAxisKey()} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value} A`, '']}
                      labelFormatter={(label) => {
                        if (timeRange === '24h') return `Hour: ${label}`
                        if (timeRange === '7d' || timeRange === 'all') return `Date: ${label}`
                        return selectedTime ? `Time: ${label}` : `Date: ${label}`
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="inputCurrent" 
                      stroke={COLORS.input} 
                      strokeWidth={2}
                      dot={false}
                      name="Input Current"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="outputCurrent" 
                      stroke={COLORS.output} 
                      strokeWidth={2}
                      dot={false}
                      name="Output Current"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="solarCurrent" 
                      stroke={COLORS.solar} 
                      strokeWidth={2}
                      dot={false}
                      name="Solar Current"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>Power Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Input Power</span>
                      <span className="font-medium">{averages.inputPower?.toFixed(2)} W</span>
                    </div>
                    <Progress 
                      value={(averages.inputPower / 5000) * 100} 
                      className="h-1 mt-1" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Output Power</span>
                      <span className="font-medium">{averages.outputPower?.toFixed(2)} W</span>
                    </div>
                    <Progress 
                      value={(averages.outputPower / 5000) * 100} 
                      className="h-1 mt-1" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Solar Power</span>
                      <span className="font-medium">{averages.solarPower?.toFixed(2)} W</span>
                    </div>
                    <Progress 
                      value={(averages.solarPower / 2000) * 100} 
                      className="h-1 mt-1" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Energy Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Input Energy</span>
                      <span className="font-medium">{averages.inputEnergy?.toFixed(2)} kWh</span>
                    </div>
                    <Progress 
                      value={(averages.inputEnergy / 50) * 100} 
                      className="h-1 mt-1" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Output Energy</span>
                      <span className="font-medium">{averages.outputEnergy?.toFixed(2)} kWh</span>
                    </div>
                    <Progress 
                      value={(averages.outputEnergy / 50) * 100} 
                      className="h-1 mt-1" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Solar Energy</span>
                      <span className="font-medium">{averages.solarEnergy?.toFixed(2)} kWh</span>
                    </div>
                    <Progress 
                      value={(averages.solarEnergy / 20) * 100} 
                      className="h-1 mt-1" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Battery Voltage</span>
                          <span className="font-medium">{averages.battVoltage?.toFixed(2)} V</span>
                        </div>
                        <Progress 
                          value={((averages.battVoltage - 10) / (14 - 10)) * 100} 
                          className="h-1 mt-1" 
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {averages.battVoltage > 13.5 ? 'Fully charged' : 
                       averages.battVoltage > 12.5 ? 'Healthy range' : 
                       'Low voltage warning'}
                    </TooltipContent>
                  </Tooltip>
                  
                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Energy Saved</span>
                      <span className="font-medium">{energySavedTotal.toFixed(2)} kWh</span>
                    </div>
                    <Progress 
                      value={Math.min((energySavedTotal / 1000) * 100, 100)} 
                      className="h-1 mt-1" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">System Load</span>
                      <span className="font-medium">
                        {averages.inputPower > 0 
                          ? ((averages.outputPower / averages.inputPower) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={averages.inputPower > 0 
                        ? (averages.outputPower / averages.inputPower) * 100 
                        : 0} 
                      className="h-1 mt-1" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  )
}