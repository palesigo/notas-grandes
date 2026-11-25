export const STORAGE = 'notas-grandes-v1';
export const LAYERS = {
  letters: [...'qwertyuiopasdfghjklzxcvbnmç'],
  xl: [...'abcdefghijklmnopqrstuvwxyzç'],
  accents: [...'áàâãéêíóôõúü'],
  symbols: [...'1234567890.,!?;:@#-+()/“”’%€&=']
};
export function edit(value, start, end, action, insert = '') {
  const before = [...value.slice(0, start)].pop()?.length ?? 0;
  const after = [...value.slice(end)][0]?.length ?? 0;
  if (action === 'left') return {text:value, cursor:start === end ? start - before : start};
  if (action === 'right') return {text:value, cursor:start === end ? end + after : end};
  if (action === 'erase' && start === end) start -= before;
  return {text:value.slice(0,start) + insert + value.slice(end), cursor:start + insert.length};
}
export function readBackup(raw) {
  const data = JSON.parse(raw);
  if (!data || data.version !== 1 || !Array.isArray(data.notes) || !data.notes.every(n =>
    n && typeof n.id === 'string' && n.id.length > 0 && typeof n.text === 'string' &&
    typeof n.updated === 'number' && Number.isFinite(n.updated) && n.updated >= 0 && n.updated <= 8.64e15
  )) throw new Error('Formato inválido');
  return data.notes.map(({id,text,updated}) => ({id,text,updated}));
}
export function mergeNotes(current, incoming, makeId) {
  const result = [...current];
  const ids = new Set(current.map(n => n.id));
  const contents = new Set(current.map(n => n.text));
  for (const note of incoming) {
    if (contents.has(note.text)) continue;
    const id = ids.has(note.id) ? makeId() : note.id;
    result.push({...note, id});
    ids.add(id);
    contents.add(note.text);
  }
  return result;
}
