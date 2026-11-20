import {FILTER_KEYS, filterRecords, sortRecords, stateFromURL, searchURL, escapeHTML as esc, safeURL, parseSaved, makeCSV} from './core.js';
const $ = id => document.getElementById(id);
const STORAGE_KEY = 'cancer-dataset-finder-v1';
const KIND_NAMES = {cohort:'Patient cohort',collection:'Collection',screen:'Laboratory screen'};
let directory, records = [], state = {}, saved = new Set(), notes = Object.create(null), expanded = new Set(), view = 'all', displayed = [], toastTimer, storageAvailable = true;

function toast(message) { clearTimeout(toastTimer); $('toast').textContent = message; $('toast').hidden = false; toastTimer = setTimeout(() => $('toast').hidden = true, 4200); }
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({saved:[...saved], notes})); storageAvailable = true; return true; }
  catch { storageAvailable = false; return false; }
}
function stateFromControls() {
  state.q = $('search').value.slice(0, 200);
  for (const key of FILTER_KEYS) state[key] = $(key).value;
  state.sort = $('sort').value;
}
function syncControls() {
  $('search').value = state.q || '';
  for (const key of FILTER_KEYS) $(key).value = state[key] || '';
  $('sort').value = state.sort || 'name';
}
function saveURL() { try { history.replaceState(null, '', searchURL(location.href, state)); } catch {} }
function readableDate(iso) { return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}); }
function renderDetail(record) {
  return `<p class="detail-intro">${esc(record.summary)}</p><div class="detail-grid"><div><h3>Useful for</h3><p>${esc(record.usefulFor)}</p></div><div><h3>Getting the data</h3><p>${esc(record.accessDetail)}</p></div><div><h3>Treatments covered</h3><p>${record.therapies.length ? esc(record.therapies.join(' · ')) : 'No specific treatment is indexed here. Check the source for study-level metadata.'}</p></div><div><h3>Before you use it</h3><p>${esc(record.caveat)}</p></div></div><div class="source-links">${record.sources.map(source => `<a href="${esc(safeURL(source.url))}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a>`).join('')}</div><p class="source-provenance">Source checked ${esc(readableDate(directory.checked))}. ${esc(record.sourceNote || '')}</p>${saved.has(record.id) ? `<div class="note-wrap"><label for="note-${esc(record.id)}">Your research notes</label><textarea id="note-${esc(record.id)}" data-note="${esc(record.id)}" maxlength="2000" placeholder="E.g. check response labels and commercial-use terms">${esc(notes[record.id] || '')}</textarea><small>Saved in this browser only · Included in CSV export</small></div>` : ''}`;
}
function renderRecord(record) {
  const id = esc(record.id), isExpanded = expanded.has(record.id), isSaved = saved.has(record.id);
  return `<article class="resource" aria-labelledby="name-${id}"><div class="resource-summary"><div><button class="resource-title" id="name-${id}" data-details="${id}" aria-expanded="${isExpanded}" aria-controls="detail-${id}">${esc(record.name)}</button><p class="subtitle">${esc(record.subtitle)}</p><div class="meta"><span class="material">${esc(record.model)}</span><span>${esc(KIND_NAMES[record.kind] || record.kind)}</span>${record.year ? `<span>${esc(record.year)}</span>` : ''}</div></div><div class="data-cell"><span class="cell-label">Data</span><p class="data-types">${esc(record.modalities.join(' · '))}</p><div class="cancers">${esc(record.cancers.join(' · '))}</div></div><div class="outcome-cell"><span class="cell-label">Outcomes</span><div class="outcomes">${record.outcomes.length ? record.outcomes.map(x=>`<span>${esc(x)}</span>`).join('') : '<span class="not-listed">Not indexed</span>'}</div></div><div class="access-cell"><span class="access-tag access-${esc(record.access.toLowerCase())}">${esc(record.access)}</span><button class="details-link" data-details="${id}" aria-label="${isExpanded ? 'Close' : 'Open'} details for ${esc(record.name)}" aria-expanded="${isExpanded}" aria-controls="detail-${id}">${isExpanded ? 'Close details' : 'View details'}</button></div><div class="save-cell"><button id="save-${id}" class="save-button" data-save="${id}" aria-pressed="${isSaved}" aria-label="${isSaved ? 'Remove' : 'Save'} ${esc(record.name)}${isSaved ? ' from' : ' to'} shortlist"><svg viewBox="0 0 12 16" aria-hidden="true"><path d="M1.5 1.5h9v13L6 11.5l-4.5 3z"/></svg>${isSaved ? 'Saved' : 'Save'}</button></div></div><div class="resource-detail" id="detail-${id}" ${isExpanded ? '' : 'hidden'}>${isExpanded ? renderDetail(record) : ''}</div></article>`;
}
function render() {
  const selected = view === 'saved' ? records.filter(r => saved.has(r.id)) : filterRecords(records, state);
  displayed = sortRecords(selected, state.sort);
  $('total-count').textContent = records.length;
  $('saved-count').textContent = saved.size;
  $('all-tab').setAttribute('aria-pressed', view === 'all');
  $('saved-tab').setAttribute('aria-pressed', view === 'saved');
  document.querySelector('.search-workbench').hidden = view === 'saved';
  $('share').hidden = view === 'saved';
  $('share').disabled = false;
  $('export').disabled = displayed.length === 0;
  $('export').textContent = view === 'saved' ? 'Export shortlist' : 'Export CSV';
  const filtered = Boolean(state.q || state.preset || FILTER_KEYS.some(key=>state[key]));
  const filterCount = FILTER_KEYS.filter(key=>state[key]).length;
  $('mobile-filter-count').textContent = filterCount ? `(${filterCount} active)` : '';
  $('reset').hidden = !filtered;
  document.querySelectorAll('[data-preset]').forEach(button => button.setAttribute('aria-pressed', button.dataset.preset === state.preset));
  const presetLabels = {clinical:'Patient cohorts with a named treatment and indexed response or survival outcomes.',single:'Resources that include single-cell measurements.',combinations:'Preclinical screens with measured drug combinations. These are not patient outcomes.'};
  $('filter-note').textContent = presetLabels[state.preset] || (state.cancer ? 'Includes pan-cancer collections. Check each source for cancer-specific coverage.' : 'Collections may include several cancers. Access is explained for every resource.');
  $('results-heading').innerHTML = view === 'saved' ? `<strong>${displayed.length}</strong> saved resource${displayed.length === 1 ? '' : 's'}` : `<strong>${displayed.length}</strong> of ${records.length} resources${filtered ? ' match' : ''}`;
  $('list-note').hidden = view !== 'saved';
  $('list-note').textContent = storageAvailable ? 'Your shortlist is saved in this browser. Open a resource to add notes. Directory filters do not apply here.' : 'Browser storage is unavailable. This shortlist lasts only for this page session. Export it before leaving.';
  $('results').innerHTML = displayed.length ? '<div class="table-labels" aria-hidden="true"><span>Resource</span><span>Data & cancer</span><span>Outcomes</span><span>Access</span><span>Shortlist</span></div>' + displayed.map(renderRecord).join('') : '';
  $('empty').hidden = displayed.length > 0;
  if (!displayed.length) $('empty').innerHTML = view === 'saved' ? '<h3>Keep useful resources together.</h3><p>Choose Save beside a resource, then come back here to add notes and export your shortlist.</p><button class="solid" data-action="browse">Browse the directory</button>' : '<h3>No resources match this search.</h3><p>Try a broader cancer type, fewer keywords or a different access filter.</p><button class="solid" data-action="reset">Clear search and filters</button>';
  $('end-note').hidden = displayed.length === 0;
  $('coverage-note').textContent = `${records.length} curated resources · Sources checked ${readableDate(directory.checked)}`;
  $('results').setAttribute('aria-busy', 'false');
}
function resetFilters() { state = {q:'',preset:'',sort:state.sort || 'name',...Object.fromEntries(FILTER_KEYS.map(k=>[k,'']))}; syncControls(); saveURL(); render(); }
function changeView(next) { view = next; render(); }
function toggleSave(id) {
  if (saved.has(id)) saved.delete(id); else saved.add(id);
  const stored = persist();
  render();
  const focus = $('save-' + id) || $('saved-tab'); focus.focus({preventScroll:true});
  if (!stored) toast('Saved for this session only. Export your shortlist to keep it.');
  else toast(saved.has(id) ? 'Added to your shortlist.' : 'Removed from your shortlist.');
}
function toggleDetails(id) {
  const record = records.find(r=>r.id===id); if (!record) return;
  if (expanded.has(id)) expanded.delete(id); else expanded.add(id);
  const panel = $('detail-' + id), open = expanded.has(id);
  panel.hidden = !open; if (open) panel.innerHTML = renderDetail(record);
  document.querySelectorAll(`[data-details="${id}"]`).forEach(button=>{
    button.setAttribute('aria-expanded', open);
    if (button.classList.contains('details-link')) { button.textContent = open ? 'Close details' : 'View details'; button.setAttribute('aria-label', `${open ? 'Close' : 'Open'} details for ${record.name}`); }
  });
}
function openAbout() { $('about-dialog').showModal(); }
function exportCSV() {
  if (!displayed.length) return;
  const blob = new Blob([makeCSV(displayed, notes, directory.checked)], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob), anchor = document.createElement('a');
  anchor.href = url; anchor.download = `cancer-datasets-${view === 'saved' ? 'shortlist' : 'results'}-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast(`Exported ${displayed.length} resource${displayed.length === 1 ? '' : 's'} with source links.`);
}
async function copySearch() {
  const url = searchURL(location.href, state);
  try { await navigator.clipboard.writeText(url); toast('Search link copied. Shortlist and notes stay private.'); }
  catch { $('share-url').value = url; $('share-dialog').showModal(); $('share-url').focus(); $('share-url').select(); }
}
async function loadDirectory() {
  $('loading').hidden = false; $('error').hidden = true;
  const controls = document.querySelectorAll('.search-workbench input,.search-workbench select,.search-workbench button,.view-tabs button,#sort');
  controls.forEach(control=>control.disabled=true);
  try {
    const response = await fetch('./data.json', {cache:'no-cache'});
    if (!response.ok) throw new Error('Directory unavailable');
    directory = await response.json();
    if (directory.version !== 1 || !Array.isArray(directory.records) || !directory.records.length) throw new Error('Invalid directory');
    records = directory.records;
    for (const record of records) if (!/^[a-z0-9-]+$/.test(record.id) || !record.sources.every(s=>safeURL(s.url))) throw new Error('Invalid resource');
    for (const [key, field] of [['cancer','cancers'],['modality','modalities'],['outcome','outcomes']]) {
      const values = [...new Set(records.flatMap(r=>r[field]))].sort((a,b)=>a.localeCompare(b));
      const initial = $(key).options[0].outerHTML;
      $(key).innerHTML = initial + values.map(value=>`<option>${esc(value)}</option>`).join('');
    }
    state = stateFromURL(location.href, records); syncControls();
    let raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch { storageAvailable = false; }
    ({saved, notes} = parseSaved(raw, records));
    $('about-coverage').textContent = `${records.length} resources were checked against public source descriptions on ${readableDate(directory.checked)}. Individual records link to the repository or resource and supporting publications where available.`;
    $('loading').hidden = true;
    controls.forEach(control=>control.disabled=false);
    render();
  } catch (error) {
    $('loading').hidden = true; $('error').hidden = false; $('results-heading').textContent = 'Directory unavailable';
    $('results').setAttribute('aria-busy', 'false');
  }
}
$('search-form').addEventListener('submit', event=>event.preventDefault());
$('search').addEventListener('input', ()=>{ if (!records.length) return; stateFromControls(); saveURL(); render(); });
FILTER_KEYS.forEach(key=>$(key).addEventListener('change', ()=>{stateFromControls();saveURL();render();}));
$('sort').addEventListener('change', ()=>{stateFromControls();saveURL();render();});
document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{state.preset = state.preset === button.dataset.preset ? '' : button.dataset.preset; saveURL();render();}));
$('reset').addEventListener('click',resetFilters);
$('toggle-filters').addEventListener('click',()=>{const open=$('toggle-filters').getAttribute('aria-expanded')!=='true';$('toggle-filters').setAttribute('aria-expanded',open);$('filter-controls').classList.toggle('is-open',open);});
$('all-tab').addEventListener('click',()=>changeView('all'));
$('saved-tab').addEventListener('click',()=>changeView('saved'));
$('export').addEventListener('click',exportCSV);
$('share').addEventListener('click',copySearch);
$('results').addEventListener('click',event=>{const save=event.target.closest('[data-save]'),details=event.target.closest('[data-details]');if(save)toggleSave(save.dataset.save);else if(details)toggleDetails(details.dataset.details);});
$('results').addEventListener('input',event=>{const id=event.target.dataset.note;if(id && saved.has(id)){notes[id]=event.target.value.slice(0,2000);if(!persist())toast('Notes are temporary. Export your shortlist to keep them.');}});
$('empty').addEventListener('click',event=>{const action=event.target.closest('[data-action]')?.dataset.action;if(action==='reset')resetFilters();if(action==='browse')changeView('all');});
$('about-button').addEventListener('click',openAbout);$('bottom-about').addEventListener('click',openAbout);
$('close-about').addEventListener('click',()=>$('about-dialog').close());$('close-share').addEventListener('click',()=>$('share-dialog').close());
for(const dialog of [$('about-dialog'),$('share-dialog')])dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
$('retry').addEventListener('click',loadDirectory);
document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){event.preventDefault();if(view==='saved')changeView('all');$('search').focus();}});
window.addEventListener('popstate',()=>{if(records.length){state=stateFromURL(location.href,records);syncControls();changeView('all');}});
loadDirectory();
