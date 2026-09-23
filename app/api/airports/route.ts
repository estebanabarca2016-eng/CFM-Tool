import { NextRequest, NextResponse } from 'next/server'

type AirportRow = { id: number; icao: string; iata: string; name: string; city: string; state: string; countryCode: string; countryName: string }

let databasePromise: Promise<AirportRow[]> | null = null
let customRows: AirportRow[] = []
let customId = -1

function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++ } else quoted = false } else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(cell); cell = '' }
    else if (ch === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row=[]; cell='' }
    else cell += ch
  }
  row.push(cell); if (row.length > 1 || row[0]) rows.push(row)
  return rows
}

async function fetchText(url: string) {
  const r = await fetch(url, { next: { revalidate: 86400 } })
  if (!r.ok) throw new Error(`Failed to fetch ${url}`)
  return r.text()
}

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = (async () => {
      const base = 'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/'
      const [airportText, countryText, regionText] = await Promise.all([
        fetchText(base + 'airports.csv'), fetchText(base + 'countries.csv'), fetchText(base + 'regions.csv')
      ])
      const airportRows = parseCsv(airportText); const countryRows = parseCsv(countryText); const regionRows = parseCsv(regionText)
      const ah = airportRows[0], ch = countryRows[0], rh = regionRows[0]
      const idx = (h: string[] | undefined, name: string) => h ? h.indexOf(name) : -1
      const ai = { id: idx(ah,'id'), icao: idx(ah,'icao_code'), iata: idx(ah,'iata_code'), name: idx(ah,'name'), city: idx(ah,'municipality'), country: idx(ah,'iso_country'), region: idx(ah,'iso_region') }
      const ci = { code: idx(ch,'code'), name: idx(ch,'name') }
      const ri = { code: idx(rh,'code'), local: idx(rh,'local_code') }
      const countries = new Map<string,string>(); countryRows.slice(1).forEach(r => { if (r[ci.code]) countries.set(r[ci.code].toUpperCase(), r[ci.name] || '') })
      const regions = new Map<string,string>(); regionRows.slice(1).forEach(r => { if (r[ri.code]) regions.set(r[ri.code].toUpperCase(), r[ri.local] || '') })
      return airportRows.slice(1).map((r, n) => {
        const countryCode = (r[ai.country] || '').toUpperCase(); const isoRegion = (r[ai.region] || '').toUpperCase()
        const localRegion = regions.get(isoRegion) || ''
        return { id: Number(r[ai.id]) || n + 1, icao: (r[ai.icao] || '').toUpperCase(), iata: (r[ai.iata] || '').toUpperCase(), name: r[ai.name] || '', city: r[ai.city] || '', state: countryCode === 'US' ? localRegion.toUpperCase().slice(0,2) : '', countryCode, countryName: countries.get(countryCode) || '' }
      }).filter(r => r.icao || r.iata)
    })()
  }
  return databasePromise
}


type AirNavFbo = { id: number; iata: string; icao: string; name: string; email: string; phone: string }

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
}

