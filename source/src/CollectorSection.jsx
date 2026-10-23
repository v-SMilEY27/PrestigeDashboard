import React from 'react';
import {Section,Card,Stat,Chip,Tick,Thin,Done,Pin} from './ui.jsx';
import {TRADER_LL4,TRADERS,CQUESTS,COLLECTOR_ITEMS,cqKey} from './data.js';
import {NoteRow} from './CollectorNote.jsx';
const pc=(x,y)=>y?Math.round(x/y*100):0;

export default function CollectorSection({s,tg,set}){
  const [ed,setEd]=React.useState(null);
  const ll4=TRADERS.filter(t=>(s.n['ll:'+t]||1)>=4).length;
  const firDone=COLLECTOR_ITEMS.filter(i=>s.c['ci:'+i.n]).length;
  return <div className="grid gap-4">
  <div className="grid grid-cols-3 gap-2"><Stat label="Traders at LL4" value={`${ll4}/${TRADERS.length}`}/><Stat label="Gate quests" value={`${CQUESTS.filter(q=>s.c[cqKey(q)]).length}/${CQUESTS.length}`}/><Stat label="Found-in-raid items" value={`${firDone}/${COLLECTOR_ITEMS.length}`}/></div>
  <Section title="Loyalty level 4" sub={`needed with ${TRADERS.join(', ')} · scav karma +3`}>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{Object.entries(TRADER_LL4).map(([t,[l,r]])=>{const ok=(s.n['ll:'+t]||1)>=4;return <div key={t} className={'rounded-lg border px-3 py-2 '+(ok?'border-green-400/30 bg-green-400/5':'border-zinc-800 bg-zinc-900')}>
      <div className="flex items-center justify-between"><span className="font-semibold text-sm">{t}</span>{ok&&<Done/>}</div>
      <div className="text-xs text-zinc-400 mt-0.5">Level {l} · rep {r.toFixed(2)}</div></div>})}</div>
    <div className="text-xs text-zinc-500">Highest level floor: {(()=>{const [t,[l]]=Object.entries(TRADER_LL4).sort((a,b)=>b[1][0]-a[1][0])[0];return l+' ('+t+')'})()}. Set your current loyalty levels on each trader's page.</div>
  </Section>
  <Section title="Gate quests" sub="finish these for The Collector">
    <div className="grid gap-2">{CQUESTS.map(q=><Card key={q.id} c="!p-3">
      <Tick on={s.c[cqKey(q)]} fn={()=>tg(cqKey(q))} chips={<><Chip>{q.giver}</Chip>{(q.maps||[]).length>0&&<Chip tone="map"><Pin/>{q.maps.join(' / ')}</Chip>}</>} note={q.obj}>{q.name}</Tick>
      {q.subs&&<div className="ml-7 mt-1 grid sm:grid-cols-2 gap-0.5">{q.subs.map((p,k)=><Tick key={k} on={s.c['cs:'+q.id+':'+k]} fn={()=>tg('cs:'+q.id+':'+k)} chips={<Chip>5 kills</Chip>}>{p.join(' or ')}</Tick>)}</div>}</Card>)}</div>
  </Section>
  <Section title="Found-in-raid items" sub={`${firDone} of ${COLLECTOR_ITEMS.length}`}>
    <Card><Thin p={pc(firDone,COLLECTOR_ITEMS.length)} tone={firDone===COLLECTOR_ITEMS.length?'bg-green-500':'bg-amber-500'}/>
      <div className="grid sm:grid-cols-2 gap-x-3 mt-3">{COLLECTOR_ITEMS.map(i=><NoteRow key={i.n} name={i.n} s={s} set={set} ed={ed} setEd={setEd}><Tick on={s.c['ci:'+i.n]} fn={()=>tg('ci:'+i.n)} chips={i.f==='check'?<Chip tone="warn" title="Not in every current source">check</Chip>:null}>{i.n}</Tick></NoteRow>)}</div>
      <div className="text-xs text-zinc-500 mt-3">Only items found in raid count. The list has {COLLECTOR_ITEMS.length} items.</div></Card>
  </Section>
  </div>}
