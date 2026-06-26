import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function LuxuryButton({to,children,variant='primary',className='',...props}){
  const cls=`${variant==='secondary'?'btn-light':'btn-dark'} ${className}`;
  return to?<Link to={to} className={cls} {...props}>{children}</Link>:<button className={cls} {...props}>{children}</button>;
}
export function PatternBackground({children,dark=false,className='',...props}){return <div className={`arabesque ${dark?'bg-maroon text-ivory':'bg-cream'} ${className}`} {...props}>{children}</div>}
export function OrnamentalDivider({light=false}){return <div className="mx-auto flex w-full max-w-xs items-center gap-3" aria-hidden="true"><span className={`h-px flex-1 ${light?'bg-champagne/45':'bg-gold/45'}`}/><span className={`text-xs ${light?'text-champagne':'text-gold'}`}>&diams;</span><span className={`h-px flex-1 ${light?'bg-champagne/45':'bg-gold/45'}`}/></div>}
export function SectionHeading({eyebrow,title,description,light=false}){return <div className="mx-auto max-w-3xl text-center"><p className={`font-royal text-[10px] uppercase tracking-[.3em] ${light?'text-champagne':'text-antique'}`}>{eyebrow}</p><h2 className={`mt-4 font-display text-5xl leading-none md:text-7xl ${light?'text-ivory':'text-maroon'}`}>{title}</h2><div className="mt-6"><OrnamentalDivider light={light}/></div>{description&&<p className={`mx-auto mt-6 max-w-2xl text-sm leading-7 ${light?'text-ivory/65':'text-ink/55'}`}>{description}</p>}</div>}
// Islamic Moorish arch — applied to image windows only
const ARCH = 'polygon(0% 100%, 0% 34%, 4% 24%, 10% 15%, 20% 8%, 34% 3%, 50% 0%, 66% 3%, 80% 8%, 90% 15%, 96% 24%, 100% 34%, 100% 100%)';
export function RoyalFrame({children,className=''}){
  return (
    <div className={`relative ${className}`} style={{
      border:'3px solid #c39a43',
      padding:'5px',
      background:'#faf5e8',
      boxShadow:'0 0 0 1px rgba(195,154,67,0.2), 0 10px 36px rgba(195,154,67,0.25), inset 0 1px 0 rgba(255,240,180,0.25)'
    }}>
      <div style={{border:'1.5px solid rgba(195,154,67,0.5)',height:'100%',padding:'8px'}}>
        {children}
      </div>
      {/* ✦ corner stars */}
      <span style={{position:'absolute',top:'7px',left:'7px',color:'#c39a43',fontSize:'11px',lineHeight:1,zIndex:3,pointerEvents:'none'}}>✦</span>
      <span style={{position:'absolute',top:'7px',right:'7px',color:'#c39a43',fontSize:'11px',lineHeight:1,zIndex:3,pointerEvents:'none'}}>✦</span>
      <span style={{position:'absolute',bottom:'7px',left:'7px',color:'#c39a43',fontSize:'11px',lineHeight:1,zIndex:3,pointerEvents:'none'}}>✦</span>
      <span style={{position:'absolute',bottom:'7px',right:'7px',color:'#c39a43',fontSize:'11px',lineHeight:1,zIndex:3,pointerEvents:'none'}}>✦</span>
    </div>
  );
}
export function RoyalCategoryCard({title,image,to='/collection'}){
  return <motion.div whileHover={{y:-7}} transition={{duration:.25}}>
    <Link to={to} className="group block">
      <RoyalFrame className="bg-cream">
        <div style={{clipPath:ARCH, background:'linear-gradient(180deg,#d4aa55 0%,#a6874e 60%,rgba(195,154,67,0.4) 100%)', padding:'4px'}}>
          <div style={{clipPath:ARCH, background:'#fcfbf7', padding:'2px'}}>
            <div style={{clipPath:ARCH, background:'linear-gradient(180deg,#d4aa55 0%,#a6874e 60%,rgba(195,154,67,0.4) 100%)', padding:'1.5px'}}>
              <div className="arabesque relative mx-auto aspect-[4/5] overflow-hidden bg-ivory" style={{clipPath:ARCH}}>
                <img src={image} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>
                <div className="absolute inset-0 bg-gradient-to-t from-maroon/70 via-transparent to-transparent"/>
                <h3 className="absolute inset-x-3 bottom-5 text-center font-display text-3xl text-ivory">{title}</h3>
              </div>
            </div>
          </div>
        </div>
      </RoyalFrame>
    </Link>
  </motion.div>;
}
