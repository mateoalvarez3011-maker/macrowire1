'use client'
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Article = { 
  id: number
  title: string
  summary: string
  source_url: string
  published_at: string
  impact_score: number | null
  risk_level: string | null
  tickers: string[]
  countries: string[]
  orgs: string[]
}

export default function Page() {
  const [brief, setBrief] = useState('Cargando…')
  const [items, setItems] = useState<Article[]>([])
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  const load = async (reset=false) => {
    const u = new URL('/api/articles', window.location.origin)
    if (search) u.searchParams.set('search', search)
    if (filter) u.searchParams.set('filter', filter)
    if (!reset && cursor) u.searchParams.set('cursor', cursor)
    const r = await fetch(u.toString()); const j = await r.json()
    setItems(prev => reset ? j.items : [...prev, ...j.items])
    setCursor(j.nextCursor)
  }

  useEffect(()=>{ (async ()=>{
    const r = await fetch('/api/daily-brief'); const j = await r.json(); setBrief(j.brief)
    await load(true)
  })() }, [])

  useEffect(()=>{ const t = setTimeout(()=> load(true), 300); return ()=> clearTimeout(t) }, [search, filter])

  return (
    <div>
      <Card className="mb-6">
        <CardHeader><CardTitle>📈 Daily Brief</CardTitle></CardHeader>
        <CardContent><p>{brief}</p></CardContent>
      </Card>

      <div className="flex gap-2 mb-4">
        <Input placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} />
        <Button variant={filter==='risk:alto'?'default':'outline'} onClick={()=>setFilter(f=> f==='risk:alto' ? '' : 'risk:alto')}>Alto impacto</Button>
      </div>

      {items.map(a=>(
        <Card key={a.id} className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">{a.title}</CardTitle>
            <p className="text-xs opacity-70">
              {new Date(a.published_at).toLocaleString()} — <a className="underline" href={a.source_url} target="_blank">Fuente</a>
            </p>
          </CardHeader>
          <CardContent>
            <p className="mb-2">{a.summary}</p>
            <div className="text-xs opacity-80">
              <b>Riesgo:</b> {a.risk_level || '—'} &nbsp; · &nbsp;
              <b>Impacto:</b> {a.impact_score ?? '—'} &nbsp; · &nbsp;
              <b>Tickers:</b> {a.tickers?.join(', ') || '—'}
            </div>
          </CardContent>
        </Card>
      ))}

      {cursor && <Button variant="outline" onClick={()=>load(false)}>Cargar más</Button>}
    </div>
  )
}
