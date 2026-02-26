import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

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

const PAGE_SIZE = 20

export default function ChatLogsPage() {
  const [logs, setLogs] = useState<ChatLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('chat_logs')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    if (search.trim()) {
      query = query.ilike('question', `%${search.trim()}%`)
    }
    if (dateFrom) query = query.gte('date', dateFrom)
    if (dateTo) query = query.lte('date', dateTo)

    const { data, count, error } = await query
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (!error) {
      setLogs(data ?? [])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [search, dateFrom, dateTo, page])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(0)
    fetchLogs()
  }

  function clearFilters() {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setPage(0)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-gray-400 mb-1.5">Hledat v otázkách</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Klíčové slovo..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Od</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Do</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Hledat
          </button>
          {(search || dateFrom || dateTo) && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-gray-400 hover:text-white text-sm px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Vymazat
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Chat Logy</h3>
          <span className="text-xs text-gray-500">
            {total.toLocaleString('cs-CZ')} záznamů
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <svg className="w-10 h-10 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">Žádné záznamy nenalezeny</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {logs.map(log => (
              <div key={log.id} className="hover:bg-gray-800/40 transition-colors">
                <button
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  className="w-full text-left px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Date & time */}
                    <div className="w-32 flex-shrink-0">
                      <p className="text-xs font-medium text-gray-300">
                        {log.date?.toString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {log.time?.toString().slice(0, 5)}
                      </p>
                    </div>

                    {/* User */}
                    <div className="w-28 flex-shrink-0 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {log.chat_user_id?.charAt(0).toUpperCase() ?? '?'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 truncate">{log.chat_user_id ?? '—'}</span>
                    </div>

                    {/* Question */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{log.question ?? '—'}</p>
                      {expandedId !== log.id && log.answer && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{log.answer}</p>
                      )}
                    </div>

                    {/* Expand icon */}
                    <svg
                      className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform ${expandedId === log.id ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded */}
                {expandedId === log.id && (
                  <div className="px-5 pb-4 space-y-3">
                    <div className="bg-gray-800/60 rounded-lg p-4 ml-36">
                      <p className="text-xs text-blue-400 font-medium mb-1.5 uppercase tracking-wider">Otázka</p>
                      <p className="text-sm text-gray-200">{log.question}</p>
                    </div>
                    {log.answer && (
                      <div className="bg-gray-800/60 rounded-lg p-4 ml-36">
                        <p className="text-xs text-emerald-400 font-medium mb-1.5 uppercase tracking-wider">Odpověď</p>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{log.answer}</p>
                      </div>
                    )}
                    <div className="flex gap-4 ml-36 text-xs text-gray-500">
                      <span>ID: {log.id}</span>
                      <span>Org: {log.org_id}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Strana {page + 1} z {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Předchozí
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Další →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
