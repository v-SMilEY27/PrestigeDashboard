import {useState,useEffect} from 'react';
// useState that persists to localStorage (falls back to memory if storage is blocked).
// It also tells the page when a save fails or saved data is damaged (the page shows a notice) and keeps a copy of damaged data instead of silently replacing it.
const say=n=>{try{(window.__pd=window.__pd||{})[n]=1;window.dispatchEvent(new Event(n))}catch{}};
export const useLS=(k,d)=>{
  const [v,s]=useState(()=>{try{const raw=localStorage.getItem(k);if(raw===null)return d;try{return JSON.parse(raw)??d}catch{try{localStorage.setItem('tpp2_damaged_'+k,raw)}catch{}say('pd-data-damaged');return d}}catch{return d}});
  useEffect(()=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{say('pd-save-failed')}},[k,v]);
  return [v,s]};
