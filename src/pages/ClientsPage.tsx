import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Organization {
  id: string
  name: string
  logo_url: string | null
}

export default function ClientsPage() {
  const { isAdmin } = useAuth()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAdmin) fetchOrgs()
  }, [isAdmin])

  async function fetchOrgs() {
    setLoading(true)
    const { data } = await supabase.from('organizations').select('*').order('name')
    setOrgs(data ?? [])
    setLoading(false)
  }

  async function createOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setError(null)
    const { error } = await supabase.from('organizations').insert({ name: newName.trim() })
    if (error) setError(error.message)
    else { setNewName(''); fetchOrgs() }
    setCreating(false)
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-sm">Přístup pouze pro administrátory</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add org form */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Přidat organizaci</h3>
        <form onSubmit={createOrg} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Název organizace..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            {creating ? 'Přidávám...' : 'Přidat'}
          </button>
        </form>
        {error && (
          <p className="text-xs text-red-400 mt-2">{error}</p>
        )}
      </div>

      {/* Orgs list */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-white">Organizace ({orgs.length})</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : orgs.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            Žádné organizace
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {orgs.map(org => (
              <div key={org.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-800/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {org.logo_url ? (
                    <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-gray-500">{org.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{org.name}</p>
                  <p className="text-xs text-gray-500">ID: {org.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
