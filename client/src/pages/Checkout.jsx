import { useEffect,useState } from 'react';
import { BadgePercent,LockKeyhole,X } from 'lucide-react';
import { Link,useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

const loadRazorpay=()=>new Promise(resolve=>{if(window.Razorpay)return resolve(true);const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.onload=()=>resolve(true);script.onerror=()=>resolve(false);document.body.appendChild(script)});
const initialShipping={name:'',phone:'',addressLine1:'',addressLine2:'',city:'',state:'',postalCode:'',country:'IN'};

export default function Checkout(){
  const {items,subtotal,clear}=useCart();const {user,updateUser}=useAuth();const nav=useNavigate();const [shipping,setShipping]=useState(initialShipping);const [error,setError]=useState('');const [loading,setLoading]=useState(false);const [couponCode,setCouponCode]=useState('');const [coupon,setCoupon]=useState(null);const [couponBusy,setCouponBusy]=useState(false);const [couponError,setCouponError]=useState('');
  const hasSavedAddress = !!(user?.name && user?.addressLine1 && user?.city);
  const [useSaved, setUseSaved] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  useEffect(() => {
    api.get('/auth/me')
      .then(({data}) => {
        updateUser(data.user);
        if (data.user?.name && data.user?.addressLine1 && data.user?.city) {
          setUseSaved(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (useSaved && user) {
      setShipping({
        name: user.name || '',
        phone: user.phone || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        state: user.state || '',
        postalCode: user.zipCode || '',
        country: user.country || 'IN'
      });
    } else if (!useSaved) {
      setShipping(initialShipping);
    }
  }, [useSaved, user]);

  useEffect(()=>{setCoupon(null);setCouponError('')},[items]);
  const cartPayload=items.map(x=>({productId:x._id,size:x.size,quantity:x.quantity}));
  const applyCoupon=async()=>{setCouponBusy(true);setCouponError('');try{const {data}=await api.post('/catalog/coupons/validate',{code:couponCode,items:cartPayload});setCoupon(data);setCouponCode(data.code)}catch(err){setCoupon(null);setCouponError(err.response?.data?.message||'Coupon could not be applied')}finally{setCouponBusy(false)}};
  const checkout=async e=>{e.preventDefault();setLoading(true);setError('');try{if(paymentMethod === 'cod'){await api.post('/payments/create-cod-order',{items:cartPayload,shippingDetails:shipping,couponCode:coupon?.code||''});clear();nav('/checkout/success')}else{if(!await loadRazorpay())throw new Error('Razorpay Checkout could not load');const {data}=await api.post('/payments/create-razorpay-order',{items:cartPayload,shippingDetails:shipping,couponCode:coupon?.code||''});const instance=new window.Razorpay({key:data.keyId,amount:data.amount,currency:data.currency,name:'Masion Jaziz',description:coupon?`Order with ${coupon.code}`:'Extrait de parfum',order_id:data.razorpayOrderId,prefill:{name:shipping.name,email:user.email,contact:shipping.phone},theme:{color:'#4b0d19'},modal:{ondismiss:()=>setLoading(false)},handler:async response=>{try{await api.post('/payments/verify-razorpay-payment',{...response,checkoutToken:data.checkoutToken});clear();nav('/checkout/success')}catch(err){setError(err.response?.data?.message||'Payment verification failed.');setLoading(false)}}});instance.on('payment.failed',response=>{setError(response.error?.description||'Payment was not completed.');setLoading(false)});instance.open()}}catch(err){setError(err.response?.data?.message||err.message||'Checkout is unavailable.');setLoading(false)}};
  const change=e=>setShipping({...shipping,[e.target.name]:e.target.value});const total=coupon?.total??subtotal;
  return <form onSubmit={checkout} className="arabesque min-h-screen bg-cream px-6 pb-28 pt-40 md:px-10"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_.8fr]"><div><p className="font-royal text-[9px] uppercase tracking-[.25em] text-antique">Secure checkout</p><h1 className="mt-5 font-display text-6xl text-maroon">Delivery & selection</h1><div className="mt-10 grid gap-4 sm:grid-cols-2">{hasSavedAddress && (<div className="sm:col-span-2 border border-gold/30 bg-ivory p-5 mb-4 flex flex-col gap-4"><p className="font-royal text-[9px] uppercase tracking-[.25em] text-antique">Shipping details selection</p><div className="flex gap-6"><label className="flex items-center gap-2 text-xs font-semibold text-maroon cursor-pointer"><input type="radio" name="checkout_addr" checked={useSaved} onChange={()=>setUseSaved(true)}/>Use saved account address</label><label className="flex items-center gap-2 text-xs font-semibold text-maroon cursor-pointer"><input type="radio" name="checkout_addr" checked={!useSaved} onChange={()=>setUseSaved(false)}/>Ship to a different address</label></div>{useSaved && (<div className="mt-1 text-xs text-ink/75 leading-relaxed bg-cream/40 p-4 border border-gold/20"><p className="font-semibold text-maroon">{user.name} ({user.phone})</p><p>{user.addressLine1}</p>{user.addressLine2 && <p>{user.addressLine2}</p>}<p>{user.city}, {user.state} {user.zipCode}</p><p>{user.country}</p></div>)}</div>)}{(!hasSavedAddress || !useSaved) && [['name','Full name'],['phone','Phone'],['addressLine1','Address'],['addressLine2','Apartment, suite (optional)'],['city','City'],['state','State'],['postalCode','Postal code'],['country','Country code']].map(([name,label])=><label key={name} className={['addressLine1','addressLine2'].includes(name)?'sm:col-span-2':''}><span className="mb-2 block text-[9px] uppercase tracking-[.18em]">{label}</span><input className="input" name={name} maxLength={name==='country'?2:undefined} value={shipping[name]} onChange={change} required={name!=='addressLine2'}/></label>)}</div>{!items.length?<div className="mt-10"><p>Your cart is empty.</p><Link to="/collection" className="btn-dark mt-6">Browse fragrances</Link></div>:<div className="mt-10 divide-y divide-gold/20 border-y border-gold/30">{items.map(x=><div className="flex gap-5 py-5" key={x._id}><img src={x.image} className="h-28 w-24 border border-gold/30 object-cover" alt=""/><div className="flex flex-1 justify-between"><div><h2 className="font-display text-2xl text-maroon">{x.name}</h2><p className="mt-1 text-[10px] text-ink/45">{x.size} / Quantity {x.quantity}</p></div><p className="text-sm">INR {(x.price*x.quantity).toFixed(2)}</p></div></div>)}</div>}</div>
    <aside className="h-fit border border-gold/45 bg-ivory p-7 shadow-royal"><p className="font-royal text-[9px] uppercase tracking-[.22em] text-antique">Order summary</p><div className="mt-7"><label className="text-[9px] uppercase tracking-[.16em]">Coupon code</label><div className="mt-2 flex"><input className="input uppercase" value={couponCode} onChange={e=>{setCouponCode(e.target.value.toUpperCase());setCoupon(null)}} placeholder="ROYAL10"/><button type="button" disabled={!couponCode||couponBusy||!items.length} onClick={applyCoupon} className="bg-maroon px-5 text-[9px] uppercase tracking-[.16em] text-champagne disabled:opacity-40">{couponBusy?'Checking':'Apply'}</button></div>{couponError&&<p className="mt-2 text-xs text-red-800">{couponError}</p>}{coupon&&<div className="mt-3 flex items-start justify-between border border-green-700/30 bg-green-50 p-3 text-xs text-green-900"><span className="flex gap-2"><BadgePercent size={15}/><span><strong>{coupon.code} applied</strong>{coupon.description&&<span className="mt-1 block text-[10px]">{coupon.description}</span>}</span></span><button type="button" onClick={()=>{setCoupon(null);setCouponCode('')}} aria-label="Remove coupon"><X size={14}/></button></div>}</div>
      <div className="mt-6 border-t border-gold/20 pt-6"><p className="text-[9px] uppercase tracking-[.18em] text-antique mb-3 font-semibold">Payment Method</p><div className="space-y-2"><label className="flex items-center gap-2 text-xs font-semibold text-maroon cursor-pointer"><input type="radio" name="payment_method" checked={paymentMethod==='razorpay'} onChange={()=>setPaymentMethod('razorpay')}/>Pay securely online (Razorpay)</label><label className="flex items-center gap-2 text-xs font-semibold text-maroon cursor-pointer"><input type="radio" name="payment_method" checked={paymentMethod==='cod'} onChange={()=>setPaymentMethod('cod')}/>Cash on Delivery (COD)</label></div></div>
      <div className="mt-7 space-y-4 border-b border-gold/30 pb-6 text-xs"><div className="flex justify-between"><span>Subtotal</span><span>INR {subtotal.toFixed(2)}</span></div>{coupon&&<div className="flex justify-between text-green-800"><span>Coupon discount</span><span>- INR {coupon.discount.toFixed(2)}</span></div>}<div className="flex justify-between"><span>Delivery</span><span>Complimentary</span></div></div><div className="flex justify-between py-6"><span className="font-display text-2xl text-maroon">Total</span><span className="font-display text-2xl text-maroon">INR {total.toFixed(2)}</span></div>{error&&<p className="mb-4 text-xs leading-5 text-red-800">{error}</p>}<button disabled={!items.length||loading} className="btn-dark w-full disabled:opacity-40">{loading?(paymentMethod==='cod'?'Placing COD order...':'Opening secure payment'):(paymentMethod==='cod'?'Place Order (Cash on Delivery)':'Pay securely with Razorpay')}</button>{paymentMethod==='razorpay'?(<p className="mt-5 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[.14em] text-ink/45"><LockKeyhole size={12}/>Verified by Razorpay</p>):(<p className="mt-5 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[.14em] text-ink/45"><LockKeyhole size={12}/>Pay on delivery</p>)}</aside>
   </div></form>;
 }
