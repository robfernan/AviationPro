// csv.js — import/export helpers
export function exportCSV(items){
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

export function parseCSVFile(file){
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      const text = fr.result || ''
      const lines = text.split(/\r?\n/).filter(Boolean)
      if (!lines.length) return resolve([])
      const headers = lines[0].split(',').map(h => h.trim())
      const items = lines.slice(1).map(l => {
        // naive CSV unquote
        const cols = l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c => c.replace(/^"|"$/g, ''))
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
