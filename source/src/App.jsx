import {VERSION} from './releases.js';
import {resetLogHistory,fixOldLogHistory} from './LogStatus.jsx';
import React,{useEffect} from 'react';
import TradersTab from './TradersTab.jsx';
import PlanTab from './PlanTab.jsx';
import Wizard from './Wizard.jsx';
import ExpAfterSetup from './ExpAfterSetup.jsx';
import HideoutTab from './HideoutTab.jsx';
import {PageLine,NewPip,PrestigeCard,playName} from './ui.jsx';
import {CYCLES,CQUESTS,cqKey} from './data.js';
import LootTab from './LootTab.jsx';
import Readiness,{buildReadiness} from './Readiness.jsx';
import Backup from './Backup.jsx';
import ImportShots from './ImportShots.jsx';
import Experiments from './Experiments.jsx';
import {useExp} from './expOptIn.js';
import NewBeginning from './NewBeginning.jsx';
import CollectorTracker from './CollectorTracker.jsx';
import {prereqsOf,dependantsOf} from './chain.js';
import {requiredSteps,sKey} from './story.js';
import {nbList} from './nb.js';
import StoryChapters from './StoryChapters.jsx';
import {useLS} from './useLS.js';
import Mark from './Mark.jsx';
import Welcome,{WelcomeBtn} from './Welcome.jsx';
import {useAutoSnap} from './Backup.jsx';
import History from './History.jsx';
import UpdateBanner from './Update.jsx';
import Picker,{LAST} from './Picker.jsx';
import {useSetupNew} from './setupNew.js';
import {diffState,addEntries} from './changelog.js';
const pc=(x,y)=>y?Math.round(x/y*100):0;
const OrangeBtn=p=><button {...p} className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-amber-400"/>;
const GhostBtn=p=><button {...p} className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:bg-white/5"/>;

