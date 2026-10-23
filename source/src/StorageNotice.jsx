import React from 'react';
import {Bk} from './ui.jsx';
// Shown when progress could not be saved, or when damaged saved data was found (a copy is kept).
export default function StorageNotice(){
  const [m,setM]=React.useState(()=>{const f=window.__pd||{};return f['pd-save-failed']?'fail':f['pd-data-damaged']?'damaged':null});
  const gone=React.useRef(false);
  React.useEffect(()=>{const w=window.__pd||{};if(w['pd-save-failed'])setM('fail');else if(w['pd-data-damaged'])setM('damaged');const f=()=>{if(!gone.current)setM('fail')},d=()=>{if(!gone.current)setM(x=>x||'damaged')};window.addEventListener('pd-save-failed',f);window.addEventListener('pd-data-damaged',d);return()=>{window.removeEventListener('pd-save-failed',f);window.removeEventListener('pd-data-damaged',d)}},[]);
  if(!m)return null;
  return <div role="alert" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)] rounded-xl border border-amber-500/60 bg-zinc-900 shadow-2xl px-4 py-3 flex flex-wrap items-center gap-3">
    <div className="text-sm"><span className="font-semibold text-amber-400">{m==='fail'?'Your progress could not be saved in this browser.':'Some saved progress was damaged.'}</span> <span className="text-zinc-300">{m==='fail'?<>Your browser may be full or blocking storage. Make a backup code in <Bk>Backup, Transfer &amp; Restore</Bk> now, then free some space or allow site data.</>:<>A copy of the damaged data was kept. Open <Bk>Backup, Transfer &amp; Restore</Bk> to check your automatic snapshots.</>}</span></div>
    <div className="flex gap-2 ml-auto"><button onClick={()=>window.dispatchEvent(new Event('pd-open-backup'))} className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-amber-400">Open it now</button>
      <button onClick={()=>{gone.current=true;setM(null)}} className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/5">Dismiss</button></div></div>;
}
