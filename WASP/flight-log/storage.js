// storage.js — simple localStorage helpers
const STORAGE_KEY = 'waspFlights:v1'

export function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch(e){ return [] }
}

export function save(items){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function clearAll(){
  localStorage.removeItem(STORAGE_KEY)
}

export function nextId(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,6)
}
