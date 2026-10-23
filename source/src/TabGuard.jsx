import React from 'react';
import {Modal,ModalFoot} from './ui.jsx';
// Only one tab should use the dashboard at a time: every tab keeps its own copy of the progress and the last one to save would overwrite the other.
// A tab that finds another one already open asks the person to choose. The tab that loses stops (the app is removed, so nothing can save from stale data).
export default function TabGuard({children}){
  const [st,setSt]=React.useState('ok'); // ok | dup (this tab opened second) | lost (another tab was chosen)
  const [gen,setGen]=React.useState(0);
  const ch=React.useRef(null);const me=React.useRef(Math.random().toString(36).slice(2));
  React.useEffect(()=>{
    if(typeof BroadcastChannel==='undefined')return;
    let c;try{c=new BroadcastChannel('pd-open-tab')}catch{return}
    ch.current=c;
    c.onmessage=e=>{const m=e.data||{};if(m.from===me.current)return;
      if(m.t==='hello')c.postMessage({t:'here',from:me.current,to:m.from}); // a tab that is already open answers a new one
      else if(m.t==='here'&&m.to===me.current)setSt(s=>s==='ok'?'dup':s);
      else if(m.t==='take')setSt('lost')};
    c.postMessage({t:'hello',from:me.current});
    return()=>{ch.current=null;c.close()}},[]);
  const use=()=>{try{ch.current&&ch.current.postMessage({t:'take',from:me.current})}catch{}setSt('ok');setGen(g=>g+1)}; // remounting reads the latest progress from the browser
  if(st==='ok')return <React.Fragment key={gen}>{children}</React.Fragment>;
  return <Modal label="Dashboard open in another tab" title={st==='dup'?'Already open in another tab':'Moved to another tab'} tone="amber" wide="max-w-md" z="z-[60]">
    <p className="text-sm leading-6 text-zinc-300">{st==='dup'?'The Prestige Dashboard is already open in another tab or window of this browser.':'You started using the Prestige Dashboard in another tab or window, so this one has paused.'}</p>
    <p className="text-sm leading-6 text-zinc-300">Only one should be open at a time. Each one keeps its own copy of your progress, and the last one to save would overwrite the other.</p>
    <p className="text-sm leading-6 text-zinc-300">{st==='dup'?'Close this tab and carry on in the other one, or press Use this tab to carry on here. The other tab will pause.':'Close this tab, or press Use this tab to carry on here. It shows your latest progress.'}</p>
    <ModalFoot><button autoFocus onClick={use} className="rounded-lg bg-amber-500 text-black text-sm font-semibold px-5 py-2 hover:bg-amber-400">Use this tab</button></ModalFoot></Modal>;
}
