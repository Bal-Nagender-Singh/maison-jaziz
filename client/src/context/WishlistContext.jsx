import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'user') {
      setLoading(true);
      api.get('/wishlist')
        .then(({ data }) => setWishlist(data))
        .catch(() => setWishlist([]))
        .finally(() => setLoading(false));
    } else {
      setWishlist([]);
    }
  }, [user]);

  const toggleWishlist = async (product) => {
    if (!user) {
      throw new Error('Unauthorized');
    }
    
    const exists = wishlist.some(item => item._id === product._id);
    
    if (exists) {
      // Remove from wishlist
      setWishlist(prev => prev.filter(item => item._id !== product._id));
      await api.delete(`/wishlist/${product._id}`);
    } else {
      // Add to wishlist
      setWishlist(prev => [...prev, product]);
      await api.post('/wishlist', { productId: product._id });
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