function stripAirNavHtml(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function parseAirNavFbos(html: string, icao: string): AirNavFbo[] {
  const heading = /FBO,\s*Fuel Providers,\s*and Aircraft Ground Support/i.exec(html)
  if (!heading || heading.index === undefined) return []

  // Keep only the actual FBO table. AirNav places "nearby airport" alternatives
  // after the on-airport FBO records, so do not let those leak into the result.
  let section = html.slice(heading.index)
  const cutPoints = [
    /Alternatives at nearby airports/i,
    /Aviation Businesses, Services, and Facilities/i
  ]
  for (const pattern of cutPoints) {
    const match = pattern.exec(section.slice(100))
    if (match && match.index !== undefined) {
      section = section.slice(0, match.index + 100)
    }
  }

  const found: AirNavFbo[] = []
  const excluded = /^(business name|contact|services \/ description|fuel prices|comments|web site|email|write|more info(?: and photos)?|more info about|independent|full service)$/i

  const addFbo = (name: string, email: string, phone: string) => {
    const cleanName = stripAirNavHtml(name)
    const cleanEmail = decodeHtml(email).trim()
    const cleanPhone = phone.trim()
    if (!cleanName || excluded.test(cleanName) || /@/.test(cleanName) || cleanName.length > 120) return
    if (!cleanEmail && !cleanPhone) return
    found.push({ id: found.length + 1, iata: '', icao, name: cleanName, email: cleanEmail, phone: cleanPhone })
  }

  const rows = Array.from(section.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi))
  for (const match of rows) {
    const row = match[1]
    const emailMatch = /mailto:([^"'?&\s<>]+)/i.exec(row)
    const email = emailMatch ? decodeURIComponent(emailMatch[1]).trim() : ''
    const rowText = stripAirNavHtml(row)
    const phoneMatch = rowText.match(/(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]\d{3}[\s.-]\d{4}/)
    const phone = phoneMatch ? phoneMatch[0] : ''
    const anchors = Array.from(row.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi))
      .map(m => stripAirNavHtml(m[1]))
      .filter(Boolean)
    const cells = Array.from(row.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi))
      .map(m => stripAirNavHtml(m[1]))
      .filter(Boolean)

    const name = anchors.find(v => !excluded.test(v) && !/@/.test(v) && v.length <= 120)
      || cells.find(v => !excluded.test(v) && !/@/.test(v) && v.length <= 120 && !/^ASRI\b/i.test(v))
    if (name) addFbo(name, email, phone)
  }

  // Fallback for AirNav markup changes where the FBO row is not wrapped in <tr>.
  // Use the email link as the anchor point and inspect nearby anchors/phone text.
  if (!found.length) {
    const emailLinks = Array.from(section.matchAll(/mailto:([^"'?&\s<>]+)/gi))
    for (const match of emailLinks) {
      const email = decodeURIComponent(match[1]).trim()
      const start = Math.max(0, (match.index || 0) - 2400)
      const context = section.slice(start, Math.min(section.length, (match.index || 0) + 500))
      const rowText = stripAirNavHtml(context)
      const phoneMatch = rowText.match(/(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]\d{3}[\s.-]\d{4}/)
      const anchors = Array.from(context.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi))
        .map(m => stripAirNavHtml(m[1]))
        .filter(Boolean)
      const name = anchors.reverse().find(v => !excluded.test(v) && !/@/.test(v) && v.length <= 120)
      if (name) addFbo(name, email, phoneMatch ? phoneMatch[0] : '')
    }
  }

  const dedup = new Map<string, AirNavFbo>()
  for (const fbo of found) {
    const key = [fbo.name.toLowerCase(), fbo.email.toLowerCase(), fbo.phone].join('|')
    if (!dedup.has(key)) dedup.set(key, { ...fbo, id: dedup.size + 1 })
  }
  return Array.from(dedup.values())
}

async function fetchAirNavFbos(icao: string) {
  const code = icao.trim().toUpperCase()
  if (!/^K[A-Z0-9]{3}$/.test(code)) throw new Error('AirNav lookup is available only for Kxxx U.S. ICAO codes')
  const response = await fetch('https://www.airnav.com/airport/' + encodeURIComponent(code), {
    headers: {
      'User-Agent': 'Corporate Fuel Management Tool FBO lookup',
      'Accept': 'text/html,application/xhtml+xml'
    },
    next: { revalidate: 900 }
  })
  if (!response.ok) throw new Error('AirNav returned ' + response.status)
  return parseAirNavFbos(await response.text(), code)
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams
    const airnav = (searchParams.get('airnav') || '').trim().toUpperCase()
    if (airnav) {
      if (!/^K[A-Z0-9]{3}$/.test(airnav)) return NextResponse.json({ error: 'AirNav FBO lookup is limited to Kxxx U.S. ICAO codes' }, { status: 400 })
      const rows = await fetchAirNavFbos(airnav)
      return NextResponse.json({ rows, total: rows.length, source: 'AirNav', icao: airnav })
    }
    const db = [...await getDatabase(), ...customRows]
    const q = (searchParams.get('q') || '').trim().toLowerCase(); const icao = (searchParams.get('icao') || '').trim().toUpperCase(); const iata = (searchParams.get('iata') || '').trim().toUpperCase()
    const icaos = Array.from(new Set((searchParams.get('icaos') || '').split(',').map(v => v.trim().toUpperCase()).filter(Boolean)))
    let filtered = db
    if (icaos.length) {
      const requested = new Set(icaos)
      filtered = filtered.filter(r => requested.has(r.icao))
      return NextResponse.json({ rows: filtered, total: filtered.length })
    }
    if (icao) filtered = filtered.filter(r => r.icao === icao)
    else if (iata) filtered = filtered.filter(r => r.iata === iata)
    else if (q) filtered = filtered.filter(r => [r.icao,r.iata,r.name,r.city,r.state,r.countryCode,r.countryName].some(v => v.toLowerCase().includes(q)))
    if (icao || iata) return NextResponse.json({ rows: filtered.slice(0, 20), total: filtered.length })
    const page = Math.max(1, Number(searchParams.get('page') || 1)); const pageSize = Math.min(100, Math.max(10, Number(searchParams.get('pageSize') || 50))); const start=(page-1)*pageSize
    return NextResponse.json({ rows: filtered.slice(start,start+pageSize), total: filtered.length, page, pageSize })
  } catch (e) { return NextResponse.json({ error: 'Airport data unavailable' }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  const body = await req.json(); const row: AirportRow = { id: customId--, icao: String(body.icao||'').toUpperCase(), iata: String(body.iata||'').toUpperCase(), name: String(body.name||''), city: String(body.city||''), state: String(body.state||'').toUpperCase(), countryCode: String(body.countryCode||'').toUpperCase(), countryName: String(body.countryName||'') }
  customRows.unshift(row); return NextResponse.json(row, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json(); const id = Number(body.id); const i = customRows.findIndex(r => r.id === id); if (i < 0) return NextResponse.json({ error:'Only locally added records can be edited in this prototype' }, { status: 400 });
  customRows[i] = { ...customRows[i], id, icao: String(body.icao||'').toUpperCase(), iata: String(body.iata||'').toUpperCase(), name: String(body.name||''), city: String(body.city||''), state: String(body.state||'').toUpperCase(), countryCode: String(body.countryCode||'').toUpperCase(), countryName: String(body.countryName||'') }
  return NextResponse.json(customRows[i])
}

export async function DELETE(req: NextRequest) {
  const id = Number(new URL(req.url).searchParams.get('id')); const before = customRows.length; customRows = customRows.filter(r => r.id !== id); if (customRows.length === before) return NextResponse.json({ error:'Source airport records cannot be deleted in this prototype' }, { status: 400 }); return NextResponse.json({ ok:true })
}
