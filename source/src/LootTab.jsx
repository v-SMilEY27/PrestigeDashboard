import KeysTab from './KeysTab.jsx';
import React from 'react';
import {useLS} from './useLS.js';
import {Empty,Card,Chip,Tick,PageLine,Tiles,Section,Chev,FirTick,NumTick,toggleNum,Thin,Pill} from './ui.jsx';
import {NoteRow} from './CollectorNote.jsx';
import {taskStatus} from './access.js';
import {planHideout,stName,CURRENCY,curLevel} from './hideout.js';
import {COLLECTOR_ITEMS,TRADER_TASKS,TRADERS} from './data.js';
import NEEDS from './lootNeeds.json';
import {usesOf,INGREDIENTS} from './uses.js';

const wiki=n=>'https://escapefromtarkov.fandom.com/wiki/'+encodeURIComponent(n.split(' / ')[0].replace(/ /g,'_'));
const fmt=n=>n.toLocaleString();
const isMoney=n=>CURRENCY.includes(n);

// Every item the plan needs, with where each need comes from.
function buildNeeds(cy,s,scope,col=false){
  const M={};
  const add=(n,src)=>{if(isMoney(n))return;const o=M[n]=M[n]||{n,src:[]};o.src.push(src)};
  const {steps}=planHideout(s,cy);
  steps.forEach(st=>st.i.forEach(([n,c,fir])=>add(n,{type:'hideout',label:stName(st.key)+' '+st.l,c,fir:!!fir,ready:st.ready})));
  if(col&&cy.tasks.includes('Collector'))COLLECTOR_ITEMS.forEach(i=>{if(!s.c['ci:'+i.n])add(i.n,{type:'collector',label:'Collector',c:1,fir:true})});
  const tasks=[];
  if(scope!=='prestige')TRADERS.concat('Fence').forEach(t=>(TRADER_TASKS[t]||[]).forEach(x=>{
    const rows=NEEDS[t+'|'+x];if(!rows||s.c['tk:'+t+':'+x])return;
    const st=taskStatus(s,t,x);
    const now=st.st==='ok';
    if(scope==='now'&&!now)return;
    const hand=rows.filter(r=>r[0]==='g'||r[0]==='p'||r[0]==='x');
    if(!hand.length)return;
    tasks.push({t,x,st:st.st,why:st.why,rows:hand});
    rows.filter(r=>r[0]==='g'||r[0]==='p').forEach(r=>add(r[3],{type:'task',label:x,c:r[1],fir:!!r[2],now,kind:r[0]}));
  }));
  Object.values(M).forEach(o=>{
    o.need=o.src.reduce((a,b)=>a+b.c,0);
    o.firNeed=o.src.reduce((a,b)=>a+(b.fir?b.c:0),0);
    o.prestige=o.src.filter(z=>z.type!=='task').reduce((a,b)=>a+b.c,0);
    o.have=s.n['hi:'+o.n]||0;
  });
  return {items:Object.values(M),tasks};
}

const SrcChips=({o})=>{
  const by={};o.src.forEach(z=>{(by[z.type+'|'+z.label]=by[z.type+'|'+z.label]||{...z,c:0}).c+=z.c});
  return <div className="flex flex-wrap gap-1 mt-1">{Object.values(by).map(z=>
    <Chip key={z.type+z.label} tone={z.type==='task'?(z.now?'map':'mute'):'warn'} title={z.type==='task'?'Task hand-in':z.type==='hideout'?'Hideout upgrade':'Collector hand-in'}>
      {z.type==='task'?'Task · ':z.type==='hideout'?'Hideout · ':''}{z.label}{z.c>1?' ×'+z.c:''}</Chip>)}</div>;
};

