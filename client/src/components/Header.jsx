import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import Logo from './Logo';
import HamburgerMenuDrawer from './HamburgerMenuDrawer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function AccountButton(){const {user}=useAuth();return <Link to={user?'/account':'/login'} aria-label={user?'Open account':'Login'} className="flex items-center gap-2 text-champagne transition hover:text-white"><UserRound size={19} strokeWidth={1.35}/><span className="hidden max-w-28 truncate text-[9px] uppercase tracking-[.15em] sm:block">{user?(user.name||user.email||'Account'):'Login'}</span></Link>}
export function CartIconButton(){const {count,setOpen}=useCart();return <button onClick={()=>setOpen(true)} aria-label={`Shopping bag, ${count} items`} className="relative text-champagne transition hover:text-white"><ShoppingBag size={20} strokeWidth={1.35}/>{count>0&&<span className="absolute -right-2.5 -top-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[8px] font-bold text-maroon">{count}</span>}</button>}

export default function Header(){
  const [menu,setMenu]=useState(false);const [scrolled,setScrolled]=useState(false);const {pathname}=useLocation();
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();

  const close=useCallback(()=>setMenu(false),[]);

  useEffect(()=>{
    const fn=()=>setScrolled(scrollY>25);
    fn();
    addEventListener('scroll',fn,{passive:true});
    return()=>removeEventListener('scroll',fn);
  },[]);

  useEffect(()=>{
    api.get('/products').then(({data})=>setAllProducts(data)).catch(()=>{});
  },[]);

  useEffect(()=>{
    close();
    setSearchActive(false);
    setSearchQuery('');
    setShowDropdown(false);
  },[pathname,close]);
  const getSearchSuggestions = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const suggestions = [];
    
    if (q.startsWith('und') || 'under'.startsWith(q) || q.startsWith('les') || 'less than'.startsWith(q)) {
      const prices = allProducts.map(p => {
        return p.sizes?.length > 0
          ? Math.min(...p.sizes.map(s => s.price))
          : p.price;
      });

      if (prices.length > 0) {
        const thresholds = [200, 300, 500, 1000, 1500, 2000, 3000, 5000];
        thresholds.forEach(th => {
          const count = prices.filter(p => p < th).length;
          if (count > 0) {
            const phrase = `under ${th}`;
            if (phrase.startsWith(q) || q.includes(th.toString()) || 'under '.startsWith(q) || q.startsWith('under')) {
              suggestions.push(phrase);
            }
          }
        });
      }
    }

    const tags = ['oud', 'rose', 'premium', 'featured'];
    tags.forEach(t => {
      if (t.startsWith(q) && t !== q) {
        suggestions.push(t.charAt(0).toUpperCase() + t.slice(1));
      }
    });

    if (/^\d+$/.test(q)) {
      const thresholds = [200, 300, 500, 1000, 1500, 2000, 3000, 5000];
      thresholds.forEach(th => {
        if (th.toString().startsWith(q)) {
          suggestions.push(`under ${th}`);
        }
      });
    }

    return Array.from(new Set(suggestions)).slice(0, 5);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchActive(false);
      setShowDropdown(false);
      navigate(`/collection?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const parseSearchQuery = (query, list) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // Smart Price Query Parsing (e.g. "under 500", "< 500", "less than 500")
    const underMatch = q.match(/under\s+(\d+)/) || q.match(/less\s+than\s+(\d+)/) || q.match(/<\s*(\d+)/);
    if (underMatch) {
      const priceLimit = parseFloat(underMatch[1]);
      return list.filter(p => {
        const minPrice = p.sizes?.length > 0
          ? Math.min(...p.sizes.map(s => s.price))
          : p.price;
        return minPrice < priceLimit;
      });
    }

    const overMatch = q.match(/over\s+(\d+)/) || q.match(/more\s+than\s+(\d+)/) || q.match(/>\s*(\d+)/);
    if (overMatch) {
      const priceLimit = parseFloat(overMatch[1]);
      return list.filter(p => {
        const maxPrice = p.sizes?.length > 0
          ? Math.max(...p.sizes.map(s => s.price))
          : p.price;
        return maxPrice > priceLimit;
      });
    }

    // Starts with match (e.g., "ab" matches "ab...")
    const startingWith = list.filter(p => p.name.toLowerCase().startsWith(q));
    if (startingWith.length > 0) {
      return startingWith;
    }

    // Contains match
    return list.filter(
      p => p.name.toLowerCase().includes(q) || p.family.toLowerCase().includes(q)
    );
  };

  return <>
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${scrolled?'border-gold/55 bg-maroon/95 py-3 shadow-royal backdrop-blur-lg':'border-gold/25 bg-maroon/90 py-4 backdrop-blur-md'}`}>
      <div className="mx-auto grid max-w-[1480px] grid-cols-[auto_1fr_auto] md:grid-cols-3 items-center px-5 md:px-10">
        <button onClick={()=>setMenu(true)} aria-label="Open navigation" aria-expanded={menu} className="w-fit text-champagne transition hover:text-white"><Menu size={24} strokeWidth={1.4}/></button>
        
        {/* Centered Logo, hidden on narrow screens if search is active to fit input */}
        <div className={`justify-self-center ${searchActive ? 'hidden sm:block' : ''}`}>
          <Logo light/>
        </div>

        <div className="flex items-center justify-end gap-4 sm:gap-5 relative col-start-3">
          {searchActive ? (
            <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-cream/10 border border-gold/45 px-3 py-1.5 rounded-sm w-[160px] sm:w-[260px]">
              <input
                type="text"
                autoFocus
                className="w-full bg-transparent text-xs text-champagne placeholder-gold/45 focus:outline-none pr-4"
                placeholder="Search..."
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="button" onClick={() => setSearchActive(false)} className="absolute right-2 text-gold hover:text-white">
                <X size={12} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchActive(true)} aria-label="Search collection" className="text-champagne transition hover:text-white">
              <Search size={19} strokeWidth={1.35}/>
            </button>
          )}

          <AccountButton/>
          <CartIconButton/>

          {/* Floating Dropdown Panel */}
          {searchActive && showDropdown && (
            <div className="absolute top-full right-0 mt-3 w-[290px] sm:w-[480px] bg-ivory border border-gold/30 shadow-royal p-4 text-maroon z-[999] overflow-y-auto max-h-[420px] rounded-sm">
              {!searchQuery.trim() ? (
                <div>
                  {/* Trending Searches */}
                  <div className="mb-4">
                    <p className="font-royal text-[9px] uppercase tracking-luxury text-antique mb-2">Trending Searches</p>
                    <div className="flex flex-wrap gap-2">
                      {['Oud', 'Rose', 'Premium', 'Featured', 'Under 500'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchQuery(tag);
                          }}
                          className="bg-cream border border-gold/20 hover:border-gold px-2.5 py-1 text-[9px] uppercase tracking-wider text-antique font-semibold transition"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recommended For You */}
                  <div>
                    <p className="font-royal text-[9px] uppercase tracking-luxury text-antique mb-2">Recommended For You</p>
                    <div className="grid grid-cols-2 gap-3">
                      {allProducts.slice(0, 4).map(p => {
                        const minPrice = p.sizes?.length > 0 ? Math.min(...p.sizes.map(s => s.price)) : p.price;
                        return (
                          <Link
                            key={p._id}
                            to={`/product/${p.slug}`}
                            className="flex items-center gap-2 p-1.5 border border-gold/10 hover:border-gold/30 bg-cream/20 transition rounded-sm"
                          >
                            <img src={p.image} className="h-10 w-8 object-cover border border-gold/20 shrink-0" alt="" />
                            <div className="min-w-0">
                              <h4 className="font-display text-xs text-maroon truncate leading-tight">{p.name}</h4>
                              <p className="text-[9px] text-antique">₹{minPrice}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Search Results / Suggestions */
                <div>
                  {/* Query Suggestions / Autocomplete */}
                  {getSearchSuggestions(searchQuery).length > 0 && (
                    <div className="mb-3 pb-2 border-b border-gold/15">
                      <p className="font-royal text-[8px] uppercase tracking-luxury text-antique mb-1.5">Suggestions</p>
                      <div className="flex flex-wrap gap-2">
                        {getSearchSuggestions(searchQuery).map(s => (
                          <button
                            key={s}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSearchQuery(s);
                            }}
                            className="flex items-center gap-1 bg-gold/10 border border-gold/30 px-2 py-0.5 rounded-sm text-[10px] text-maroon hover:bg-gold/20 font-semibold"
                          >
                            <Search size={10} className="text-gold" />
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="font-royal text-[9px] uppercase tracking-luxury text-antique mb-2">Recommendations</p>
                  {parseSearchQuery(searchQuery, allProducts).length > 0 ? (
                    <div className="space-y-2">
                      {parseSearchQuery(searchQuery, allProducts).map(p => {
                        const minPrice = p.sizes?.length > 0 ? Math.min(...p.sizes.map(s => s.price)) : p.price;
                        return (
                          <Link
                            key={p._id}
                            to={`/product/${p.slug}`}
                            className="flex items-center gap-3 p-2 border border-gold/10 hover:border-gold/30 bg-cream/20 transition rounded-sm"
                          >
                            <img src={p.image} className="h-11 w-9 object-cover border border-gold/20 shrink-0" alt="" />
                            <div className="flex-1 min-w-0 text-left">
                              <h4 className="font-display text-xs text-maroon truncate leading-tight">{p.name}</h4>
                              <p className="text-[8px] text-ink/50 truncate">{p.family} / {p.notes?.slice(0, 3).join(' • ')}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-royal text-[10px] text-antique">₹{minPrice}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-[10px] text-ink/40 py-4 uppercase font-royal tracking-wider">No products match search</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
    <HamburgerMenuDrawer open={menu} onClose={close}/>
  </>
}
