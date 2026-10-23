import React from 'react';
import {useLS} from './useLS.js';
import {PageLine,Chev,Pin,CheckGlyph,Thin,Led,Pop,ledOf,Empty,Tiles,ExpandAll,Chip as SharedChip} from './ui.jsx';
import {taskStatus} from './access.js';
import {useLogStatus,fmtAt} from './LogStatus.jsx';
import CollectorSection from './CollectorSection.jsx';
import {PREREQ,TASK_REWARD,TASK_MAP,TASK_LL,TASK_REQ,TRADER_TASKS,TRADERS} from './data.js';

const pc=(x,y)=>y?Math.round(x/y*100):0;
const wiki=n=>'https://escapefromtarkov.fandom.com/wiki/'+encodeURIComponent(n.replace(/ /g,'_'));
const fmt=n=>n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e4?Math.round(n/1e3)+'k':n.toLocaleString();

export const chainsFor=(t,l)=>{const set=new Set(l),par={},kids={};l.forEach(x=>{par[x]=[];kids[x]=[]});
l.forEach(x=>(PREREQ[t+'|'+x]||[]).forEach(p=>{const i=p.indexOf('|'),pt=p.slice(0,i),pn=p.slice(i+1);if(pt===t&&set.has(pn)){par[x].push(pn);kids[pn].push(x)}}));
const seen=new Set(),comps=[],memo={};
const dep=(x,st=[])=>{if(memo[x]!==undefined)return memo[x];if(st.includes(x))return 0;return memo[x]=par[x].length?1+Math.max(...par[x].map(p=>dep(p,[...st,x]))):0};
l.forEach(x=>{if(seen.has(x)||(!par[x].length&&!kids[x].length))return;const stack=[x],comp=[];seen.add(x);while(stack.length){const y=stack.pop();comp.push(y);[...par[y],...kids[y]].forEach(z=>{if(!seen.has(z)){seen.add(z);stack.push(z)}})}comps.push(comp)});
const chains=comps.map(comp=>{const items=comp.slice().sort((a,b)=>dep(a)-dep(b)||l.indexOf(a)-l.indexOf(b)).map(x=>({x,par:par[x]})),roots=items.filter(i=>!i.par.length);return {title:roots[0].x.replace(/\s*-\s*Part \d+$/,''),roots:roots.length,items,pos:Math.min(...comp.map(x=>l.indexOf(x)))}}).sort((a,b)=>a.pos-b.pos);
return {chains,singles:l.filter(x=>!par[x].length&&!kids[x].length)}};

// Reward and map details in task rows are shown quietly (no pill); everything else uses the shared chip.
const Chip=({tone,title,children})=><SharedChip tone={['xp','rep','map'].includes(tone)?'quiet':tone} title={title}>{children}</SharedChip>;

