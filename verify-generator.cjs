// 运行 node verify-generator.cjs；固定随机种子使批量检查可复现。
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let seed=20261029;
const math=Object.create(Math);
math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const c=vm.createContext({Math:math});
for(const file of ['i18n.js','level.js','sketch.js','generator.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),c);
const run=s=>vm.runInContext(s,c);
vm.runInContext("language='zh'",c);
let previous='',fallbacks=0;const signatures=new Set(), starts=new Set(), goals=new Set();const started=Date.now();
for(let i=0;i<200;i++){
 c.previous=previous;
 const result=run('generateLevel(previous)');
 assert.notEqual(result.signature,previous);
 assert(run('isGoodLevel()'));
 assert(run('hasSeparatePositions()'));
 assert(run('checkState(LEVEL.start.x,LEVEL.start.y,LEVEL.start.mode).valid'));
 const solution=run('findLevelSolution()');
 let state=run('({...LEVEL.start})');
 for(const step of solution){
  if(step.action==='空格'){assert.equal(step.x,state.x);assert.equal(step.y,state.y);assert.notEqual(step.mode,state.mode);}
  else{assert.equal(Math.abs(step.x-state.x)+Math.abs(step.y-state.y),1);assert.equal(step.mode,state.mode);}
  c.step=step;assert(run('checkState(step.x,step.y,step.mode).valid'));state=step;
 }
 c.state=state;assert(run('checkWin(state.x,state.y,state.mode)'));
 starts.add(run('JSON.stringify(LEVEL.start)'));goals.add(run('JSON.stringify([LEVEL.playerGoal,LEVEL.shadowGoal])'));
 signatures.add(result.signature);previous=result.signature;fallbacks+=Number(result.fallback);
}
assert(starts.size>1);assert(goals.size>1);
for(const index of [0,1]){run(`applyLevel(RANDOM_FALLBACKS[${index}])`);assert(run('hasSeparatePositions() && isGoodLevel()'));}
// 强制重复相同随机序列，使 300 次尝试均被排除，检查备选分支。
math.random=()=>0;
const first=run('generateLevel()');c.previous=first.signature;
const fallback=run('generateLevel(previous)');assert(fallback.fallback);assert.notEqual(fallback.signature,first.signature);assert(run('isGoodLevel()'));
// 存储不可用时初始化仍可运行。
const labels={};Object.assign(c,{localStorage:{getItem(){throw Error('denied');},setItem(){throw Error('denied');}},document:{getElementById(id){return labels[id]??={};}}});
run('initializeRandomLevel()');assert(labels.feedback.textContent.includes('可解性'));
assert(run('playerX===LEVEL.start.x && playerY===LEVEL.start.y && currentMode===LEVEL.start.mode'));
assert(labels.objective.textContent.includes(run('String(LEVEL.playerGoal.x)')));
console.log(`PASS: 200 generated levels, ${signatures.size} unique, ${starts.size} starts, ${goals.size} goal pairs, ${fallbacks} fallbacks; full route replay, restrictions, forced fallback and unavailable storage. ${Date.now()-started}ms`);
