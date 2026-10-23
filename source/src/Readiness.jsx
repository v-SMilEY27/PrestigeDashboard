import React from 'react';
import {Card,Section,Chip,Thin,Chev,Done,CheckGlyph,NumTick,toggleNum} from './ui.jsx';
import {slug,curLevel,maxLvl} from './hideout.js';
import {nbList} from './nb.js';
import {storyProgress,STORY} from './story.js';
import {TRADERS,CQUESTS,COLLECTOR_ITEMS,cqKey} from './data.js';

// Every requirement the planner tracks for this prestige, as pass or fail.
export const buildReadiness=(cy,s)=>{
  const lvl=s.n.lvl||0,rub=s.n.rub||0,needCol=cy.tasks.includes('Collector');
  const R=[];
  const add=(group,label,have,need,done,go,note,key,pri,inp)=>R.push({group,label,have,need,done,go,note,key,pri,inp});
  // groups follow the in-game unlock panel; pri is the order the planner suggests doing things
  add('Level and roubles','PMC level',lvl,cy.lvl,lvl>=cy.lvl,null,null,undefined,3,{k:'lvl'});
  if(needCol)add('Tasks','Collector',s.c['t:Collector']?1:0,1,!!s.c['t:Collector'],null,`${COLLECTOR_ITEMS.filter(i=>s.c['ci:'+i.n]).length}/${COLLECTOR_ITEMS.length} items ticked below. Tick it once the game shows it done`,'t:Collector',5);
  cy.tasks.filter(t=>t!=='Collector'&&t!=='New Beginning').forEach(t=>add('Tasks',t,s.c['t:'+t]?1:0,1,!!s.c['t:'+t],null,'Task','t:'+t,1));
  cy.story.forEach(t=>add('Tasks',t,s.c['s:'+t]?1:0,1,!!s.c['s:'+t],null,(()=>{const p=storyProgress(t,s);return p?`Story chapter · ${p.have}/${p.need} steps ticked below`:'Story chapter'})(),'s:'+t,1));
  if(cy.tasks.includes('New Beginning'))add('Tasks','New Beginning',s.c['t:New Beginning']?1:0,1,!!s.c['t:New Beginning'],null,(()=>{const o=nbList(cy,s);return o.length?`${o.filter(x=>x.done).length}/${o.length} objectives ticked below. Do this last`:'Do this last'})(),'t:New Beginning',6);
  Object.entries(cy.skills).forEach(([k,m])=>{const v=s.n['k:'+k]||0;add('Skills',k,v,m,v>=m,null,null,undefined,4,{k:'k:'+k})});
  Object.entries(cy.hideout).forEach(([k,m])=>{const c=curLevel(s,cy,slug(k));add('Hideout upgrades',k,c,m,c>=m,['Hideout'],null,undefined,2,{k:'hl:'+slug(k),val:c,max:maxLvl(slug(k))})});
  add('Level and roubles','Roubles in stash (millions)',rub,cy.rub,rub>=cy.rub,null,null,undefined,4.5,{k:'rub',step:0.1});
  if(needCol){
    const low=TRADERS.filter(t=>(s.n['ll:'+t]||1)<4);
    add('Collector steps','Traders at loyalty level 4',TRADERS.length-low.length,TRADERS.length,low.length===0,['Traders and Tasks'],low.length?'Still below LL4: '+low.join(', '):null,undefined,5);
    const q=CQUESTS.filter(x=>s.c[cqKey(x)]).length;add('Collector steps','Gate quests',q,CQUESTS.length,q===CQUESTS.length,['Traders and Tasks',{view:'collector'}],null,undefined,5);
    const it=COLLECTOR_ITEMS.filter(i=>s.c['ci:'+i.n]).length;add('Collector steps','Found-in-raid items',it,COLLECTOR_ITEMS.length,it===COLLECTOR_ITEMS.length,['Traders and Tasks',{view:'collector'}],null,undefined,5);
  }
  const order=['Level and roubles','Tasks','Skills','Hideout upgrades','Collector steps'];
  const unmet=R.filter(r=>!r.done).sort((a,b)=>a.pri-b.pri);
  // Partial credit: a number row counts have/need, a story chapter or New Beginning counts its ticked steps. Only a met row counts as whole.
  R.forEach(r=>{let f=r.done?1:Math.min(1,r.need?r.have/r.need:0);
    if(!r.done&&r.key){
      if(r.key.startsWith('s:')){const p=storyProgress(r.label,s);if(p&&p.need)f=p.have/p.need}
      else if(r.key==='t:New Beginning'){const o=nbList(cy,s);if(o.length)f=o.filter(x=>x.done).length/o.length}}
    r.frac=r.done?1:Math.min(0.99,Math.max(0,f))});
  const all=R.length&&R.every(r=>r.done),pct=!R.length?0:all?100:Math.min(99,Math.round(R.reduce((a,r)=>a+r.frac,0)/R.length*100));
  return {rows:R,order,blocker:unmet[0]||null,done:R.filter(r=>r.done).length,pct};
};