const Title=({right,noGen,after})=>{const ex=useExp();return <header className="mb-4 relative pr-28 max-sm:pr-0">
  <Mark/>
  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pb-3 max-sm:gap-x-1.5 max-sm:pb-5"><div className="max-sm:basis-full max-sm:pr-28"><h1 className="text-2xl font-bold text-amber-500">Prestige Dashboard</h1><p className="text-[10px] leading-3 text-zinc-500"><span className={'font-semibold '+(ex?'text-pink-400':'text-zinc-600')}>Version {VERSION}{ex?'E':''}</span> · <span className="text-[#7e7e87]">Data checked on 23 Oct 2026</span></p></div>{right}<Backup noGen={noGen}/>{after}<WelcomeBtn/></div>
</header>};

// The first time a prestige's setup is finished, that moment is when it started: game logs from before it belong to the last prestige (hotfix 1.22.1).
// Running setup again later (wizRe) keeps the start time and the log history.
const isNewStart=o=>!o.n.wizRe&&!o.n.logFrom;
const logFromOf=o=>isNewStart(o)?{logFrom:Math.floor(Date.now()/1000)}:{};
const startLogs=o=>{if(isNewStart(o))resetLogHistory()};
function Cycle({cy,choose}){
const [s,setS]=useLS('tpp2_cycle_'+cy.p,{n:{},c:{}});const setupNew=useSetupNew();const [picking,setPicking]=React.useState(false);
const navRef=React.useRef(null);
// New Beginning objectives run in order: undoing one also undoes every objective after it (a counted objective counts as undone once it drops below its target).
const nbUndoAfter=(o,c,n,i,list)=>{list.slice(i+1).forEach(x=>{c[x.key]=false;n[x.nkey]=0})};
const set=(k,v)=>setS(o=>{const n={...o.n,[k]:v};if(k.startsWith('cn:')&&!v)delete n[k];let c=o.c;if(k.startsWith('nbn:')&&cy.tasks.includes('New Beginning')){const list=nbList(cy,o),i=list.findIndex(x=>x.nkey===k);if(i>=0&&list[i].done&&v<list[i].need){c={...c};nbUndoAfter(o,c,n,i,list)}}return {...o,n,c}});const tg=k=>setS(o=>{const on=!o.c[k],c={...o.c,[k]:on};let n=o.n;if(!on&&k.startsWith('nb:')&&cy.tasks.includes('New Beginning')){const list=nbList(cy,o),i=list.findIndex(x=>x.key===k);if(i>=0){n={...o.n};nbUndoAfter(o,c,n,i,list)}}if(k.startsWith('tk:'))(on?prereqsOf(k):dependantsOf(k)).forEach(p=>{c[p]=on});if(on&&k.startsWith('s:'))requiredSteps(k.slice(2),o).forEach(x=>{c[sKey(x.id)]=true});return {...o,n,c}});
React.useEffect(()=>{const h=()=>setS(o=>{if(!o.n.skipIgnore)return o;const n={...o.n};delete n.skipIgnore;return {...o,n}});window.addEventListener('pd-restore-warnings',h);return()=>window.removeEventListener('pd-restore-warnings',h)},[]);
// Older versions ticked Collector gate quests under their own keys. Move those ticks onto the trader task they are.
const mig=React.useRef(false);
React.useEffect(()=>{if(!Object.keys(s.c).some(k=>k.startsWith('cq:')||/^cs:\d+$/.test(k)))return;
  mig.current=true;setS(o=>{const c={...o.c};CQUESTS.forEach(q=>{if(c['cq:'+q.id])c[cqKey(q)]=true;delete c['cq:'+q.id]});Object.keys(c).forEach(k=>{if(/^cs:\d+$/.test(k)){c['cs:sbih:'+k.slice(3)]=c[k];delete c[k]}});return {...o,c}})},[]);
const [log,setLog]=useLS('tpp2_log_'+cy.p,[]);
// A prestige set up before 1.22.1 (or restored from an older backup code) has no start time: it gets one now, so game logs from before today are not read for it (hotfix 1.22.1).
React.useEffect(()=>{if(!s.n.wizDone||s.n.logFrom)return;fixOldLogHistory();mig.current=true;setS(o=>o.n.logFrom||!o.n.wizDone?o:({...o,n:{...o.n,logFrom:Math.floor(Date.now()/1000)}}))},[s.n.wizDone,s.n.logFrom]);
// Put one logged change back the way it was. The undo itself is not logged; the entry is simply removed.
const undoEntry=e=>{mig.current=true;setS(o=>{const n={...o.n},c={...o.c};
  if(typeof e.v==='boolean')c[e.k]=!e.v;else if(e.f===undefined)delete n[e.k];else n[e.k]=e.f;return {...o,n,c}});
  setLog(l=>l.filter(x=>x!==e))};const prev=React.useRef({p:cy.p,s});
useEffect(()=>{const pv=prev.current;prev.current={p:cy.p,s};if(pv.p===cy.p&&pv.s!==s&&mig.current){mig.current=false;return}if(pv.p!==cy.p||pv.s===s||!s.n.wizDone||!pv.s.n.wizDone)return;
  const e=diffState(pv.s,s,cy);if(e.length)setLog(l=>addEntries(l,e))},[s]);
const [tab0,setTab]=useLS('tpp2_ui_tab','Overview');const [hsec,setHsec]=useLS('tpp2_ui_hsec','plan');const [hopen,setHopen]=useLS('tpp2_ui_hopen',{});const [topen,setTopen]=useLS('tpp2_ui_topen',{});const [tsel,setTsel]=useLS('tpp2_trader','Prapor');const [thide,setThide]=useLS('tpp2_hide',false);const [tview,setTview]=useLS('tpp2_tview','trader');const [tmap,setTmap]=useLS('tpp2_tmap','All');const hd=Object.entries(cy.hideout);
const needCol=cy.tasks.includes('Collector');
const rd=buildReadiness(cy,s);const pct=rd.pct;
const off={'Hideout':!hd.length&&`Not needed for ${playName(cy.p)}: no hideout requirements`};
const go=(t,o={})=>{if(off[t])return;setTab(t);if(o.hsec)setHsec(o.hsec);if(o.view){setTview(o.view);setTmap(o.map||'All')}if(o.trader)setTsel(o.trader)};
const tabs=['Overview','Planning','Hideout','Traders and Tasks','Loot','History'];
const OLD={'Next Steps':'Planning','This Raid':'Planning','Keys':'Loot','Collector':'Traders and Tasks','Story Tasks':'Overview','Plan':'Planning'};
const tabN=OLD[tab0]||tab0;
const tab=(off[tabN]||!tabs.includes(tabN))?'Overview':tabN;
useEffect(()=>{const h=e=>{if(!s.n.wizDone||e.ctrlKey||e.metaKey||e.altKey)return;
  const el=e.target,tag=el&&el.tagName;if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(el&&el.isContentEditable)||document.querySelector('[role=dialog]'))return;
  const i='123456'.indexOf(e.key);if(i>=0&&i<tabs.length&&e.key.length===1&&!off[tabs[i]]){setTab(tabs[i]);e.preventDefault();return}};
  document.addEventListener('keydown',h);return()=>document.removeEventListener('keydown',h)});
const expOn=useExp();
// On a phone the tab bar scrolls sideways: fade the edge that has more tabs hidden past it
React.useEffect(()=>{const n=navRef.current;if(!n)return;const f=()=>{n.dataset.l=n.scrollLeft>4?'1':'';n.dataset.r=n.scrollLeft+n.clientWidth<n.scrollWidth-4?'1':''};f();n.addEventListener('scroll',f,{passive:true});window.addEventListener('resize',f);return()=>{n.removeEventListener('scroll',f);window.removeEventListener('resize',f)}},[]);
React.useEffect(()=>{const n=navRef.current,b=n&&n.querySelector('[aria-current=page]');if(b&&n.scrollWidth>n.clientWidth)n.scrollTo({left:b.offsetLeft-(n.clientWidth-b.offsetWidth)/2,behavior:'smooth'})},[tab]); // phone: keep the open tab in view
if(picking)return <div><Title noGen/><Picker current={cy.p} onResetCurrent={()=>{setS({n:{},c:{}});setLog([])}} onBack={()=>setPicking(false)} pick={p=>{if(p===cy.p){setPicking(false);if(s.n.wizDone)setS(o=>({...o,n:{...o.n,wizDone:0,wizRe:1}}))}else choose(p)}}/></div>;
if(!s.n.wizDone)return <div className={'acc acc-p'+cy.p}><Title noGen/><Wizard changePrestige={()=>setPicking(true)} cy={cy} s={s} set={set} setS={setS} tg={tg} finish={()=>{startLogs(s);setS(o=>({...o,n:{...o.n,...logFromOf(o),wizDone:1,wizSkip:0,wizRe:0,...(!o.n.wizRe&&!expOn&&!o.n.expAsked?{expAsk:1}:{})}}))}} skip={()=>{startLogs(s);setS(o=>({...o,n:{...o.n,...logFromOf(o),wizDone:1,wizSkip:1,wizRe:0}}))}}/></div>;
if(s.n.expAsk)return <div className={'acc acc-p'+cy.p}><Title noGen/><ExpAfterSetup onDone={()=>setS(o=>{const n={...o.n,expAsked:1};delete n.expAsk;return {...o,n}})}/></div>;
return <div className={'acc acc-p'+cy.p+' grid gap-4'}>
<div><Title right={<><span className="relative inline-flex"><OrangeBtn onClick={()=>setPicking(true)}>Run Setup</OrangeBtn>{setupNew.any&&<NewPip label={'Setup has changed: '+setupNew.fresh.join(', ')} className="-top-1 -right-1"/>}</span><ImportShots cy={cy} s={s} setS={setS}/></>} after={<Experiments s={s} setS={setS}/>}/>
{s.n.wizSkip>0&&!s.n.skipIgnore&&(()=>{const miss=[!(s.n.name||'').trim()&&'PMC name',!s.n.faction&&'faction',!s.n.lvl&&'level',!Object.keys(s.n).some(k=>k.startsWith('ll:'))&&'loyalty levels',!Object.keys(s.c).some(k=>k.startsWith('tk:')&&s.c[k])&&'finished tasks'].filter(Boolean);
  return <div className="rounded-xl border border-amber-400/40 bg-amber-400/5 p-3 text-sm text-amber-200 mb-3 flex flex-wrap items-center justify-between gap-2">
    <div>Setup was skipped, so suggestions may be inaccurate.{miss.length>0&&<> Still missing: <b>{miss.join(', ')}</b>.</>}</div>
    <div className="flex gap-2"><GhostBtn onClick={()=>set('skipIgnore',1)}>Ignore</GhostBtn><GhostBtn onClick={()=>set('wizDone',0)}>Finish setup</GhostBtn></div></div>})()}
<PrestigeCard p={cy.p} pct={pct} done={rd.done} total={rd.rows.length} name={s.n.name} faction={s.n.faction} compact={tab!=='Overview'}/></div>

<nav ref={navRef} className={'kt-p'+cy.p+' tabs-nav sticky top-0 z-30 -mx-4 px-4 py-2 flex flex-wrap gap-2 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:snap-x bg-[#0e0f11]/95 backdrop-blur border-b border-zinc-800/60'}>{tabs.map((t,i)=><button key={t} type="button" disabled={!!off[t]} aria-current={tab===t?'page':undefined} title={off[t]||'Press '+(i+1)} onClick={()=>setTab(t)} className={'kt'+(tab===t?' kt-on':'')}>{t}</button>)}<span className="ml-auto self-center text-xs text-zinc-500 hidden md:inline">Keys 1 to 6 switch tabs</span></nav>

<div key={tab} className="tab-in">{tab==='Overview'&&<div className="grid gap-4">
  <PageLine>What {playName(cy.p)} needs, and how far along you are. Type values straight into the checklist and tick tasks as you finish them.</PageLine>
  <Readiness cy={cy} s={s} go={go} tg={tg} set={set}/>
  {cy.tasks.includes('New Beginning')&&<NewBeginning cy={cy} s={s} set={set} tg={tg}/>}
  {cy.tasks.includes('Collector')&&<CollectorTracker s={s} tg={tg} set={set}/>}
  <StoryChapters cy={cy} s={s} tg={tg} set={set} tickMany={ks=>setS(o=>({...o,c:{...o.c,...Object.fromEntries(ks.map(k=>[k,true]))}}))} untickMany={ks=>setS(o=>({...o,c:{...o.c,...Object.fromEntries(ks.map(k=>[k,false]))}}))}/>
</div>}

{tab==='Hideout'&&<HideoutTab cy={cy} s={s} set={set} sec={hsec} setSec={setHsec} open={hopen} setOpen={setHopen}/>}

{tab==='Traders and Tasks'&&<TradersTab open={topen} setOpen={setTopen} s={s} set={set} tg={tg} sel={tsel} setSel={setTsel} hide={thide} setHide={setThide} view={tview} setView={setTview} mapf={tmap} setMapf={setTmap} needCol={needCol} go={go}/>}

{tab==='Loot'&&<LootTab cy={cy} s={s} set={set} tg={tg}/>}

{tab==='History'&&<History cy={cy} s={s} log={log} undo={undoEntry} clear={()=>setLog([])}/>}

{tab==='Planning'&&<PlanTab cy={cy} s={s} set={set} tg={tg} go={go}/>}</div>
</div>}

export default function App(){
useAutoSnap();
const [sel,setSel]=useLS('tpp2_sel',null);const cy=CYCLES.find(c=>c.p===sel);
return <div className="max-w-6xl mx-auto p-4">
<Welcome/><UpdateBanner/>
{cy?<Cycle key={cy.p} cy={cy} choose={p=>{try{localStorage.setItem(LAST,JSON.stringify(p))}catch{}setSel(p)}}/>:<div><Title noGen/>
<Picker pick={p=>{try{localStorage.setItem(LAST,JSON.stringify(p))}catch{}setSel(p)}}/></div>}</div>}
