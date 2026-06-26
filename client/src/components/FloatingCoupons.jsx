import { useState, useEffect } from 'react';
import { Ticket, X, Copy, Check, Gift } from 'lucide-react';
import { api } from '../services/api';

export default function FloatingCoupons() {
  const [isOpen, setIsOpen] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/catalog/coupons/public')
      .then(res => {
        setCoupons(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load public coupons:', err);
        setLoading(false);
      });
  }, []);

  const handleCopy = (code) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.warn('Fallback copy failed:', err);
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode('');
    }, 2000);
  };

  // Do not render anything if there are no coupons available
  if (!loading && coupons.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Button in Bottom-Left Corner */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 group flex items-center justify-center h-14 w-14 rounded-full bg-maroon border border-gold/60 text-gold shadow-glow hover:bg-gold hover:text-ink hover:border-gold transition-all duration-300 animate-bounce-subtle"
        title="View Available Gifts"
        aria-label="View Available Gifts"
      >
        <div className="absolute inset-0.5 rounded-full border border-gold/30 group-hover:border-ink/20" />
        <Gift size={24} className="transition-transform duration-300 group-hover:scale-110" />
        {coupons.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-ink text-[10px] font-bold border border-maroon">
            {coupons.length}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-md bg-ink text-ivory border-r border-gold/30 shadow-2xl transition-transform duration-500 ease-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Decorative Arabesque Border (Vertical Line) */}
        <div className="absolute top-0 right-0 bottom-0 w-[3px] bg-gradient-to-b from-gold/10 via-gold/50 to-gold/10" />
        
        {/* Grain overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#c39a43_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative flex flex-col h-full p-6 md:p-8">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gold/20 pb-4 mb-6">
            <div>
              <p className="font-royal text-[10px] uppercase tracking-luxury text-champagne">Exclusive Benefits</p>
              <h2 className="font-display text-3xl text-ivory mt-1">Maison Treasures</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 border border-gold/20 hover:border-gold/60 text-gold hover:text-champagne transition-all duration-300"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
            <p className="text-xs text-champagne/70 leading-relaxed font-sans">
              Discover active privileges and custom pricing created for our esteemed patrons. Apply any of the following coupon codes at checkout to unlock savings.
            </p>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
                <p className="text-xs text-champagne/40">Gathering privileges...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="relative border border-gold/35 bg-maroon/10 p-5 rounded-sm overflow-hidden group hover:border-gold/65 transition-all duration-300"
                  >
                    {/* Perforated ticket circles at the left and right border */}
                    <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full bg-ink border border-gold/35 transform -translate-y-1/2" />
                    <div className="absolute top-1/2 -right-2 w-4 h-4 rounded-full bg-ink border border-gold/35 transform -translate-y-1/2" />

                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div>
                        {/* Discount Value tag */}
                        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-gold text-ink font-royal tracking-wide rounded-sm">
                          {coupon.discountType === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                        </span>
                      </div>
                      
                      {/* Copy Action */}
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase border border-gold/30 px-2.5 py-1 text-champagne bg-gold/5 hover:bg-gold hover:text-ink transition-all duration-300"
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <Check size={12} className="text-emerald-400 group-hover:text-ink" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Coupon Code display */}
                    <div className="font-mono text-lg font-bold tracking-widest text-gold mb-2 select-all">
                      {coupon.code}
                    </div>

                    {/* Description */}
                    {coupon.description && (
                      <p className="text-[13px] text-ivory/80 leading-relaxed font-sans mb-3">
                        {coupon.description}
                      </p>
                    )}

                    {/* Scope details */}
                    <div className="border-t border-gold/15 pt-3 mt-3 space-y-1.5 text-[11px] text-champagne/80">
                      <div className="flex justify-between">
                        <span className="text-champagne/45 uppercase tracking-wider">Applicable To:</span>
                        <span className="font-semibold text-ivory">
                          {coupon.scope === 'all' && 'Storewide Collection'}
                          {coupon.scope === 'category' && `Category: ${coupon.category?.name || 'Selected Category'}`}
                          {coupon.scope === 'product' && `Product: ${coupon.product?.name || 'Selected Fragrance'}`}
                        </span>
                      </div>

                      {coupon.minimumOrder > 0 && (
                        <div className="flex justify-between">
                          <span className="text-champagne/45 uppercase tracking-wider">Min. Purchase:</span>
                          <span className="font-semibold text-ivory">₹{coupon.minimumOrder.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {coupon.maximumDiscount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-champagne/45 uppercase tracking-wider">Max. Discount:</span>
                          <span className="font-semibold text-ivory">₹{coupon.maximumDiscount.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {coupon.expiresAt && (
                        <div className="flex justify-between">
                          <span className="text-champagne/45 uppercase tracking-wider">Expires On:</span>
                          <span className="font-semibold text-ivory">
                            {new Date(coupon.expiresAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer of the Drawer */}
          <div className="border-t border-gold/20 pt-4 mt-6 text-center">
            <p className="text-[9px] uppercase tracking-luxury text-champagne/40">
              Masion Jaziz ◆ Est. 2026
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
