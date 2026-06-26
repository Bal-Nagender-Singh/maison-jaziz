import { Instagram, Facebook } from 'lucide-react';import { Link } from 'react-router-dom';import Logo from './Logo';import { OrnamentalDivider } from './RoyalUI';
export default function Footer({settings}){return <footer className="arabesque border-t border-gold/40 bg-ink text-ivory"><div className="mx-auto max-w-[1380px] px-6 py-16 md:px-10 md:py-20"><div className="grid gap-12 md:grid-cols-[1.6fr_1fr] md:items-center md:gap-16 border-b border-gold/25 pb-14">

  {/* LEFT: Brand identity */}
  <div className="flex flex-col items-start gap-6">
    <Logo light/>
    <p className="font-display text-lg italic text-ivory/65 max-w-sm">Masion Jaziz — composed for those who leave a trace.</p>
    <div className="flex items-center gap-3">
      {settings?.instagram_handle ? (
        <a href={settings.instagram_handle.startsWith('http') ? settings.instagram_handle : `https://instagram.com/${settings.instagram_handle.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center border border-gold/40 bg-gold/10 text-champagne transition-all duration-300 hover:bg-gold hover:text-ink hover:border-gold"><Instagram size={20}/></a>
      ) : (
        <div className="flex h-11 w-11 items-center justify-center border border-gold/20 text-champagne/25"><Instagram size={20}/></div>
      )}
      {settings?.facebook_handle ? (
        <a href={settings.facebook_handle.startsWith('http') ? settings.facebook_handle : `https://facebook.com/${settings.facebook_handle}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center border border-gold/40 bg-gold/10 text-champagne transition-all duration-300 hover:bg-gold hover:text-ink hover:border-gold"><Facebook size={20}/></a>
      ) : (
        <div className="flex h-11 w-11 items-center justify-center border border-gold/20 text-champagne/25"><Facebook size={20}/></div>
      )}
    </div>
    {(settings?.store_email || settings?.store_phone) && (
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.18em] text-champagne/70 font-medium">
        {settings.store_email && <a href={`mailto:${settings.store_email}`} className="hover:text-champagne transition">{settings.store_email}</a>}
        {settings.store_phone && <a href={`tel:${settings.store_phone}`} className="hover:text-champagne transition">{settings.store_phone}</a>}
      </div>
    )}
  </div>

  {/* RIGHT: Nav links */}
  <div className="grid grid-cols-2 gap-x-10 gap-y-8">
    <div>
      <p className="font-royal text-[9px] uppercase tracking-[.22em] text-champagne mb-5">Explore</p>
      <div className="grid gap-3 text-sm text-ivory/60">
        <Link to="/collection" className="transition hover:translate-x-1 hover:text-champagne">Shop</Link>
      </div>
    </div>
    <div>
      <p className="font-royal text-[9px] uppercase tracking-[.22em] text-champagne mb-5">Help</p>
      <div className="grid gap-3 text-sm text-ivory/60">
        <Link to="/account" className="transition hover:translate-x-1 hover:text-champagne">Account</Link>
        <Link to="/faq" className="transition hover:translate-x-1 hover:text-champagne">FAQ</Link>
      </div>
    </div>
  </div>

</div>
<p className="pt-6 text-center text-[8px] uppercase tracking-[.18em] text-ivory/25">Copyright {new Date().getFullYear()} Masion Jaziz. All rights reserved.</p>
</div></footer>}

