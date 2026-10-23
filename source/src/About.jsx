import React from 'react';
import {Modal,ModalFoot,CloseBtn} from './ui.jsx';
import AboutExtra from './aboutExtra.jsx';
import AccentCard from './AccentCard.jsx';

const ISSUES='https://github.com/UPSDWNFRWN/PrestigeDashboard/issues';
const Card=({title,children})=><AccentCard tone="amber" title={title}>{children}</AccentCard>;
const Q=({q,children})=><div className="grid gap-0.5"><b className="text-zinc-100 font-semibold">{q}</b><span>{children}</span></div>;

// A link that closes this window (and the welcome window behind it) and opens another window.
const Go=({go,ev,tone='text-green-400 hover:text-green-300',children})=><button type="button" onClick={()=>go(ev)} className={'font-bold no-underline rounded-md px-1.5 py-0.5 -mx-0.5 bg-[color-mix(in_srgb,currentColor_15%,transparent)] hover:bg-[color-mix(in_srgb,currentColor_28%,transparent)] transition-colors '+tone}>{children}</button>;
export default function About({open,onClose,go=()=>{}}){
  if(!open)return null;
  return <Modal label="About and help" title="About and help" tone="amber" wide="max-w-3xl" z="z-[60]" onClose={onClose} dismiss>
    <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs leading-5 text-amber-300">This is a fan-made tool. It is not made by, affiliated with or endorsed by Battlestate Games, the makers of Escape from Tarkov. Game names, tasks, items and traders belong to their owners.</p>
    <div className="grid gap-4 text-sm text-zinc-300">
      <div className="grid sm:grid-cols-2 gap-3">
        <Card title="Where the data comes from">
          <div>Task, item and hideout data comes from the PvE data feed and a community wiki. The <b className="text-zinc-100">Data checked on</b> date at the top is the release date of the last update that compared the data with those sources.</div>
          <div className="text-xs leading-5 text-zinc-400">Game data can change, so if something looks wrong, check it in the game and tell me.</div></Card>
        <Card title="Where your progress is kept">
          <div>Everything you enter is saved in this browser on this device. Nothing is uploaded.</div>
          <div className="text-xs leading-5 text-zinc-400">Make a backup code from <Go go={go} ev="pd-open-backup">Backup, Transfer &amp; Restore</Go> to move to another browser or device, or to be safe.</div></Card>
      </div>
      <Card title="Questions"><div className="grid gap-3">
        <Q q="Why does a task say it cannot be checked?">Some tasks depend on things the data does not record. The dashboard says so instead of guessing.</Q>
        <Q q="How are suggestions chosen?">They use your level, loyalty levels, karma, accessible maps and ticked tasks. They are a planning guide, not game data.</Q></div></Card>
      <AboutExtra go={go} Go={Go}/>
      <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <a href={ISSUES} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-amber-500 text-black text-sm font-semibold px-5 py-2 hover:bg-amber-400 max-sm:w-full max-sm:text-center">Open an issue on GitHub</a>
        <div className="flex-1 min-w-[12rem] grid gap-0.5"><div className="font-semibold text-zinc-100">Feedback and bugs</div>
          <div className="text-xs leading-5 text-zinc-400">Found a mistake or have an idea? Tell me about it on GitHub. If you know me already, you can message me on Discord instead.</div></div></section>
      <Card title="Credits and licences"><div className="grid gap-1.5 text-xs leading-5 text-zinc-400">
        <div>Game data comes from <b className="font-semibold text-zinc-200">tarkov.dev</b>, a community project that shares the PvE data feed, and from the <b className="font-semibold text-zinc-200">Escape from Tarkov Wiki</b>, a community wiki. Thank you to both communities.</div>
        <div>The dashboard is built with open-source software. Each part keeps its own licence.</div>
        <ul className="grid gap-1 list-disc pl-4">
          <li><b className="font-semibold text-zinc-200">React and React DOM</b>: MIT licence, copyright Facebook, Inc. and its affiliates.</li>
          <li><b className="font-semibold text-zinc-200">Tesseract.js and the Tesseract engine, with the English language data</b>: Apache Licence 2.0.</li>
          <li><b className="font-semibold text-zinc-200">Oxanium font</b>: SIL Open Font Licence 1.1, copyright 2019 The Oxanium Project Authors.</li>
          <li><b className="font-semibold text-zinc-200">QR code generator (qrcode-generator 1.4.4)</b>: MIT licence, copyright 2009 Kazuhiko Arase.</li></ul></div></Card>
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400"><span className="font-semibold text-zinc-300">Shortcuts</span>
        <kbd className="rounded-md border border-zinc-600 bg-zinc-800 px-1.5 py-0.5 font-mono text-zinc-200">1</kbd> to <kbd className="rounded-md border border-zinc-600 bg-zinc-800 px-1.5 py-0.5 font-mono text-zinc-200">6</kbd> switch tabs</div>
    </div>
    <ModalFoot><CloseBtn tone="amber" autoFocus onClick={onClose}/></ModalFoot>
  </Modal>;
}