// One shopping-list item as a compact card: tick, name, how many you have out of how many you need, a thin bar, and where it is used.
function ItemCard({o,s,set}){
  const left=Math.max(0,o.need-o.have),done=left===0;
  const by={};o.src.forEach(z=>{const k=z.type+'|'+z.label;(by[k]=by[k]||{...z,c:0}).c+=z.c});
  const where=Object.values(by).map((z,i)=><React.Fragment key={z.type+z.label}>{i>0&&' · '}{z.type==='task'?<>Task: <a href={wiki(z.label)} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-amber-400" title="Open this task on the wiki">{z.label}</a></>:z.label}{z.c>1?' ×'+z.c:''}</React.Fragment>);
  return <div className={'rounded-lg border bg-black/20 p-3 grid gap-1.5 '+(done?'border-green-400/25':'border-zinc-800')}>
    <div className="flex items-center gap-2">
      <NumTick done={done} canClear={s.n['prev:hi:'+o.n]!==undefined} onClick={()=>toggleNum(s,set,'hi:'+o.n,o.need,o.have||0)} label={(done?'Clear: ':'Have all: ')+o.n}/>
      <a href={wiki(o.n)} target="_blank" rel="noopener noreferrer" className={'font-medium hover:underline hover:text-amber-400 min-w-0 '+(done?'line-through opacity-50':'')}>{o.n}</a>
      {o.firNeed>0&&<FirTick n={o.firNeed<o.need?o.firNeed:null}/>}
      <span className="ml-auto flex items-center gap-1.5 shrink-0">
        <input type="number" min="0" value={o.have||''} onChange={e=>set('hi:'+o.n,+e.target.value)} placeholder="0" aria-label={'How many '+o.n+' you have'} className="bg-zinc-800 w-14 px-1.5 py-0.5 rounded text-sm text-right no-spin"/>
        <span className="text-xs text-zinc-400 tabular-nums w-9">/ {fmt(o.need)}</span></span></div>
    <Thin p={o.need?Math.min(100,o.have/o.need*100):0} tone={done?'bg-green-500':'bg-amber-500'} sm/>
    <div className="text-xs text-zinc-500 leading-4" title="Where this item is needed">{where}</div></div>;
}

const ingText=l=>l.map(i=>(i.c>1?i.c+'× ':'')+i.n+(i.tool?' (tool)':'')).join(', ');
function Uses({name,s,cy}){
  const u=usesOf(name);
  if(!u.crafts.length&&!u.barters.length)return null;
  const crafts=u.crafts.filter((c,i,arr)=>arr.findIndex(x=>x.st===c.st&&x.lv===c.lv&&x.out.n===c.out.n&&ingText(x.ing)===ingText(c.ing))===i);
  return <details className="mt-2 group"><summary className="cursor-pointer list-none text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1"><span className="transition-transform group-open:rotate-90"><Chev/></span>Used in {crafts.length} craft{crafts.length===1?'':'s'} and {u.barters.length} barter{u.barters.length===1?'':'s'}</summary>
    <div className="mt-1.5 grid gap-1">
      {crafts.map((c,i)=>{const can=curLevel(s,cy,c.st)>=c.lv;return <div key={'c'+i} className="rounded-lg bg-black/20 px-2 py-1.5 text-xs text-zinc-300"><span className="font-medium text-zinc-100">{stName(c.st)} {c.lv}</span> <Chip tone={can?'ok':'mute'}>{can?'built':'not built'}</Chip> {ingText(c.ing)} <span className="text-zinc-500">→</span> {c.out.c>1?c.out.c+'× ':''}{c.out.n}</div>})}
      {u.barters.map((b,i)=><div key={'b'+i} className="rounded-lg bg-black/20 px-2 py-1.5 text-xs text-zinc-300"><span className="font-medium text-zinc-100">{b.tr} LL{b.ll}</span>{(s.n['ll:'+b.tr]||1)>=b.ll?<> <Chip tone="ok">unlocked</Chip></>:null}{b.unlock&&<> <Chip tone="mute" title="Needs this task finished">task: {b.unlock}</Chip></>} {ingText(b.ing)} <span className="text-zinc-500">→</span> {b.out.c>1?b.out.c+'× ':''}{b.out.n}</div>)}
    </div></details>;
}

function Verdict({q,all,scope,s,cy}){
  const ql=q.trim().toLowerCase();
  if(ql.length<2)return null;
  const names=[...new Set([...all.map(o=>o.n),...INGREDIENTS.filter(n=>!CURRENCY.includes(n))])];
  const hits=names.filter(n=>n.toLowerCase().includes(ql)).slice(0,8);
  if(!hits.length)return <Card c="!p-3 border-red-400/40"><div className="flex items-center gap-2"><Chip tone="bad">Sell</Chip><span className="font-medium">“{q.trim()}”</span></div>
    <div className="text-sm text-zinc-300 mt-1">Nothing in your plan, and no craft or barter in the game data uses it, so it is safe to sell{scope==='prestige'?' (prestige only: widen the scope above to include tasks)':''}.</div></Card>;
  return <div className="grid gap-2">{hits.map(n=>{
    const o=all.find(x=>x.n===n),u=usesOf(n),nUse=u.crafts.length+u.barters.length,left=o?Math.max(0,o.need-o.have):0;
    let tone,label,msg;
    if(o&&left>0){tone=o.prestige>0?'ok':'map';label=o.prestige>0?'Keep':'Keep for task';msg=`Your plan needs ${fmt(o.need)}, you have ${fmt(o.have)}: ${fmt(left)} more to keep.`}
    else if(o){tone='mute';label='Spare once handed in';msg=`You already hold the ${fmt(o.need)} your plan needs, so extras are free to use elsewhere.`+(nUse?' They can go into crafts or barters (below) or be sold.':' Extras can be sold.')}
    else if(nUse){tone='warn';label='Optional';msg='No prestige or task needs this, but it is an ingredient in crafts or barters. Sell it unless one of those is worth it to you.'}
    else{tone='bad';label='Sell';msg='Nothing in your plan or in any craft or barter uses it.'}
    return <Card key={n} c="!p-3"><div className="flex flex-wrap items-center gap-2"><Chip tone={tone}>{label}</Chip><span className="font-medium">{n}</span></div>
      <div className="text-sm text-zinc-300 mt-1">{msg}</div>{o&&<SrcChips o={o}/>}<Uses name={n} s={s} cy={cy}/></Card>})}</div>;
}

function TaskCard({k,tg}){
  const now=k.st==='ok';
  return <Card c="!p-3">
    <Tick on={false} fn={()=>tg('tk:'+k.t+':'+k.x)} chips={<><Chip>{k.t}</Chip><Chip tone={now?'ok':k.st==='unknown'?'warn':'bad'}>{now?'Available now':k.st==='unknown'?'Cannot be checked':'Locked'}</Chip></>}
      note={!now?'Needs: '+k.why.join(', '):undefined}>{k.x} <span className="text-zinc-500 font-normal text-xs">tick when done</span></Tick>
    <div className="ml-9 mt-1 flex flex-wrap gap-1">{k.rows.map((r,i)=>r[0]==='x'
      ?<Chip key={i} tone="mute" title="Many items are accepted: pick whichever spare ones you have">{r[1]}× any of {r[3]} items{r[2]?<> <FirTick/></>:null}</Chip>
      :isMoney(r[3])?<Chip key={i} tone="xp">{fmt(r[1])} {r[3]}</Chip>
      :<Chip key={i} tone={r[0]==='p'?'map':'mute'} title={r[0]==='p'?'Placed in the world (consumed)':'Handed in'}>{r[1]>1?r[1]+'× ':''}{r[3]}{r[2]?<> <FirTick/></>:null}{r[0]==='p'?' · plant':''}</Chip>)}</div></Card>;
}

export default function LootTab({cy,s,set,tg}){
  const [ced,setCed]=React.useState(null);
  const scope='now'; // prestige items plus the tasks you can start right now
  const needCol=cy.tasks.includes('Collector');
  const [q,setQ]=React.useState('');
  const [tab0,setTab]=useLS('tpp2_ui_loot_tab','list');
  const tab=tab0==='collector'&&!needCol?'list':tab0;
  const [showAll,setShowAll]=useLS('tpp2_ui_loot_view','short');
  const [flt,setFlt]=useLS('tpp2_ui_loot_filter','all');
  const [more,setMore]=useLS('tpp2_ui_loot_more',false);
  const {items,tasks}=React.useMemo(()=>buildNeeds(cy,s,scope),[cy,s,scope]);
  const {items:allItems}=React.useMemo(()=>buildNeeds(cy,s,'all',true),[cy,s]);
  const short=o=>o.need>o.have;
  const pre=items.filter(o=>o.prestige>0),preShort=pre.filter(short);
  const firShort=preShort.filter(o=>o.firNeed>0);
  const taskItems=items.filter(o=>o.prestige===0),taskShort=taskItems.filter(short);
  const colDone=COLLECTOR_ITEMS.filter(i=>s.c['ci:'+i.n]).length;
  const rubNow=s.n.rub,rubGoal=cy.rub;
  const grouped=TRADERS.concat('Fence').map(t=>[t,tasks.filter(k=>k.t===t)]).filter(([,l])=>l.length);
  const kinds={all:()=>true,pre:o=>o.prestige>0,task:o=>o.prestige===0,fir:o=>o.firNeed>0};
  const list=items.filter(kinds[flt]||kinds.all).filter(o=>showAll==='all'||short(o)).sort((a,b)=>((b.prestige>0)-(a.prestige>0))||a.n.localeCompare(b.n));
  const covered=pre.length-preShort.length,pctCovered=pre.length?covered/pre.length*100:100;
  const pillCls=on=>'rounded-full border px-3.5 py-1.5 text-sm font-medium transition '+(on?'bg-amber-500 border-amber-500 text-black':'border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-white/5');
  const Pl=({k,children,n})=><button onClick={()=>setTab(k)} aria-pressed={tab===k} className={pillCls(tab===k)}>{children}{n!==undefined&&<span className="opacity-90"> {n}</span>}</button>;
  const Fl=({k,children})=><Pill on={flt===k} aria-pressed={flt===k} onClick={()=>setFlt(k)}>{children}</Pill>;
  return <div className="grid gap-4">
    <PageLine>What to keep, hand in or go and find. Your stash counts are checked against what the plan still needs.</PageLine>

    <Tiles items={[['Prestige items covered',covered+'/'+pre.length,preShort.length>0?preShort.length+' still short':'all covered'],['To find in raid',firShort.length,'items you must find'],['Task items short',taskShort.length,'for tasks you can start'],...(needCol?[['Collector items',COLLECTOR_ITEMS.length-colDone,'still to find']]:[]),['Roubles',rubNow===undefined||rubNow===''?'–':rubNow+'M','goal '+rubGoal+'M']]}/>

    <div className="flex flex-wrap items-center gap-2">
      <Pl k="list" n={preShort.length+taskShort.length}>Shopping list</Pl><Pl k="hand" n={tasks.length}>Hand-ins</Pl><Pl k="keys">Keys</Pl>{needCol&&<Pl k="collector" n={colDone+'/'+COLLECTOR_ITEMS.length}>Collector</Pl>}
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search an item: should I keep it?" aria-label="Search an item: should I keep it?" className="flex-1 min-w-[12rem] max-sm:basis-full max-sm:order-last bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm"/>
    </div>
    {q.trim().length>=2&&<Verdict q={q} all={allItems} scope={scope} s={s} cy={cy}/>}

    {tab==='list'&&<Section title="Shopping list" sub="items still short for the plan">
      <div className="flex flex-wrap items-center gap-2"><Fl k="all">All</Fl><Fl k="pre">Prestige</Fl><Fl k="task">Tasks</Fl><Fl k="fir">Found in raid</Fl>
        <button onClick={()=>setShowAll(showAll==='all'?'short':'all')} className="lnk ml-auto text-xs py-2 -my-2">{showAll==='all'?'Hide items you already have':`Show items you already have (${items.length-items.filter(short).length})`}</button></div>
      {list.length===0&&<Empty icon={items.length?'done':'empty'} title={items.length?'Nothing short here':'No items needed right now'} hint={items.length?'You hold everything this view needs.':undefined}/>}
      {(()=>{const shown=more?list:list.slice(0,24);
        return [[true,'For the prestige'],[false,'For tasks you can start']].map(([pre_,title])=>{const g=shown.filter(o=>(o.prestige>0)===pre_);
          return g.length?<div key={title} className="grid gap-2"><div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title} <span className="opacity-80">{list.filter(o=>(o.prestige>0)===pre_).length}</span></div>
            <div className="grid sm:grid-cols-2 gap-2">{g.map(o=><ItemCard key={o.n} o={o} s={s} set={set}/>)}</div></div>:null})})()}
      {list.length>24&&<button onClick={()=>setMore(m=>!m)} className="lnk justify-self-start text-sm">{more?'Show fewer':`Show all ${list.length} items`}</button>}
      <div className="text-xs text-zinc-500">Type how many you have, or tick an item when you have enough. The count is shared with the Hideout tab. A gold tick means the item only counts if found in raid.</div>
    </Section>}

    {tab==='hand'&&<Section title="Hand-ins" sub="tasks that need items handed in, by trader">
      {grouped.length===0&&<Empty title="No item hand-ins right now" hint="Tasks that need you to hand in items will show up here."/>}
      {grouped.map(([t,l])=><div key={t} className="grid gap-2"><div className="flex items-center gap-2"><h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{t}</h4><Chip>{l.length}</Chip></div>
        <div className="grid lg:grid-cols-2 gap-2">{l.map(k=><TaskCard key={k.x} k={k} tg={tg}/>)}</div></div>)}
    </Section>}

    {tab==='keys'&&<section><KeysTab cy={cy} s={s} tg={tg}/></section>}

    {tab==='collector'&&needCol&&<section className="grid gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><div className="text-sm text-zinc-400">Every Collector item must be handed in <FirTick/> found in raid. Tick each one when you have found it.</div><div className="text-sm text-zinc-400"><b className="text-zinc-100 stat-val">{colDone}</b>/{COLLECTOR_ITEMS.length} found</div></div>
      <Thin p={colDone/COLLECTOR_ITEMS.length*100} tone={colDone===COLLECTOR_ITEMS.length?'bg-green-500':'bg-amber-500'}/>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{COLLECTOR_ITEMS.map(i=>{const on=!!s.c['ci:'+i.n];
        return <NoteRow key={i.n} name={i.n} s={s} set={set} ed={ced} setEd={setCed} indent="pl-9" outer={'rounded-lg border bg-black/20 hover:bg-white/5 '+(on?'border-green-400/25':'border-zinc-800')}><label className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer">
          <input type="checkbox" checked={on} onChange={()=>tg('ci:'+i.n)} className="accent-amber-500 size-4 shrink-0"/>
          <a href={wiki(i.n)} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className={'text-sm font-medium hover:underline hover:text-amber-400 min-w-0 '+(on?'line-through opacity-50':'')}>{i.n}</a>
          {i.f==='check'&&<Chip tone="warn" title="Only one source lists this item, so check it in game">check</Chip>}</label></NoteRow>})}</div>
    </section>}
  </div>;
}