// Where on the Overview page a task row leads when its name is pressed (the circle still ticks it).
const jumpId=r=>!r.key?null:r.key==='t:New Beginning'?'sec-nb':r.key==='t:Collector'?'sec-collector':r.key.startsWith('s:')&&STORY[r.label]?'sec-story-'+slug(r.label):null;
export const jumpTo=id=>{
  window.dispatchEvent(new CustomEvent('pd-jump',{detail:id}));
  setTimeout(()=>{const el=document.getElementById(id);if(!el)return;
    const d=el.querySelector(':scope > details');if(d)d.open=true;
    let calm=false;try{calm=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
    el.scrollIntoView({behavior:calm?'auto':'smooth',block:'start'});
    el.classList.remove('jump-flash');void el.offsetWidth;el.classList.add('jump-flash');setTimeout(()=>el.classList.remove('jump-flash'),1400)},60)};

export default function Readiness({cy,s,go,tg,set}){
  const {rows,order,blocker,done}=buildReadiness(cy,s);
  const ready=blocker===null;
  return <Section title="Prestige readiness">
    <Card c={'!py-3 border-l-4 '+(ready?'border-green-400/40 !border-l-green-400 bg-green-400/5':'border-zinc-800 !border-l-amber-500')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><div className={'text-xs font-semibold uppercase tracking-wider '+(ready?'text-green-400':'text-amber-500')}>{ready?'Ready':'Next blocker'}</div>
          <div className={'text-lg font-bold leading-6 '+(ready?'text-green-300':'')}>{ready?'Every tracked requirement is met':<>{blocker.label}{blocker.need>1?<span className="text-zinc-400 font-normal text-base"> ({blocker.have}/{blocker.need})</span>:''}</>}</div>
          {ready&&<div className="text-sm text-zinc-400">Open the Prestige tab in game to confirm it lets you continue.</div>}</div>
        {!ready&&blocker.go&&<button onClick={()=>go(...blocker.go)} className="rounded-lg bg-amber-500 text-black text-sm font-semibold px-3 py-1.5 hover:bg-amber-400">Go there</button>}
      </div>
    </Card>
    <div className="sm:columns-2 gap-3">{order.filter(g=>rows.some(r=>r.group===g)).map(g=>{const gr=rows.filter(r=>r.group===g),gd=gr.filter(r=>r.done).length;
      const all=gd===gr.length;
      return <div key={g} id={g==='Collector steps'?'sec-collector-steps':undefined} className="break-inside-avoid mb-3 scroll-mt-24 rounded-xl"><Card c={'!p-3 '+(all?'border-green-400/25':'')}><details key={g+all} open={!all} className="group">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-2"><span className="font-semibold flex items-center gap-2"><span className="text-zinc-500 text-xs transition-transform group-open:rotate-90"><Chev/></span>{all&&<Done/>}{g}</span><Chip tone={all?'ok':'mute'}>{gd}/{gr.length}</Chip></summary>
        <div className="grid gap-0.5 mt-1">{gr.map(r=>{const isB=blocker&&blocker.label===r.label&&blocker.group===r.group;
          const jid=jumpId(r),Txt=jid?'button':'span';
          const Tag=r.key&&!jid?'label':r.go&&!r.inp&&!r.key?'button':'div';
          const props=r.key||r.inp?{}:r.go?{onClick:()=>go(...r.go)}:{};
          return <Tag key={r.label} {...props} className={'text-left flex items-center gap-2 rounded-lg px-2 py-1.5 '+(r.key||r.go?'cursor-pointer hover:bg-white/5 ':'')+(isB?'ring-1 ring-amber-500/60 bg-amber-500/5':'')}>
            {r.key?(jid?<label className="cbx"><input type="checkbox" checked={r.done} onChange={()=>tg(r.key)} className="accent-amber-500 mt-0.5 size-4 shrink-0" aria-label={r.label}/></label>:<input type="checkbox" checked={r.done} onChange={()=>tg(r.key)} className="accent-amber-500 mt-0.5 size-4 shrink-0" aria-label={r.label}/>)
              :r.inp?<NumTick className="mt-0.5" done={r.done} canClear={s.n['prev:'+r.inp.k]!==undefined} onClick={()=>toggleNum(s,set,r.inp.k,r.need,r.inp.val??s.n[r.inp.k]??0)} label={(r.done?'Clear: ':'Mark reached: ')+r.label}/>
              :<span className={'mt-0.5 grid place-items-center size-4 shrink-0 rounded-full text-xs font-bold '+(r.done?'bg-green-500 text-green-950':'border border-zinc-600 text-transparent')} aria-label={r.done?'met':'not met'}><CheckGlyph/></span>}
            <Txt {...(jid?{type:'button',onClick:()=>jumpTo(jid),title:'Jump to '+r.label+' below'}:{})} className={'min-w-0 flex-1 '+(jid?'text-left cursor-pointer':'')}><span className={'text-sm '+(r.done?'text-zinc-400':'font-medium')}>{r.label}</span>{!r.inp&&r.need>1&&<span className="text-xs text-zinc-500 ml-2">{r.have}/{r.need}</span>}
              {isB&&<span className="ml-2"><Chip tone="warn">next</Chip></span>}{r.note&&!r.done&&<span className="block text-xs text-zinc-500">{r.note}</span>}</Txt>{r.inp&&<span className="flex items-center gap-2 shrink-0"><input type="number" min="0" max={r.inp.max} step={r.inp.step||1} value={r.inp.val??s.n[r.inp.k]??''} onChange={e=>{const v=e.target.value===''?undefined:+e.target.value;set(r.inp.k,v!==undefined&&r.inp.max!==undefined?Math.max(0,Math.min(r.inp.max,v)):v)}} aria-label={r.group==='Hideout upgrades'?r.label+' level built':r.label} placeholder="0" className="bg-zinc-800 w-20 px-2 py-0.5 rounded text-sm text-zinc-100"/><span className="text-xs text-zinc-500">/ {r.need}{r.group==='Hideout upgrades'?' built':''}</span><span className="w-14 shrink-0"><Thin p={r.frac*100} tone={r.done?'bg-green-500':'bg-amber-500'}/></span></span>}</Tag>})}</div></details></Card></div>})}</div>
  </Section>;
}
