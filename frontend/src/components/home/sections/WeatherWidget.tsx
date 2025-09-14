"use client"

import { motion } from "framer-motion"
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface WeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  visibility: number
  forecast: Array<{
    day: string
    high: number
    low: number
    condition: string
    icon: string
  }>
}

interface WeatherWidgetProps {
  lang: string
  realData?: WeatherData
}

export default function WeatherWidget({ lang, realData }: WeatherWidgetProps) {
  // Use real data if provided, otherwise fallback to mock data
  const weatherData = realData || {
    location: 'Phnom Penh, Cambodia',
    temperature: 32,
    condition: 'Partly Cloudy',
    humidity: 78,
    windSpeed: 12,
    visibility: 10,
    forecast: [
      { day: 'Mon', high: 34, low: 26, condition: 'Sunny', icon: 'sun' },
      { day: 'Tue', high: 33, low: 25, condition: 'Cloudy', icon: 'cloud' },
      { day: 'Wed', high: 31, low: 24, condition: 'Rain', icon: 'rain' },
      { day: 'Thu', high: 32, low: 25, condition: 'Partly Cloudy', icon: 'cloud' },
      { day: 'Fri', high: 35, low: 27, condition: 'Sunny', icon: 'sun' }
    ]
  }
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="h-6 w-6 text-yellow-500" />
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="h-6 w-6 text-gray-500" />
      case 'rain':
        return <CloudRain className="h-6 w-6 text-blue-500" />
      default:
        return <Cloud className="h-6 w-6 text-gray-500" />
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'cloudy':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'rain':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <Card className="border-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-teal-900/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
              <Thermometer className="h-4 w-4 text-white" />
            </div>
            {lang === 'kh' ? 'អាកាសធាតុ' : 'Weather'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Weather */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getWeatherIcon(weatherData.condition)}
              <Badge className={getConditionColor(weatherData.condition)}>
                {weatherData.condition}
              </Badge>
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {weatherData.temperature}°C
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {weatherData.location}
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Droplets className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {weatherData.humidity}%
              </div>
              <div className="text-xs text-gray-500">
                {lang === 'kh' ? 'សំណើម' : 'Humidity'}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Wind className="h-4 w-4 text-gray-500" />
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {weatherData.windSpeed} km/h
              </div>
              <div className="text-xs text-gray-500">
                {lang === 'kh' ? 'ខ្យល់' : 'Wind'}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Eye className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {weatherData.visibility} km
              </div>
              <div className="text-xs text-gray-500">
                {lang === 'kh' ? 'ភាពច្បាស់' : 'Visibility'}
              </div>
            </div>
          </div>

          {/* 5-Day Forecast */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {lang === 'kh' ? 'ទស្សនកិច្ច ៥ ថ្ងៃ' : '5-Day Forecast'}
            </h4>
            <div className="space-y-2">
              {weatherData.forecast.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                      {day.day}
                    </span>
                    {getWeatherIcon(day.condition)}
                    <span className="text-xs text-gray-600 dark:text-gray-300 hidden sm:block">
                      {day.condition}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {day.high}°
                    </span>
                    <span className="text-xs text-gray-500">
                      {day.low}°
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weather Alert */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">
                {lang === 'kh' ? 'ការព្រមានអាកាសធាតុ' : 'Weather Alert'}
              </span>
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
              {lang === 'kh' ? 'សូមប្រយ័ត្នពីភ្លៀងធ្លាក់ខ្លាំង' : 'Heavy rain expected this afternoon'}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
