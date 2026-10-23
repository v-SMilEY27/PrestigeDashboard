import '@fontsource/oxanium/latin-700.css';
import {openRewards} from './rewardsBus.js';
import React from 'react';

export const Card=({children,c=''})=><div className={'rounded-xl border border-zinc-800 bg-zinc-900 p-4 '+c}>{children}</div>;
// The progress bar used everywhere: a dark rail, a smooth fill and a glowing edge at the leading end. tone picks the colour; sm is the slimmer version.
const TONE={'bg-amber-500':'var(--acc,#f59e0b)','bg-green-500':'#22c55e','bg-sky-500':'#0ea5e9'};
export const Thin=({p,tone='bg-amber-500',sm})=>{const w=Math.min(100,Math.max(0,p||0));
  return <div className={'charge'+(sm?' sm':'')} aria-hidden="true">{w>0&&<span className="charge-fill" style={{width:w+'%','--b':TONE[tone]||tone}}/>}</div>};
export const Section=({title,sub,right,children})=><section className="grid gap-2">
  <div className="flex flex-wrap items-baseline gap-x-2"><h3 className="text-lg font-bold text-amber-500">{title}</h3>{sub&&<span className="text-xs text-zinc-500">{sub}</span>}{right&&<span className="ml-auto">{right}</span>}</div>{children}</section>;
// Expand all | Collapse all, the same everywhere.
export const ExpandAll=({onExpand,onCollapse})=><span className="ml-auto flex items-center gap-2 text-xs whitespace-nowrap"><button type="button" onClick={onExpand} className="lnk">Expand all</button><span className="text-zinc-700" aria-hidden="true">|</span><button type="button" onClick={onCollapse} className="lnk">Collapse all</button></span>;
// A status light on tiles that show a count like 3/7: green when complete, amber when under way, dark when nothing is done yet.
const ratio=v=>{const m=typeof v==='string'&&v.match(/^(\d+(?:\.\d+)?)[A-Za-z]*\/(\d+(?:\.\d+)?)/);return m?[+m[1],+m[2]]:null};
export const Stat=({label,value,sub,led})=>{const r=ratio(value),st=led||(r?(r[0]>=r[1]&&r[1]>0?'done':r[0]>0?'part':'none'):null);
  return <div className="relative rounded-lg border border-zinc-800 bg-black/20 px-3 py-2">{st&&<span role="img" aria-label={st==='done'?'Complete':st==='part'?'In progress':'Not started'} title={st==='done'?'Complete':st==='part'?'In progress':'Not started'} className={'stat-led '+st}/>}<div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</div><div className="stat-val text-lg leading-6">{value}</div>{sub&&<div className="text-xs text-zinc-500">{sub}</div>}</div>};
// Status light helpers. ledOf: done out of total. shortLed: a count of things still missing (none missing is complete).
export const ledOf=(d,t)=>t>0&&d>=t?'done':d>0?'part':'none';
export const shortLed=n=>n===0?'done':'part';
const LED_TXT={done:'Complete',part:'In progress',none:'Not started'};
export const Led=({st})=><span role="img" aria-label={LED_TXT[st]} title={LED_TXT[st]} className={'stat-led inl '+st}/>;
// A quiet glow that runs once when the wrapped item becomes complete while you are looking at it. Already complete items do not flash.
export const Pop=({done,className='',children})=>{
  const prev=React.useRef(done),[on,setOn]=React.useState(false);
  React.useEffect(()=>{const was=prev.current;prev.current=done;if(!was&&done){setOn(true);const t=setTimeout(()=>setOn(false),1800);return()=>clearTimeout(t)}if(!done)setOn(false)},[done]);
  return <div className={className+(on?' done-flash':'')}>{children}</div>};
