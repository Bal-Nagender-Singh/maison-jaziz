import { motion } from 'framer-motion';
import { Plus, Heart } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { RoyalFrame } from './RoyalUI';

// Shared arch polygon – Islamic Moorish pointed arch
const ARCH = 'polygon(0% 100%, 0% 34%, 4% 24%, 10% 15%, 20% 8%, 34% 3%, 50% 0%, 66% 3%, 80% 8%, 90% 15%, 96% 24%, 100% 34%, 100% 100%)';

export default function ProductCard({product,index=0}){
  const {add}=useCart();
  const {user}=useAuth();
  const {toggleWishlist,isInWishlist}=useWishlist();
  const navigate=useNavigate();
  const location=useLocation();
  
  const isWishlisted=isInWishlist(product._id);
  
  const handleWishlist=async e=>{
    e.preventDefault();
    e.stopPropagation();
    if(!user){
      navigate('/login',{state:{from:location}});
      return;
    }
    try{
      await toggleWishlist(product);
    }catch(err){
      console.error(err);
    }
  };

  return <motion.article initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-40px'}} transition={{delay:(index%4)*.055,duration:.5}} whileHover={{y:-7}} className="group h-full">
    <RoyalFrame className="h-full transition duration-300">
      <div className="flex h-full flex-col bg-ivory">
        {/* Image wrapper — outer gold arch border + inner arch image */}
        <div className="relative">
          {/* Outer gold arch (acts as border) */}
          <div style={{clipPath:ARCH, background:'linear-gradient(180deg,#d4aa55 0%,#a6874e 60%,rgba(195,154,67,0.4) 100%)', padding:'4px'}}>
            {/* Inner ivory arch spacer */}
            <div style={{clipPath:ARCH, background:'#fcfbf7', padding:'2px'}}>
              {/* Inner gold arch line */}
              <div style={{clipPath:ARCH, background:'linear-gradient(180deg,#d4aa55 0%,#a6874e 60%,rgba(195,154,67,0.4) 100%)', padding:'1.5px'}}>
                {/* Inner ivory arch with image */}
                <div className="arabesque relative overflow-hidden bg-cream" style={{clipPath:ARCH, aspectRatio:'4/5'}}>
                  <Link to={`/product/${product.slug}`} className="block h-full w-full">
                    <img src={product.image} alt={product.imageAlt||`${product.name} perfume bottle`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-maroon/30 via-transparent to-transparent"/>
                    <span className="absolute left-1/2 bottom-6 -translate-x-1/2 whitespace-nowrap bg-maroon/90 px-3 py-1.5 text-[8px] uppercase tracking-[.18em] text-champagne">{product.family}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* Heart button — sits OUTSIDE the clipped arch, on the wrapper */}
          <button onClick={handleWishlist} className="absolute right-3 top-[36%] z-20 flex h-8 w-8 items-center justify-center rounded-full border border-gold/50 bg-ivory/90 text-maroon shadow-md transition-all hover:scale-105 hover:bg-gold hover:text-white" aria-label={isWishlisted?'Remove from wishlist':'Add to wishlist'}><Heart size={15} fill={isWishlisted?'#a6874e':'none'} className={isWishlisted?'text-gold':'text-maroon'}/></button>
        </div>

        <div className="flex flex-1 flex-col px-3 pb-3 pt-4 text-center">
          <Link to={`/product/${product.slug}`} className="font-display text-3xl leading-none text-maroon transition hover:text-antique">{product.name}</Link>
          <p className="mt-2 min-h-8 text-[10px] leading-4 text-ink/55">{product.notes.join(' / ')}</p>
          <div className="mt-3 flex items-center justify-center gap-3 text-xs"><strong className="font-royal text-antique">INR {Number(product.price).toLocaleString('en-IN')}</strong><span className="text-ink/35">{product.size}</span></div>
          <button onClick={()=>add(product)} className="btn-dark mt-5 w-full gap-2" aria-label={`Add ${product.name} to cart`}><Plus size={14}/>Add to Cart</button>
        </div>
      </div>
    </RoyalFrame>
  </motion.article>;
}
