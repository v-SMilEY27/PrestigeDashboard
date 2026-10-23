import React from 'react';
import {shortLed,Pips,Empty,Section,ExpandAll,Stat,Chip,Pill,PageLine,Chev,FirTick,Done,playName} from './ui.jsx';
import ModuleView from './ModuleView.jsx';
import {HID,stName,maxLvl,skillName,CURRENCY,fmtTime,planHideout,materials} from './hideout.js';

const wiki=n=>'https://escapefromtarkov.fandom.com/wiki/'+encodeURIComponent(n.replace(/ /g,'_'));
const pc=(x,y)=>y?Math.round(x/y*100):0;
const fmt=n=>n.toLocaleString();

const Seg=({value,max,onChange,min=0})=><div className="inline-flex rounded-lg border border-zinc-700 overflow-hidden">{Array.from({length:max-min+1},(_,i)=>i+min).map(n=>
  <button key={n} onClick={()=>onChange(n)} className={'px-3 py-1 text-sm font-medium transition '+(value===n?(n===0?'bg-zinc-700 text-zinc-100 font-semibold':'bg-amber-500 text-black font-semibold'):'hover:bg-white/5')}>{n}</button>)}</div>;

function StepCard({st,s,cy,set,cur,open,toggle}){
  const need=st.i.length;
  return <div className={'rounded-xl border bg-zinc-900 '+(st.ready?'border-green-400/30':'border-zinc-800')}>
    <button onClick={toggle} aria-expanded={open} className="w-full text-left p-3">
      <div className="flex items-center justify-between gap-2 max-sm:flex-wrap">
        <div className="font-semibold flex items-center gap-2 max-sm:whitespace-nowrap"><span className={'text-zinc-500 text-xs inline-block transition-transform '+(open?'rotate-90':'')}><Chev/></span>{stName(st.key)} <span className="text-zinc-500 font-normal">→</span> Level {st.l}</div>
        <div className="flex gap-1 max-sm:ml-5">{st.forPrestige&&<Chip tone="warn" title="Needed for this prestige">Prestige</Chip>}<Chip tone={st.ready?'ok':'bad'}>{st.ready?'Ready':'Blocked'}</Chip></div>
      </div>
      <div className="flex flex-wrap gap-1 mt-1.5 ml-5"><Chip>⏱ {fmtTime(st.t)}</Chip>{need>0&&<Chip>{need} item{need>1?'s':''}</Chip>}
        {!st.ready&&st.blockMods.map(m=><Chip key={m.k+m.l} tone="bad">needs {stName(m.k)} {m.l}</Chip>)}
        {st.blockTraders.map(([t,l])=><Chip key={t} tone="bad">{t} LL{l}</Chip>)}</div>
    </button>
    {open&&<div className="px-3 pb-3 grid gap-3 border-t border-zinc-800 pt-3">
      {(st.s.length>0||st.r.length>0||st.sk.length>0)&&<div>
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Requires</div>
        <div className="flex flex-wrap gap-1">
          {st.s.map(([ps,pl])=>{const met=cur(ps)>=pl;return <Chip key={ps+pl} tone={met?'ok':'bad'} title={met?'Built':'Not built yet'}>{met&&<Done/>}{stName(ps)} {pl}</Chip>})}
          {st.r.map(([t,l])=><Chip key={t} tone={(s.n['ll:'+t]||1)>=l?'ok':'bad'}>{t} LL{l}</Chip>)}
          {st.sk.map(([k,l])=>{const have=s.n['k:'+k];return <Chip key={k} tone={have===undefined?'mute':have>=l?'ok':'bad'} title="Skill level needed">{skillName(k)} {l}</Chip>})}</div></div>}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Materials</div>
        {st.i.length?<div className="grid sm:grid-cols-2 gap-1">{st.i.map(([n,c,fir])=>{const have=s.n['hi:'+n]||0;return <div key={n} className="flex items-center justify-between gap-2 rounded-lg bg-black/20 px-2 py-1 text-sm">
          <a href={wiki(n)} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-amber-400 truncate">{n}</a>
          <span className="shrink-0 flex items-center gap-1"><span className={have>=c?'text-green-300':'text-zinc-300'}>{CURRENCY.includes(n)?fmt(c):'×'+c}</span>{fir?<FirTick/>:null}</span></div>})}</div>
          :<div className="text-sm text-zinc-500">Nothing to hand in.</div>}
      </div>
      <div className="flex justify-end"><button onClick={()=>set('hl:'+st.key,st.l)} className="rounded-lg border border-zinc-600 text-zinc-100 text-xs font-semibold px-3 py-1.5 transition hover:border-green-400 hover:text-green-300">Mark built</button></div>
    </div>}
  </div>;
}

