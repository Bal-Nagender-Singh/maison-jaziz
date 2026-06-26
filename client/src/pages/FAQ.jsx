import { useState, useEffect } from 'react';import { Plus } from 'lucide-react';import { AnimatePresence,motion } from 'framer-motion';import { OrnamentalDivider } from '../components/RoyalUI';import { api } from '../services/api';
export default function FAQ(){
  const [open,setOpen]=useState(0);
  const [faqs,setFaqs]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    api.get('/catalog/faqs')
      .then(r=>setFaqs(r.data))
      .catch(()=>setFaqs([]))
      .finally(()=>setLoading(false));
  },[]);
  return <div className="arabesque min-h-screen bg-cream px-6 pb-28 pt-36 md:px-10"><div className="mx-auto grid max-w-[1250px] gap-14 lg:grid-cols-[.65fr_1.35fr]"><div><p className="font-royal text-[10px] uppercase tracking-[.28em] text-antique">Client services</p><h1 className="mt-5 font-display text-6xl leading-none text-maroon md:text-8xl">How may we assist?</h1><div className="my-7"><OrnamentalDivider/></div><p className="max-w-sm text-sm leading-7 text-ink/55">For personal guidance, our client care team is available Monday through Saturday.</p></div><div className="border border-gold/45 bg-ivory p-4 md:p-7">{loading?<div className="py-16 text-center text-sm text-ink/40">Loading...</div>:faqs.length===0?<div className="py-16 text-center text-sm text-ink/40">No FAQs available yet.</div>:faqs.map(({id,question,answer},i)=><div key={id||i} className="border-b border-gold/30 last:border-0"><button onClick={()=>setOpen(open===i?-1:i)} aria-expanded={open===i} className="flex w-full items-center justify-between gap-5 py-6 text-left"><span className="font-display text-2xl text-maroon md:text-3xl">{question}</span><Plus size={18} className={`shrink-0 text-antique transition ${open===i?'rotate-45':''}`}/></button><AnimatePresence>{open===i&&<motion.p initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="max-w-2xl overflow-hidden pb-6 text-sm leading-7 text-ink/55">{answer}</motion.p>}</AnimatePresence></div>)}</div></div></div>

}

