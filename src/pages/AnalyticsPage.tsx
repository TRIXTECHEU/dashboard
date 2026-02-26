import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell
} from 'recharts'

interface MonthlyData { month: string; count: number }
interface HourlyData { hour: string; count: number }
interface DowData { day: string; count: number }
interface TopUser { user: string; count: number }

const DAYS_CS = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota']

const tooltipStyle = {
  backgroundColor: '#1f2937',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: '#f9fafb',
  fontSize: '12px',
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])
  const [dowData, setDowData] = useState<DowData[]>([])
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [avgPerDay, setAvgPerDay] = useState(0)
  const [avgPerUser, setAvgPerUser] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    // Fetch all logs for aggregation (date, time, chat_user_id)
    const { data } = await supabase
      .from('chat_logs')
      .select('date, time, chat_user_id')

    if (!data) { setLoading(false); return }

    // Monthly (last 6 months)
    const monthMap: Record<string, number> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthMap[key] = 0
    }
    data.forEach(r => {
      const key = r.date?.toString().slice(0, 7)
      if (key && key in monthMap) monthMap[key]++
    })
    setMonthlyData(
      Object.entries(monthMap).map(([k, v]) => {
        const [year, month] = k.split('-')
        const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' })
        return { month: label, count: v }
      })
    )

    // Hourly distribution (0-23)
    const hourMap: Record<number, number> = {}
    data.forEach(r => {
      const h = r.time ? parseInt(r.time.toString().split(':')[0], 10) : null
      if (h !== null && !isNaN(h)) hourMap[h] = (hourMap[h] ?? 0) + 1
    })
    setHourlyData(
      Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, count: hourMap[h] ?? 0 }))
    )

    // Day of week (Mon-Sun)
    const dowMap: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    data.forEach(r => {
      if (r.date) {
        const dow = new Date(r.date.toString()).getDay()
        dowMap[dow] = (dowMap[dow] ?? 0) + 1
      }
    })
    setDowData(
      [1, 2, 3, 4, 5, 6, 0].map(d => ({ day: DAYS_CS[d].slice(0, 2), count: dowMap[d] ?? 0 }))
    )

    // Top 10 active users
    const userMap: Record<string, number> = {}
    data.forEach(r => {
      if (r.chat_user_id) userMap[r.chat_user_id] = (userMap[r.chat_user_id] ?? 0) + 1
    })
    const sorted = Object.entries(userMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([user, count]) => ({ user, count }))
    setTopUsers(sorted)

    // Avg per day
    const daySet = new Set(data.map(r => r.date?.toString()))
    setAvgPerDay(daySet.size > 0 ? Math.round(data.length / daySet.size) : 0)

    // Avg per user
    const userSet = new Set(data.map(r => r.chat_user_id))
    setAvgPerUser(userSet.size > 0 ? Math.round(data.length / userSet.size) : 0)

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
      </div>
    )
  }

  const maxTopUser = topUsers[0]?.count ?? 1

  return (
    <div className="space-y-6">
      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Průměr / den</p>
          <p className="text-3xl font-bold text-white">{avgPerDay}</p>
          <p className="text-xs text-gray-500 mt-1">konverzací za aktivní den</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Průměr / uživatel</p>
          <p className="text-3xl font-bold text-white">{avgPerUser}</p>
          <p className="text-xs text-gray-500 mt-1">konverzací na uživatele</p>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Měsíční trend (posledních 6 měsíců)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#374151' }} />
            <Line
              type="monotone"
              dataKey="count"
              name="Konverzace"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly + DOW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hourly */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Rozložení dle hodiny (24h)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis hide allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#374151' }} />
              <Bar dataKey="count" name="Konverzace" radius={[3, 3, 0, 0]}>
                {hourlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count === Math.max(...hourlyData.map(d => d.count)) ? '#f59e0b' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Nejaktivnější: {hourlyData.reduce((a, b) => a.count > b.count ? a : b, { hour: '—', count: 0 }).hour}
          </p>
        </div>

        {/* Day of week */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Rozložení dle dne v týdnu</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dowData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis hide allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#374151' }} />
              <Bar dataKey="count" name="Konverzace" radius={[4, 4, 0, 0]}>
                {dowData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count === Math.max(...dowData.map(d => d.count)) ? '#8b5cf6' : '#4b5563'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top users */}
      {topUsers.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Top 10 nejaktivnějších uživatelů</h3>
          <div className="space-y-2.5">
            {topUsers.map((u, i) => (
              <div key={u.user} className="flex items-center gap-3">
                <span className="w-5 text-xs text-gray-500 text-right flex-shrink-0">{i + 1}.</span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{u.user.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm text-gray-300 truncate flex-1 max-w-[200px]">{u.user}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                      style={{ width: `${(u.count / maxTopUser) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">{u.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