const tones={ok:'border-green-400/30 bg-green-400/10 text-green-300',bad:'border-red-400/40 bg-red-400/10 text-red-300',mute:'border-zinc-700 bg-zinc-800/60 text-zinc-300',xp:'border-zinc-700 bg-zinc-800/60 text-zinc-300',rep:'border-zinc-700 bg-zinc-800/60 text-zinc-300',map:'border-zinc-700 bg-zinc-800/60 text-zinc-300',warn:'border-amber-400/40 bg-amber-400/10 text-amber-400',quiet:'border-transparent bg-transparent text-zinc-400 !px-1'};
export const Chip=({tone='mute',title,children})=><span title={title} className={'inline-flex items-center rounded-full border px-2 py-0.5 text-xs leading-4 max-w-full whitespace-normal '+tones[tone]}>{children}</span>;
// The green bold used whenever a message names the Backup, Transfer & Restore button or its Restore choice. Use this everywhere so they always match the button.
export const Bk=({children})=><b className="text-green-400">{children}</b>;
export const Tick=({on,fn,children,chips,note,disabled})=><label className="flex items-start gap-3 rounded-lg px-2 py-1.5 cursor-pointer transition hover:bg-white/5">
  <input type="checkbox" checked={!!on} onChange={fn} disabled={disabled} className="accent-amber-500 mt-1 size-4 shrink-0"/>
  <div className="min-w-0 flex-1"><div className={'font-medium '+(on?'line-through opacity-50':'')}>{children}</div>
    {chips&&<div className={'flex flex-wrap gap-1 mt-1 '+(on?'opacity-50':'')}>{chips}</div>}
    {note&&<div className="text-xs text-zinc-400 mt-1">{note}</div>}</div></label>;
export const Pill=({on,children,...p})=><button {...p} className={'rounded-full px-3.5 py-1.5 text-sm font-medium transition '+(p.disabled?'border border-zinc-800 text-zinc-600 cursor-not-allowed':on?'bg-amber-500 text-black':'border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-white/5')}>{p.disabled&&<Lock/>}{children}</button>;

// Standard top of every tab: one line saying what the page is for, then up to four stat tiles.
export const PageLine=({children})=><p className="text-sm text-zinc-400">{children}</p>;
export const Tiles=({items})=><div className={'grid grid-cols-2 gap-2 '+(items.length===3?'sm:grid-cols-3':items.length===5?'sm:grid-cols-5':'sm:grid-cols-4')}>{items.map(([l,v,s])=><Stat key={l} label={l} value={v} sub={s}/>)}</div>;

// Faction colours. BEAR is tan text on olive green; USEC is white text on black (like the in-game patch).
export const FACTION={
  BEAR:{bg:'#4a5326',border:'#8d9455',fg:'#dcc79c'},
  USEC:{bg:'#000000',border:'#e5e5e5',fg:'#ffffff'}};
// One chip for the player: their PMC name in their faction colours. Falls back to the faction name, or a plain name chip.
export const PlayerChip=({name,faction})=>{const c=FACTION[faction];
  if(!name&&!c)return null;
  if(!c)return <Chip tone="map" title="Your PMC name">{name}</Chip>;
  return <span title={(name?name+' · ':'')+faction+' PMC'} style={{backgroundColor:c.bg,borderColor:c.border,color:c.fg,outline:`1px dashed ${c.border}`,outlineOffset:'-3px'}} className="patch-font inline-flex items-center rounded-[3px] border-2 px-3 py-1 text-xs leading-4 font-bold uppercase tracking-widest whitespace-nowrap">{name||faction}</span>};

// Disclosure chevron drawn as a shape (the text arrow shows as a blue emoji box on some systems). Rotates 90 degrees when its parent group is open.
export const Chev=()=><svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" className="inline-block"><path d="M3 1.5 L7 5 L3 8.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// Golden tick, like the game's "found in raid" marker.
export const FirTick=({n,className=''})=><span title="Must be found in raid" className={'inline-flex items-center gap-0.5 align-middle text-amber-400 '+className}>
  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-label="Found in raid"><path d="M3 8.5l3.2 3.2L13 4.8"/></svg>{n?<span className="text-xs font-semibold">{n}</span>:null}</span>;

