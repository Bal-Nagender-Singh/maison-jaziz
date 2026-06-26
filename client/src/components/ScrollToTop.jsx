import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop(){
  const {pathname,hash}=useLocation();
  useLayoutEffect(()=>{
    if('scrollRestoration' in history)history.scrollRestoration='manual';
    return()=>{if('scrollRestoration' in history)history.scrollRestoration='auto'};
  },[]);
  useLayoutEffect(()=>{
    if(hash){
      const frame=requestAnimationFrame(()=>document.getElementById(hash.slice(1))?.scrollIntoView({block:'start'}));
      return()=>cancelAnimationFrame(frame);
    }
    window.scrollTo(0,0);
  },[pathname,hash]);
  return null;
}
