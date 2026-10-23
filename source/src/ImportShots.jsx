import React from 'react';
import {Chip,Chev,Thin,Modal,ModalFoot,CloseBtn,HowTo} from './ui.jsx';
import AccentCard from './AccentCard.jsx';
import {autoSnap} from './Backup.jsx';
import {readImage} from './ocr.js';
import {parseTaskList,parsePanel,isPanel,isTraders,parseLoyalty,slug} from './shots.js';

const fmtM=v=>Math.round(v/1e4)/100;
const curOf=(s,k)=>k.startsWith('ll:')?(s.n[k]||1):(s.n[k]||0);
const MAXF=30;
// Dropped folders arrive as directory entries, so walk them to find the images inside.
const readEntry=e=>new Promise(res=>{if(e.isFile)e.file(f=>res([f]),()=>res([]));else{const r=e.createReader(),all=[];const next=()=>r.readEntries(async es=>{if(!es.length){res((await Promise.all(all.map(readEntry))).flat());return}all.push(...es);next()},()=>res([]));next()}});
const dropped=async dt=>{const items=[...(dt.items||[])].map(i=>i.webkitGetAsEntry&&i.webkitGetAsEntry()).filter(Boolean);
  if(!items.length)return [...dt.files];return (await Promise.all(items.map(readEntry))).flat()};
const okNum=(v,max)=>Number.isFinite(v)&&v>=0&&v<=max;