// The small purple dot that means "new". Used on the maker's mark (new update) and on Run Setup and setup steps (new or changed setup). Always this purple. Place it with className.
export const NewPip=({className='',label='New'})=><span role="img" aria-label={label} title={label} className={'absolute size-2.5 rounded-full bg-purple-500 ring-2 ring-[#0e0f11] '+className}/>;

// Shared icons, so ticks, pins, keys and stars look the same on every tab and on every device (no colour emoji).
const ic={viewBox:'0 0 16 16',fill:'none',stroke:'currentColor',strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true};
export const CheckGlyph=({className='size-[70%]'})=><svg {...ic} strokeWidth="2.8" className={className}><path d="M3.5 8.5l3 3 6-6.5"/></svg>;
// Round green tick for "done", matches the green tick boxes.
export const Done=({className=''})=><span title="Done" className={'inline-grid place-items-center size-3.5 rounded-full bg-green-500 text-green-950 align-[-2px] mr-1 shrink-0 '+className}><CheckGlyph/></span>;
export const Pin=()=><svg {...ic} strokeWidth="1.6" className="inline size-3.5 align-[-2px] mr-1 shrink-0"><path d="M8 14.5s4.5-4.2 4.5-7.8a4.5 4.5 0 10-9 0C3.5 10.3 8 14.5 8 14.5z"/><circle cx="8" cy="6.7" r="1.6"/></svg>;
export const KeyIcon=()=><svg {...ic} strokeWidth="1.6" className="inline size-3.5 align-[-2px] mr-1 shrink-0"><circle cx="5" cy="10.5" r="2.7"/><path d="M7 8.6L13.5 2.5M11 5l2 2M9.2 6.7l1.6 1.6"/></svg>;
export const Lock=()=><svg {...ic} strokeWidth="1.6" className="inline size-3.5 align-[-2px] mr-1 shrink-0"><rect x="3.2" y="7.2" width="9.6" height="6.6" rx="1.4"/><path d="M5.3 7.2V5.3a2.7 2.7 0 015.4 0v1.9"/></svg>;
export const Star=()=><svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="inline size-3.5 align-[-2px] mr-0.5 shrink-0 text-amber-400"><path d="M8 1.6l1.9 4 4.3.5-3.2 3 .9 4.3L8 11.2l-3.9 2.2.9-4.3-3.2-3 4.3-.5z"/></svg>;

// A run's name: Prestige 1, Prestige 2 and so on.
export const playName=p=>`Prestige ${p}`;

// Shows a number that counts up or down to its new value when it changes (not on first show). Off for reduced motion.
export const useCountTo=v=>{const [shown,setShown]=React.useState(v),from=React.useRef(v);
  React.useEffect(()=>{const a=from.current,b=v;if(a===b)return;
    const calm=typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(calm){from.current=b;setShown(b);return}
    const t0=performance.now(),D=550;let raf;
    const step=t=>{const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,3);setShown(Math.round(a+(b-a)*e));if(k<1)raf=requestAnimationFrame(step);else from.current=b};
    raf=requestAnimationFrame(step);return()=>{cancelAnimationFrame(raf);from.current=b}},[v]);
  return shown};
// Row of small level pips for a hideout module: green = built, tinted = planned, ringed = needed for this prestige.
export const Pips=({max,built=0,plan=0,need=0})=><span className="pips" role="img" aria-label={`Built level ${built} of ${max}`+(need?`, level ${need} needed`:'')}>{[...Array(max)].map((_,i)=>{const n=i+1;return <span key={n} className={'pip'+(n<=built?' built':n<=plan?' plan':'')+(n<=need?' need':'')}/>})}</span>;
// A friendly empty state: a small icon, what is empty, and what to do about it. icon: done | search | empty.
const EI={done:<><circle cx="12" cy="12" r="8.5"/><path d="M8.2 12.4l2.6 2.6 5-5.4"/></>,search:<><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/></>,empty:<><path d="M3.5 13l2.2-6.2A2 2 0 017.6 5.5h8.8a2 2 0 011.9 1.3L20.5 13"/><path d="M3.5 13v4.5a1.5 1.5 0 001.5 1.5h14a1.5 1.5 0 001.5-1.5V13h-4.5l-1 2h-6l-1-2z"/></>};
export const Empty=({icon='empty',title,hint,c=''})=><div className={'rounded-xl border border-dashed border-zinc-700 bg-black/10 px-4 py-7 text-center grid justify-items-center gap-1.5 '+c}>
  <span className={'grid place-items-center size-10 rounded-full border '+(icon==='done'?'border-green-400/40 bg-green-400/10 text-green-300':'border-zinc-700 bg-zinc-800/60 text-zinc-400')}><svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{EI[icon]}</svg></span>
  <div className="font-semibold text-zinc-200">{title}</div>{hint&&<div className="text-sm text-zinc-400 max-w-md">{hint}</div>}</div>;

