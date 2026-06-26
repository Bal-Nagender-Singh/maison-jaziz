import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import { api } from '../services/api';

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      api.get('/products')
        .then(({ data }) => setProducts(data))
        .catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }

    // Smart Price Query Parsing (e.g. "under 500", "< 500", "less than 500")
    const underMatch = q.match(/under\s+(\d+)/) || q.match(/less\s+than\s+(\d+)/) || q.match(/<\s*(\d+)/);
    if (underMatch) {
      const priceLimit = parseFloat(underMatch[1]);
      const matched = products.filter(p => {
        const minPrice = p.sizes?.length > 0
          ? Math.min(...p.sizes.map(s => s.price))
          : p.price;
        return minPrice < priceLimit;
      });
      setResults(matched);
      return;
    }

    const overMatch = q.match(/over\s+(\d+)/) || q.match(/more\s+than\s+(\d+)/) || q.match(/>\s*(\d+)/);
    if (overMatch) {
      const priceLimit = parseFloat(overMatch[1]);
      const matched = products.filter(p => {
        const maxPrice = p.sizes?.length > 0
          ? Math.max(...p.sizes.map(s => s.price))
          : p.price;
        return maxPrice > priceLimit;
      });
      setResults(matched);
      return;
    }

    // Matches products starting with typed query (e.g. "ab" for "ab...")
    const startingWith = products.filter(p => p.name.toLowerCase().startsWith(q));
    if (startingWith.length > 0) {
      setResults(startingWith);
      return;
    }

    // Default contains matching
    const matched = products.filter(
      p => p.name.toLowerCase().includes(q) || p.family.toLowerCase().includes(q)
    );
    setResults(matched);
  }, [query, products]);

  if (!open) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/collection?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleItemClick = (slug) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-maroon/95 backdrop-blur-md px-6 py-20 md:px-10 text-champagne">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 text-gold transition hover:scale-105 hover:text-white"
        aria-label="Close search"
      >
        <X size={28} strokeWidth={1.5} />
      </button>

      <div className="mx-auto w-full max-w-3xl">
        <p className="text-center font-royal text-[10px] uppercase tracking-[.25em] text-gold/70 mb-4">
          Maison de Parfum Search
        </p>
        <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-gold/45 pb-4">
          <Search size={22} className="text-gold mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent font-display text-2xl md:text-4xl text-champagne placeholder-gold/30 focus:outline-none"
            placeholder="Type e.g., 'ab', 'under 500', 'Rose'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        {/* Dynamic Recommendations / Suggestions */}
        <div className="mt-8 overflow-y-auto max-h-[60vh] space-y-4 pr-2">
          {query.trim() && (
            <p className="font-royal text-[9px] uppercase tracking-[.18em] text-gold/50 mb-4">
              Recommendations ({results.length} found)
            </p>
          )}

          {results.map((p) => {
            const minPrice = p.sizes?.length > 0 ? Math.min(...p.sizes.map(s => s.price)) : p.price;
            const sizeStr = p.sizes?.length > 0 ? p.sizes[0].size : p.size;
            return (
              <button
                key={p._id}
                onClick={() => handleItemClick(p.slug)}
                className="w-full text-left flex items-center gap-4 p-3 border border-gold/15 bg-ivory/5 transition hover:bg-gold/10 hover:border-gold/45"
              >
                <img
                  src={p.image}
                  className="h-16 w-12 object-cover border border-gold/30 shrink-0"
                  alt={p.name}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg text-white truncate">{p.name}</h3>
                  <p className="text-[10px] text-gold/70 truncate">{p.family} / {p.notes?.join(' • ')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-royal text-xs text-gold">₹{minPrice}</p>
                  <p className="text-[9px] text-gold/50">{sizeStr}</p>
                </div>
              </button>
            );
          })}

          {query.trim() && results.length === 0 && (
            <p className="text-center text-sm text-gold/50 py-10 font-royal uppercase tracking-wider">
              No fragrances match your request.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
