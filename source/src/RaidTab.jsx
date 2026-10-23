import React from 'react';
import {Card,Section,Stat,Chip,Pill,Chev,FirTick,Done,KeyIcon,Star} from './ui.jsx';
import {useLS} from './useLS.js';
import {taskStatus} from './access.js';
import {planHideout,CURRENCY} from './hideout.js';
import {TRADER_TASKS,TASK_REWARD,TASK_MAP,COLLECTOR_ITEMS} from './data.js';
import NEEDS from './lootNeeds.json';
import {nbList} from './nb.js';
import {NbObj} from './NewBeginning.jsx';
import {keysFor,hasKey,keyReady} from './KeysTab.jsx';
import MapAccess from './MapAccess.jsx';
import {useLogStatus,InProgressChip} from './LogStatus.jsx';

const MAPS=['Ground Zero','Factory','Customs','Woods','Shoreline','Interchange','Reserve','Lighthouse','Streets','The Lab','Labyrinth'];
const wiki=n=>'https://escapefromtarkov.fandom.com/wiki/'+encodeURIComponent(n.split(' / ')[0].replace(/ /g,'_'));
const fmt=n=>n.toLocaleString();
const mapsOf=(t,x)=>{const m=TASK_MAP[t+'|'+x];return !m?[]:m==='Any map'?['Any map']:m.split(', ')};
const money=n=>CURRENCY.includes(n);

const ItemLine=({n,c,have,fir,tag})=>{const short=have!==undefined&&have<c;
  return <div className="flex items-center justify-between gap-2 rounded-lg bg-black/20 px-2 py-1 text-sm">
    <a href={wiki(n)} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-amber-400 min-w-0 truncate">{n}</a>
    <span className="shrink-0 flex items-center gap-1.5">{fir&&<FirTick/>}{tag&&<Chip tone="mute">{tag}</Chip>}
      <span className={have===undefined?'text-zinc-300':short?'text-amber-400':'text-green-300'}>{have!==undefined&&<span className="text-xs text-zinc-500 mr-1">have {have}</span>}×{c}</span></span></div>};

