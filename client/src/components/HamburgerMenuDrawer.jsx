import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { UserRound, X } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

const links=[
  ['Home','/'],
  ['Trending','/#trending-showcase'],
  ['Most Selling','/#most-selling-showcase'],
  ['Premium','/#premium-showcase'],
  ['Categories','/#categories'],
  ['FAQ','/faq'],
  ['Contact','/faq#contact']
];

export default function HamburgerMenuDrawer({open,onClose}){
  const {user}=useAuth();
  useEffect(()=>{
    if(!open)return;
    document.body.classList.add('menu-open');
    const escape=e=>e.key==='Escape'&&onClose();
    addEventListener('keydown',escape);
    return()=>{document.body.classList.remove('menu-open');removeEventListener('keydown',escape)};
  },[open,onClose]);
  return <AnimatePresence>{open&&<div className="fixed inset-0 z-[70]">
    <motion.button aria-label="Close navigation" className="absolute inset-0 bg-black/65 backdrop-blur-sm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}/>
    <motion.aside role="dialog" aria-modal="true" aria-label="Main navigation" initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{duration:.42,ease:[.76,0,.24,1]}} className="arabesque absolute inset-y-0 left-0 flex w-[94%] max-w-[360px] flex-col overflow-y-auto bg-maroon p-3 text-ivory shadow-2xl">
      <div className="flex min-h-full flex-col border border-gold/70 p-6">
        <div className="flex items-center justify-between border-b border-gold/30 pb-6"><Logo light/><button onClick={onClose} aria-label="Close menu" className="grid h-10 w-10 place-items-center border border-gold/40 text-champagne transition hover:rotate-90 hover:bg-gold hover:text-maroon"><X size={19}/></button></div>
        <nav className="flex-1 py-7">{links.map(([label,to],i)=><motion.div key={label} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:.08+i*.035}} className="border-b border-gold/20"><NavLink onClick={onClose} to={to} className={({isActive})=>`group flex items-center justify-between py-3.5 font-display text-[1.7rem] leading-none transition hover:translate-x-1 hover:text-champagne ${isActive?'text-champagne':'text-ivory/90'}`}><span>{label}</span><span className="text-[8px] text-gold opacity-0 transition group-hover:opacity-100">◆</span></NavLink></motion.div>)}</nav>

        <p className="mt-8 text-center font-display text-sm italic text-ivory/45">Composed for those who leave a trace.</p>
      </div>
    </motion.aside>
  </div>}</AnimatePresence>
}
