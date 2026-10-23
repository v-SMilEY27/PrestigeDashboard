import React from 'react';
import {Card,Chip,Tick,Thin,Chev,Done,CheckGlyph,Led,Pop,ledOf} from './ui.jsx';
import {useLS} from './useLS.js';
import {NB_TEMPLATE,nbList} from './nb.js';

// One objective: a tick when only one is needed, otherwise a +/- counter that completes at the target.
// The circle on a counted objective is also a button: tick it to mark the whole objective done without typing the number (tick again to clear it).
export function NbObj({o,s,set,tg}){
  if(o.need<=1)return <Tick on={o.done} fn={()=>tg(o.key)} note={o.note}>{o.label}</Tick>;
  const setN=v=>{const n=Math.max(0,Math.min(o.need,v||0));if(s.c[o.key])tg(o.key);set(o.nkey,n)};
  const toggleAll=()=>{if(o.done){if(s.c[o.key])tg(o.key);set(o.nkey,0)}else tg(o.key)};
  const btn='size-7 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-white/5 disabled:opacity-30';
  return <div className="flex items-start gap-3 rounded-lg px-2 py-1.5">
    <button type="button" onClick={toggleAll} aria-pressed={o.done} aria-label={(o.done?'Clear: ':'Mark done: ')+o.label} title={o.done?'Clear this objective':'Mark this objective done'} className={'tap mt-1 grid place-items-center size-4 shrink-0 rounded-full text-xs font-bold transition '+(o.done?'bg-green-500 text-green-950':'border border-zinc-600 text-transparent hover:border-zinc-400 hover:bg-white/10')}><CheckGlyph/></button>
    <div className="min-w-0 flex-1"><div className={'font-medium '+(o.done?'line-through opacity-50':'')}>{o.label}</div>{o.note&&<div className="text-xs text-zinc-400">{o.note}</div>}</div>
    <div className="flex items-center gap-1 shrink-0"><button onClick={()=>setN(o.have-1)} disabled={o.have<=0} aria-label={'One less: '+o.label} className={btn}>−</button>
      <input type="number" min="0" max={o.need} value={o.have} onChange={e=>setN(+e.target.value)} aria-label={o.label+' count'} className="bg-zinc-800 w-14 px-1 py-1 rounded text-center text-sm text-zinc-100"/>
      <span className="text-xs text-zinc-500 w-8">/ {o.need}</span>
      <button onClick={()=>setN(o.have+1)} disabled={o.have>=o.need} aria-label={'One more: '+o.label} className={btn}>+</button></div></div>}

export default function NewBeginning({cy,s,set,tg}){
  const [open,setOpen]=useLS('tpp2_ui_nb_open',false);
  React.useEffect(()=>{const h=e=>{if(e.detail==='sec-nb')setOpen(true)};window.addEventListener('pd-jump',h);return()=>window.removeEventListener('pd-jump',h)},[setOpen]);
  const tpl=NB_TEMPLATE[cy.p],list=nbList(cy,s),done=list.filter(o=>o.done).length,all=list.length>0&&done===list.length;
  return <section id="sec-nb" className="grid gap-2 scroll-mt-24 rounded-xl"><Pop done={all} className="rounded-xl">
    <Card c="!p-0">
      <button onClick={()=>setOpen(o=>!o)} aria-expanded={open} className="w-full text-left p-3">
        <div className="flex items-center justify-between gap-2"><span className="font-semibold flex items-center gap-2"><span className={'text-zinc-500 text-xs inline-block transition-transform '+(open?'rotate-90':'')}><Chev/></span>New Beginning objectives</span>
          <span className="flex items-center gap-1">{tpl&&<Chip tone={(s.n.lvl||0)>=tpl.lvl?'ok':'bad'}>Lv {tpl.lvl}</Chip>}<Chip tone={all?'ok':'mute'}>{done}/{list.length} objectives</Chip><span className="ml-1"><Led st={ledOf(done,list.length)}/></span></span></div>
        <div className="mt-2"><Thin p={list.length?done/list.length*100:0} tone={all?'bg-green-500':'bg-amber-500'}/></div></button>
      {open&&<div className="border-t border-zinc-800 p-3 grid gap-2">
        {tpl&&<div className="flex flex-wrap items-center gap-2 text-sm"><span className="text-zinc-400">To start:</span>
          <Chip tone={(s.n.lvl||0)>=tpl.lvl?'ok':'bad'} title="Your level is set in the Overview checklist">{(s.n.lvl||0)>=tpl.lvl&&<Done/>}Lv {tpl.lvl} (you: {s.n.lvl||'not set'})</Chip>
          <Chip tone="mute">{tpl.pre?`Prestige level ${tpl.pre}`:'No Prestige yet'}</Chip>
          {tpl.conf&&<Chip tone="ok" title="Read from the in-game quest page">Matches the in-game task</Chip>}</div>}
        {list.length>0&&<div className="grid gap-0.5">{list.map(o=><NbObj key={o.id} o={o} s={s} set={set} tg={tg}/>)}</div>}
        <div className="text-xs text-zinc-500">Objectives are from the in-game quest page. Tick “New Beginning” in the checklist above once the game shows it complete.</div>
      </div>}
    </Card></Pop></section>}
