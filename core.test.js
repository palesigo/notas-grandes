import test from 'node:test';
import assert from 'node:assert/strict';
import { edit, mergeNotes, readBackup, LAYERS } from '../core.js';

test('inserção, acentos, espaço e mudança de linha', () => {
  assert.deepEqual(edit('ola',2,3,'insert','á'), {text:'olá',cursor:3});
  assert.deepEqual(edit('olá',3,3,'space',' '), {text:'olá ',cursor:4});
  assert.deepEqual(edit('olá',3,3,'line','\n'), {text:'olá\n',cursor:4});
});
test('apagar seleção, primeiro carácter e emoji', () => {
  assert.deepEqual(edit('abc',0,2,'erase'), {text:'c',cursor:0});
  assert.deepEqual(edit('abc',0,0,'erase'), {text:'abc',cursor:0});
  assert.deepEqual(edit('a😊b',3,3,'erase'), {text:'ab',cursor:1});
});
test('mover cursor respeita seleção e limites', () => {
  assert.equal(edit('a😊b',3,3,'left').cursor,1);
  assert.equal(edit('a😊b',1,1,'right').cursor,3);
  assert.equal(edit('abc',1,2,'right').cursor,2);
  assert.equal(edit('abc',0,0,'left').cursor,0);
  assert.equal(edit('abc',3,3,'right').cursor,3);
});
test('teclados incluem o alfabeto e os caracteres portugueses', () => {
  assert.deepEqual([...LAYERS.letters].sort(), [...LAYERS.xl].sort());
  assert.equal(new Set(LAYERS.xl).size,27);
  assert.ok([...'áàâãçéêíóôõú'].every(c => [...LAYERS.letters,...LAYERS.accents].includes(c)));
});
test('valida cópias e rejeita dados inválidos', () => {
  const notes = [{id:'1',text:'Olá',updated:0}];
  assert.deepEqual(readBackup(JSON.stringify({version:1,notes})),notes);
  for (const raw of ['x','null','{"version":2,"notes":[]}', '{"version":1,"notes":[{"id":"1","text":5,"updated":0}]}']) {
    assert.throws(() => readBackup(raw));
  }
});
test('importação não sobrescreve notas e evita duplicados por texto', () => {
  const a = {id:'1',text:'A',updated:0};
  const b = {id:'1',text:'B',updated:1};
  assert.deepEqual(mergeNotes([a],[b,b,a],()=>'2'), [a,{...b,id:'2'}]);
});