export default function ImportShots({cy,s,setS,big}){
  const [open,setOpen]=React.useState(false);
  const [drag,setDrag]=React.useState(false);
  const [busy,setBusy]=React.useState('');
  const [prog,setProg]=React.useState(null);   // {i,n} while reading a batch
  const [err,setErr]=React.useState('');
  const [res,setRes]=React.useState(null);   // {rows, unmatched, panel}
  const [pick,setPick]=React.useState({});
  const [vals,setVals]=React.useState({});
  const [done,setDone]=React.useState('');
  const fileRef=React.useRef(null),dirRef=React.useRef(null);

  const reset=()=>{setProg(null);setRes(null);setPick({});setVals({});setErr('');setDone('');setBusy('')};
  React.useEffect(()=>{if(!open)reset()},[open]);

  const handle=React.useCallback(async files=>{
    files=[...files].filter(f=>f.type.startsWith('image/')).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
    if(!files.length){setErr('Choose image files (PNG or JPG screenshots).');return}
    let note='';if(files.length>MAXF){note=`Only the first ${MAXF} of ${files.length} images were read. Import the rest in a second batch.`;files=files.slice(0,MAXF)}
    setErr(note);setDone('');setBusy('Starting');setProg({i:0,n:files.length});
    try{
      const rows=[],un=[],seen=new Set();let panel=null;const loy=[];
      let idx=0;
      for(const f of files){
        setProg({i:++idx,n:files.length});
        const img=await readImage(f,setBusy);
        if(isPanel(img)&&!panel){panel=parsePanel(img,cy)}
        else if(isTraders(img)){parseLoyalty(img).rows.forEach(x=>{if(!loy.some(y=>y.t===x.t))loy.push(x)})}
        else{const r=parseTaskList(img);r.rows.forEach(x=>{const k=x.t+'|'+x.x;if(!seen.has(k)){seen.add(k);rows.push(x)}});un.push(...r.unmatched)}
      }
      const p={},v={};
      rows.forEach(r=>{const k='tk:'+r.t+':'+r.x;p[k]=r.state==='done'&&!s.c[k]});
      loy.forEach(x=>{const k='ll:'+x.t;v[k]=x.ll?String(x.ll):'';p[k]=!!x.ll&&!x.unsure&&curOf(s,k)!==x.ll});
      if(panel){
        const add=(key,cur,unsure,max,conv=x=>x)=>{const good=okNum(cur,max)&&!unsure&&conv(cur)!==curOf(s,key);v[key]=Number.isFinite(cur)?String(conv(cur)):'';p[key]=good};
        if(panel.level)add('lvl',panel.level.cur,panel.level.unsure,79);
        panel.skills.forEach(x=>add('k:'+x.name,x.cur,x.unsure,51));
        panel.hideout.forEach(x=>add('hl:'+slug(x.name),x.cur,x.unsure,9));
        if(panel.rub)add('rub',panel.rub.cur,panel.rub.unsure,9e9,fmtM);
        panel.tasks.forEach(x=>{p[x.k]=x.met&&!s.c[x.k]});
      }
      const nCheck=loy.filter(x=>x.unsure).length+(panel?[panel.level,...panel.skills,...panel.hideout,panel.rub].filter(x=>x&&x.unsure).length:0);
      setRes({rows,loy,nCheck,unmatched:[...new Set(un)].slice(0,12),panel,nFiles:files.length});setPick(p);setVals(v);setBusy('');setProg(null);
    }catch(e){setErr('Could not read the screenshots: '+(e&&e.message||e));setBusy('');setProg(null)}
  },[cy,s.c]);

  // allow pasting a screenshot straight from the clipboard while the window is open
  React.useEffect(()=>{if(!open)return;const h=e=>{const fs=[...(e.clipboardData?.files||[])];if(fs.length){e.preventDefault();handle(fs)}};document.addEventListener('paste',h);return()=>document.removeEventListener('paste',h)},[open,handle]);

  const apply=()=>{
    autoSnap('Before screenshot import');
    const n={},c={};let nTicks=0,nVals=0;
    Object.entries(pick).forEach(([k,on])=>{if(!on)return;
      if(k.startsWith('tk:')||k.startsWith('t:')||k.startsWith('s:')){c[k]=true;nTicks++}
      else{const num=+vals[k];if(vals[k]!==''&&Number.isFinite(num)){n[k]=num;nVals++}}});
    setS(o=>({...o,n:{...o.n,...n},c:{...o.c,...c}}));
    setDone(`Applied: ${nTicks} tick${nTicks===1?'':'s'} and ${nVals} value${nVals===1?'':'s'}.`);setRes(null);setPick({});setVals({});
  };
  const nPicked=Object.values(pick).filter(Boolean).length;
  const byT={};(res?.rows||[]).forEach(r=>(byT[r.t]=byT[r.t]||[]).push(r));
  const NumRow=({k,label,note,max,step=1})=><label className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5">
    <input type="checkbox" checked={!!pick[k]} onChange={e=>setPick(p=>({...p,[k]:e.target.checked}))} className="accent-sky-500 size-4"/>
    <span className="flex-1 text-sm">{label}<span className="ml-2 text-xs text-zinc-500">{Number(vals[k])===curOf(s,k)?'no change':<>was {curOf(s,k)} → <b className="text-sky-300">now {vals[k]||'?'}</b></>}</span>{note&&<span className="ml-2"><Chip tone="warn" title="This number was hard to read. Check it against your screen before applying.">check</Chip></span>}</span>
    <input type="number" min="0" max={max} step={step} value={vals[k]??''} onChange={e=>setVals(v=>({...v,[k]:e.target.value}))} aria-label={label+' value'} className="bg-zinc-800 w-24 px-2 py-0.5 rounded text-sm text-right"/></label>;
  const P=res?.panel,L=res?.loy||[];

  return <>
    <button onClick={()=>setOpen(true)} className={big?"rounded-lg bg-sky-500 text-black text-sm font-semibold px-3 py-1.5 hover:bg-sky-400":"rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-sky-400"}>Import Screenshot</button>
    {open&&<Modal label="Import Screenshot" title="Import Screenshot" tone="sky" wide="max-w-4xl" onClose={()=>setOpen(false)} dismiss>
        <div className="grid gap-3 text-sm text-zinc-300">
          <div className="grid gap-1.5"><div className="text-zinc-200">Add screenshots from the game, mixed together if you like. You review each change before it is applied.</div>
            <div className="text-xs leading-5 text-zinc-400">Everything is read in your browser and nothing is uploaded.</div></div>
          <HowTo tone="sky" defaultOpen title="How to import from screenshots" steps={[<>In the game, open the <b className="text-zinc-100">Prestige tab</b> (the unlock conditions screen). It shows your level, skills, hideout levels, roubles and the tasks you have done.</>,<>You can also open a <b className="text-zinc-100">trader's task list</b> (blue rows count as finished) or the <b className="text-zinc-100">Traders screen</b> (each trader's loyalty level). Use any of these screens, in any mix.</>,<>Take a screenshot of each screen you opened.</>,<>Drag the screenshots or a folder onto the box below, paste one, or press Choose images or Choose a folder.</>,<>Look through the changes it found and untick any you do not want.</>,<>Press Apply.</>]}/>
        </div>
        <div className={'md-drop rounded-xl border border-dashed border-zinc-600 p-5 text-center grid gap-3 justify-items-center '+(drag?'on':'')} onDragEnter={e=>{e.preventDefault();setDrag(true)}} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget))setDrag(false)}} onDrop={async e=>{e.preventDefault();setDrag(false);handle(await dropped(e.dataTransfer))}}>
          <svg viewBox="0 0 24 24" className={'size-8 '+(drag?'text-sky-300':'text-sky-500')} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V5M7.5 9.5L12 5l4.5 4.5"/><path d="M4 15v3.2A1.8 1.8 0 005.8 20h12.4a1.8 1.8 0 001.8-1.8V15"/></svg>
          <div className="text-sm text-zinc-300">{drag?'Drop to add them':'Drag screenshots or a folder onto this box, paste one, or browse to their location:'}</div>
          <div><button onClick={()=>fileRef.current&&fileRef.current.click()} disabled={!!busy} className="rounded-lg bg-sky-500 text-black text-sm font-semibold px-5 py-2 hover:bg-sky-400 disabled:opacity-50">Choose images</button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" aria-label="Screenshot files" onChange={e=>{handle(e.target.files);e.target.value=''}}/>
            <button onClick={()=>dirRef.current&&dirRef.current.click()} disabled={!!busy} className="ml-2 rounded-lg border border-sky-500/50 text-sky-300 text-sm px-4 py-2 hover:bg-sky-500/10 disabled:opacity-50">Choose a folder</button>
            <input ref={dirRef} type="file" webkitdirectory="" directory="" multiple className="hidden" aria-label="Screenshot folder" onChange={e=>{handle(e.target.files);e.target.value=''}}/></div>
          {busy&&<div role="status" className="grid gap-1 text-xs text-zinc-400 w-full">
            <div>{prog&&prog.n>1?`Image ${Math.max(1,prog.i)} of ${prog.n} · `:''}{busy}…</div>
            {prog&&prog.n>1&&<Thin p={Math.round(Math.max(0,prog.i-1)/prog.n*100)} tone="bg-sky-500" sm/>}</div>}
        </div>
        {err&&<div role="alert" className="text-sm text-red-300">{err}</div>}
        {done&&<div role="status" className="rounded-lg border border-green-400/30 bg-green-400/5 p-3 text-sm text-green-200">{done}</div>}
        {res&&<div className="grid gap-4">
          <div className="text-sm text-zinc-300">{nPicked} change{nPicked===1?'':'s'} ready to apply{res.nCheck>0&&<span className="text-amber-400"> · {res.nCheck} to check against your screen</span>}. Values show what they are now and what the screenshot says. Anything that matches what you already have is left unticked.</div>
          {P&&<AccentCard tone="sky" title="Prestige panel" c="grid gap-1">
            {P.warnings.map(w=><div key={w} className="text-xs text-amber-400">{w}</div>)}
            {P.level&&NumRow({k:'lvl',label:'PMC level',note:P.level.unsure,max:79})}
            {P.skills.map(x=>NumRow({k:'k:'+x.name,label:x.name+' skill',note:x.unsure,max:51}))}
            {P.hideout.map(x=>NumRow({k:'hl:'+slug(x.name),label:x.name+' level built',note:x.unsure,max:9}))}
            {P.rub&&NumRow({k:'rub',label:'Roubles (millions)',note:P.rub.unsure,max:9999,step:0.01})}
            {P.tasks.length>0&&<div className="mt-1 text-xs text-zinc-400">Tasks (shown in blue in the panel when met)</div>}
            {P.tasks.map(x=><label key={x.k} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5 text-sm"><input type="checkbox" checked={!!pick[x.k]} onChange={e=>setPick(p=>({...p,[x.k]:e.target.checked}))} className="accent-sky-500 size-4"/><span className="flex-1">{x.name}</span><Chip tone={x.met?'ok':'mute'}>{s.c[x.k]?'already ticked':x.met?'met':'not met'}</Chip></label>)}
            {!P.level&&!P.skills.length&&!P.hideout.length&&<div className="text-sm text-zinc-400">A panel was detected but no values could be read. Try a larger, uncropped screenshot.</div>}
          </AccentCard>}
          {L.length>0&&<AccentCard tone="sky" title="Trader loyalty levels" c="grid gap-1">
            {L.map(x=>NumRow({k:'ll:'+x.t,label:x.t,note:x.unsure,max:4}))}
          </AccentCard>}
          {Object.keys(byT).length>0&&<AccentCard tone="sky" title="Task lists" c="grid gap-2">
            {Object.entries(byT).map(([t,list])=><div key={t} className="rounded-lg border border-zinc-800 p-2 grid gap-0.5"><div className="text-sm font-semibold text-zinc-100">{t}</div>
              {list.map(r=>{const k='tk:'+r.t+':'+r.x,had=!!s.c[k];return <label key={k} className={'flex items-center gap-2 rounded px-2 py-1 text-sm '+(r.state==='done'?'hover:bg-white/5':'opacity-60')}>
                <input type="checkbox" disabled={r.state!=='done'||had} checked={!!pick[k]} onChange={e=>setPick(p=>({...p,[k]:e.target.checked}))} className="accent-sky-500 size-4"/>
                <span className="flex-1">{r.x}</span><Chip tone={r.state==='done'?'ok':r.state==='active'?'warn':'mute'}>{had?'already ticked':r.state==='done'?'finished':r.state==='active'?'in progress, not ticked':'status unclear'}</Chip></label>})}</div>)}
          </AccentCard>}
          {!P&&L.length===0&&Object.keys(byT).length===0&&<div className="text-sm text-zinc-300">Nothing could be matched in {res.nFiles>1?'those screenshots':'that screenshot'}. Use a clearer or larger screenshot of a task list or the Prestige panel.</div>}
          {res.unmatched.length>0&&<details className="text-xs text-zinc-400 group"><summary className="cursor-pointer list-none flex items-center gap-1.5"><span className="inline-block transition-transform group-open:rotate-90"><Chev/></span>{res.unmatched.length} line{res.unmatched.length>1?'s':''} not recognised as tasks</summary><div className="mt-1">{res.unmatched.join(' · ')}</div></details>}
        </div>}
      <ModalFoot left={res&&<button onClick={reset} className="md-link">Start over</button>}><CloseBtn tone="sky" quiet={!!res} onClick={()=>setOpen(false)}/>{res&&<button onClick={apply} disabled={!nPicked} className="rounded-lg bg-sky-500 text-black text-sm font-semibold px-5 py-2 hover:bg-sky-400 disabled:opacity-40">Apply {nPicked} selected</button>}</ModalFoot>
    </Modal>}
  </>;
}
