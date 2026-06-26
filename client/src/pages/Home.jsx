import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gift, RotateCcw, ShieldCheck, Truck, ChevronLeft, ChevronRight, Flame, Sparkles, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { LuxuryButton, OrnamentalDivider, PatternBackground, RoyalCategoryCard, SectionHeading } from '../components/RoyalUI';
import { products as fallbackProducts } from '../data/products';
import { api } from '../services/api';

const fallbackCategories = [['Attars', fallbackProducts[0].image], ['Eau de Parfum', fallbackProducts[1].image], ['Oud Collection', fallbackProducts[3].image], ['Gift Sets', fallbackProducts[2].image], ['Luxury Oils', fallbackProducts[4].image], ['Signature Scents', fallbackProducts[6].image]].map(([name, image], i) => ({ id: name, name, slug: name.toLowerCase().replace(/\s+/g, '-'), imageUrl: image, sortOrder: i }));
const fallbackSlide = { id: 'fallback', title: 'Royal fragrances crafted for unforgettable presence.', subtitle: 'Precious oud, luminous saffron and velvet florals, composed as an olfactory heirloom for those whose presence lingers.', imageUrl: fallbackProducts[3].image, ctaLabel: 'Shop Collection', ctaUrl: '/collection' };

export default function Home() {
  const [slides, setSlides] = useState([fallbackSlide]); const [categories, setCategories] = useState(fallbackCategories); const [products, setProducts] = useState(fallbackProducts); const [active, setActive] = useState(0);
  const [allProducts, setAllProducts] = useState(fallbackProducts);
  useEffect(() => { api.get('/catalog/slides').then(({ data }) => data.length && setSlides(data)).catch(() => { }); api.get('/catalog/categories').then(({ data }) => data.length && setCategories(data)).catch(() => { }); api.get('/products').then(({ data }) => { if (data.length) { setAllProducts(data); setProducts(data.filter(p => p.featured)) } }).catch(() => { }) }, []);
  useEffect(() => { if (slides.length < 2) return; const timer = setInterval(() => setActive(i => (i + 1) % slides.length), 4500); return () => clearInterval(timer) }, [slides.length, active]);
  useEffect(() => { if (active >= slides.length) setActive(0) }, [slides.length, active]);
  const slide = slides[active] || fallbackSlide;
  return <div>
    <section className="relative h-[580px] overflow-hidden bg-maroon pt-24 text-ivory md:h-[680px]">
      <Link to={slide.ctaUrl || '/collection'} className="absolute inset-0 block h-full w-full cursor-pointer z-10">
        <AnimatePresence><motion.img key={slide.id} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .4 }} src={slide.imageUrl} alt={slide.title} className="absolute inset-0 h-full w-full object-cover" /></AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-maroon/65 to-black/20" />
        <div className="absolute inset-0 arabesque opacity-40" />
        <div className="pointer-events-none absolute inset-5 border border-gold/35 md:inset-8" />
        <div className="relative mx-auto flex h-full max-w-[1380px] items-center px-8 pb-12 md:px-14 md:pb-16">
          <motion.div key={`${slide.id}-copy`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }} className="max-w-3xl">
            <p className="font-royal text-[10px] uppercase tracking-[.32em] text-champagne">The Royal Perfumery of Masion Jaziz</p>
            <h1 className="mt-5 font-display text-5xl leading-[1] sm:text-6xl md:text-[5rem] lg:text-[5.5rem]">{slide.title}</h1>
            <p className="mt-5 max-w-xl text-xs leading-6 text-ivory/75 md:text-sm md:leading-7">{slide.subtitle}</p>
          </motion.div>
        </div>
      </Link>
      {slides.length > 1 && <><button onClick={() => setActive(i => (i - 1 + slides.length) % slides.length)} aria-label="Previous slide" className="absolute left-6 top-1/2 z-20 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-gold/30 bg-maroon/40 text-champagne backdrop-blur-sm transition hover:bg-maroon hover:border-gold hover:text-white"><ChevronLeft size={20} strokeWidth={1.5} /></button><button onClick={() => setActive(i => (i + 1) % slides.length)} aria-label="Next slide" className="absolute right-6 top-1/2 z-20 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-gold/30 bg-maroon/40 text-champagne backdrop-blur-sm transition hover:bg-maroon hover:border-gold hover:text-white"><ChevronRight size={20} strokeWidth={1.5} /></button><div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">{slides.map((s, i) => <button key={s.id} onClick={() => setActive(i)} aria-label={`Show slide ${i + 1}`} className={`h-1 transition-all ${i === active ? 'w-10 bg-champagne' : 'w-5 bg-ivory/40'}`} />)}</div></>}</section>
    <section className="border-y border-gold/35 bg-ink text-ivory"><div className="mx-auto grid max-w-[1380px] divide-y divide-gold/20 px-6 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">{[[Truck, 'Complimentary delivery'], [Gift, 'Royal presentation'], [RotateCcw, 'Thirty-day returns'], [ShieldCheck, 'Authenticity assured']].map(([Icon, title]) => <div key={title} className="flex items-center justify-center gap-3 py-6 text-[9px] uppercase tracking-[.17em] text-ivory/70"><Icon size={17} strokeWidth={1.2} className="text-gold" />{title}</div>)}</div></section>

    <PatternBackground className="px-6 py-24 md:px-10 md:py-32" id="categories"><SectionHeading eyebrow="Curated rituals" title="Shop By Category" description="Enter a collection shaped by rare materials, ceremonial warmth and Arabian perfumery." /><div className="mx-auto mt-14 grid max-w-[1380px] gap-7 sm:grid-cols-2 lg:grid-cols-3">{categories.map(c => <RoyalCategoryCard key={c.id} title={c.name} image={c.imageUrl} to={`/collection?category=${c.slug}`} />)}</div></PatternBackground>
    <section id="royal-collection" className="bg-ivory px-6 py-24 md:px-10 md:py-32"><SectionHeading eyebrow="The signatures" title="The Royal Collection" description="Distinct compositions made to unfold slowly and remain beautifully." /><div className="mx-auto mt-14 grid max-w-[1380px] gap-7 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}</div><div className="mt-14 text-center"><LuxuryButton to="/collection?featured=true">View All</LuxuryButton></div></section>

    {/* Trending Showcase Section */}
    <section id="trending-showcase" className="bg-cream border-t border-gold/25 px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto flex flex-col items-center mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/45 bg-ivory text-gold shadow-md relative group">
          <div className="absolute inset-0.5 rounded-full border border-dashed border-gold/30"></div>
          <Flame size={22} className="text-gold animate-pulse" />
        </div>
      </div>
      <SectionHeading
        eyebrow="The Modern Pulse"
        title="Trending Now"
        description="Captivating scents capturing current imaginations, designed for bold and memorable impressions."
      />
      <div className="mx-auto mt-14 grid max-w-[1380px] gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {allProducts.filter(p => p.trending).slice(0, 4).map((p, i) => (
          <ProductCard key={p._id} product={p} index={i} />
        ))}
      </div>
      {allProducts.filter(p => p.trending).length === 0 && (
        <div className="text-center py-16">
          <p className="font-display text-2xl text-maroon/60">No trending fragrances yet.</p>
        </div>
      )}
    </section>

    {/* Most Selling Showcase Section */}
    <section id="most-selling-showcase" className="bg-ivory border-t border-gold/25 px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto flex flex-col items-center mb-8">
        <div className="flex h-14 w-14 items-center justify-center bg-maroon text-champagne shadow-md relative rotate-45 border border-gold/60">
          <div className="absolute inset-1 border border-gold/25"></div>
          <div className="-rotate-45 flex items-center justify-center">
            <Sparkles size={20} className="text-gold" />
          </div>
        </div>
      </div>
      <SectionHeading
        eyebrow="Maison Favorites"
        title="Most Selling"
        description="The defining favorites of the collection, celebrated for their exceptional sillage and lasting character."
      />
      <div className="mx-auto mt-14 grid max-w-[1380px] gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {allProducts.filter(p => p.mostSelling).slice(0, 4).map((p, i) => (
          <ProductCard key={p._id} product={p} index={i} />
        ))}
      </div>
      {allProducts.filter(p => p.mostSelling).length === 0 && (
        <div className="text-center py-16">
          <p className="font-display text-2xl text-maroon/60">No best selling fragrances yet.</p>
        </div>
      )}
    </section>

    {/* Premium Showcase Section */}
    <section id="premium-showcase" className="arabesque bg-maroon text-ivory border-t border-b border-gold/35 px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto flex flex-col items-center mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold bg-ink text-gold shadow-xl relative">
          <div className="absolute inset-1 rounded-full border border-gold/30"></div>
          <Crown size={24} className="text-champagne" />
        </div>
      </div>
      <SectionHeading
        light
        eyebrow="The Pinnacle of Artistry"
        title="Premium Collection"
        description="Masterfully composed olfactory masterpieces featuring extremely rare oils, pure aged ouds, and hand-tinctured resins."
      />
      <div className="mx-auto mt-14 grid max-w-[1380px] gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {allProducts.filter(p => p.premium || p.category?.slug === 'premium').slice(0, 4).map((p, i) => (
          <ProductCard key={p._id} product={p} index={i} />
        ))}
      </div>
      {allProducts.filter(p => p.premium || p.category?.slug === 'premium').length === 0 && (
        <div className="text-center py-16">
          <p className="font-display text-2xl text-champagne/60">No premium fragrances yet.</p>
        </div>
      )}
    </section>
  </div>;
}
