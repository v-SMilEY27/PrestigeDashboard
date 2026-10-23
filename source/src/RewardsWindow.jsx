import React from 'react';
import {Modal,ModalFoot,CloseBtn,playName,Chev} from './ui.jsx';
import DATA from './rewards-prestige.json';
// Rewards for each PvE prestige, transcribed from the in-game reward screens (15 Oct 2026). Each entry in rewards-prestige.json: [category, name, column span (1 or 2 of 4), picture file].
// The pictures in rewardimg/ are whole game tiles (cut corners, label, border recoloured in the prestige's colour), made by /home/claude/tools/maketiles.py from the screenshots.
const IMG=import.meta.glob('./rewardimg/*.webp',{eager:true,import:'default'});
// Each picture is the whole game tile (cut corners, label, border in the prestige's colour), so it is shown as it is: no cropping, stretching or extra frame.
const Tile=({r})=><li className={r[2]===2?'col-span-2':''}><img src={IMG['./rewardimg/'+r[3]]} alt={r[1]+', '+r[0].toLowerCase()} width={r[2]===2?562:268} height="268" loading="lazy" decoding="async" className="block h-auto w-full"/></li>;
function Window({p0,cur,onClose}){
  const [open,setOpen]=React.useState(p0); // exactly one card is open at all times
  return <Modal label="Prestige rewards" title="Prestige rewards" tone={'p'+p0} wide="max-w-5xl" onClose={onClose} dismiss>
    <p className="text-sm text-zinc-400">Everything each prestige gives you.{cur?` ${playName(cur)} is the one you are working toward.`:''}</p>
    <div className="grid gap-3">{[1,2,3,4,5,6].map(p=>{const rows=DATA[p],on=open===p;
      return <details key={p} open={on} className={'group rounded-xl border bg-zinc-900 acc-p'+p} style={p===open?{borderColor:'var(--acc)',boxShadow:'0 0 0 1px var(--acc), 0 0 22px -6px var(--acc)'}:{borderColor:'color-mix(in srgb,var(--acc) 40%,#27272a)'}}>
        <summary onClick={e=>{e.preventDefault();setOpen(p)}} className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-4 py-3 [&::-webkit-details-marker]:hidden">
          <span className="text-xs transition-transform group-open:rotate-90" style={{color:'var(--acc)'}}><Chev/></span>
          <h3 className={'font-semibold '+(on?'text-lg text-zinc-50':'text-zinc-200')}>{playName(p)}</h3>
          {p===cur&&<span className="rounded-full border px-2 py-0.5 text-xs" style={{borderColor:'var(--acc)',color:'var(--acc)'}}>Working toward</span>}
          <span className="ml-auto text-xs text-zinc-500">{rows.length} rewards</span></summary>
        <div className="px-4 pb-4" style={{containerType:'inline-size'}}><ul className="grid grid-cols-2 lg:grid-cols-4" style={{gap:'2.2609cqw'}}>{rows.map(r=><Tile key={r[3]} r={r}/>)}</ul></div></details>})}</div>
    <ModalFoot><CloseBtn tone={'p'+p0} autoFocus onClick={onClose}/></ModalFoot>
  </Modal>}
// Lives once at the top of the page; any "Rewards" button opens it through openRewards().
export default function RewardsHost(){
  const [w,setW]=React.useState(null);
  React.useEffect(()=>{const h=e=>{const d=e.detail||{};if(d.p>=1&&d.p<=6)setW({p:d.p,cur:d.cur||0,k:Date.now()})};window.addEventListener('pd-rewards',h);return()=>window.removeEventListener('pd-rewards',h)},[]);
  return w?<Window key={w.k} p0={w.p} cur={w.cur} onClose={()=>setW(null)}/>:null}
