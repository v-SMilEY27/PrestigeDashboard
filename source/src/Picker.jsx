import {openRewards} from './rewardsBus.js';
import React from 'react';
import {playName} from './ui.jsx';
import {CYCLES} from './data.js';
import {buildReadiness} from './Readiness.jsx';
import {SetupHead,StepHead} from './Wizard.jsx';
import {useSetupNew} from './setupNew.js';
import {autoSnap} from './Backup.jsx';

export const LAST='tpp2_ui_lastp';
const read=k=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch{return null}};
const started=s=>!!s&&(Object.keys(s.n||{}).length>0||Object.keys(s.c||{}).length>0);

// The "Which prestige are you working toward?" page. Shows each prestige's requirements, and your progress on any you have started.
const workName=p=>'Working toward Prestige '+p;
const doneName=p=>'Prestige '+p+' Obtained';
export default function Picker({pick,onBack,current,onResetCurrent}){
  const sn=useSetupNew();const [ver,setVer]=React.useState(0),[ask,setAsk]=React.useState(null),[busy,setBusy]=React.useState(false);
  const info=React.useMemo(()=>{const m={};CYCLES.forEach(c=>{const s=read('tpp2_cycle_'+c.p);if(started(s)){const rd=buildReadiness(c,s);m[c.p]={s,pct:rd.pct,done:rd.done,total:rd.rows.length}}});return m},[ver]);
  const last=read(LAST),lastC=CYCLES.find(c=>c.p===last&&info[c.p]);
  // The prestige you are on: the one you used last, else the highest one you have started. Every lower prestige is shown as completed.
  const cur=lastC?lastC.p:Math.max(0,...Object.keys(info).map(Number));
  // Erase one prestige's saved progress (setup, ticks, hideout, stash counts, change log, setup position). A safety copy is saved first.
  const doReset=async n=>{setBusy(true);
    try{await autoSnap('Before resetting '+playName(n))}catch{}
    try{['tpp2_cycle_','tpp2_log_','tpp2_ui_wiz_'].forEach(k=>localStorage.removeItem(k+n));if(read(LAST)===n)localStorage.removeItem(LAST)}catch{}
    if(onResetCurrent&&n===current)onResetCurrent();
    setAsk(null);setBusy(false);setVer(v=>v+1)};
  return <div className="grid gap-4">
    <SetupHead line="Everything the planner suggests depends on these answers, so each step is required." names={['Profile','Level','Traders','Maps','Hideout','Tasks','Review']} pos={0} fresh={sn.fresh}/>
    <StepHead n={1} of={8} title="Which prestige are you working toward?" hint="Your checklist, plan and loot list are all built from the requirements of the prestige you choose." right={onBack&&<button onClick={onBack} className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/5 transition hover:border-zinc-500">Back to dashboard</button>}/>
    {lastC&&!onBack&&<button onClick={()=>pick(lastC.p)} className={'kc kc-prog kc-p'+lastC.p+' border transition overflow-hidden relative flex flex-col text-left h-[5.5rem] w-full'}>
      <span className="relative z-[1] flex flex-1 items-stretch">
        <span className="flex-1 min-w-0 pl-4 pr-3 py-3 flex items-center gap-3.5">
          <span className="kc-slot" aria-hidden="true"/>
          <span className="min-w-0 flex flex-col justify-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] kc-eyebrow leading-none whitespace-nowrap">Continue where you left off</span>
            <span className="kc-title text-sm sm:text-base font-bold uppercase tracking-wide sm:tracking-wider">{workName(lastC.p)}</span></span>
          <span className="ml-auto patch-font text-2xl sm:text-4xl leading-none tabular-nums kc-pct shrink-0" aria-label={info[lastC.p].pct+' percent complete'}>{info[lastC.p].pct}%</span></span>
        <span className="kc-band" aria-hidden="true"><span>Resume</span></span></span>
      <span aria-hidden="true" className="kc-rail absolute inset-x-0 bottom-0 h-1.5">{info[lastC.p].pct>0&&<span className="kc-fill" style={{width:Math.min(100,info[lastC.p].pct)+'%'}}/>}</span>
    </button>}
    <div className="grid sm:grid-cols-2 gap-3">{CYCLES.map(c=>{const i=info[c.p],gold=c.p<cur,fin=c.p===CYCLES.length,st=gold?'done':i?'prog':'idle';
      return <div key={c.p} className={'kc kc-'+st+' kc-p'+c.p+' border transition overflow-hidden relative flex flex-col h-[7.5rem] sm:h-[5.5rem]'}>
        <div className="relative z-[1] flex flex-1 items-stretch">
          <button onClick={()=>pick(c.p)} className="flex-1 min-w-0 text-left pl-4 pr-3 py-3 flex items-center gap-3.5">
            <span className="kc-slot" aria-hidden="true"/>
            <span className="min-w-0 flex flex-col justify-center gap-1.5">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="min-w-0 flex flex-col">{st==='prog'&&<span className="text-[10px] font-semibold uppercase tracking-[0.22em] kc-eyebrow leading-none mb-1 whitespace-nowrap">Working toward</span>}<span className="kc-title text-sm sm:text-base font-bold uppercase tracking-wide sm:tracking-wider sm:whitespace-nowrap">{gold?doneName(c.p):'Prestige '+c.p}</span></span></span></span>
            <span className="ml-auto flex items-center gap-2.5 shrink-0">
              {st==='prog'?<><span className="patch-font text-2xl sm:text-4xl leading-none tabular-nums kc-pct" aria-label={i.pct+' percent complete'}>{i.pct}%</span></>
                :<><span className="kc-led" aria-hidden="true"/><span className="kc-stat hidden sm:inline text-[11px] font-bold uppercase tracking-[0.18em]">{st==='done'?'Access granted':'Not started'}</span></>}</span></button>
          <button type="button" onClick={()=>openRewards(c.p,cur)} title={'See what Prestige '+c.p+' gives you'} className="kc-rw kc-rw-i self-center shrink-0 mr-1.5"><svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="2.2" y="6.2" width="11.6" height="7.6" rx="1"/><path d="M1.6 4.4h12.8v1.8H1.6zM8 4.4v9.4M8 4.4C6.2 4.4 4.8 3.7 5.2 2.8S7.5 2.7 8 4.4zM8 4.4c1.8 0 3.2-.7 2.8-1.6S8.5 2.7 8 4.4z"/></svg><span className="sr-only">Rewards</span></button>
          {i&&<button onClick={()=>setAsk(ask===c.p?null:c.p)} aria-expanded={ask===c.p} title={'Reset Prestige '+c.p} className="mr-3 self-center shrink-0 rounded-md px-1.5 py-1 text-[11px] uppercase tracking-widest text-zinc-500 transition hover:text-red-300 hover:bg-white/5">Reset</button>}
          <span className="kc-band" aria-hidden="true"><span>{fin?'Final':st==='done'?'Done':st==='prog'?'Active':'Pending'}</span></span></div>
        {st==='prog'&&<div aria-hidden="true" className="kc-rail absolute inset-x-0 bottom-0 h-1.5">{i.pct>0&&<span className="kc-fill" style={{width:Math.min(100,i.pct)+'%'}}/>}</div>}
      </div>})}</div>
    {ask&&<div role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 grid gap-2 text-sm">
          <div className="text-red-300"><b>Reset Prestige {ask}?</b> This erases its setup, ticked tasks, hideout levels, stash counts and change log. Your other prestiges are not touched. A safety copy is saved first, and you can bring it back from Backup, Transfer &amp; Restore.</div>
          <div className="flex gap-2"><button disabled={busy} onClick={()=>doReset(ask)} className="rounded-lg bg-red-500 text-white font-semibold px-3 py-1.5 text-sm hover:bg-red-400 disabled:opacity-50">Yes, reset it</button>
            <button onClick={()=>setAsk(null)} className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/5">Cancel</button></div></div>}
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 grid gap-2">
      <div className="text-base font-bold text-amber-500">Pick the prestige you are working toward</div>
      <div className="text-sm text-zinc-100">Choose <b className="text-white">Prestige 1</b> only if you are <b className="text-white">still playing your very first playthrough</b> and have <b className="text-white">not yet reached the end of it and pressed Prestige</b>.</div>
      <div className="text-sm text-zinc-100">Once you have prestiged, you are working toward a later one. Take the number of times you have prestiged and add one. If you have prestiged once, choose <b className="text-white">Prestige 2</b>. Prestiges you have already passed show as Obtained.</div></div>
  </div>;
}
