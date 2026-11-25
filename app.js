import { STORAGE, LAYERS, edit, readBackup, mergeNotes } from './core.js';
const $ = selector => document.querySelector(selector);
const editor = $('#note');
const keys = $('#keys');
const dialog = $('#library');
const status = $('#storage');
const makeId = () => crypto.randomUUID();
const empty = () => ({id:makeId(), text:'', updated:Date.now()});
let state = {version:1, notes:[], active:null, xl:false, native:false};
let loaded = true;
try {
  const saved = localStorage.getItem(STORAGE);
  if (saved) {
    const parsed = JSON.parse(saved);
    state = {...state, notes:readBackup(saved), active:parsed.active, xl:parsed.xl === true, native:parsed.native === true};
  }
} catch { loaded = false; }
let active = state.notes.find(n => n.id === state.active) ?? state.notes[0] ?? empty();
let uppercase = false, layer = 'letters', history = [], knownText = '';
function message(text, error = false) {
  if (status.textContent !== text) status.textContent = text;
  status.classList.toggle('error', error);
}
function save() {
  if (!loaded) {
    message('Não foi possível ler o armazenamento. As alterações não são guardadas; usa a exportação.', true);
    return false;
  }
  try {
    localStorage.setItem(STORAGE, JSON.stringify({...state, active:active.id}));
    message(active.text ? 'Nota guardada neste iPad.' : 'Pronto a escrever.');
    return true;
  } catch {
    message('Não foi possível guardar. Exporta a nota antes de fechar a aplicação.', true);
    return false;
  }
}
function button(label, handler) {
  const node = document.createElement('button');
  node.type = 'button'; node.textContent = label;
  node.addEventListener('click', handler);
  return node;
}
function showKeyboard() {
  const layout = layer === 'letters' && state.xl ? 'xl' : layer;
  keys.className = `keys ${state.xl ? 'xl' : ''} layout-${layout}`;
  keys.replaceChildren(...LAYERS[layout].map(char => {
    const label = uppercase ? char.toLocaleUpperCase('pt-PT') : char;
    const key = button(label, () => command('insert', key.textContent));
    key.dataset.char = char;
    return key;
  }));
}
function showUndo() {
  $('#undo').setAttribute('aria-disabled', String(history.length === 0));
}
function activate(note) {
  active = note;
  editor.value = note.text;
  knownText = editor.value;
  editor.setSelectionRange(knownText.length, knownText.length);
  history = [];
  showUndo();
  save();
}
function remember(text, start, end = start) {
  history.push({text,start,end});
  if (history.length > 100) history.shift();
  showUndo();
}
function commit() {
  knownText = editor.value;
  active.text = knownText;
  active.updated = Date.now();
  if (!state.notes.includes(active) && knownText) state.notes.push(active);
  save();
}
function command(action, char = '') {
  const {value, selectionStart:start, selectionEnd:end} = editor;
  if (action === 'undo') {
    const previous = history.pop();
    if (!previous) return;
    editor.value = previous.text;
    editor.setSelectionRange(previous.start, previous.end);
    showUndo(); commit();
    return;
  }
  const insert = {space:' ', line:'\n', insert:char}[action] ?? '';
  const result = edit(value, start, end, action, insert);
  if (result.text !== value) {
    remember(value, start, end);
    editor.value = result.text;
    commit();
    if (result.cursor === result.text.length) editor.scrollTop = editor.scrollHeight;
  }
  editor.setSelectionRange(result.cursor, result.cursor);
}
let beforeInput = null;
editor.addEventListener('beforeinput', () => {
  beforeInput = {start:editor.selectionStart, end:editor.selectionEnd};
});
editor.addEventListener('input', () => {
  if (editor.value !== knownText) {
    const {start,end} = beforeInput ?? {start:knownText.length,end:knownText.length};
    remember(knownText, start, end);
    commit();
  }
  beforeInput = null;
});
document.querySelectorAll('[data-command]').forEach(node => {
  node.addEventListener('click', () => command(node.dataset.command));
});
const layerButtons = document.querySelectorAll('[data-layer]');
layerButtons.forEach(node => node.addEventListener('click', () => {
  layer = node.dataset.layer;
  layerButtons.forEach(b => b.setAttribute('aria-pressed', String(node === b)));
  showKeyboard();
}));
$('#shift').addEventListener('click', () => {
  uppercase = !uppercase;
  $('#shift').setAttribute('aria-pressed', String(uppercase));
  showKeyboard();
});
function showXL() {
  $('#xl').setAttribute('aria-pressed', String(state.xl));
  showKeyboard();
}
$('#xl').addEventListener('click', () => { state.xl = !state.xl; showXL(); save(); });
function showNative() {
  editor.inputMode = state.native ? 'text' : 'none';
  $('#native').setAttribute('aria-pressed', String(state.native));
}
$('#native').addEventListener('click', () => {
  state.native = !state.native; showNative(); save();
  if (state.native) editor.focus();
});
$('#new').addEventListener('click', () => activate(empty()));
const date = new Intl.DateTimeFormat('pt-PT', {dateStyle:'short', timeStyle:'short'});
function showLibrary() {
  const notes = $('#notes');
  notes.replaceChildren();
  if (!state.notes.length) {
    const hint = document.createElement('li'); hint.textContent = 'Ainda não há notas guardadas.'; notes.append(hint);
  }
  for (const note of [...state.notes].sort((a,b) => b.updated - a.updated)) {
    const title = (note.text.trim().split(/\r?\n/,1)[0] || 'Nota sem texto').slice(0,60);
    const li = document.createElement('li');
    const open = button(`${title} · ${date.format(note.updated)}`, () => { activate(note); dialog.close(); });
    open.className = 'note-open';
    const remove = button('Eliminar', () => {
      if (!confirm(`Eliminar a nota «${title}»? Esta ação não pode ser desfeita.`)) return;
      state.notes = state.notes.filter(n => n !== note);
      if (active === note) activate(empty()); else save();
      showLibrary(); dialog.querySelector('button').focus();
    });
    remove.setAttribute('aria-label', `Eliminar a nota ${title}`);
    li.append(open, remove); notes.append(li);
  }
}
$('#open').addEventListener('click', () => { showLibrary(); dialog.showModal(); });
function download(name, type, content) {
  const url = URL.createObjectURL(new Blob([content], {type}));
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
$('#text').addEventListener('click', () => download('nota.txt','text/plain;charset=utf-8',editor.value));
$('#backup').addEventListener('click', () => download('notas-grandes.json','application/json',JSON.stringify({version:1, notes:state.notes}, null, 2)));
const file = $('#file');
$('#restore').addEventListener('click', () => file.click());
file.addEventListener('change', async () => {
  const selected = file.files[0]; file.value = '';
  if (!selected) return;
  const feedback = $('#feedback');
  try {
    if (selected.size > 10 * 1024 * 1024) throw new Error('Ficheiro demasiado grande');
    const imported = readBackup(await selected.text());
    const previous = state.notes.length;
    state.notes = mergeNotes(state.notes, imported, makeId);
    const count = state.notes.length - previous;
    const ok = count === 0 || save();
    feedback.textContent = count === 0 ? 'Não foram encontradas notas novas.'
      : `${count} ${count === 1 ? 'nota importada' : 'notas importadas'}${ok ? '.' : ' na sessão, mas sem guardar no dispositivo.'}`;
  } catch { feedback.textContent = 'Não foi possível importar. Escolhe um ficheiro JSON de Notas Grandes até 10 MB.'; }
});
showNative(); showXL(); activate(active);
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready)
    .then(() => { $('#offline').hidden = false; }).catch(error => console.warn('Modo offline indisponível:', error));
}
