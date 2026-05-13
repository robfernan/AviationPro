// storage helpers (inlined)
const STORAGE_KEY = 'waspFlights:v1'
function load(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch(e){ return [] } }
function save(items){ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) }
function clearAll(){ localStorage.removeItem(STORAGE_KEY) }
function nextId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,6) }

// csv helpers (inlined)
function exportCSV(items){
  const headers = ['id','date','hours','role','solo','cross','night','notes']
  const rows = items.map(it => headers.map(h => JSON.stringify(it[h] ?? '')).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wasp-flights-${new Date().toISOString().slice(0,10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function parseCSVFile(file){
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      const text = fr.result || ''
      const lines = text.split(/\r?\n/).filter(Boolean)
      if (!lines.length) return resolve([])
      const headers = lines[0].split(',').map(h => h.trim())
      const items = lines.slice(1).map(l => {
        const cols = l.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(c => c.replace(/^\"|\"$/g, ''))
        const obj = {}
        headers.forEach((h,i)=> obj[h] = cols[i] ?? '')
        return obj
      })
      resolve(items)
    }
    fr.onerror = () => reject(fr.error)
    fr.readAsText(file)
  })
}

const API_BASE = 'http://127.0.0.1:3001/api'
let useApi = false

async function apiAvailable(){
  try{
    const res = await fetch(API_BASE.replace('/api','/api/health'))
    return res.ok
  }catch(e){return false}
}

async function apiLoad(){
  const res = await fetch(`${API_BASE}/flights`)
  if (!res.ok) throw new Error('api load failed')
  return res.json()
}

async function apiSave(item){
  const res = await fetch(`${API_BASE}/flights`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(item) })
  return res.ok
}

async function apiDelete(id){
  const res = await fetch(`${API_BASE}/flights/${id}`, { method: 'DELETE' })
  return res.ok
}

function qs(sel, root = document) { return root.querySelector(sel) }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)) }

function formatHour(n){ return Number(n || 0).toFixed(1) }

function computeSummary(items){
  const s = { total:0, pic:0, solo:0, cross:0, night:0, instr:0 }
  items.forEach(f => {
    const h = parseFloat(f.hours) || 0
    s.total += h
    if (f.role === 'pic') s.pic += h
    if (f.solo === true || f.solo === 'true') s.solo += h
    if (f.cross === true || f.cross === 'true') s.cross += h
    if (f.night === true || f.night === 'true') s.night += h
    s.instr += parseFloat(f.actual || 0) + parseFloat(f.sim || 0)
  })
  Object.keys(s).forEach(k => s[k] = Number(s[k].toFixed(1)))
  return s
}

function renderSummary(items){
  const c = qs('#counts')
  const s = computeSummary(items)
  c.innerHTML = `
    <div class="bg-yellow-50 px-4 py-2 rounded text-sm text-yellow-700 shadow">Total ${s.total}h</div>
    <div class="bg-violet-50 px-4 py-2 rounded text-sm text-violet-700 shadow">PIC ${s.pic}h</div>
    <div class="bg-white px-4 py-2 rounded text-sm text-slate-700 shadow">Solo ${s.solo}h</div>
  `
}

function renderTable(items){
  const tbody = qs('#flights-table tbody')
  tbody.innerHTML = ''
  items.slice().reverse().forEach((f) => {
    const tr = document.createElement('tr')
    const id = f.id
    tr.innerHTML = `
      <td class="py-2">${f.date || ''}</td>
      <td class="py-2">${formatHour(f.hours)} hrs</td>
      <td class="py-2">${[f.role, f.solo?'Solo':'', f.cross?'Cross':'' , f.night?'Night':''].filter(Boolean).join(', ')}</td>
      <td class="py-2"><button data-id="${id}" class="delete-btn text-xs text-red-600">Delete</button></td>
    `
    tbody.appendChild(tr)
  })
  qsa('.delete-btn').forEach(btn => btn.addEventListener('click', async e => {
    const id = e.target.getAttribute('data-id')
    if (useApi) {
      await apiDelete(id)
    } else {
      const items = load().filter(i => String(i.id) !== String(id))
      save(items)
    }
    await refresh()
  }))
}

async function refresh(){
  let items = useApi ? await apiLoad() : load()
  // normalize possible backend fields (flight_date/flight_time) to frontend model (date/hours)
  items = (items || []).map(f => ({
    ...f,
    date: f.flight_date || f.date || '',
    hours: (f.flight_time !== undefined) ? f.flight_time : (f.hours !== undefined ? f.hours : 0),
    solo: f.solo === 1 || f.solo === true || f.solo === '1' || f.solo === 'true',
    cross: f.cross_country === 1 || f.cross_country === true || f.cross === '1' || f.cross === 'true' || f.cross === true,
    night: f.night === 1 || f.night === true || f.night === '1' || f.night === 'true'
  }))
  renderSummary(items)
  renderTable(items)
}

function wireCSV(){
  const exportBtn = qs('#export-csv')
  const importBtn = qs('#import-csv-btn')
  const importFile = qs('#import-file')

  exportBtn.addEventListener('click', async ()=>{
    const items = useApi ? await apiLoad() : load()
    exportCSV(items)
  })

  importBtn.addEventListener('click', ()=> importFile.click())
  importFile.addEventListener('change', async (e)=>{
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const parsed = await parseCSVFile(file)
    // normalize parsed rows into our model
    const items = parsed.map(r => ({
      id: r.id || nextId(),
      date: r.date || r.flight_date || '',
      hours: r.hours || r.flight_time || '0',
      role: r.role || '',
      solo: r.solo === 'true' || r.solo === true,
      cross: r.cross === 'true' || r.cross === true,
      night: r.night === 'true' || r.night === true,
      notes: r.notes || ''
    }))
    save(items)
    importFile.value = ''
    await refresh()
  })
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const form = qs('#flight-form')
  const clear = qs('#clear')
  form.addEventListener('submit', async e => {
    e.preventDefault()
    const date = qs('#flight-date').value
    const hours = qs('#flight-hours').value
    const role = qs('#pilot-role').value
    const solo = qs('#flag-solo').checked
    const cross = qs('#flag-cross').checked
    const night = qs('#flag-night').checked
    const item = { id: nextId(), date, hours, role, solo, cross, night, actual:0, sim:0, notes:'' }
    if (useApi) {
      await apiSave(item)
    } else {
      const items = load()
      items.push(item)
      save(items)
    }
    form.reset()
    await refresh()
  })
  clear.addEventListener('click', ()=>{ form.reset() })
  useApi = await apiAvailable()
  if (useApi) console.log('WASP: backend detected — using API')
  wireCSV()
  await refresh()
})
  // expose a global marker so we can detect module load in the browser
  try{ window.__wasp_module_loaded__ = true }catch(e){}

