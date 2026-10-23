import React from 'react';
import {MAKER} from './mark.js';
import {VERSION,RELEASES} from './releases.js';
import {BUILD_ID} from './build.js';
const BUILD=BUILD_ID(VERSION);
import {NewPip,Chev,bindMore} from './ui.jsx';
import {useExp} from './expOptIn.js';

// The maker's mark: the handle in small text with a smile-shaped underline, top right. Dark grey until you hover over it, then purple.
// Clicking it opens the changelog.
const SEEN='tpp2_ui_seen_ver';
export default function Mark(){
  const ex=useExp();
  const [open,setOpen]=React.useState(false);
  // A small purple dot shows until the changelog has been opened since the last update. A first-ever visit starts out as seen.
  const [seen,setSeen]=React.useState(()=>{try{const v=localStorage.getItem(SEEN);if(v===null){localStorage.setItem(SEEN,BUILD);return BUILD}return v}catch{return BUILD}});
  const show=()=>{setOpen(true);setSeen(BUILD);try{localStorage.setItem(SEEN,BUILD)}catch{}};
  const fresh=seen!==BUILD;
  React.useEffect(()=>{if(!open)return;const h=e=>{if(e.key==='Escape')setOpen(false)};document.addEventListener('keydown',h);return()=>document.removeEventListener('keydown',h)},[open]);
  return <div className="absolute top-0 right-0">
    <button onClick={show} title="I'm going through changes..." aria-label={fresh?'Open changelog (new update)':'Open changelog'} className="relative inline-flex flex-col items-center text-zinc-900 transition-colors duration-500 hover:text-purple-500 focus-visible:text-purple-500 select-none cursor-pointer">
      {fresh&&<NewPip label="New update" className="-top-1.5 -right-2.5"/>}
      <span className="font-mono text-[11px] font-semibold tracking-[0.2em] leading-none">{MAKER}</span>
      <svg viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true" className="mt-1 w-full h-3.5">
        <path d="M2 2 Q50 22 98 2" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
      </svg>
    </button>
    {open&&<div role="dialog" aria-modal="true" aria-label="Changelog" className="md-back fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
      <div ref={el=>{if(el){el._u&&el._u();el._u=bindMore(el)}}} className="md-panel w-full max-w-3xl max-h-[92vh] overflow-auto rounded-2xl border border-purple-400/25 bg-[#0f1012] shadow-2xl shadow-black/60 cl-scroll">
        <div className="sticky top-0 z-10 bg-[#0f1012]/95 backdrop-blur border-b border-purple-400/20"><div className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1"><h2 className="text-xl font-bold text-purple-400 cl-cursor">Changelog</h2></div>
          <button onClick={()=>setOpen(false)} aria-label="Close" className="grid shrink-0 place-items-center size-8 rounded-lg border border-zinc-700 text-zinc-400 hover:text-purple-300 hover:border-purple-400/60 transition">✕</button></div>
</div>
        <div className="grid gap-3 p-4">{(()=>{const one=(r,i)=>{
          const head=<><span className={'rounded-md border px-2 py-0.5 font-mono text-sm font-bold '+(r.x?'border-pink-400/40 bg-pink-400/10 text-pink-300':'border-purple-400/40 bg-purple-400/10 text-purple-300')}>v{r.v}{r.x?'E':''}</span>{r.x&&<span className="patch-font text-base font-bold uppercase tracking-wider text-pink-400">Experimental</span>}{r.t&&<span className="patch-font text-sm font-bold uppercase tracking-wider text-zinc-400">{r.t}</span>}<span className="text-xs text-zinc-500 ml-auto">{+String(r.v).split('.')[1]<21?'':r.d}</span></>;
          const about=r.about&&<div className="rounded-lg border border-pink-400/25 bg-pink-400/5 p-3 grid gap-1.5"><div className="text-sm font-bold text-pink-300">{r.about.title}</div>{r.about.body.map((t,k)=><p key={k} className="text-xs leading-5 text-pink-200/90">{t}</p>)}</div>;
          const list=<>{about}<ul className={'grid gap-2 text-sm cl-list '+(r.x?'text-pink-200 cl-exp-all':'text-zinc-300')}>{r.n.map((x,j)=><li key={j}>{x}</li>)}</ul></>;
          return r.v===RELEASES[0].v?<section key={r.v+(r.x?'E':'')} className={'rounded-xl border p-4 grid gap-3 '+(r.x?'border-pink-400/30 bg-pink-400/5':'border-zinc-800 bg-zinc-900')}><div className="flex flex-wrap items-center gap-2">{head}</div>{list}</section>
            :<details key={r.v+(r.x?'E':'')} className={'group rounded-xl border '+(r.x?'border-pink-400/30 bg-pink-400/5':'border-zinc-800 bg-zinc-900')}><summary className="cursor-pointer list-none flex flex-wrap items-center gap-2 p-3"><span className={(r.x?'text-pink-400':'text-purple-400')+' text-xs transition-transform group-open:rotate-90'}><Chev/></span>{head}</summary><div className="px-4 pb-4 pt-1">{list}</div></details>};const launch=r=>{const [a,b]=r.v.split('.').map(Number);return a===1&&b<=20};const early=RELEASES.filter(launch),recent=RELEASES.filter(r=>!launch(r));const first=early.length?early[early.length-1].v:'',last=early.length?early[0].v:'';
return <>{recent.map((r,i)=>one(r,i))}{early.length>0&&<details className="group rounded-xl border border-purple-400/25 bg-purple-400/5"><summary className="cursor-pointer list-none flex flex-wrap items-center gap-2 p-3"><span className="text-purple-400 text-xs transition-transform group-open:rotate-90"><Chev/></span><span className="font-semibold text-purple-300 text-sm">Launch week: rapid releases</span><span className="rounded-md border border-purple-400/40 bg-purple-400/10 px-2 py-0.5 font-mono text-xs text-purple-300">v{first} to v{last}</span><span className="text-xs text-zinc-500 ml-auto">{early.length} releases</span></summary><div className="grid gap-3 px-3 pb-3 pt-1"><p className="text-xs leading-5 text-zinc-400">During launch week, every small fix got its own version number, so the count climbed quickly. From here on, updates are weekly.</p>{early.map((r,k)=>one(r,k+3))}</div></details>}</>})()}
        </div>
      </div></div>}
  </div>;
}
