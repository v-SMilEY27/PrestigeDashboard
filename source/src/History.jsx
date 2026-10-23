import React from 'react';
import {Card,Chip,PageLine,Tiles,Pill,Empty,Section} from './ui.jsx';
import {useLS} from './useLS.js';
import {entryText} from './changelog.js';

// Which group an entry belongs to, from the saved key it changed.
export const CATS=['Tasks','Story','Hideout','Profile','Loot','New Beginning','Imports'];
export const catOf=e=>{
  if(e.bulk)return 'Imports';
  const k=e.k;
  if(k.startsWith('nb:')||k.startsWith('nbn:'))return 'New Beginning';
  if(k.startsWith('s:')||k.startsWith('sp:'))return 'Story';
  if(k.startsWith('hl:')||k.startsWith('ht:'))return 'Hideout';
  if(k.startsWith('hi:')||k.startsWith('key:')||k.startsWith('ci:'))return 'Loot';
  if(k==='lvl'||k==='rub'||k==='karma'||k.startsWith('ll:')||k.startsWith('k:'))return 'Profile';
  return 'Tasks';
};
const DAY=864e5;
const startOf=t=>{const d=new Date(t);d.setHours(0,0,0,0);return d.getTime()};
const hm=t=>new Date(t).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
const dayLabel=t=>{const a=startOf(t),n=startOf(Date.now()),diff=Math.round((n-a)/DAY);
  if(diff===0)return 'Today';if(diff===1)return 'Yesterday';
  return new Date(t).toLocaleDateString([], {weekday:'long',day:'numeric',month:'short'})};
// An entry can be undone only while the item still holds the value that entry gave it.
const canUndo=(e,s)=>!e.bulk&&(typeof e.v==='boolean'?!!s.c[e.k]===e.v:(s.n[e.k]??0)===e.v);

// The last 14 days as small bars, so you can see when you were active.
function Strip({log}){
  const today=startOf(Date.now()),days=[...Array(14)].map((_,i)=>today-(13-i)*DAY);
  const counts=days.map(d=>log.filter(e=>startOf(e.t)===d).length),max=Math.max(1,...counts);
  return <div className="rounded-lg border border-zinc-800 bg-black/20 px-3 py-2">
    <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Last 14 days</div>
    <div className="flex items-end gap-1 h-12" role="img" aria-label={'Changes per day over the last 14 days: '+counts.join(', ')}>
      {days.map((d,i)=><div key={d} className="flex-1 h-full flex items-end" title={new Date(d).toLocaleDateString([], {day:'numeric',month:'short'})+': '+counts[i]+' change'+(counts[i]===1?'':'s')}>
        <div className={'w-full rounded-sm '+(counts[i]?'bg-amber-500':'bg-zinc-800')} style={{height:counts[i]?Math.max(12,counts[i]/max*100)+'%':'4px'}}/></div>)}</div>
    <div className="flex justify-between text-[10px] text-zinc-500 mt-1"><span>{new Date(days[0]).toLocaleDateString([], {day:'numeric',month:'short'})}</span><span>Today</span></div></div>;
}

export default function History({cy,s,log,undo,clear}){
  const [cat,setCat]=useLS('tpp2_ui_hcat','All');
  const [q,setQ]=React.useState(''),[ask,setAsk]=React.useState(false);
  const today=startOf(Date.now());
  const ticks=log.filter(e=>!e.bulk&&typeof e.v==='boolean'&&e.v).length;
  const week=log.filter(e=>e.t>=today-6*DAY).length;
  const todayN=log.filter(e=>e.t>=today).length;
  const counts=Object.fromEntries(CATS.map(c=>[c,log.filter(e=>catOf(e)===c).length]));
  const shown=log.filter(e=>(cat==='All'||catOf(e)===cat)&&(!q.trim()||entryText(e,cy).toLowerCase().includes(q.trim().toLowerCase())));
  const groups=[];shown.forEach(e=>{const d=startOf(e.t),g=groups[groups.length-1];if(g&&g.d===d)g.items.push(e);else groups.push({d,items:[e]})});
  const last=log[0];
  return <div className="grid gap-4">
    <PageLine>Everything you have changed in {'Prestige '+cy.p} since setup, newest first. Undo puts one item back the way it was.</PageLine>
    <Tiles items={[['Today',String(todayN),todayN===1?'change':'changes'],['This week',String(week),'last 7 days'],['Ticked off',String(ticks),'tasks and steps recorded'],['Last change',last?(startOf(last.t)===today?hm(last.t):dayLabel(last.t)):'None yet',last?(startOf(last.t)===today?'today':hm(last.t)):'']]}/>
    <Strip log={log}/>
    <Section title="Change history" sub="newest first"><Card c="!p-3 grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {['All',...CATS.filter(c=>counts[c])].map(c=><Pill key={c} on={cat===c} aria-pressed={cat===c} onClick={()=>setCat(c)}>{c}{c!=='All'&&<span className="opacity-90"> {counts[c]}</span>}</Pill>)}
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search your history" aria-label="Search your history" className="ml-auto w-full sm:w-56 rounded-lg border border-zinc-700 bg-black/30 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 outline-none"/></div>
      {log.length===0?<Empty title="Nothing here yet" hint="Changes you make after setup, such as ticks, levels and imports, appear here as you make them."/>
        :shown.length===0?<Empty icon="search" title="No changes match" hint="Try another filter or clear the search box."/>
        :<div className="grid gap-3">{groups.map(g=><div key={g.d}>
          <div className="flex items-baseline gap-2 border-b border-zinc-800 pb-1 mb-1"><h3 className="text-sm font-bold text-amber-500">{dayLabel(g.d)}</h3><span className="text-xs text-zinc-500">{g.items.length} change{g.items.length===1?'':'s'}</span></div>
          <div className="grid gap-0.5">{g.items.map((e,i)=><div key={i+'-'+e.t} className="flex gap-3 text-sm px-1 py-1 rounded hover:bg-white/5">
            <span className="text-xs text-zinc-500 w-[4.5rem] shrink-0 pt-0.5 tabular-nums whitespace-nowrap">{hm(e.t)}</span>
            <span className="text-zinc-100 flex-1 min-w-0">{entryText(e,cy)}</span>
            <span className="hidden sm:block shrink-0"><Chip tone="mute">{catOf(e)}</Chip></span>
            {canUndo(e,s)?<button onClick={()=>undo(e)} title="Put this back the way it was" className="lnk shrink-0 text-xs">Undo</button>:<span className="shrink-0 w-8"/>}</div>)}</div></div>)}</div>}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 border-t border-zinc-800 pt-2">
        <span>Keeps the last 300 changes for this prestige. Changes made before setup finished are not recorded.</span>
        {log.length>0&&(ask?<span className="flex items-center gap-2 text-red-300">Erase all {log.length}?<button onClick={()=>{clear();setAsk(false)}} className="rounded border border-red-400/50 px-2 py-0.5 hover:bg-red-400/10">Yes, clear</button><button onClick={()=>setAsk(false)} className="text-zinc-400 hover:text-zinc-200">Cancel</button></span>
          :<button onClick={()=>setAsk(true)} className="lnk">Clear history</button>)}</div>
    </Card></Section>
  </div>;
}
