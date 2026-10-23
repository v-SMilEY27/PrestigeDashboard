// Any button can open the Rewards window: openRewards(p, cur) where p is the prestige whose card starts open and cur is the prestige being worked toward (or 0 when none).
export const openRewards=(p,cur=0)=>{try{window.dispatchEvent(new CustomEvent('pd-rewards',{detail:{p,cur}}))}catch(e){}};