const Row=({t,x,s,tg,next,note,warn,grp,fin}) => {
  const on=!!s.c['tk:'+t+':'+x],at=on&&fin?fin[t+'|'+x]:0,r=TASK_REQ[t+'|'+x],rw=TASK_REWARD[t+'|'+x],mp=TASK_MAP[t+'|'+x];
  const lv=r?r[0]:0,lls=r&&r[1]?r[1].split(','):[];
  const eff=TASK_LL[t+'|'+x]||1,own=lls.some(e=>e.startsWith(t));
  const ext=(PREREQ[t+'|'+x]||[]).map(p=>{const i=p.indexOf('|');return [p.slice(0,i),p.slice(i+1)]}).filter(([pt])=>pt!==t);
  const chips=[];
  if(lv>0)chips.push(<Chip key="lv" tone={s.n.lvl&&s.n.lvl<lv?'bad':'mute'} title="Minimum PMC level">Lv {lv}</Chip>);
  lls.forEach(e=>{const m=e.match(/^(\D+)(\d)$/),tr=m[1],v=+m[2];if(grp&&tr===t&&v===grp)return;chips.push(<Chip key={e} tone={(s.n['ll:'+tr]||1)<v?'bad':'ok'} title={'Needs '+tr+' loyalty level '+v}>{tr===t?'':tr+' '}LL{v}</Chip>)});
  if(t!=='Fence'&&!own&&eff>1)chips.push(<Chip key="eff" tone={(s.n['ll:'+t]||1)<eff?'bad':'mute'} title="Inherited from an earlier task in the chain">LL{eff}</Chip>);
  if(rw){const [xp,rep,oth]=rw;
    if(xp>0)chips.push(<Chip key="xp" tone="xp" title="Experience reward">+{xp.toLocaleString()} XP</Chip>);
    if(rep!==0)chips.push(<Chip key="rep" tone="rep" title="Trader standing reward">+{rep.toFixed(2)} rep</Chip>);
    if(oth)chips.push(<Chip key="oth" tone="bad" title="Standing change with another trader">{oth.replace(':',' ')}</Chip>)}
  if(mp)chips.push(<Chip key="map" tone="map" title="Map(s) for this task"><Pin/>{mp}</Chip>);
  return <div className={'rounded-lg px-2 py-1.5 border transition '+(next&&!on?'border-green-400/40 bg-green-400/5':'border-transparent hover:bg-white/5')}>
    <label className="flex items-start gap-3 cursor-pointer">
      <input type="checkbox" checked={on} onChange={()=>tg('tk:'+t+':'+x)} className="accent-amber-500 mt-1 size-4 shrink-0"/>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
          <a href={wiki(x)} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} title="Open on the Tarkov wiki" className={'font-medium hover:underline hover:text-amber-400 '+(on?'line-through opacity-50':'')}>{x}</a>
          {next&&!on&&<span className="text-xs font-bold tracking-wide rounded bg-green-500 text-green-950 px-1.5 py-0.5">NEXT</span>}
          {chips.length>0&&<div className={'flex flex-wrap items-center gap-1 min-w-0 max-w-full sm:ml-auto sm:justify-end max-sm:basis-full '+(on?'opacity-50':'')}>{chips}</div>}
        </div>
        {at>0&&<div className="text-xs text-pink-300 mt-1">Finished {fmtAt(at)} <span className="text-pink-300/60">· from your game logs</span></div>}
        {note&&<div className="text-xs text-zinc-400 mt-1">after: {note}</div>}
        {warn&&<div className="text-xs text-amber-400/80 mt-1">{warn}</div>}
        {ext.length>0&&<div className="text-xs text-amber-400/80 mt-1">Also needs: {ext.map(([pt,pn])=>pn+(pt==='Other'?' (other trader)':' ('+pt+')')).join(', ')}</div>}
      </div>
    </label>
  </div>;
};

const Stat=({label,value,sub})=><div className="rounded-lg border border-zinc-800 bg-black/20 px-3 py-2"><div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</div><div className="text-lg font-bold leading-6">{value}</div>{sub&&<div className="text-xs text-zinc-500">{sub}</div>}</div>;