// Banner for the opened prestige, built like the keycards on the picker. compact is the slim version shown on the other tabs.
export const PrestigeCard=({p,pct,done,total,name,faction,compact})=>{
  const ready=pct>=100,shownPct=useCountTo(pct);
  // Completing the last requirement while you watch stamps the card ACCESS GRANTED for a few seconds. Opening an already complete prestige does not.
  const prev=React.useRef(pct),[stamp,setStamp]=React.useState(false);
  React.useEffect(()=>{const was=prev.current;prev.current=pct;if(was<100&&pct>=100){setStamp(true);const t=setTimeout(()=>setStamp(false),3200);return()=>clearTimeout(t)}if(pct<100)setStamp(false)},[pct]);
  return <div className={'kc '+(ready?'kc-done':'kc-prog')+(stamp?' kc-flash':'')+' kc-p'+p+' border relative flex flex-col overflow-hidden '+(compact?'min-h-[4.5rem]':'min-h-[8.5rem]')} >
    <span role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Prestige readiness" className="sr-only">{pct}%</span>
    <div className="relative z-[1] flex flex-1 items-stretch">
      <div className={'flex-1 min-w-0 pl-4 pr-3 flex items-center gap-3.5 '+(compact?'py-2':'py-4')}>
        <span className="kc-slot" aria-hidden="true"/>
        <div className="min-w-0 flex flex-col justify-center gap-1">
          {!compact&&<span className="kc-eyebrow leading-none">{ready?"Ready to prestige":"Working toward"}</span>}
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className={'kc-title font-bold uppercase tracking-wider whitespace-nowrap '+(compact?'text-base':'text-xl')}>{playName(p)}</span><button type="button" onClick={()=>openRewards(p,p)} title={'See what '+playName(p)+' gives you'} className="kc-rw"><svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="2.2" y="6.2" width="11.6" height="7.6" rx="1"/><path d="M1.6 4.4h12.8v1.8H1.6zM8 4.4v9.4M8 4.4C6.2 4.4 4.8 3.7 5.2 2.8S7.5 2.7 8 4.4zM8 4.4c1.8 0 3.2-.7 2.8-1.6S8.5 2.7 8 4.4z"/></svg>Rewards</button></span>
          {!compact&&<span className="mt-0.5"><PlayerChip name={name} faction={faction}/></span>}</div>
        <div className="ml-auto flex items-center gap-3.5">
          <span className={'patch-font kc-pct leading-none tabular-nums '+(compact?'text-2xl':'text-4xl sm:text-5xl')}>{shownPct}%</span>
          {ready?<span className="kc-stat hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] leading-snug"><span className="kc-led" aria-hidden="true"/>Access<br/>granted</span>
            :<span className="kc-stat hidden sm:block text-xs font-semibold uppercase tracking-[0.14em] leading-snug">{done}<span className="opacity-85"> of {total}</span><br/>met</span>}</div></div>
      <span className="kc-band" aria-hidden="true"><span>{p===6?'Final':ready?'Ready':'Active'}</span></span></div>
    <span className="sr-only" role="status">{stamp?playName(p)+' complete. Access granted.':''}</span>
    {stamp&&<div aria-hidden="true" className="kc-stamp"><span><i className="kc-led"/>Access granted</span></div>}
    <div aria-hidden="true" className={'kc-rail absolute inset-x-0 bottom-0 '+(compact?'h-1.5':'h-2')}>{pct>0&&<span className="kc-fill" style={{width:Math.min(100,pct)+'%'}}/>}</div>
  </div>};

