import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import StatCard from '../components/StatCard'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'

interface ChatLog {
  id: string
  org_id: string
  chat_user_id: string
  question: string
  answer: string
  created_at: string
  date: string
  time: string
}

interface DailyCount {
  date: string
  count: number
}

interface HourCount {
  hour: string
  count: number
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
}

function getLast30Days() {
  const days: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export default function OverviewPage() {
  const [loading, setLoading] = useState(true)
  const [totalConv, setTotalConv] = useState(0)
  const [uniqueUsers, setUniqueUsers] = useState(0)
  const [todayConv, setTodayConv] = useState(0)
  const [monthConv, setMonthConv] = useState(0)
  const [dailyData, setDailyData] = useState<DailyCount[]>([])
  const [hourlyData, setHourlyData] = useState<HourCount[]>([])
  const [recentLogs, setRecentLogs] = useState<ChatLog[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const firstOfMonth = new Date()
    firstOfMonth.setDate(1)
    const monthStart = firstOfMonth.toISOString().split('T')[0]
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    const dateFrom = thirtyDaysAgo.toISOString().split('T')[0]

    const [totalRes, usersRes, todayRes, monthRes, recentRes, last30Res] = await Promise.all([
      supabase.from('chat_logs').select('*', { count: 'exact', head: true }),
      supabase.from('chat_logs').select('chat_user_id'),
      supabase.from('chat_logs').select('*', { count: 'exact', head: true }).eq('date', today),
      supabase.from('chat_logs').select('*', { count: 'exact', head: true }).gte('date', monthStart),
      supabase.from('chat_logs').select('*').order('created_at', { ascending: false }).limit(8),
      supabase.from('chat_logs').select('date, time').gte('date', dateFrom),
    ])

    setTotalConv(totalRes.count ?? 0)
    setUniqueUsers(new Set(usersRes.data?.map(r => r.chat_user_id)).size)
    setTodayConv(todayRes.count ?? 0)
    setMonthConv(monthRes.count ?? 0)
    setRecentLogs(recentRes.data ?? [])

    // Build daily chart data
    const days = getLast30Days()
    const countMap: Record<string, number> = {}
    last30Res.data?.forEach(r => {
      const d = r.date?.toString().split('T')[0] ?? ''
      countMap[d] = (countMap[d] ?? 0) + 1
    })
    setDailyData(days.map(d => ({ date: formatDate(d), count: countMap[d] ?? 0 })))

    // Build hourly chart data
    const hourMap: Record<number, number> = {}
    last30Res.data?.forEach(r => {
      const h = r.time ? parseInt(r.time.toString().split(':')[0], 10) : null
      if (h !== null && !isNaN(h)) hourMap[h] = (hourMap[h] ?? 0) + 1
    })
    setHourlyData(
      Array.from({ length: 24 }, (_, h) => ({
        hour: `${h}:00`,
        count: hourMap[h] ?? 0,
      }))
    )

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
      </div>
    )
  }

  const tooltipStyle = {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#f9fafb',
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Celkové konverzace"
          value={totalConv.toLocaleString('cs-CZ')}
          subtitle="Všechna data"
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
        <StatCard
          title="Unikátní uživatelé"
          value={uniqueUsers.toLocaleString('cs-CZ')}
          subtitle="Všechna data"
          color="violet"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Dnes"
          value={todayConv.toLocaleString('cs-CZ')}
          subtitle="Konverzace dnes"
          color="emerald"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Tento měsíc"
          value={monthConv.toLocaleString('cs-CZ')}
          subtitle={new Date().toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
          color="amber"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily area chart - spans 2 cols */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Konverzace za posledních 30 dní</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#374151' }} />
              <Area
                type="monotone"
                dataKey="count"
                name="Konverzace"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#blueGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly bar chart */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Aktivita dle hodiny</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyData} barSize={6}>
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
              <Bar dataKey="count" name="Konverzace" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent conversations */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Nedávné konverzace</h3>
          <span className="text-xs text-gray-500">{recentLogs.length} záznamů</span>
        </div>
        <div className="divide-y divide-gray-800">
          {recentLogs.length === 0 && (
            <div className="px-5 py-8 text-center text-gray-500 text-sm">Žádná data</div>
          )}
          {recentLogs.map(log => (
            <div key={log.id} className="px-5 py-4 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">
                    {log.chat_user_id?.charAt(0).toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-300 truncate max-w-[120px]">
                      {log.chat_user_id ?? 'Anonymní'}
                    </span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-500">
                      {log.date} {log.time ? log.time.toString().slice(0, 5) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 truncate">{log.question}</p>
                  {log.answer && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{log.answer}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
