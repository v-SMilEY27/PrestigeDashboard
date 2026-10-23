import React from 'react';

// Small notes on Collector items ("where it is, who has it"). Kept with the rest of your progress in this browser (key cn:<item name>), so they are part of backup codes. At most 60 characters each.
export const NOTE_MAX=60;
export const noteOf=(s,name)=>{const v=s&&s.n&&s.n['cn:'+name];return typeof v==='string'?v.slice(0,NOTE_MAX):''};
export const noteCount=s=>Object.keys((s&&s.n)||{}).filter(k=>k.startsWith('cn:')&&noteOf(s,k.slice(3))).length;

const Pen=()=><svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>;

// The note box. Enter or leaving the box saves, Escape cancels, an empty note removes the note.
function Editor({name,s,set,close}){
  const [v,setV]=React.useState(noteOf(s,name));
  const done=React.useRef(false);
  const save=()=>{if(done.current)return;done.current=true;const t=v.trim().slice(0,NOTE_MAX);if(t!==noteOf(s,name))set('cn:'+name,t);close()};
  return <input type="text" autoFocus value={v} maxLength={NOTE_MAX} onChange={e=>setV(e.target.value)} onBlur={save}
    onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();save()}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();done.current=true;close()}}}
    placeholder="Add a note (where it is, who has it)" aria-label={'Note for '+name}
    className="cn-in w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none"/>;
}

// One row with a pencil button on the right. `ed` is the name of the item being edited in this list (one at a time) and `setEd` changes it.
export function NoteRow({name,s,set,ed,setEd,children,outer='rounded-lg hover:bg-white/5',indent='pl-10'}){
  const v=noteOf(s,name),editing=ed===name;
  return <div className={outer}>
    <div className="flex items-start">
      <div className="min-w-0 flex-1">{children}</div>
      <button type="button" onClick={()=>setEd(editing?null:name)} aria-expanded={editing} aria-label={(v?'Edit the note for ':'Add a note for ')+name} title={v?'Edit note':'Add a note'} className={'cn-btn tap mt-1.5 mr-1 '+(v?'cn-on':'')}><Pen/></button>
    </div>
    {editing?<div className={indent+' pr-2 pb-1.5'}><Editor key={name} name={name} s={s} set={set} close={()=>setEd(null)}/></div>:v&&<div className={indent+' pr-2 pb-1.5 text-xs leading-4 text-zinc-400 break-words'}>{v}</div>}
  </div>;
}