// Shared window shell for the welcome, backup and import windows: rounded, a thin edge and header strip in the window's colour (amber, green or sky), a bordered close button, and a body with even padding.
// A soft fade at the bottom of a scrolling window while there is more below it (the scrollbars are hidden). Sets data-more on the scroller.
export const bindMore=el=>{if(!el)return()=>{};const f=()=>{if(el.scrollHeight-el.scrollTop-el.clientHeight>6)el.setAttribute('data-more','1');else el.removeAttribute('data-more')};
  f();el.addEventListener('scroll',f,{passive:true});let ro,mo;try{ro=new ResizeObserver(f);ro.observe(el);[...el.children].forEach(c=>ro.observe(c))}catch(e){}try{mo=new MutationObserver(f);mo.observe(el,{childList:true,subtree:true})}catch(e){}
  return()=>{el.removeEventListener('scroll',f);ro&&ro.disconnect();mo&&mo.disconnect()}};
export const Modal=({label,title,tone='green',onClose,dismiss,wide='max-w-lg',z='z-50',children})=>{
  const pr=React.useRef(null);
  const opener=React.useRef(typeof document!=='undefined'?document.activeElement:null); // read while rendering, before a window button with autoFocus takes focus
  React.useEffect(()=>bindMore(pr.current),[]);
  React.useEffect(()=>{if(pr.current)pr.current.scrollTop=0},[]); // autofocus on a bottom button can scroll a tall window; start at the top
  // keyboard: focus moves into the window on open (unless something inside already took it), Tab stays inside, and focus returns to what opened it on close
  React.useEffect(()=>{const prev=opener.current;const p=pr.current;if(p&&!p.contains(document.activeElement))p.focus({preventScroll:true});return()=>{try{if(prev&&prev.isConnected&&prev.focus)prev.focus({preventScroll:true})}catch{}}},[]);
  const trap=e=>{if(e.key!=='Tab')return;const p=pr.current;if(!p)return;
    const f=[...p.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')].filter(x=>x.offsetParent!==null||x===document.activeElement);
    if(!f.length){e.preventDefault();p.focus();return}
    const a=document.activeElement,first=f[0],last=f[f.length-1];
    if(e.shiftKey&&(a===first||a===p||!p.contains(a))){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&(a===last||!p.contains(a))){e.preventDefault();first.focus()}};
  React.useEffect(()=>{if(!onClose)return;const h=e=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',h);return()=>document.removeEventListener('keydown',h)},[onClose]);
  return <div role="dialog" aria-modal="true" aria-label={label||title} className={'md-back fixed inset-0 '+z+' grid place-items-center bg-black/75 p-4 overflow-auto'} onKeyDown={trap} onClick={e=>{if(dismiss&&e.target===e.currentTarget)onClose&&onClose()}}>
    <div ref={pr} tabIndex={-1} className={'outline-none md md-panel md-'+tone+' w-full '+wide+' max-h-[92vh] overflow-auto cl-scroll rounded-2xl border bg-[#0f1012] shadow-2xl shadow-black/60 my-auto'}>
      <div className="md-head sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-3 border-b bg-[#0f1012]/95 backdrop-blur"><h2 className="md-title text-xl font-bold">{title}</h2>
        {onClose&&<button onClick={onClose} aria-label="Close" className="md-x grid place-items-center size-8 rounded-lg border border-zinc-700 text-zinc-400 transition">✕</button>}</div>
      <div className="p-5 grid gap-4">{children}</div></div></div>};
// Buttons row for a window: quiet actions on the left, the main action on the right.
// Pinned to the bottom of every window (stays visible while the window scrolls): quiet actions on the left, the main action on the right.
export const ModalFoot=({left,children})=><div className="md-foot sticky bottom-0 z-10 -mx-5 -mb-5 mt-1 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 bg-[#0f1012]/95 backdrop-blur"><div className="text-xs">{left}</div><div className="flex flex-wrap items-center gap-2">{children}</div></div>;
// The Close button every window ends with, in the window's own colour. quiet = outlined, used when another button is the main action.
const CB={amber:['bg-amber-500 hover:bg-amber-400','border-amber-500/50 text-amber-300 hover:bg-amber-500/10'],sky:['bg-sky-500 hover:bg-sky-400','border-sky-500/50 text-sky-300 hover:bg-sky-500/10'],green:['bg-green-500 hover:bg-green-400','border-green-500/50 text-green-300 hover:bg-green-500/10'],pink:['bg-pink-500 hover:bg-pink-400','border-pink-500/50 text-pink-300 hover:bg-pink-500/10']};
['p1','p2','p3','p4','p5','p6'].forEach(k=>{CB[k]=['bg-[var(--mc)] hover:brightness-110','border-[color:color-mix(in_srgb,var(--mc)_55%,transparent)] text-[var(--mc)] hover:bg-white/5']});
export const CloseBtn=({tone='amber',quiet,onClick,autoFocus})=><button autoFocus={autoFocus} onClick={onClick} className={'rounded-lg text-sm px-5 py-2 '+(quiet?'border font-normal '+CB[tone][1]:'text-black font-semibold '+CB[tone][0])}>Close</button>;

// A tick for a number that has a target (level, roubles, skills, item counts). Ticking sets the number to the target and remembers
// what it was; ticking again puts it back. If the target was already met before you ticked, the number box is the way to lower it.
export const NumTick=({done,canClear,onClick,label,className=''})=><button type="button" onClick={onClick} aria-pressed={done} aria-label={label} title={done?(canClear?'Clear this and put your number back':'Already met. Change the number to lower it'):'Mark this as reached'} className={'tap grid place-items-center size-4 shrink-0 rounded-full text-xs font-bold transition '+(done?'bg-green-500 text-green-950':'border border-zinc-600 text-transparent hover:border-zinc-400 hover:bg-white/10')+' '+className}><CheckGlyph/></button>;
export const toggleNum=(s,set,k,need,cur)=>{const pk='prev:'+k;
  if(cur>=need){const pv=s.n[pk];if(pv!==undefined&&pv!==null){set(k,pv);set(pk,undefined)}}
  else{set(pk,cur||0);set(k,need)}};

// Experimental things are pink everywhere: the header button, the windows, this tag and this note.
export const ExpTag=()=><span className="inline-flex items-center rounded-full border border-pink-400/40 bg-pink-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-pink-300">Experimental</span>;
export const ExpNote=({children})=><p className="rounded-xl border border-pink-400/25 bg-pink-400/5 px-4 py-3 text-xs leading-5 text-pink-300">{children}</p>;
// A collapsible numbered "how to" for a window, in the window's own colour. Closed by default so regular users can skip it.
const HT={amber:'border-amber-500/30 bg-amber-500/5 text-amber-300',sky:'border-sky-500/30 bg-sky-500/5 text-sky-300',green:'border-green-500/30 bg-green-500/5 text-green-300',pink:'border-pink-400/30 bg-pink-400/5 text-pink-300'};
export const HowTo=({tone='green',title,steps,defaultOpen})=><details open={defaultOpen||undefined} className={'group rounded-xl border px-4 py-2.5 '+HT[tone]}><summary className="cursor-pointer list-none text-sm font-semibold flex items-center justify-between gap-3">{title}<span aria-hidden="true" className="text-xs font-normal opacity-80 group-open:hidden">Show steps</span><span aria-hidden="true" className="text-xs font-normal opacity-80 hidden group-open:inline">Hide steps</span></summary>
  <ol className="mt-2 grid gap-2 text-sm text-zinc-200">{steps.map((t,i)=><li key={i} className="flex gap-3"><span aria-hidden="true" className="grid place-items-center shrink-0 size-6 rounded-full border border-current/40 bg-black/20 text-xs font-bold">{i+1}</span><span className="pt-0.5">{t}</span></li>)}</ol></details>;
