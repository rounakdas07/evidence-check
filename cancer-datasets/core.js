export const FILTER_KEYS = ['cancer', 'modality', 'outcome', 'model', 'access'];
export const PRESETS = ['clinical', 'single', 'combinations'];
export function normalise(value = '') {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[-‐‑–—]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
export function searchText(record) {
  return normalise([record.id, record.name, record.subtitle, record.kind, record.model, record.summary, record.usefulFor, ...record.cancers, ...record.modalities, ...record.therapies, ...record.outcomes, ...(record.tags || [])].join(' '));
}
export function matchesPreset(record, preset) {
  if (preset === 'clinical') return record.model === 'Patients' && record.therapies.length > 0 && record.outcomes.some(x => ['Treatment response', 'Survival'].includes(x));
  if (preset === 'single') return record.modalities.includes('Single-cell');
  if (preset === 'combinations') return record.model === 'Cell lines' && (record.tags || []).includes('combination-screen');
  return true;
}
export function filterRecords(records, state = {}) {
  const words = normalise(state.q || '').split(' ').filter(Boolean);
  return records.filter(record => {
    if (words.length && !words.every(word => searchText(record).includes(word))) return false;
    if (state.cancer && !record.cancers.includes(state.cancer) && !record.cancers.includes('Pan-cancer')) return false;
    if (state.modality && !record.modalities.includes(state.modality)) return false;
    if (state.outcome && !record.outcomes.includes(state.outcome)) return false;
    if (state.model && record.model !== state.model) return false;
    if (state.access && record.access !== state.access) return false;
    return matchesPreset(record, state.preset);
  });
}
export function sortRecords(records, sort = 'name') {
  return [...records].sort((a, b) => (sort === 'year' ? (b.year || 0) - (a.year || 0) : 0) || a.name.localeCompare(b.name, 'en'));
}
export function stateFromURL(url, records) {
  const params = new URL(url).searchParams;
  const state = {q: (params.get('q') || '').slice(0, 200), preset: '', sort: 'name'};
  if (PRESETS.includes(params.get('preset'))) state.preset = params.get('preset');
  if (params.get('sort') === 'year') state.sort = 'year';
  const fields = {cancer:'cancers',modality:'modalities',outcome:'outcomes',model:'model',access:'access'};
  for (const key of FILTER_KEYS) {
    const value = params.get(key) || '';
    state[key] = records.some(record => Array.isArray(record[fields[key]]) ? record[fields[key]].includes(value) : record[fields[key]] === value) ? value : '';
  }
  return state;
}
export function searchURL(url, state) {
  const result = new URL(url);
  result.search = ''; result.hash = '';
  for (const key of ['q', ...FILTER_KEYS, 'preset', 'sort']) if (state[key] && !(key === 'sort' && state[key] === 'name')) result.searchParams.set(key, state[key]);
  return result.href;
}
export function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export function safeURL(value) { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } }
export function parseSaved(raw, records) {
  try {
    const parsed = JSON.parse(raw || '{}');
    const ids = new Set(records.map(r => r.id));
    const saved = new Set((Array.isArray(parsed.saved) ? parsed.saved : []).filter(id => ids.has(id)));
    const notes = Object.create(null);
    for (const id of saved) if (typeof parsed.notes?.[id] === 'string') notes[id] = parsed.notes[id].slice(0, 2000);
    return {saved, notes};
  } catch { return {saved: new Set(), notes: Object.create(null)}; }
}
export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
export function makeCSV(records, notes = {}, checked = '') {
  const headers = ['Resource','Description','Resource type','Study material','Cancer','Data types','Treatments','Outcomes','Access','Access details','Useful for','Limitation','Publication year','Source links','Source checked','My notes'];
  const rows = records.map(r => [r.name,r.summary,r.kind,r.model,r.cancers.join('; '),r.modalities.join('; '),r.therapies.join('; '),r.outcomes.join('; '),r.access,r.accessDetail,r.usefulFor,r.caveat,r.year || '',r.sources.map(s => `${s.label}: ${s.url}`).join(' | '),checked,notes[r.id] || '']);
  return '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
