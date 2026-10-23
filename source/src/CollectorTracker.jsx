import React from 'react';
import {Card,Chip,Tick,Thin,Chev,Led,Pop,ledOf} from './ui.jsx';
import {useLS} from './useLS.js';
import {COLLECTOR_ITEMS} from './data.js';
import {NoteRow,noteOf,noteCount} from './CollectorNote.jsx';

// Collapsible list of the Collector items on the Overview, laid out like New Beginning objectives. It uses the same ticks as Traders and Tasks and the Loot tab, so all three always match.
export default function CollectorTracker({s,tg,set}){
  const [open,setOpen]=useLS('tpp2_ui_col_open',false);
  React.useEffect(()=>{const h=e=>{if(e.detail==='sec-collector')setOpen(true)};window.addEventListener('pd-jump',h);return()=>window.removeEventListener('pd-jump',h)},[setOpen]);
  const [q,setQ]=React.useState(''),[ed,setEd]=React.useState(null),[onlyN,setOnlyN]=useLS('tpp2_ui_col_notes_only',false);
  const nNotes=noteCount(s);
  const norm=x=>x.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); // ignores case, punctuation and extra spaces
  const filtering=!!norm(q)||(onlyN&&nNotes>0);
  const shown=COLLECTOR_ITEMS.filter(i=>(!norm(q)||norm(i.n).includes(norm(q))||norm(noteOf(s,i.n)).includes(norm(q)))&&(!(onlyN&&nNotes>0)||noteOf(s,i.n)));
  const total=COLLECTOR_ITEMS.length,done=COLLECTOR_ITEMS.filter(i=>s.c['ci:'+i.n]).length,all=done===total;
  return <section id="sec-collector" className="grid gap-2 scroll-mt-24 rounded-xl"><Pop done={all} className="rounded-xl">
    <Card c="!p-0">
      <button onClick={()=>setOpen(o=>!o)} aria-expanded={open} className="w-full text-left p-3">
        <div className="flex items-center justify-between gap-2"><span className="font-semibold flex items-center gap-2"><span className={'text-zinc-500 text-xs inline-block transition-transform '+(open?'rotate-90':'')}><Chev/></span>Collector items</span>
          <span className="flex items-center gap-1"><Chip tone={all?'ok':'mute'}>{done}/{total} items</Chip><span className="ml-1"><Led st={ledOf(done,total)}/></span></span></div>
        <div className="mt-2"><Thin p={total?done/total*100:0} tone={all?'bg-green-500':'bg-amber-500'}/></div></button>
      {open&&<div className="border-t border-zinc-800 p-3 grid gap-2">
        <div className="flex items-center gap-2"><div className="relative min-w-0 flex-1"><input type="text" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==='Escape'&&q){e.stopPropagation();setQ('')}}} placeholder="Search Collector items" aria-label="Search Collector items" className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 pr-9 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"/>
          {q&&<button onClick={()=>setQ('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-400 px-1">✕</button>}</div>
          {(nNotes>0||onlyN)&&<button type="button" onClick={()=>setOnlyN(v=>!v)} aria-pressed={onlyN} title="Show only the items that have a note" className="cn-filter">With notes ({nNotes})</button>}</div>
        {filtering&&<div className="text-xs text-zinc-500" role="status">Showing {shown.length} of {total} items{onlyN&&nNotes>0?' with notes':''}</div>}
        {norm(q)&&!shown.length&&<div className="rounded-lg border border-dashed border-zinc-700 px-3 py-4 text-center text-sm text-zinc-400">No Collector item or note matches “{q.trim()}”.</div>}
        <div className="grid sm:grid-cols-2 gap-x-3 gap-y-0.5">{shown.map(i=><NoteRow key={i.n} name={i.n} s={s} set={set} ed={ed} setEd={setEd}><Tick on={s.c['ci:'+i.n]} fn={()=>tg('ci:'+i.n)} chips={i.f==='check'?<Chip tone="warn" title="Not in every current source">check</Chip>:null}>{i.n}</Tick></NoteRow>)}</div>
        <div className="text-xs text-zinc-500">Only items found in raid count. These are the same ticks as on the Loot tab and in Traders and Tasks. Tick “Collector” in the checklist above once the game shows it complete.</div>
      </div>}
    </Card></Pop></section>}
