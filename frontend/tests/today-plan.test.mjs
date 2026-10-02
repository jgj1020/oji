import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/lib/todayPlan.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function setup() {
  const data = new Map();
  const localStorage = {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key),
  };
  const window = new EventTarget();
  const load = () => {
    const context = { exports: {}, localStorage, window, Event };
    vm.runInNewContext(compiled, context);
    return context.exports;
  };
  return { api: load(), load, localStorage, window };
}
const first = { id: 'test-a', place_name: '테스트 카페', address: '테스트 주소', latitude: 37.5, longitude: 127, distance_m: 100 };
const second = { ...first, id: 'test-b', place_name: '테스트 공원' };

test('selected places survive reload, reordering and removal', () => {
  const { api, load } = setup();
  api.toggleTodayPlan(first);
  api.toggleTodayPlan(second);
  assert.equal(load().getTodayPlan().length, 2);
  api.moveTodayPlanPlace(1, 'up');
  assert.equal(load().getTodayPlan()[0].id, second.id);
  api.moveTodayPlanPlace(0, 'up');
  assert.equal(load().getTodayPlan()[0].id, second.id);
  api.removeTodayPlanPlace(first.id);
  assert.equal(load().getTodayPlan().length, 1);
  assert.equal(load().getTodayPlan()[0].id, second.id);
});

test('legacy selection is preserved and does not reappear after removal', () => {
  const { api, localStorage } = setup();
  localStorage.setItem('oji-selected-place', JSON.stringify(first));
  assert.equal(api.getTodayPlan()[0].id, first.id);
  api.toggleTodayPlan(first);
  assert.equal(api.getTodayPlan().length, 0);
  assert.equal(localStorage.getItem('oji-selected-place'), null);
});

test('navigation counters receive updates, including another tab, and unsubscribe', () => {
  const { api, window } = setup();
  let count = 0;
  let updates = 0;
  const unsubscribe = api.onTodayPlanChange(() => { count = api.getTodayPlan().length; updates++; });
  api.toggleTodayPlan(first);
  assert.equal(count, 1);
  api.toggleTodayPlan(second);
  assert.equal(count, 2);
  window.dispatchEvent(new Event('storage'));
  assert.equal(updates, 3);
  unsubscribe();
  api.clearTodayPlan();
  assert.equal(updates, 3);
});
