import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { OrnamentalDivider, RoyalFrame } from '../components/RoyalUI';

export default function ProductDetail(){
  const {slug}=useParams();
  const [product,setProduct]=useState(null);
  const [loading,setLoading]=useState(true);
  const [qty,setQty]=useState(1);
  const {add}=useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(()=>{
    setLoading(true);
    setProduct(null);
    api.get(`/products/${slug}`)
      .then(({data})=>{ setProduct(data); setGalleryIndex(0); })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[slug]);

  useEffect(() => {
    if (product?.sizes?.length) setSelectedSize(product.sizes[0].size);
    else if (product) setSelectedSize(product.size);
  }, [product]);

  // Loading skeleton
  if(loading) return (
    <div className="pt-20 min-h-screen">
      <section className="arabesque bg-cream px-5 py-12 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-[1320px] items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div className="mx-auto w-full max-w-2xl">
            <div className="aspect-[4/5] w-full rounded-sm bg-gradient-to-br from-gold/10 via-champagne/30 to-gold/10 animate-pulse" style={{borderRadius:'999px 999px 8px 8px / 55% 55% 8px 8px'}}/>
          </div>
          <div className="space-y-5 max-w-xl">
            <div className="h-3 w-28 rounded bg-gold/20 animate-pulse"/>
            <div className="h-14 w-4/5 rounded bg-gold/15 animate-pulse"/>
            <div className="h-px w-full bg-gold/25"/>
            <div className="h-6 w-32 rounded bg-gold/20 animate-pulse"/>
            <div className="h-4 w-full rounded bg-gold/10 animate-pulse"/>
            <div className="h-4 w-5/6 rounded bg-gold/10 animate-pulse"/>
            <div className="h-4 w-3/4 rounded bg-gold/10 animate-pulse"/>
            <div className="flex gap-3 pt-4">
              <div className="h-14 w-28 rounded bg-gold/15 animate-pulse"/>
              <div className="h-14 flex-1 rounded bg-gold/25 animate-pulse"/>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  if(!product) return (
    <div className="min-h-screen pt-40 text-center">
      <p className="font-royal text-xs uppercase tracking-[.25em] text-antique mb-4">Maison Jaziz</p>
      <p className="font-display text-5xl text-maroon">Fragrance not found.</p>
      <p className="mt-4 text-sm text-ink/50">This fragrance may have been removed or the link is incorrect.</p>
    </div>
  );

  const activeSizeObj = product.sizes?.find(s => s.size === selectedSize) || { size: product.size, price: product.price, stock: product.stock };

  // Build the full image gallery: cover image first, then additional gallery images
  const galleryImages = (() => {
    const imgs = [];
    if (product.image) imgs.push({ url: product.image, alt: product.imageAlt || product.name });
    (product.images || []).forEach(img => {
      if (img.url && img.url !== product.image) imgs.push({ url: img.url, alt: img.alt || product.name });
    });
    return imgs.length > 0 ? imgs : [{ url: product.image, alt: product.name }];
  })();

  const hasMultiple = galleryImages.length > 1;

  const navigate = (dir) => {
    setDirection(dir);
    setGalleryIndex(i => (i + dir + galleryImages.length) % galleryImages.length);
  };

  const variants = {
    enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 })
  };

  return <div className="pt-20">
    <section className="arabesque bg-cream px-5 py-12 md:px-10 md:py-20"><div className="mx-auto grid max-w-[1320px] items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
      <motion.div initial={{opacity:0}} animate={{opacity:1}}>
        <RoyalFrame className="mx-auto max-w-2xl">
          {/* Outer gold arch border + inner arch image */}
          <div className="relative" style={{aspectRatio:'4/5'}}>
            {/* Gold arch border layer */}
            <div style={{clipPath:'polygon(0% 100%, 0% 34%, 4% 24%, 10% 15%, 20% 8%, 34% 3%, 50% 0%, 66% 3%, 80% 8%, 90% 15%, 96% 24%, 100% 34%, 100% 100%)',background:'linear-gradient(180deg,#d4aa55 0%,#a6874e 60%,rgba(195,154,67,0.3) 100%)',padding:'4px',height:'100%'}}>
              {/* Inner ivory spacer */}
              <div style={{clipPath:'polygon(0% 100%, 0% 34%, 4% 24%, 10% 15%, 20% 8%, 34% 3%, 50% 0%, 66% 3%, 80% 8%, 90% 15%, 96% 24%, 100% 34%, 100% 100%)',background:'#fcfbf7',padding:'2px',height:'100%'}}>
                {/* Inner gold arch line */}
                <div style={{clipPath:'polygon(0% 100%, 0% 34%, 4% 24%, 10% 15%, 20% 8%, 34% 3%, 50% 0%, 66% 3%, 80% 8%, 90% 15%, 96% 24%, 100% 34%, 100% 100%)',background:'linear-gradient(180deg,#d4aa55 0%,#a6874e 60%,rgba(195,154,67,0.3) 100%)',padding:'1.5px',height:'100%'}}>
                  {/* Inner image layer */}
                  <div className="relative overflow-hidden bg-cream" style={{clipPath:'polygon(0% 100%, 0% 34%, 4% 24%, 10% 15%, 20% 8%, 34% 3%, 50% 0%, 66% 3%, 80% 8%, 90% 15%, 96% 24%, 100% 34%, 100% 100%)',height:'100%'}}>
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                      <motion.img
                        key={galleryIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.35 }}
                        src={galleryImages[galleryIndex].url}
                        alt={galleryImages[galleryIndex].alt}
                        className="h-full w-full object-cover absolute inset-0"
                      />
                    </AnimatePresence>
                    <span className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-maroon/90 px-4 py-2 text-[8px] uppercase tracking-[.2em] text-champagne z-10">Extrait de parfum</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prev/Next arrows – outside clip, always visible */}
            {hasMultiple && (
              <>
                <button onClick={() => navigate(-1)} className="absolute left-2 top-[45%] -translate-y-1/2 z-20 bg-maroon/80 hover:bg-maroon text-champagne p-2 transition" aria-label="Previous image">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => navigate(1)} className="absolute right-2 top-[45%] -translate-y-1/2 z-20 bg-maroon/80 hover:bg-maroon text-champagne p-2 transition" aria-label="Next image">
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip – only shown when multiple images */}
          {hasMultiple && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setDirection(idx > galleryIndex ? 1 : -1); setGalleryIndex(idx); }}
                  className={`flex-shrink-0 h-16 w-14 overflow-hidden border-2 transition ${idx === galleryIndex ? 'border-gold' : 'border-gold/20 opacity-60 hover:opacity-90'}`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </RoyalFrame>
      </motion.div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.15}} className="max-w-xl"><p className="font-royal text-[10px] uppercase tracking-[.28em] text-antique">{product.family}</p><h1 className="mt-4 font-display text-6xl leading-none text-maroon md:text-8xl">{product.name}</h1><div className="my-6"><OrnamentalDivider/></div><div className="flex items-center gap-5"><span className="font-royal text-xl text-antique">INR {Number(activeSizeObj.price).toLocaleString('en-IN')}</span><span className="text-xs text-ink/40">{activeSizeObj.size} / Selection</span></div><p className="mt-7 text-sm font-light leading-7 text-ink/65">{product.description}</p>
      
      {product.sizes?.length > 0 && (
        <div className="mt-6 border-y border-gold/20 py-4">
          <p className="font-royal text-[9px] uppercase tracking-[.2em] text-maroon/55 mb-3">Select Size</p>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map(s => (
              <button 
                key={s.size} 
                type="button" 
                onClick={() => setSelectedSize(s.size)} 
                className={`px-4 py-2 text-[9px] uppercase tracking-wider border transition ${selectedSize === s.size ? 'border-gold bg-maroon text-champagne font-bold shadow-royal-sm' : 'border-gold/30 bg-ivory text-ink/60 hover:border-gold/60'}`}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8"><p className="font-royal text-[9px] uppercase tracking-[.2em] text-maroon/55">Fragrance notes &amp; accords</p><div className="mt-4 flex flex-wrap gap-2">{(product.accords||product.notes).map(x=><span className="border border-gold/45 bg-ivory/70 px-4 py-2 text-[9px] uppercase tracking-[.14em]" key={x}>{x}</span>)}</div></div><div className="mt-9 flex gap-3"><div className="flex items-center border border-gold/50 bg-ivory"><button className="p-4" aria-label="Decrease quantity" onClick={()=>setQty(Math.max(1,qty-1))}><Minus size={13}/></button><span className="w-7 text-center text-xs">{qty}</span><button className="p-4" aria-label="Increase quantity" onClick={()=>setQty(Math.min(10,qty+1))}><Plus size={13}/></button></div><button className="btn-dark flex-1" disabled={activeSizeObj.stock<=0} onClick={()=>add({...product, size: activeSizeObj.size, price: activeSizeObj.price, stock: activeSizeObj.stock},qty)}>Add to Cart - INR {(activeSizeObj.price*qty).toLocaleString('en-IN')}</button></div><p className="mt-4 text-center text-[9px] uppercase tracking-[.15em] text-ink/45">{activeSizeObj.stock>0?'In stock - ships within 24 hours':'Currently unavailable'}</p></motion.div>
    </div></section>
    <section className="arabesque bg-maroon px-6 py-24 text-ivory md:px-10 md:py-32"><div className="mx-auto max-w-[1200px]"><div className="text-center"><p className="font-royal text-[10px] uppercase tracking-[.28em] text-champagne">The lasting impression</p><h2 className="mt-4 font-display text-5xl md:text-7xl">Why you'll love it</h2></div><div className="mt-12 grid gap-7 md:grid-cols-3">{(product.loveReasons||['Exceptional materials','Long-lasting extrait concentration','Hand-finished presentation']).map((x,i)=><div key={x} className="border border-gold/35 p-7 text-center"><span className="font-royal text-sm text-gold">0{i+1}</span><p className="mt-6 font-display text-3xl">{x}</p></div>)}</div><div className="mt-16 grid gap-6 border-t border-gold/30 pt-10 md:grid-cols-3">{[[Truck,'Complimentary delivery'],[Sparkles,'Luxury gift presentation'],[ShieldCheck,'Authenticity assured']].map(([I,t])=><div className="flex items-center justify-center gap-4 text-xs text-ivory/65" key={t}><I strokeWidth={1} className="text-gold"/>{t}</div>)}</div></div></section>
  </div>;
}
