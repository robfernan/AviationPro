const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(bodyParser.json())

const dbFile = path.join(__dirname, 'data.json')

function loadDb(){
  try{
    if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify([]))
    return JSON.parse(fs.readFileSync(dbFile, 'utf8') || '[]')
  }catch(e){ return [] }
}

function saveDb(items){
  fs.writeFileSync(dbFile, JSON.stringify(items, null, 2))
}

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.get('/api/flights', (req, res) => {
  const rows = loadDb()
  // sort by date desc
  rows.sort((a,b)=> (b.flight_date||'').localeCompare(a.flight_date||''))
  res.json(rows)
})

app.post('/api/flights', (req, res) => {
  const f = req.body
  const items = loadDb()
  const existing = items.findIndex(it => it.id === f.id)
  if (existing >= 0) items[existing] = f
  else items.push(f)
  saveDb(items)
  res.json({ ok: true })
})

app.delete('/api/flights/:id', (req, res) => {
  const id = req.params.id
  const items = loadDb().filter(i => i.id !== id)
  saveDb(items)
  res.json({ ok: true })
})

app.listen(PORT, () => console.log(`WASP backend listening on http://0.0.0.0:${PORT}`))
