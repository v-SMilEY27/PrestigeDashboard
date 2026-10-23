import React from 'react';
import {Section,Card,Chip,Tick,Thin,Chev,Led,Pop,ledOf} from './ui.jsx';
import {useLS} from './useLS.js';
import {slug} from './hideout.js';
import {STORY,sKey,storyProgress,stepsShown,storyHasFork,FORKS,ENDING_NOTE,forkEnding} from './story.js';

export default function StoryChapters({cy,s,tg,set,tickMany,untickMany}){
  const [open,setOpen]=useLS('tpp2_ui_story_open',{});
  React.useEffect(()=>{const h=e=>{const m=String(e.detail||'').match(/^sec-story-(.+)$/);if(m)setOpen(o=>({...o,...Object.fromEntries(Object.keys(STORY).filter(n=>slug(n)===m[1]).map(n=>[n,true]))}))};window.addEventListener('pd-jump',h);return()=>window.removeEventListener('pd-jump',h)},[setOpen]);
  const names=cy.story.filter(n=>STORY[n]);
  if(!names.length)return null;
  return <Section title="Story chapters">
    {names.map(n=>{const st=STORY[n],p=storyProgress(n,s),isOpen=!!open[n],whole=!!s.c['s:'+n];
      return <div key={n} id={'sec-story-'+slug(n)} className="scroll-mt-24 rounded-xl"><Pop done={p.need>0&&p.have>=p.need} className="rounded-xl"><Card c="!p-0">
        <button onClick={()=>setOpen(o=>({...o,[n]:!o[n]}))} aria-expanded={isOpen} className="w-full text-left p-3">
          <div className="flex items-center justify-between gap-2"><span className="font-semibold flex items-center gap-2"><span className={'text-zinc-500 text-xs inline-block transition-transform '+(isOpen?'rotate-90':'')}><Chev/></span>{n}</span>
            <span className="flex items-center gap-1">{whole&&<Chip tone="ok">Chapter ticked</Chip>}<Chip tone={p.have>=p.need?'ok':'mute'}>{p.have}/{p.need} steps</Chip><span className="ml-1"><Led st={ledOf(p.have,p.need)}/></span></span></div>
          <div className="mt-2"><Thin p={p.need?p.have/p.need*100:0} tone={p.have>=p.need?'bg-green-500':'bg-amber-500'}/></div></button>
        {isOpen&&<div className="border-t border-zinc-800 p-3 grid gap-1">
          <div className="text-xs text-zinc-400 mb-1">Needs: {st.req}</div>
          {storyHasFork(n)&&<div className="rounded-lg border border-zinc-800 bg-black/20 p-3 mb-1">
            <div className="text-sm font-semibold">In Falling Skies, who did you give the armored case to?</div>
            <div className="mt-1.5 flex flex-wrap gap-2">{[['prapor','Gave it to Prapor'],['kept','Kept it']].map(([v,l])=><button key={v} onClick={()=>set('ticketCase',s.n.ticketCase===v?null:v)} aria-pressed={s.n.ticketCase===v} className={'rounded-lg border px-3 py-1.5 text-sm transition '+(s.n.ticketCase===v?'border-amber-500 bg-amber-500/15 text-amber-300 font-semibold':'border-zinc-700 text-zinc-300 hover:border-amber-500')}>{l}</button>)}</div>
            <div className="text-xs text-zinc-500 mt-1.5">{s.n.ticketCase==='prapor'?'The Lightkeeper steps are on your route and now count towards progress.':s.n.ticketCase==='kept'?'The Lightkeeper steps are hidden, because they only happen if Prapor has the case.':'Pick one to see the right steps. Until then the Lightkeeper steps are shown but not counted.'}</div></div>}
          {stepsShown(st,s).map((x,xi,arr)=><Tick key={x.id} on={s.c[sKey(x.id)]} fn={()=>{if(s.c[sKey(x.id)])return untickMany([...arr.slice(xi).map(y=>sKey(y.id)),'s:'+n]);tickMany(arr.slice(0,xi+1).filter(y=>y===x||(y.f==='b'?s.n.ticketCase==='prapor':!y.o)).map(y=>sKey(y.id)))}} note={x.n}
            chips={<><Chip tone="map">{x.m}</Chip>{x.f==='o'&&<Chip tone="mute" title="Not counted in progress">optional</Chip>}{x.f==='b'&&<Chip tone="warn" title={s.n.ticketCase==='prapor'?'On your route':'Only if Prapor has the case'}>{s.n.ticketCase==='prapor'?'your route':'Prapor route'}</Chip>}</>}>{x.t}</Tick>)}
          {storyHasFork(n)&&<div className="rounded-lg border border-zinc-800 bg-black/20 p-3 mt-1">
            <div className="text-sm font-semibold">Kerman's choices</div>
            <div className="text-xs text-zinc-500">These come after the ticket, so the prestige does not need them. Record them here if you want your route on file.</div>
            {FORKS.filter(f=>!f.after||s.n[f.after[0]]===f.after[1]).map(f=><div key={f.k} className="mt-2"><div className="text-sm text-zinc-300">{f.q}</div>
              <div className="mt-1 flex flex-wrap gap-2">{f.o.map(([v,l])=><button key={v} onClick={()=>{const on=s.n[f.k]===v;set(f.k,on?null:v);FORKS.slice(FORKS.indexOf(f)+1).forEach(g=>set(g.k,null))}} aria-pressed={s.n[f.k]===v} className={'rounded-lg border px-3 py-1.5 text-sm transition '+(s.n[f.k]===v?'border-amber-500 bg-amber-500/15 text-amber-300 font-semibold':'border-zinc-700 text-zinc-300 hover:border-amber-500')}>{l}</button>)}</div></div>)}
            {forkEnding(s.n)&&<div className="mt-2 text-sm"><span className="font-semibold text-amber-300">Ending: {forkEnding(s.n)}.</span> <span className="text-zinc-400">{ENDING_NOTE[forkEnding(s.n)]}</span></div>}
          </div>}
          <div className="text-xs text-zinc-500 mt-1">Steps come from a community story guide, so check them against your in-game quest log. Ticking a step also ticks the required steps before it. Unticking a step also unticks every step after it, and the chapter itself. Optional steps are not counted. Tick the chapter itself in the checklist above once the game shows it complete.</div>
        </div>}
      </Card></Pop></div>})}
  </Section>}
