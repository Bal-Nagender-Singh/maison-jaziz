import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { MapPin, Navigation, Phone, Mail } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import ScrollToTop from './ScrollToTop';
import FloatingCoupons from './FloatingCoupons';
import { api } from '../services/api';

export default function Layout(){
  const [settings, setSettings] = useState({ google_maps_url: '', instagram_handle: '', facebook_handle: '', store_email: '', store_phone: '', store_address: '' });

  useEffect(() => {
    api.get('/catalog/settings')
      .then(res => setSettings(res.data))
      .catch(err => console.error('Failed to load store settings:', err));
  }, []);

  const hasLocation = settings.google_maps_url || settings.store_address;

  return <>
    <ScrollToTop/>
    <Header/>
    <main><Outlet/></main>

    {hasLocation && (
      <section className="arabesque bg-ink text-ivory border-t border-gold/35 px-6 py-20 md:px-10">
        <div className="mx-auto max-w-[1380px]">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="mx-auto flex flex-col items-center mb-6">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-gold/60 animate-pulse"/>
                <div className="absolute inset-2 rounded-full border border-gold/30"/>
                <MapPin size={24} className="text-gold relative z-10"/>
              </div>
            </div>
            <p className="font-royal text-[10px] uppercase tracking-[.32em] text-champagne">Find the Maison</p>
            <h2 className="mt-4 font-display text-5xl md:text-6xl text-ivory">Our Flagship Location</h2>
            <div className="mx-auto mt-5 flex w-full max-w-xs items-center gap-3">
              <span className="h-px flex-1 bg-gold/40"/><span className="text-gold text-xs">◆</span><span className="h-px flex-1 bg-gold/40"/>
            </div>
          </div>

          {/* Two-panel card */}
          <div className="mx-auto max-w-4xl border border-gold/45 overflow-hidden shadow-2xl grid md:grid-cols-2">

            {/* LEFT: Map link panel */}
            <div className="relative flex flex-col items-center justify-center gap-6 bg-maroon px-10 py-14 text-center overflow-hidden">
              {/* Arabesque corner marks */}
              <span className="absolute top-3 left-3 text-gold/30 text-2xl pointer-events-none">✦</span>
              <span className="absolute top-3 right-3 text-gold/30 text-2xl pointer-events-none">✦</span>
              <span className="absolute bottom-3 left-3 text-gold/30 text-2xl pointer-events-none">✦</span>
              <span className="absolute bottom-3 right-3 text-gold/30 text-2xl pointer-events-none">✦</span>
              <div className="absolute inset-4 border border-gold/20 pointer-events-none"/>

              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold/70 bg-ink/40 shadow-xl relative">
                <div className="absolute inset-1.5 rounded-full border border-gold/25"/>
                <Navigation size={30} className="text-gold"/>
              </div>

              <div>
                <p className="font-royal text-[9px] uppercase tracking-[.3em] text-champagne/70 mb-2">Visit Us</p>
                <h3 className="font-display text-3xl text-ivory mb-1">Maison Jaziz</h3>
                <p className="text-xs text-champagne/60 tracking-wider">Royal Perfumery</p>
              </div>

              {settings.google_maps_url ? (
                <a
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-3 border border-gold/60 bg-gold/10 px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[.22em] text-champagne transition-all duration-300 hover:bg-gold hover:text-ink hover:border-gold"
                >
                  <MapPin size={13} className="transition-transform group-hover:scale-110"/>
                  Open in Google Maps
                </a>
              ) : (
                <span className="text-xs text-champagne/40 italic">No map link set</span>
              )}
            </div>

            {/* RIGHT: Address panel */}
            <div className="flex flex-col justify-center gap-6 bg-ink/90 border-l border-gold/30 px-10 py-14">
              <div className="border-b border-gold/25 pb-5">
                <p className="font-royal text-[9px] uppercase tracking-[.3em] text-gold mb-3">Store Address</p>
                {settings.store_address ? (
                  <p className="font-display text-2xl text-ivory leading-snug whitespace-pre-line">{settings.store_address}</p>
                ) : (
                  <p className="text-sm text-ivory/35 italic">No address configured</p>
                )}
              </div>

              <div className="space-y-4">
                {settings.store_phone && (
                  <a href={`tel:${settings.store_phone}`} className="flex items-center gap-3 group">
                    <div className="flex h-9 w-9 items-center justify-center border border-gold/35 bg-gold/10 text-gold group-hover:bg-gold group-hover:text-ink transition-all shrink-0">
                      <Phone size={14}/>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[.2em] text-champagne/50 mb-0.5">Phone</p>
                      <p className="text-sm text-ivory/80 group-hover:text-champagne transition">{settings.store_phone}</p>
                    </div>
                  </a>
                )}
                {settings.store_email && (
                  <a href={`mailto:${settings.store_email}`} className="flex items-center gap-3 group">
                    <div className="flex h-9 w-9 items-center justify-center border border-gold/35 bg-gold/10 text-gold group-hover:bg-gold group-hover:text-ink transition-all shrink-0">
                      <Mail size={14}/>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[.2em] text-champagne/50 mb-0.5">Email</p>
                      <p className="text-sm text-ivory/80 group-hover:text-champagne transition">{settings.store_email}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    )}

    <Footer settings={settings}/>
    <CartDrawer/>
    <FloatingCoupons/>
  </>;
}

