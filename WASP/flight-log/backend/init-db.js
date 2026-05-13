const fs = require('fs')
const path = require('path')
const file = path.join(__dirname, 'data.json')

if (!fs.existsSync(file)){
  const seed = [
    { id: 'seed1', flight_date: '2026-05-01', flight_time: 1.2, pilot_role: 'pic', solo: 0, cross_country: 1, night: 0, notes: 'Cross-country practice' },
    { id: 'seed2', flight_date: '2026-05-02', flight_time: 0.8, pilot_role: 'solo', solo: 1, cross_country: 0, night: 1, notes: 'Night solo' },
    { id: 'seed3', flight_date: '2026-05-03', flight_time: 2.4, pilot_role: 'pic', solo: 0, cross_country: 0, night: 0, notes: 'Dual training' }
  ]
  fs.writeFileSync(file, JSON.stringify(seed, null, 2))
  console.log('Seeded 3 flights to', file)
} else {
  console.log('DB file exists at', file)
}