export default function TradersTab({open,setOpen,s,set,tg,sel,setSel,hide,setHide,view:view0,setView,mapf,setMapf,needCol,go}){
  const ls=useLogStatus(s);
  const view=(view0==='collector'&&!needCol)?'trader':view0;
  const all=Object.entries(TRADER_TASKS);
  const done=(t,x)=>!!s.c['tk:'+t+':'+x];
  const totAll=all.reduce((n,[,l])=>n+l.length,0),doneAll=all.reduce((n,[t,l])=>n+l.filter(x=>done(t,x)).length,0);
  const names=all.map(([t])=>t),cur=names.includes(sel)?sel:names[0];
  const l=TRADER_TASKS[cur],d=l.filter(x=>done(cur,x)).length;
  const {chains,singles}=chainsFor(cur,l);
  const left=l.filter(x=>!done(cur,x));
  const xpLeft=left.reduce((n,x)=>n+((TASK_REWARD[cur+'|'+x]||[0])[0]||0),0);
  const repLeft=left.reduce((n,x)=>n+((TASK_REWARD[cur+'|'+x]||[0,0])[1]||0),0);
  const ll=s.n['ll:'+cur]||1;
  const groups=(cur==='Fence'?[[0,singles]]:[1,2,3,4].map(g=>[g,singles.filter(x=>(TASK_LL[cur+'|'+x]||1)===g)])).filter(([,g])=>g.length);
  const lvl=s.n.lvl||0;
  const llOf=t=>s.n['ll:'+t]||1;
  const [incl,setIncl]=useLS('tpp2_ui_incl_traders',false);
  const [exp,setExp]=useLS('tpp2_ui_avail_exp',{});
  const stOf=(t,x)=>taskStatus(s,t,x);
  const mapsOf=(t,x)=>{const m=TASK_MAP[t+'|'+x];return !m?[]:m==='Any map'?['Any map']:m.split(', ')};
  const avail=[],locked=[];let unk=0;
  all.forEach(([t,list])=>list.forEach(x=>{if(done(t,x))return;const st=stOf(t,x).st;if(st==='ok'||(st==='unknown'&&incl))avail.push([t,x]);else if(st==='unknown')unk++;else locked.push([t,x])}));
  const MAPS=['Ground Zero','Factory','Customs','Woods','Shoreline','Interchange','Reserve','Lighthouse','Streets','The Lab','Labyrinth'];
  const fits=(t,x,m)=>{if(m==='All')return true;const ms=mapsOf(t,x);if(m==='None')return ms.length===0;return ms.includes(m)||ms.includes('Any map')};
  const mapCount=m=>avail.filter(([t,x])=>fits(t,x,m)).length;
  const shownAvail=avail.filter(([t,x])=>fits(t,x,mapf||'All'));
  const [q,setQ]=React.useState('');
  const qs=q.trim().toLowerCase();
  const chipBtn=(k,label,n)=><button key={k} onClick={()=>setMapf(k)} className={'rounded-full border px-3 py-1 text-xs transition '+((mapf||'All')===k?'border-green-400 bg-green-400/15 text-green-200':'border-zinc-700 text-zinc-300 hover:border-zinc-500')}>{label} <span className="opacity-80">{n}</span></button>;
  const filterCard=(
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="text-sm text-zinc-400">Level <b className="text-zinc-100">{lvl||'not set'}</b>, with the loyalty levels below. <button onClick={()=>go('Overview')} className="lnk">Edit level</button></div>
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer" title="Tasks that may need a failed task, a hidden game-state requirement or a task from an untracked trader"><input type="checkbox" checked={incl} onChange={e=>setIncl(e.target.checked)} className="accent-amber-500"/>Include tasks that cannot be checked{unk>0&&!incl?` (${unk} hidden)`:''}</label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Your loyalty levels"><span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Loyalty</span>
          {TRADERS.map(t=><label key={t} className="text-xs text-zinc-400">{t} <select value={s.n['ll:'+t]||1} onChange={e=>set('ll:'+t,+e.target.value)} aria-label={t+' loyalty level'} className="bg-zinc-800 rounded px-1 py-0.5 text-zinc-100">{[1,2,3,4].map(n=><option key={n} value={n}>LL{n}</option>)}</select></label>)}
          <label className="text-xs text-zinc-400">Scav karma <input type="number" step="0.1" value={s.n.karma??''} onChange={e=>set('karma',e.target.value===''?undefined:+e.target.value)} aria-label="Scav karma" className="bg-zinc-800 w-16 px-2 py-0.5 rounded ml-1 text-zinc-100" placeholder="0"/></label></div>
        {!lvl&&<div className="mt-2 text-xs text-amber-400/80">Your level is not set, so it counts as level 1 and most tasks show as locked. Enter it in the Overview checklist or in Run Setup.</div>}
        <div className="mt-3 flex flex-wrap gap-2">{chipBtn('All','All maps',avail.length)}{MAPS.filter(m=>mapCount(m)>0).map(m=>chipBtn(m,<><Pin/>{m}</>,mapCount(m)))}{chipBtn('None','No map',mapCount('None'))}</div>
        <details className="mt-2 text-xs text-zinc-500 group"><summary className="cursor-pointer list-none flex items-center gap-1.5 hover:text-zinc-300"><span className="inline-block transition-transform group-open:rotate-90"><Chev/></span>How this list works</summary><div className="mt-1 grid gap-1">
          <div>{locked.length} more tasks are locked behind a level, loyalty level, reputation or an earlier task.</div>
          <div>Tasks that work on any map show under every map. Availability uses the same strict checks as the Planning tab: level, loyalty, Fence karma and earlier tasks.</div></div></details>
      </div>  );
  const searchBox=(
      <div className="relative">
        <input type="text" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')setQ('')}} placeholder="Search tasks by name, trader or map" aria-label="Search tasks" className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 pr-9 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"/>
        {q&&<button onClick={()=>setQ('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-400 px-1">✕</button>}
      </div>
  );
  const header=(
    <div className="grid gap-3">
      <PageLine>Every trader task in one place. Work through them by trader, {needCol?'see what you can start right now, or follow the Collector gate.':'or see what you can start right now.'}</PageLine>
      <Tiles items={[['Done',doneAll+'/'+totAll,'ticked so far'],['Available now',avail.length,'you can start'],['Locked',locked.length,'level, loyalty or an earlier task'],['Cannot be checked',unk,incl?'now in Available now':'hidden requirement in the data']]}/>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-zinc-700 overflow-hidden text-sm">{[['trader','By trader'],['avail','Available now'],...(needCol?[['collector','Collector']]:[])].map(([k,lb])=><button key={k} onClick={()=>setView(k)} className={'px-3 py-1 text-sm font-medium transition '+(view===k?'bg-amber-500 text-black':'hover:bg-white/5')}>{lb}</button>)}</div>
        {view!=='collector'&&<div className="flex-1 min-w-[12rem] max-sm:basis-full max-sm:order-last">{searchBox}</div>}
        {view==='trader'&&<label className="flex items-center gap-1.5 cursor-pointer text-xs text-zinc-400 whitespace-nowrap"><input type="checkbox" checked={!!hide} onChange={e=>setHide(e.target.checked)} className="accent-amber-500"/>Hide done</label>}
      </div>
      <div className="text-xs text-zinc-500">Green chips are requirements you meet and red ones you do not yet. +XP and +rep are rewards, and the pin is the map.</div>
    </div>
  );
  if(qs){
    const hits=[];
    all.forEach(([t,list])=>list.forEach(x=>{const mp=(TASK_MAP[t+'|'+x]||'').toLowerCase();if(x.toLowerCase().includes(qs)||t.toLowerCase().includes(qs)||mp.includes(qs))hits.push([t,x])}));
    const byT={};hits.forEach(([t,x])=>(byT[t]=byT[t]||[]).push(x));
    return <div className="grid gap-3">{header}{view==='avail'&&filterCard}
      <div className="text-sm text-zinc-400">{hits.length} {hits.length===1?'task':'tasks'} match <b className="text-zinc-100">“{q.trim()}”</b>, across all traders. <button onClick={()=>setQ('')} className="lnk">Clear search</button></div>
      {hits.length===0&&<Empty icon="search" title="No tasks match" hint="Check the spelling or try part of the name."/>}
      {names.filter(t=>byT[t]).map(t=><div key={t} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
        <div className="flex items-center justify-between mb-1"><button onClick={()=>{setSel(t);setView('trader');setQ('')}} title="Open this trader" className="font-semibold hover:text-amber-400">{t}</button><span className="text-xs text-zinc-400">{byT[t].filter(x=>done(t,x)).length}/{byT[t].length} done</span></div>
        <div className="grid lg:grid-cols-2 gap-x-6 gap-y-0.5">{byT[t].map(x=><Row key={x} t={t} x={x} s={s} tg={tg} fin={ls.done}/>)}</div>
      </div>)}
    </div>}
  if(view==='collector')return <div className="grid gap-3">{header}<CollectorSection s={s} tg={tg} set={set}/></div>;
  if(view==='avail'){
    const byT={};shownAvail.forEach(([t,x])=>(byT[t]=byT[t]||[]).push(x));
    return <div className="grid gap-3">
      {header}
      {filterCard}
      {shownAvail.length===0&&<Empty icon="empty" title="Nothing available here" hint="Try another map or raise your loyalty levels."/>}
      {names.filter(t=>byT[t]).map(t=>{const lim=exp[t]?byT[t].length:8;return <div key={t} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
        <div className="flex items-center justify-between mb-1"><button onClick={()=>{setSel(t);setView('trader')}} title="Open this trader" className="font-semibold hover:text-amber-400">{t}</button><span className="text-xs text-zinc-400">{byT[t].length} available</span></div>
        <div className="grid lg:grid-cols-2 gap-x-6 gap-y-0.5">{byT[t].slice(0,lim).map(x=><Row key={x} t={t} x={x} s={s} tg={tg} fin={ls.done}/>)}</div>
        {byT[t].length>8&&<button onClick={()=>setExp(o=>({...o,[t]:!o[t]}))} className="lnk mt-1 ml-2 text-xs">{exp[t]?'Show fewer':`Show all ${byT[t].length}`}</button>}
      </div>})}
    </div>}
  return <div className="grid gap-3">
    {header}

    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 dim-led">{names.map(t=>{const tl=TRADER_TASKS[t],td=tl.filter(x=>done(t,x)).length,on=t===cur;
      return <Pop key={t} done={tl.length>0&&td===tl.length} className="rounded-xl"><button onClick={()=>setSel(t)} className={'rounded-xl border px-3 py-2 text-left w-full max-sm:px-2 transition '+(on?'border-amber-500 bg-amber-500/[0.04]':'border-zinc-800 bg-zinc-900 hover:border-zinc-600')}>
        <div className={'text-sm font-bold flex items-center justify-between gap-2 '+(on?'text-amber-500':'')}>{t}<Led st={ledOf(td,tl.length)}/></div>
        <div className="text-xs text-zinc-400 mb-1">{td}/{tl.length}</div>
        <Thin p={pc(td,tl.length)} tone={td===tl.length?'bg-green-500':'bg-amber-500'}/>
      </button></Pop>})}</div>

    <div className="rounded-xl border border-zinc-800 border-l-4 !border-l-amber-500 bg-zinc-900 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xl font-bold">{cur}</div>
        {cur==='Fence'
          ?<label className="text-sm text-zinc-400">Scav karma <input type="number" step="0.1" value={s.n.karma??''} onChange={e=>set('karma',+e.target.value)} className="bg-zinc-800 w-20 px-2 py-0.5 rounded ml-1 text-zinc-100"/></label>
          :<div className="flex items-center gap-2"><span className="text-xs text-zinc-400">Loyalty level</span>
            <div className="inline-flex rounded-lg border border-zinc-700 overflow-hidden">{[1,2,3,4].map(n=><button key={n} onClick={()=>set('ll:'+cur,n)} className={'px-3 py-1 text-sm font-medium transition '+(ll===n?'bg-amber-500 text-black':'hover:bg-white/5')}>{n}</button>)}</div></div>}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Done" value={`${d}/${l.length}`} sub={pc(d,l.length)+'% complete'}/>
        <Stat label="XP left" value={fmt(xpLeft)} sub="base value"/>
        <Stat label="Rep left" value={'+'+repLeft.toFixed(2)} sub={`from ${left.length} tasks`}/>
      </div>
    </div>

    {chains.length>0&&<section>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-2"><h3 className="text-lg font-bold text-amber-500 whitespace-nowrap">Task chains</h3><span className="text-xs text-zinc-500 order-last basis-full sm:order-none sm:basis-auto">{chains.length} · work each chain top to bottom</span><ExpandAll onExpand={()=>setOpen(o=>{const n={...o};chains.forEach(c=>n[cur+'|'+c.title+'|'+c.items[0].x]=true);return n})} onCollapse={()=>setOpen(o=>{const n={...o};chains.forEach(c=>n[cur+'|'+c.title+'|'+c.items[0].x]=false);return n})}/></div>
      <div className="grid gap-2">{chains.map(c=>{
        const cd=c.items.filter(i=>done(cur,i.x)).length;
        if(hide&&cd===c.items.length)return null;
        const ok=cur+'|'+c.title+'|'+c.items[0].x,isOpen=!!open[ok],nextItem=c.items.find(i=>!done(cur,i.x)&&i.par.every(p=>done(cur,p)));
        const nextTxt=cd===c.items.length?'Chain complete':nextItem?<>Next: <span className="text-green-300">{nextItem.x}</span></>:'Blocked by earlier steps';
        return <Pop key={c.items[0].x} done={cd===c.items.length} className="rounded-xl"><div className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5">
          <button onClick={()=>setOpen(o=>({...o,[ok]:!isOpen}))} aria-expanded={isOpen} className="w-full text-left flex items-center gap-x-3 gap-y-1.5 flex-wrap">
            <span className="font-semibold flex items-center gap-2 min-w-0 sm:basis-56 sm:shrink-0"><span className={'text-zinc-500 text-xs transition-transform inline-block '+(isOpen?'rotate-90':'')}><Chev/></span><span className="truncate">{c.title}</span>{c.roots>1&&<span className="text-xs font-normal text-zinc-400">branching</span>}</span>
            <span className="w-28 max-sm:flex-1"><Thin p={pc(cd,c.items.length)} tone={cd===c.items.length?'bg-green-500':'bg-amber-500'} sm/></span>
            {!isOpen&&<span className="text-xs text-zinc-400 min-w-0 flex-1 truncate max-sm:order-last max-sm:basis-full max-sm:pl-6">{nextTxt}</span>}
            <span className={'text-xs flex items-center gap-2 ml-auto '+(cd===c.items.length?'text-green-400':'text-zinc-400')}>{cd}/{c.items.length}<Led st={ledOf(cd,c.items.length)}/></span>
          </button>
          {isOpen&&<div className="relative mt-3 ml-3 border-l border-zinc-700 space-y-0.5">{c.items.map((i,k)=>{
            const on=done(cur,i.x),nxt=!on&&i.par.every(p=>done(cur,p)),prev=k>0?c.items[k-1].x:null;
            if(hide&&on)return null;
            return <div key={i.x} className="relative pl-6">
              <span className={'absolute -left-[11px] top-2.5 grid place-items-center size-[22px] rounded-full text-xs font-bold border '+(on?'bg-green-500 text-green-950 border-green-400':nxt?'bg-zinc-900 text-green-300 border-green-400':'bg-zinc-900 text-zinc-400 border-zinc-600')}>{on?<CheckGlyph/>:k+1}</span>
              <Row t={cur} x={i.x} s={s} tg={tg} fin={ls.done} next={nxt} note={i.par.length>0&&(i.par.length!==1||i.par[0]!==prev)?i.par.join(', '):null}/>
            </div>})}</div>}
        </div></Pop>})}</div>
    </section>}

    {groups.length>0&&<section>
      <div className="flex items-baseline gap-2 mb-2"><h3 className="text-lg font-bold text-amber-500">Standalone tasks</h3><span className="text-xs text-zinc-500">{singles.length}{cur!=='Fence'?' · grouped by loyalty level':''}</span></div>
      <div className="grid gap-3">{groups.map(([g,items])=>{
        const gd=items.filter(x=>done(cur,x)).length,unlocked=ll>=g,shown=hide?items.filter(x=>!done(cur,x)):items;
        if(!shown.length)return null;
        return <div key={g} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
          {g>0&&<div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2"><span className={'rounded-md px-2 py-0.5 text-xs font-bold '+(unlocked?'bg-green-400/15 text-green-300 border border-green-400/30':'bg-zinc-800 text-zinc-300 border border-zinc-700')}>LL{g}</span><span className="text-sm font-semibold">Loyalty Level {g}</span>{unlocked&&<span className="text-xs text-green-400">unlocked</span>}</div>
            <span className="text-xs text-zinc-400">{gd}/{items.length}</span>
          </div>}
          <div className="grid lg:grid-cols-2 gap-x-6 gap-y-0.5">{shown.map(x=><Row key={x} t={cur} x={x} s={s} tg={tg} fin={ls.done} grp={g}/>)}</div>
        </div>})}</div>
    </section>}
  </div>;
}
