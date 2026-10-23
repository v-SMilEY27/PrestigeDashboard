import React from 'react';
import {Chip,Chev,Modal,ModalFoot,CloseBtn,HowTo,ExpNote,Bk} from './ui.jsx';
import {autoSnap} from './Backup.jsx';
import {readLogs,droppedLogs,fromInput,canWatch,savedHandle,forgetHandle,chooseHandle,openHandle} from './logs.js';
import {useLS} from './useLS.js';
import {saveLogState,fmtAt,resetLogHistory} from './LogStatus.jsx';
import {prereqsOf} from './chain.js';

const nice=k=>{const [t,...x]=k.split('|');return {t,x:x.join('|')}};
const tkey=k=>'tk:'+k.replace('|',':');
const day=s=>s?new Date(s*1000).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'';

export default function ImportLogs({open,onClose,s,setS}){
  const [drag,setDrag]=React.useState(false);
  const [busy,setBusy]=React.useState(false);
  const [err,setErr]=React.useState('');
  const [res,setRes]=React.useState(null);
  const [pick,setPick]=React.useState({});
  const [done,setDone]=React.useState('');
  const [brave,setBrave]=React.useState(false);
  React.useEffect(()=>{try{navigator.brave&&navigator.brave.isBrave().then(setBrave).catch(()=>{})}catch{}},[]);
  const ua=typeof navigator!=='undefined'?navigator.userAgent:'';
  const firefox=/firefox/i.test(ua),safari=/safari/i.test(ua)&&!/chrome|chromium|crios|edg/i.test(ua);
  const [last,setLast]=useLS('tpp2_ui_logslast',null);
  const [saved,setSaved]=React.useState(null);
  React.useEffect(()=>{if(open)savedHandle().then(setSaved)},[open]);
  const dirRef=React.useRef(null),fileRef=React.useRef(null);
  // Manual clear (hotfix 1.22.1): forget what the logs said so far and read only messages from now on. Ticks are not touched.
  const [ask,setAsk]=React.useState(false);
  const clearNow=()=>{resetLogHistory();setLast(null);setS(o=>({...o,n:{...o.n,logFrom:Math.floor(Date.now()/1000)}}));setAsk(false);setDone('Log history cleared. Only log messages from now on are read.')};
  const reset=()=>{setRes(null);setPick({});setErr('');setDone('');setBusy(false);setAsk(false)};
  React.useEffect(()=>{if(!open)reset()},[open]);

  const handle=async list=>{
    setErr('');setDone('');
    if(!list.some(x=>/push-notifications.*\.log$/i.test(x.file.name))){setErr('No notification logs found in that selection. Choose the Logs folder (or one of the dated folders inside it).');return}
    setBusy(true);
    try{
      const r=await readLogs(list,s.n.logFrom||0);const p={};
      r.done.forEach(k=>{p[tkey(k)]=!s.c[tkey(k)]});
      setRes(r);setPick(p);saveLogState(r);
    }catch(e){setErr('Could not read the logs: '+(e&&e.message||e))}
    setBusy(false);
  };
  const check=async()=>{
    setErr('');setDone('');setBusy(true);
    try{const h=saved||await chooseHandle();const list=await openHandle(h);setSaved(h);setBusy(false);await handle(list)}
    catch(e){setBusy(false);if(e&&e.name!=='AbortError')setErr(e.message||String(e))}
  };
  const chooseNew=async()=>{await forgetHandle();setSaved(null);try{const h=await chooseHandle();setSaved(h);setBusy(true);const list=await openHandle(h);setBusy(false);await handle(list)}catch(e){setBusy(false);if(e&&e.name!=='AbortError')setErr(e.message||String(e))}};
  const picked=Object.keys(pick).filter(k=>pick[k]);
  const extra=React.useMemo(()=>{const x=new Set();picked.forEach(k=>prereqsOf(k).forEach(p=>{if(!s.c[p]&&!pick[p])x.add(p)}));return x},[pick,s.c]);
  const apply=()=>{
    autoSnap('Before game log import');
    const c={};picked.forEach(k=>{c[k]=true});extra.forEach(k=>{c[k]=true});
    setS(o=>({...o,c:{...o.c,...c}}));
    setDone(`Applied: ${picked.length} task${picked.length===1?'':'s'} ticked`+(extra.size?`, plus ${extra.size} earlier task${extra.size===1?'':'s'} that lead to them.`:'.'));
    setLast({at:Date.now(),to:res.to||(last&&last.to)||0,n:picked.length});
    setRes(null);setPick({});
  };
  if(!open)return null;
  const byT={};(res?.done||[]).forEach(k=>{const n=nice(k);(byT[n.t]=byT[n.t]||[]).push(n.x)});
  return <Modal label="Import game logs" title="Import game logs" tone="pink" wide="max-w-4xl" onClose={onClose} dismiss>
    <ExpNote>This only reads log files the game has already written. It never changes, moves or deletes anything and does not touch the game itself. Your progress is backed up automatically before anything is applied. Use it at your own discretion.</ExpNote>
    {!res&&<div className="grid gap-1.5">
      <div className="text-sm text-zinc-200">The game writes trader task messages into its log files. This reads them and ticks the tasks you have finished. You review everything before it changes.</div>
      <div className="text-xs leading-5 text-zinc-400">Choose the <b className="text-zinc-200">Logs</b> folder inside your Escape from Tarkov folder. It is read in your browser and nothing is uploaded. The game deletes old logs, so import regularly to avoid gaps.</div>
    </div>}
    {!res&&<HowTo tone="pink" title="How to import your game logs" steps={[<>Find the <b className="text-zinc-100">Logs</b> folder inside your Escape from Tarkov folder.</>,<>Press {canWatch?<b className="text-zinc-100">Choose Logs folder and remember it</b>:<b className="text-zinc-100">Choose a folder</b>} and pick that folder. You can also drag it onto the box.</>,<>If your browser asks to view the folder, allow it. The dashboard only reads the files and never changes them.</>,<>Look through the tasks it found and untick any you do not want.</>,<>Press Apply. A backup of your progress is taken first.</>]}/>}
    {!res&&canWatch&&saved&&<div className="rounded-xl border border-pink-400/30 bg-pink-400/5 p-4 flex flex-wrap items-center gap-x-4 gap-y-3">
      <button onClick={check} disabled={busy} className="rounded-lg bg-pink-500 text-black text-sm font-semibold px-5 py-2 hover:bg-pink-400 disabled:opacity-50 max-sm:w-full">{saved?'Check for new completions':'Choose Logs folder and remember it'}</button>
      <div className="text-sm text-zinc-300 flex-1 min-w-[12rem] grid gap-0.5">{saved?<>
        <div>Folder remembered: <b className="text-zinc-100">{saved.name}</b>{last?<span className="text-zinc-400"> · Last import {new Date(last.at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}{last.n?`, ${last.n} ticked`:''}</span>:null}</div>
        <div className="text-xs text-zinc-400">One click re-reads it and shows what is new. Your browser asks permission each visit. <button onClick={chooseNew} className="md-link">Change folder</button> · <button onClick={async()=>{await forgetHandle();setSaved(null)}} className="md-link">Forget it</button></div></>
      :<>
        <div>Your browser can remember the folder, so next time it is one click.</div>
        <div className="text-xs text-zinc-400">Only the folder's location is kept, not its contents.{last?` Last import ${new Date(last.at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}.`:''}</div></>}</div></div>}
    {!res&&<div className={'md-drop rounded-xl border border-dashed border-zinc-600 text-center grid justify-items-center '+(saved?'p-3 gap-2 ':'p-5 gap-3 ')+(drag?'on':'')} onDragEnter={e=>{e.preventDefault();setDrag(true)}} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget))setDrag(false)}} onDrop={async e=>{e.preventDefault();setDrag(false);handle(await droppedLogs(e.dataTransfer))}}>
      <div className={saved?'text-xs text-zinc-400':'text-sm text-zinc-300'}>{drag?'Drop it here':saved?'Or choose a Logs folder by hand, or drag it onto this box:':'Drag your Logs folder onto this box, or browse to its location:'}</div>
      {canWatch&&!saved&&<div className="grid gap-1 justify-items-center"><button onClick={check} disabled={busy} className="rounded-lg bg-pink-500 text-black text-sm font-semibold px-5 py-2 hover:bg-pink-400 disabled:opacity-50 max-sm:w-full">Choose Logs folder and remember it</button>
        <div className="text-xs text-zinc-400">Your browser can remember the folder, so next time it is one click. Only the folder's location is kept, not its contents.{last?` Last import ${new Date(last.at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}.`:''}</div></div>}
      <div>{!(canWatch&&!saved)&&<button onClick={()=>dirRef.current&&dirRef.current.click()} disabled={busy} className={saved?'rounded-lg border border-pink-500/50 text-pink-300 text-sm px-3 py-1.5 hover:bg-pink-500/10 disabled:opacity-50':'rounded-lg bg-pink-500 text-black text-sm font-semibold px-4 py-1.5 hover:bg-pink-400 disabled:opacity-50'}>Choose a folder</button>}
        <input ref={dirRef} type="file" webkitdirectory="" directory="" multiple className="hidden" aria-label="Logs folder" onChange={e=>{handle(fromInput(e.target.files));e.target.value=''}}/>
        <button onClick={()=>fileRef.current&&fileRef.current.click()} disabled={busy} className={(canWatch&&!saved?'':saved?'ml-2 ':'ml-2 ')+'rounded-lg border border-pink-500/50 text-pink-300 text-sm px-3 py-1.5 hover:bg-pink-500/10 disabled:opacity-50'}>Choose files</button>
        <input ref={fileRef} type="file" accept=".log,text/plain" multiple className="hidden" aria-label="Log files" onChange={e=>{handle(fromInput(e.target.files));e.target.value=''}}/></div>
      {!canWatch&&<div className="text-sm text-zinc-300 grid gap-1.5 justify-items-center">
        <div>Remembering the folder and one-click checking need a recent Chrome, Edge, Brave, Opera or Vivaldi. In this browser, choose the folder each time you import.</div>
        <details className="text-left group w-full max-w-xl"><summary className="cursor-pointer list-none text-center md-link">How to turn it on in your browser</summary>
          <div className="mt-2 grid gap-2 rounded-lg border border-pink-400/20 p-3 text-sm text-zinc-300">
            {brave?<>
              <div><b className="text-zinc-100">You are using Brave.</b> Brave switches this feature off by default. To turn it on:</div>
              <ol className="list-decimal pl-5 grid gap-1"><li>Open a new tab and type <b className="text-zinc-100 select-all">brave://flags/#file-system-access-api</b> in the address bar.</li><li>Set <b className="text-zinc-100">File System Access API</b> to <b className="text-zinc-100">Enabled</b>.</li><li>Press <b className="text-zinc-100">Relaunch</b>, then open this window again.</li></ol></>
            :firefox?<div><b className="text-zinc-100">Firefox</b> does not support this, and there is no setting to change. For one-click checking, open the dashboard in Chrome, Edge, Brave, Opera or Vivaldi. Your progress carries over with <Bk>Backup, Transfer &amp; Restore</Bk>.</div>
            :safari?<div><b className="text-zinc-100">Safari</b> does not support this, and there is no setting to change. For one-click checking, open the dashboard in Chrome, Edge, Brave, Opera or Vivaldi. Your progress carries over with <Bk>Backup, Transfer &amp; Restore</Bk>.</div>
            :<div>Use an up-to-date <b className="text-zinc-100">Chrome</b>, <b className="text-zinc-100">Edge</b>, <b className="text-zinc-100">Brave</b>, <b className="text-zinc-100">Opera</b> or <b className="text-zinc-100">Vivaldi</b>. If you already do, your browser version may be too old, or the feature may be switched off in its settings.</div>}
          </div></details></div>}
      {busy&&<div role="status" className="text-xs text-zinc-400">Reading logs…</div>}
    </div>}
    {!res&&(ask
      ?<div className="rounded-xl border border-pink-400/40 bg-pink-400/5 p-4 grid gap-3"><div className="text-sm text-zinc-200">This forgets what your logs said so far: tasks in progress, failed tasks and your last import. Only log messages from now on are read. Your ticks stay as they are.</div>
        <div className="flex flex-wrap gap-2"><button onClick={clearNow} className="rounded-lg bg-pink-500 text-black text-sm font-semibold px-4 py-1.5 hover:bg-pink-400">Clear log history</button><button onClick={()=>setAsk(false)} className="rounded-lg border border-zinc-600 text-zinc-300 text-sm px-4 py-1.5 hover:bg-white/5">Cancel</button></div></div>
      :<div className="rounded-xl border border-zinc-800 p-4 flex flex-wrap items-center gap-x-4 gap-y-2"><div className="flex-1 min-w-[12rem] grid gap-0.5"><div className="text-sm text-zinc-200">Log history</div><div className="text-xs text-zinc-400">Starting fresh, for example after a wipe? Clear what your logs said so far.</div></div>
        <button onClick={()=>{setDone('');setAsk(true)}} disabled={busy} className="rounded-lg border border-pink-500/50 text-pink-300 text-sm px-3 py-1.5 hover:bg-pink-500/10 disabled:opacity-50 max-sm:w-full">Clear log history</button></div>)}
    {err&&<div role="alert" className="text-sm text-red-300">{err}</div>}
    {done&&<div role="status" className="rounded-lg border border-green-400/30 bg-green-400/5 p-3 text-sm text-green-200">{done}</div>}
    {res&&<div className="grid gap-4">
      <div className="text-sm text-zinc-300">Read {res.nPve+res.nUnk} PvE log{res.nPve+res.nUnk===1?'':'s'}{res.from?<> from {day(res.from)}{res.to&&day(res.to)!==day(res.from)?' to '+day(res.to):''}</>:''}.{res.nPvp>0&&<> Skipped {res.nPvp} PvP log{res.nPvp===1?'':'s'}.</>}{res.nUnk>0&&<span className="text-amber-400"> {res.nUnk} log{res.nUnk===1?'':'s'} could not be confirmed as PvE because the matching session file was missing. {res.nUnk===1?'It was':'They were'} read anyway, so check the tasks below.</span>}</div>
      {last&&last.to&&res.from&&res.from>last.to+3600&&<div className="text-sm text-amber-300">These logs start after your last import, so anything finished in between may be missing. The game deletes old logs, so import more often to avoid gaps.</div>}
      {res.done.length>0?<section className="grid gap-2"><div className="font-semibold">Completed tasks found ({res.done.length})</div>
        {Object.entries(byT).map(([t,list])=><div key={t} className="rounded-lg border border-zinc-800 p-2 grid gap-0.5"><div className="text-sm font-semibold text-zinc-100">{t}</div>
          {list.map(x=>{const k='tk:'+t+':'+x,had=!!s.c[k];return <label key={k} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-white/5">
            <input type="checkbox" disabled={had} checked={!!pick[k]} onChange={e=>setPick(p=>({...p,[k]:e.target.checked}))} className="accent-pink-500 size-4"/>
            <span className="flex-1">{x}</span>{res.doneAt[t+'|'+x]>0&&<span className="text-xs text-zinc-400 whitespace-nowrap">{fmtAt(res.doneAt[t+'|'+x])}</span>}<Chip tone={had?'mute':'ok'}>{had?'already ticked':(last&&last.to&&(res.doneAt[t+'|'+x]||0)>last.to?'new':'completed')}</Chip></label>})}</div>)}
        {extra.size>0&&<div className="text-xs text-zinc-400">Ticking these also ticks {extra.size} earlier task{extra.size===1?'':'s'} that lead to them, the same as ticking them by hand.</div>}
      </section>:<div className="text-sm text-zinc-300">No completed tasks were found in these logs.</div>}
      {(res.open.length>0||res.failed.length>0||res.unknown>0)&&<details className="text-xs text-zinc-400 group"><summary className="cursor-pointer list-none flex items-center gap-1.5"><span className="inline-block transition-transform group-open:rotate-90"><Chev/></span>Also in the logs, not ticked</summary>
        <div className="mt-1 grid gap-1">
          {res.open.length>0&&<div><b className="text-zinc-300">Accepted, not finished ({res.open.length}):</b> {res.open.map(k=>nice(k).x).join(' · ')}</div>}
          {res.failed.length>0&&<div><b className="text-zinc-300">Failed ({res.failed.length}):</b> {res.failed.map(k=>nice(k).x).join(' · ')}</div>}
          {res.unknown>0&&<div>{res.unknown} task message{res.unknown===1?'':'s'} for tasks this dashboard does not track.</div>}</div></details>}
    </div>}
    <ModalFoot left={res&&<button onClick={reset} className="md-link">Start over</button>}><CloseBtn tone="pink" quiet={!!res} onClick={onClose}/>{res&&<button onClick={apply} disabled={!picked.length} className="rounded-lg bg-pink-500 text-black text-sm font-semibold px-5 py-2 hover:bg-pink-400 disabled:opacity-40">Apply {picked.length} selected</button>}</ModalFoot>
  </Modal>;
}
