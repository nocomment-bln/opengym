import { equipmentOf } from './exercises.js'

const haystack = ex => [ex.n, ex.tg, ex.eq, ex.desc, ex.level].filter(Boolean).join(' ').toLowerCase()

export function filterExercises(list, { q = '', bp = '', eq = '', collection = '', usage = null } = {}) {
  const query = q.toLowerCase().trim()
  return list.filter(ex =>
    (!collection || ex.collection === collection) &&
    (bp === '★' ? Boolean(usage?.[ex.id]) : (!bp || ex.bp === bp)) &&
    (!eq || ex.eq === eq) &&
    (!query || haystack(ex).includes(query))
  )
}

export function equipmentForFilters(list, filters) {
  return equipmentOf(filterExercises(list, { ...filters, eq: '' }))
}