export default function RaidTab({cy,s,set,tg,best=[]}){
  const [map,setMap]=useLS('tpp2_ui_raid_map',null);
  const [incl,setIncl]=useLS('tpp2_ui_incl_plan',false);
  const [last,setLast]=React.useState(null);
  React.useEffect(()=>{if(!last)return;const h=setTimeout(()=>setLast(null),10000);return()=>clearTimeout(h)},[last]);
  const access=MAPS.filter(m=>!s.c['nm:'+m]);
  const cur=MAPS.includes(map)?map:(access[0]||MAPS[0]);
  const have=n=>s.n['hi:'+n]||0;
  const ls=useLogStatus(s);
  const mark=(t,x)=>{const k='tk:'+t+':'+x;tg(k);setLast({label:x,undo:()=>tg(k)})};

  // tasks on this map you can start now (same strict rules as Available now)
  const tasks=[];let locked=0,unk=0;
  Object.entries(TRADER_TASKS).forEach(([t,l])=>l.forEach(x=>{
    if(s.c['tk:'+t+':'+x])return;
    const ms=mapsOf(t,x);if(!(ms.includes(cur)||ms.includes('Any map')))return;
    const st=taskStatus(s,t,x).st;
    if(st==='ok'||(st==='unknown'&&incl))tasks.push({t,x,rw:TASK_REWARD[t+'|'+x]||[0,0],rows:NEEDS[t+'|'+x]||[],any:ms.includes('Any map')});
    else if(st==='unknown')unk++;else locked++;
  }));
  // tasks the logs say you have accepted always show on their map, even when the dashboard thinks they are still locked
  ls.open.forEach(key=>{const [t,...r]=key.split('|'),x=r.join('|');if(s.c['tk:'+t+':'+x]||tasks.some(k=>k.t===t&&k.x===x))return;
    const ms=mapsOf(t,x);if(!(ms.includes(cur)||ms.includes('Any map')))return;
    tasks.push({t,x,rw:TASK_REWARD[key]||[0,0],rows:NEEDS[key]||[],any:ms.includes('Any map')})});
  tasks.sort((a,b)=>(ls.open.has(b.t+'|'+b.x)-ls.open.has(a.t+'|'+a.x))||(a.any-b.any)||(b.rw[0]||0)-(a.rw[0]||0));

  // roll up the items those tasks need
  const bring={},find={},keys={};let flex=0;
  tasks.forEach(k=>k.rows.forEach(r=>{
    const [kind,c,fir,n]=r;
    if(kind==='x'){flex++;return}
    if(money(n))return;
    if(kind==='f'){keys[n]=(keys[n]||0)+c;return}
    if(kind==='p'||(kind==='g'&&!fir))bring[n]=(bring[n]||0)+c;
    else find[n]=(find[n]||0)+c;
  }));
  // things worth grabbing on any map
  const anywhere={};
  planHideout(s,cy).steps.forEach(st=>st.i.forEach(([n,c,fir])=>{if(fir&&!money(n))anywhere[n]=(anywhere[n]||0)+c}));
  if(cy.tasks.includes('Collector'))COLLECTOR_ITEMS.forEach(i=>{if(!s.c['ci:'+i.n])anywhere[i.n]=(anywhere[i.n]||0)+1});
  const short=o=>Object.entries(o).filter(([n,c])=>have(n)<c);
  const findShort=short(find),anyShort=short(anywhere).filter(([n])=>!(n in find));
  const mk={};tasks.forEach(k=>keysFor(k.t,k.x).filter(([m])=>m===cur).forEach(([,alts])=>alts.forEach(n=>{(mk[n]=mk[n]||[]).push(k.x)})));
  const mapKeys=Object.entries(mk).sort(([a],[b])=>a.localeCompare(b));
  const nbHere=cy.tasks.includes('New Beginning')&&!s.c['t:New Beginning']?nbList(cy,s).filter(o=>!o.done&&o.maps&&o.maps.includes(cur)):[];
  const xp=tasks.reduce((n,k)=>n+(k.rw[0]||0),0);

  return <div className="grid gap-4">
    {last&&<div role="status" className="rounded-xl border border-green-400/30 bg-green-400/5 px-3 py-2 text-sm text-green-200 flex items-center justify-between gap-2"><span>“{last.label}” marked done.</span><span className="flex gap-3"><button onClick={()=>{last.undo();setLast(null)}} className="font-semibold underline underline-offset-2">Undo</button><button onClick={()=>setLast(null)} aria-label="Dismiss" className="text-zinc-400 hover:text-zinc-100">✕</button></span></div>}

    <Section title="Which map are you running?" sub="maps you can access come first">
      <div className="flex flex-wrap gap-2">{access.concat(MAPS.filter(m=>!access.includes(m))).map(m=><Pill key={m} on={cur===m} onClick={()=>setMap(m)} title={best.includes(m)?'One of your best maps right now':undefined}>{best.includes(m)&&<Star/>}{m}{!access.includes(m)?' ·locked':''}</Pill>)}</div>
      <MapAccess s={s} tg={tg}/>
    </Section>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <Stat label="Tasks here" value={tasks.length} sub={locked?`${locked} more still locked`:'startable now'}/>
      <Stat label="XP on offer" value={fmt(xp)} sub="if you finish them all"/>
      <Stat label="Bring" value={Object.keys(bring).length} sub="items to carry in"/>
      <Stat label="Find in raid" value={findShort.length+Object.keys(keys).length} sub="items and keys to look for"/>
    </div>

    <Section title={`Tasks on ${cur}`} sub={tasks.length?'tick one off when you finish it':undefined}>
      {tasks.length===0?<Card><div className="text-sm text-zinc-300">No startable tasks on this map right now{locked?`: ${locked} are locked behind level, loyalty, karma or an earlier task`:''}. Try another map or update your stats on Overview.</div></Card>
        :<Card c="grid gap-1 !p-3">{tasks.map(k=><div key={k.t+k.x} className="flex items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-white/5">
          <label className="cbx"><input type="checkbox" checked={false} onChange={()=>mark(k.t,k.x)} aria-label={'Mark '+k.x+' done'} title="Mark done" className="accent-amber-500 mt-1 size-4 shrink-0"/></label>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><a href={wiki(k.x)} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline hover:text-amber-400">{k.x}</a><Chip>{k.t}</Chip>{k.any&&<Chip tone="map">any map</Chip>}{ls.open.has(k.t+'|'+k.x)&&<InProgressChip/>}
            {k.rw[0]>0&&<Chip tone="xp">+{fmt(k.rw[0])} XP</Chip>}{keysFor(k.t,k.x).length>0&&<Chip tone={keyReady(s,k.t,k.x)?'ok':'warn'} title="Task key"><KeyIcon/>{keyReady(s,k.t,k.x)?'key held':'needs key'}</Chip>}{k.rw[1]>0&&<Chip tone="rep">+{k.rw[1].toFixed(2)}</Chip>}</div>
            {k.rows.length>0&&<div className="flex flex-wrap gap-1 mt-1">{k.rows.map((r,i)=>r[0]==='x'?<Chip key={i} tone="mute">{r[1]}× any of {r[3]} items{r[2]?<> <FirTick/></>:null}</Chip>
              :money(r[3])?<Chip key={i} tone="xp">{fmt(r[1])} {r[3]}</Chip>
              :<Chip key={i} tone={r[0]==='p'?'map':r[0]==='f'?'warn':'mute'} title={r[0]==='p'?'Placed in the world':r[0]==='f'?'Find in the raid':'Hand in'}>{r[1]>1?r[1]+'× ':''}{r[3].split(' / ')[0]}{r[2]?<> <FirTick/></>:null}{r[0]==='p'?' · plant':r[0]==='f'?' · find':''}</Chip>)}</div>}</div></div>)}
          {unk>0&&!incl&&<div className="text-xs text-zinc-500 px-2">{unk} more here cannot be checked (hidden requirements) and are hidden. <button onClick={()=>setIncl(true)} className="lnk">Include them</button></div>}</Card>}
    </Section>

    {nbHere.length>0&&<Section title={`New Beginning on ${cur}`} sub="objectives for this map">
      <Card c="grid gap-0.5 !p-3">{nbHere.map(o=><NbObj key={o.id} o={o} s={s} set={set} tg={tg}/>)}</Card></Section>}

    {mapKeys.length>0&&<Section title={`Keys for ${cur}`} sub="tick the ones in your stash">
      <Card c="grid gap-0.5 !p-3">{mapKeys.map(([n,alts])=><label key={n} className="flex items-start gap-3 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-white/5">
        <input type="checkbox" checked={hasKey(s,n)} onChange={()=>tg('key:'+n)} className="accent-amber-500 mt-1 size-4 shrink-0"/>
        <div className="min-w-0 flex-1"><div className={'font-medium '+(hasKey(s,n)?'text-green-300':'')}>{hasKey(s,n)&&<Done/>}{n==='Unknown key'?'Unnamed key (check the task in game)':n}</div>
          <div className="text-xs text-zinc-400">{alts.join(', ')}</div></div></label>)}</Card></Section>}

    {Object.keys(bring).length>0&&<Section title="Bring with you" sub="items these tasks use up or need handed in">
      <Card c="grid gap-1 !p-3">{Object.entries(bring).sort().map(([n,c])=><ItemLine key={n} n={n} c={c} have={have(n)}/>)}
        <div className="text-xs text-zinc-500 px-1 mt-1">“have” is your stash count from the Hideout or Loot tab (leave blank if you do not track it).</div></Card></Section>}

    {(findShort.length>0||Object.keys(keys).length>0)&&<Section title="Find in this raid" sub="needed by the tasks above">
      <Card c="grid gap-1 !p-3">{Object.entries(keys).map(([n,c])=><ItemLine key={n} n={n} c={c} tag="key / item to find"/>)}{findShort.map(([n,c])=><ItemLine key={n} n={n} c={c} have={have(n)} fir/>)}
        {flex>0&&<div className="text-xs text-zinc-500 px-1">{flex} task objective{flex>1?'s':''} accept{flex>1?'':'s'} many different items; see Loot → Task hand-ins.</div>}</Card></Section>}

    {anyShort.length>0&&<details className="group">
      <summary className="cursor-pointer list-none flex items-baseline gap-2"><span className="text-zinc-500 text-xs transition-transform group-open:rotate-90"><Chev/></span><h3 className="text-lg font-bold text-amber-500">Grab on any map</h3><span className="text-xs text-zinc-500">{anyShort.length} found-in-raid items still needed for hideout upgrades and the Collector</span></summary>
      <Card c="grid gap-1 !p-3 mt-2">{anyShort.sort().map(([n,c])=><ItemLine key={n} n={n} c={c} have={have(n)} fir/>)}
        <div className="text-xs text-zinc-500 px-1 mt-1">The game data has no per-map spawn lists, so these are just things to pick up whenever you see them.</div></Card></details>}
  </div>;
}
