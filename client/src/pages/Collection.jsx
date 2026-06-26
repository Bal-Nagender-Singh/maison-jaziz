import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { products as fallback } from '../data/products';
export default function Collection(){
  const [params]=useSearchParams();
  const category=params.get('category')||'';
  const featured=params.get('featured')==='true';
  const premium=params.get('premium')==='true';
  const mostSelling=params.get('mostSelling')==='true';
  const trending=params.get('trending')==='true';
  const searchVal=params.get('search')||'';
  const [products,setProducts]=useState([]);
  const [loading,setLoading]=useState(true);
  const [family,setFamily]=useState('All');

  useEffect(()=>{
    setLoading(true);
    const queryParts=[];
    if(category)queryParts.push(`category=${encodeURIComponent(category)}`);
    if(featured)queryParts.push('featured=true');
    if(premium)queryParts.push('premium=true');
    if(mostSelling)queryParts.push('mostSelling=true');
    if(trending)queryParts.push('trending=true');
    const queryString=queryParts.length?`?${queryParts.join('&')}`:'';
    api.get(`/products${queryString}`).then(({data})=>{
      setProducts(data);
      setLoading(false);
    }).catch(()=>{
      setProducts(category||featured||premium||mostSelling||trending?[]:fallback);
      setLoading(false);
    });
    setFamily('All')
  },[category,featured,premium,mostSelling,trending]);

  let baseProducts=products;
  if(products===fallback){
    if(featured)baseProducts=baseProducts.filter(p=>p.featured);
    if(premium)baseProducts=baseProducts.filter(p=>p.premium);
    if(mostSelling)baseProducts=baseProducts.filter(p=>p.mostSelling);
    if(trending)baseProducts=baseProducts.filter(p=>p.trending);
  }

  const shown=family==='All'?baseProducts:baseProducts.filter(x=>x.family===family);

  // Smart Search Filtering
  const parseSearchQuery = (query, list) => {
    const q = query.trim().toLowerCase();
    if (!q) return list;

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

  const finalProducts = parseSearchQuery(searchVal, shown);
  const pageTitle = searchVal ? `Search: "${searchVal}"` : featured ? 'Royal Collection' : category ? category.replace(/-/g,' ') : 'The Collection';

  return <div className="arabesque min-h-screen bg-cream px-6 pb-28 pt-36 md:px-10 md:pt-44">
    <header className="mx-auto max-w-[1380px] border border-gold/40 bg-ivory/80 px-6 py-12 text-center md:px-12">
      <p className="font-royal text-[10px] uppercase tracking-[.28em] text-antique">Masion Jaziz parfums</p>
      <h1 className="mt-5 font-display text-6xl capitalize text-maroon md:text-8xl">{pageTitle}</h1>
      <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-ink/55">Rare compositions chosen for depth, texture and remarkable persistence.</p>
    </header>
    {loading ? (
      <div className="flex justify-center items-center py-40">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent"/>
      </div>
    ) : (
      <>
        <div className="mx-auto grid max-w-[1380px] gap-7 sm:grid-cols-2 lg:grid-cols-4 mt-9">
          {finalProducts.map((p,i)=><ProductCard key={p._id} product={p} index={i}/>)}
        </div>
        {!finalProducts.length&&<p className="py-20 text-center font-display text-3xl text-maroon">No fragrances found.</p>}
      </>
    )}
  </div>
}