export default function HideoutTab({cy,s,set,sec:tab,setSec:setTab,open,setOpen}){
  const {steps,req,cur}=planHideout(s,cy);
  const reqs=Object.entries(cy.hideout);
  const ready=steps.filter(x=>x.ready);
  const time=steps.reduce((n,x)=>n+x.t,0);
  const allMats=materials(steps);
  const leftCount=allMats.filter(m=>!CURRENCY.includes(m.n)&&(s.n['hi:'+m.n]||0)<m.need).length;
  const keys=Object.keys(HID).sort((a,b)=>(!!req[b]-!!req[a])||stName(a).localeCompare(stName(b)));

  return <div className="grid gap-4">
    <PageLine>Everything left to build for this prestige and what it needs, in the order you can build it.</PageLine>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Stat label="Upgrades left" led={shortLed(steps.length)} value={steps.length} sub={`${ready.length} ready to build`}/>
      <Stat label="Build time" value={fmtTime(time)} sub="if built one after another"/>
      <Stat label="Items to gather" led={shortLed(leftCount)} value={leftCount} sub="items still short"/>
      <Stat label="Roubles" value={fmt(allMats.find(m=>m.n==='Roubles')?.need||0)} sub="for all upgrades"/>
    </div>

    <div className="flex flex-wrap gap-2">{[['plan','Plan',steps.length+' upgrades'],['mats','Materials',leftCount+' short'],['mine','My hideout','set built levels']].map(([k,l,n])=><Pill key={k} on={tab===k} onClick={()=>setTab(k)}>{l} <span className="opacity-90 text-xs">· {n}</span></Pill>)}</div>

    {tab==='mine'&&<details open className="group">
      <summary className="cursor-pointer list-none flex items-baseline gap-2 mb-2"><h3 className="text-lg font-bold text-amber-500">My hideout</h3><span className="text-xs text-zinc-500">set the level you have built, and optionally plan extra modules</span></summary>
      <div className="grid sm:grid-cols-2 gap-2">{keys.map(k=>{const mx=maxLvl(k),c=cur(k),t=s.n['ht:'+k]||0;return <div key={k} className={'rounded-xl border bg-zinc-900 p-3 '+(req[k]?'border-amber-500/40':'border-zinc-800')}>
        <div className="flex items-center justify-between gap-2"><div className="font-semibold">{stName(k)}</div><span className="flex items-center gap-2"><Pips max={mx} built={c} plan={t} need={req[k]||0}/>{req[k]&&<Chip tone="warn" title={`${playName(cy.p)} needs this module at level ${req[k]}`}>Needs level {req[k]}</Chip>}</span></div>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-400"><span>Built</span><Seg value={c} max={mx} onChange={v=>set('hl:'+k,v)}/></div>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-zinc-400"><span title="Add this module to the plan">Also plan to</span><Seg value={Math.max(t,0)} max={mx} onChange={v=>set('ht:'+k,v)}/></div></div>})}</div>
    </details>}

    {tab==='plan'&&<Section title="Build order" sub={steps.length?'in the order you can build them':undefined}
      right={steps.length>0&&<ExpandAll onExpand={()=>setOpen(Object.fromEntries(steps.map(x=>[x.key+x.l,true])))} onCollapse={()=>setOpen({})}/>}>
      {steps.length===0?<Empty icon="done" title="Nothing left to build" hint="Every hideout upgrade this plan needs is already built."/>
        :<div className="grid gap-2">{steps.map((st,i)=><div key={st.key+st.l} className="flex gap-2 items-start">
          <span className="grid place-items-center size-6 shrink-0 mt-3 rounded-full border border-zinc-600 text-xs text-zinc-400">{i+1}</span>
          <div className="flex-1 min-w-0"><StepCard st={st} s={s} cy={cy} set={set} cur={cur} open={!!open[st.key+st.l]} toggle={()=>setOpen(o=>({...o,[st.key+st.l]:!o[st.key+st.l]}))}/></div></div>)}</div>}
    </Section>}

    {tab==='mats'&&<Section title="Materials by module" sub="module → upgrade level → items. Type how many you have in your stash"><ModuleView cy={cy} s={s} set={set}/></Section>}
  </div>;
}
