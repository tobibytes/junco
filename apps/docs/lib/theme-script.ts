/**
 * Same script as `themeScript()` from junco. We can't call that here: junco's bundle carries a
 * "use client" banner, so on the server every export (even plain functions) is a client
 * reference. Keep this in sync until junco ships it from a server-safe entry.
 */
export const THEME_SCRIPT = `(function(k,t,m){try{var s=localStorage;t=s.getItem(k+"-theme")||t;m=s.getItem(k+"-motion")||m}catch(e){}var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches),r=d?"dark":"light",e=document.documentElement;e.classList.toggle("dark",d);e.dataset.theme=r;e.dataset.motion=m;e.style.colorScheme=r})("junco","system","full")`;
