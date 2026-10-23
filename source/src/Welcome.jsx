import React from 'react';
import {useLS} from './useLS.js';
import {Modal,ModalFoot,CloseBtn,Bk} from './ui.jsx';
import About from './About.jsx';
import AccentCard from './AccentCard.jsx';

// One-time welcome window shown on the first visit (remembered in this browser).
// Turns back on every warning the user has hidden: the backup reminders and each cycle's "Setup was skipped" notice.
// Other parts of the app listen for the event so their on-screen state follows.
export function restoreWarnings(){
  let n=0;
  try{
    if(localStorage.getItem('tpp2_ui_bkremind_off')==='1'){localStorage.removeItem('tpp2_ui_bkremind_off');n++}
    for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!/^tpp2_cycle_\d+$/.test(k))continue;
      const o=JSON.parse(localStorage.getItem(k));if(o&&o.n&&o.n.skipIgnore){delete o.n.skipIgnore;localStorage.setItem(k,JSON.stringify(o));n++}}
  }catch{}
  window.dispatchEvent(new Event('pd-restore-warnings'));
  return n;
}
export const showWelcome=()=>window.dispatchEvent(new Event('pd-show-welcome'));
// A small round "?" button for the header that opens the welcome window again.
export const WelcomeBtn=()=><button onClick={showWelcome} title="Show the welcome message" aria-label="Show the welcome message" className="grid place-items-center size-7 rounded-full border border-zinc-600 text-xs font-bold text-zinc-300 transition hover:border-amber-500 hover:text-amber-400">?</button>;
export default function Welcome(){
  const [seen,setSeen]=useLS('tpp2_ui_welcome_seen',false);
  const [again,setAgain]=React.useState(false);
  const [restored,setRestored]=React.useState(null);
  const [about,setAbout]=React.useState(false);
  React.useEffect(()=>{const h=()=>{setAgain(true);setRestored(null);setSeen(false)};window.addEventListener('pd-show-welcome',h);return()=>window.removeEventListener('pd-show-welcome',h)},[]);
  React.useEffect(()=>{const h=()=>setSeen(true);window.addEventListener('pd-hide-welcome',h);return()=>window.removeEventListener('pd-hide-welcome',h)},[]);
  if(seen)return null;
  const step=(n,t)=><li className="flex gap-3"><span className="grid place-items-center shrink-0 size-6 rounded-full border border-amber-500/60 bg-amber-500/10 text-xs font-bold text-amber-400">{n}</span><span className="pt-0.5">{t}</span></li>;
  return <>
  <Modal label="Welcome" title="Welcome to the Prestige Dashboard" tone="amber" wide="max-w-3xl" onClose={()=>setSeen(true)}>
    <div className="text-sm text-zinc-300">A planner for your Escape from Tarkov PvE prestige runs. It shows what each prestige needs, what you have done so far, and what to do next.</div>
    <AccentCard tone="amber" title="How it works" c="text-sm text-zinc-300 grid gap-1.5">
      <ol className="grid gap-2.5">
        {step(1,<>Pick the prestige you are working toward, then run Setup. You can enter your level, loyalty levels, hideout levels and finished tasks, or use <b className="text-sky-400 whitespace-nowrap">Import Screenshot</b> to read them from in-game screenshots.</>)}
        {step(2,<>Tick off tasks and update your hideout levels as you go. The tabs show your readiness, a step-by-step plan, your hideout, trader tasks and what to loot.</>)}
        {step(3,<>None of your progress is uploaded. It is all kept in this browser, and once the page has loaded it works without internet.</>)}
      </ol></AccentCard>
    <AccentCard tone="green" c="grid gap-2" title={<span className="flex items-center gap-2 text-green-400"><svg viewBox="0 0 16 16" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 1.6l5 1.9v4c0 3.1-2.1 5.3-5 6.9-2.9-1.6-5-3.8-5-6.9v-4z"/><path d="M5.6 8.2l1.6 1.6 3.2-3.4"/></svg>Back up your progress regularly</span>}>
      <div className="text-sm text-zinc-100">Your progress is saved <b>only in this browser</b>. Clearing your browser data, switching browser or device, or opening the page from a different address <b>will lose it</b>, and nobody can recover it for you. Updates keep your progress, but a backup code is still your safety net.</div>
      <div className="text-sm text-zinc-100">Once setup is finished, use the green <Bk>Backup, Transfer &amp; Restore</Bk> button at the top, copy the code and keep it somewhere safe (a notes app or a message to yourself). To restore, open the same button, choose <Bk>Restore</Bk> and paste it. Make a fresh code whenever you make progress, especially before an update.</div>
    </AccentCard>
    <AccentCard tone="pink" title={<span className="text-pink-300">Experimental features</span>} c="text-xs text-zinc-400">These features are still in heavy development and may change a lot, or be removed, before they join the main site. They are off until you turn them on with the pink Experimental button at the top.</AccentCard>
    <ModalFoot left={<div className="grid gap-1"><div className="flex flex-wrap gap-x-4 gap-y-1"><button onClick={()=>setAbout(true)} className="md-link text-left">About and help</button><button onClick={()=>setRestored(restoreWarnings())} className="md-link text-left">Restore hidden warnings</button></div>
        {restored!==null&&<div role="status" className="text-zinc-400">{restored>0?'Done. Hidden warnings are back on.':'Nothing was hidden.'}</div>}</div>}>
      {again?<CloseBtn tone="amber" autoFocus onClick={()=>setSeen(true)}/>:<button autoFocus onClick={()=>setSeen(true)} className="rounded-lg bg-amber-500 text-black text-sm font-semibold px-5 py-2 hover:bg-amber-400">Got it, let's start</button>}</ModalFoot>
  </Modal>
  <About open={about} onClose={()=>setAbout(false)} go={ev=>{setAbout(false);setSeen(true);setTimeout(()=>window.dispatchEvent(new Event(ev)),0)}}/>
  </>;
}
