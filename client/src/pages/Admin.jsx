import { useEffect,useState } from 'react';
import { ImageUp,Pencil,Plus,Trash2,X,LogOut,GalleryHorizontal } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

const productBlank={name:'',slug:'',family:'',categoryId:'',notes:'',accords:'',description:'',price:'',size:'75ml',stock:'',imageUrl:'',imagePublicId:null,imageAlt:'',featured:false,premium:false,mostSelling:false,trending:false,loveReasons:'',sizes:[{size:'75ml',price:'',stock:''}]};
const categoryBlank={name:'',slug:'',description:'',imageUrl:'',imagePublicId:null,active:true,sortOrder:0};
const couponBlank={code:'',description:'',discountType:'percent',value:'',scope:'all',categoryId:'',productId:'',minimumOrder:0,maximumDiscount:'',active:true,startsAt:'',expiresAt:'',usageLimit:'',perCustomer:false};
const slideBlank={title:'',subtitle:'',imageUrl:'',imagePublicId:null,ctaLabel:'Shop now',ctaUrl:'/collection',productId:'',active:true,sortOrder:0};
const faqBlank={question:'',answer:'',sortOrder:0,active:true};
const labels={products:'fragrance',categories:'category',coupons:'coupon',slides:'slide',faqs:'FAQ'};

function Field({label,children,className=''}){return <label className={className}><span className="mb-2 block text-[9px] uppercase tracking-[.18em] text-maroon/60">{label}</span>{children}</label>}

export default function Admin(){
  const { logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'products';
  const setTab = (t) => setSearchParams({ tab: t });
  const [products,setProducts]=useState([]);const [categories,setCategories]=useState([]);const [coupons,setCoupons]=useState([]);const [slides,setSlides]=useState([]);const [orders,setOrders]=useState([]);const [customers,setCustomers]=useState([]);const [faqs,setFaqs]=useState([]);const [editing,setEditing]=useState(null);const [uploading,setUploading]=useState(false);const [galleryUploading,setGalleryUploading]=useState(false);const [error,setError]=useState('');
  const [settings,setSettings]=useState({google_maps_url:'',instagram_handle:'',facebook_handle:'',store_email:'',store_phone:'',store_address:''});const [savingSettings,setSavingSettings]=useState(false);
  const load=()=>Promise.allSettled([
    api.get('/products').then(r=>setProducts(r.data)).catch(err => { console.error('Error loading products:', err); throw err; }),
    api.get('/catalog/admin/categories').then(r=>setCategories(r.data)).catch(err => { console.error('Error loading categories:', err); throw err; }),
    api.get('/catalog/admin/coupons').then(r=>setCoupons(r.data)).catch(err => { console.error('Error loading coupons:', err); throw err; }),
    api.get('/catalog/admin/slides').then(r=>setSlides(r.data)).catch(err => { console.error('Error loading slides:', err); throw err; }),
    api.get('/orders/admin').then(r=>setOrders(r.data)).catch(err => { console.error('Error loading orders:', err); throw err; }),
    api.get('/auth/admin/users').then(r=>setCustomers(r.data)).catch(err => { console.error('Error loading customers:', err); throw err; }),
    api.get('/catalog/settings').then(r=>setSettings(r.data)).catch(err => { console.error('Error loading settings:', err); throw err; }),
    api.get('/catalog/admin/faqs').then(r=>setFaqs(r.data)).catch(err => { console.error('Error loading faqs:', err); throw err; })
  ]).then(results => {
    const rejected = results.filter(r => r.status === 'rejected');
    if (rejected.length > 0) {
      setError(`Failed to load some dashboard data. Check console for details.`);
    }
  });
  useEffect(()=>{load()},[tab]);
  const create=()=>setEditing({...({products:productBlank,categories:categoryBlank,coupons:couponBlank,slides:slideBlank,faqs:faqBlank}[tab])});
  const open=item=>{if(tab==='products')setEditing({...item,categoryId:item.categoryId||'',notes:item.notes.join(', '),accords:item.accords.join(', '),loveReasons:(item.loveReasons||[]).join(', '),imageUrl:item.imageUrl||item.image,images:item.images||[],sizes:item.sizes&&item.sizes.length>0?item.sizes:[{size:item.size||'75ml',price:item.price,stock:item.stock}]});else if(tab==='coupons')setEditing({...item,categoryId:item.categoryId||'',productId:item.productId||'',maximumDiscount:item.maximumDiscount??'',usageLimit:item.usageLimit??'',startsAt:item.startsAt?item.startsAt.slice(0,16):'',expiresAt:item.expiresAt?item.expiresAt.slice(0,16):''});else setEditing({...item,productId:item.productId||''})};
  const upload=async e=>{const file=e.target.files?.[0];if(!file)return;setUploading(true);setError('');try{const form=new FormData();form.append('image',file);const {data}=await api.post('/uploads/product-image',form);setEditing(current=>({...current,imageUrl:data.url,imagePublicId:data.publicId}))}catch(err){setError(err.response?.data?.message||'Image upload failed')}finally{setUploading(false)}};
  const uploadGalleryImage=async e=>{const file=e.target.files?.[0];if(!file||!editing)return;const productId=editing._id||editing.id;if(!productId){setError('Save the product first before adding gallery images.');return;}setGalleryUploading(true);setError('');try{const form=new FormData();form.append('image',file);const {data}=await api.post(`/products/admin/${productId}/images`,form);setEditing(current=>({...current,images:[...(current.images||[]),data]}))}catch(err){setError(err.response?.data?.message||'Gallery image upload failed')}finally{setGalleryUploading(false);e.target.value=''}};
  const deleteGalleryImage=async(productId,imageId)=>{try{await api.delete(`/products/admin/${productId}/images/${imageId}`);setEditing(current=>({...current,images:(current.images||[]).filter(img=>img.id!==imageId)}))}catch(err){setError(err.response?.data?.message||'Failed to delete image')}};
  const save=async e=>{e.preventDefault();setError('');let body={...editing};delete body._id;delete body.id;delete body.image;delete body.category;delete body.product;delete body._count;delete body.createdAt;delete body.updatedAt;delete body.images;delete body.wishlistItems;if(tab==='products'){const sizes=editing.sizes||[];const firstPrice=sizes[0]?Number(sizes[0].price):0;const firstSize=sizes[0]?sizes[0].size:'75ml';const totalStock=sizes.reduce((sum,s)=>sum+Number(s.stock||0),0);body={...body,price:firstPrice,size:firstSize,stock:totalStock,sizes:sizes.map(s=>({size:s.size,price:Number(s.price),stock:Number(s.stock)})),categoryId:body.categoryId||null,notes:String(body.notes).split(',').map(x=>x.trim()).filter(Boolean),accords:String(body.accords).split(',').map(x=>x.trim()).filter(Boolean),loveReasons:String(body.loveReasons||'').split(',').map(x=>x.trim()).filter(Boolean)}}if(tab==='categories')body.sortOrder=Number(body.sortOrder||0);if(tab==='slides')body={...body,sortOrder:Number(body.sortOrder||0),productId:body.productId||null};if(tab==='coupons')body={...body,discountType:'percent',value:Number(body.value),minimumOrder:Number(body.minimumOrder||0),maximumDiscount:body.maximumDiscount===''?null:Number(body.maximumDiscount),usageLimit:body.usageLimit===''?null:Number(body.usageLimit),categoryId:body.scope==='category'?body.categoryId:null,productId:null,perCustomer:!!body.perCustomer,startsAt:body.startsAt?new Date(body.startsAt).toISOString():null,expiresAt:body.expiresAt?new Date(body.expiresAt).toISOString():null};try{const base=tab==='products'?'/products/admin':`/catalog/admin/${tab}`;editing._id||editing.id?await api.put(`${base}/${editing._id||editing.id}`,body):await api.post(base,body);setEditing(null);await load()}catch(err){setError(err.response?.data?.message||`Unable to save ${labels[tab]}`)}};
  const remove=async item=>{if(!confirm(`Delete this ${labels[tab]}?`))return;const base=tab==='products'?'/products/admin':`/catalog/admin/${tab}`;try{await api.delete(`${base}/${item._id||item.id}`);load()}catch(err){setError(err.response?.data?.message||'Delete failed')}};
  const handleStatusChange=async(orderId,newStatus)=>{try{await api.put(`/orders/admin/${orderId}/status`,{status:newStatus});await load()}catch(err){setError(err.response?.data?.message||'Failed to update order status')}};
  const set=(key,value)=>setEditing(current=>({...current,[key]:value}));
  const saveSettings=async e=>{e.preventDefault();setSavingSettings(true);setError('');try{await api.put('/catalog/admin/settings',settings);alert('Settings saved successfully')}catch(err){setError(err.response?.data?.message||'Failed to save settings')}finally{setSavingSettings(false)}};
  return <div className="arabesque min-h-screen bg-cream px-5 pb-24 pt-12 md:px-10"><div className="mx-auto max-w-[1380px]"><div className="flex items-center justify-between border-b border-gold/30 pb-8 mb-10"><div className="flex items-center gap-4"><span className="font-display text-3xl tracking-wider text-maroon">MAISON JAZIZ</span><span className="h-5 w-px bg-gold/30"></span><span className="text-xs uppercase tracking-[0.2em] text-antique">Portal</span></div><div className="flex items-center gap-7"><button onClick={logout} className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-red-800 hover:text-red-600 transition"><LogOut size={16}/>Sign Out</button></div></div><header className="flex flex-col justify-between gap-7 border-b border-gold/40 pb-9 md:flex-row md:items-end"><div><p className="font-royal text-xs uppercase tracking-[.25em] text-antique">Maison operations</p><h1 className="mt-4 font-display text-7xl text-maroon">Admin dashboard</h1></div>{!['orders','customers','settings'].includes(tab)&&<button onClick={create} className="btn-dark gap-2.5 px-6 py-3 text-sm font-semibold"><Plus size={16}/>New {labels[tab]}</button>}</header><div className="flex gap-4 overflow-auto py-8">{['products','categories','coupons','slides','orders','customers','faqs','settings'].map(x=><button key={x} onClick={()=>{setTab(x);setEditing(null);setError('')}} className={`whitespace-nowrap border px-6 py-3 text-[11px] font-semibold uppercase tracking-[.2em] transition-all duration-300 ${tab===x?'border-gold bg-maroon text-champagne shadow-md':'border-gold/30 bg-ivory text-ink/60 hover:border-gold'}`}>{x}</button>)}</div>{error&&!editing&&<p className="mb-4 text-xs text-red-800">{error}</p>}

  {tab==='products'&&<GridTable heads={['Fragrance','Category','Price','Stock','Actions']}>{products.map(p=><tr key={p._id} className="border-t border-gold/20"><td className="flex items-center gap-5 py-5 px-6"><img className="h-20 w-16 border border-gold/30 object-cover shadow-sm" src={p.image} alt=""/><span className="font-display text-2xl text-maroon">{p.name}</span></td><td className="py-5 px-6 font-medium text-ink/75">{p.category?.name||'Unassigned'}</td><td className="py-5 px-6 font-royal text-antique font-semibold">INR {p.price}</td><td className="py-5 px-6 font-medium text-ink/75">{p.stock}</td><Actions onEdit={()=>open(p)} onDelete={()=>remove(p)}/></tr>)}</GridTable>}
  {tab==='categories'&&<GridTable heads={['Category','Slug','Products','Status','Actions']}>{categories.map(c=><tr key={c.id} className="border-t border-gold/20"><td className="flex items-center gap-5 py-5 px-6">{c.imageUrl&&<img className="h-20 w-24 border border-gold/30 object-cover shadow-sm" src={c.imageUrl} alt=""/>}<span className="font-display text-2xl text-maroon">{c.name}</span></td><td className="py-5 px-6 text-ink/75 font-mono text-xs">{c.slug}</td><td className="py-5 px-6 font-medium text-ink/75">{c._count?.products||0}</td><td className="py-5 px-6"><span className={`inline-block px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border ${c.active?'bg-green-50 text-green-800 border-green-200':'bg-red-50 text-red-800 border-red-200'}`}>{c.active?'Active':'Hidden'}</span></td><Actions onEdit={()=>open(c)} onDelete={()=>remove(c)}/></tr>)}</GridTable>}
  {tab==='coupons'&&<GridTable heads={['Code','Discount','Scope','Usage','Actions']}>{coupons.map(c=><tr key={c.id} className="border-t border-gold/20"><td className="py-5 px-6 font-royal text-antique text-base font-semibold">{c.code}</td><td className="py-5 px-6 font-medium text-ink/80">{c.discountType==='percent'?`${c.value}%`:`INR ${c.value}`}</td><td className="py-5 px-6 capitalize text-ink/75 font-medium">{c.scope}{c.category?.name?` - ${c.category.name}`:c.product?.name?` - ${c.product.name}`:''}</td><td className="py-5 px-6 font-medium text-ink/75">{c.usedCount}{c.usageLimit?` / ${c.usageLimit}`:''}</td><Actions onEdit={()=>open(c)} onDelete={()=>remove(c)}/></tr>)}</GridTable>}
  {tab==='slides'&&<GridTable heads={['Slide','Linked product','Order','Status','Actions']}>{slides.map(s=><tr key={s.id} className="border-t border-gold/20"><td className="flex items-center gap-5 py-5 px-6"><img className="h-20 w-28 border border-gold/30 object-cover shadow-sm" src={s.imageUrl} alt=""/><span className="font-display text-2xl text-maroon">{s.title}</span></td><td className="py-5 px-6 font-medium text-ink/75">{s.product?.name||'None'}</td><td className="py-5 px-6 font-medium text-ink/75">{s.sortOrder}</td><td className="py-5 px-6"><span className={`inline-block px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border ${s.active?'bg-green-50 text-green-800 border-green-200':'bg-red-50 text-red-800 border-red-200'}`}>{s.active?'Active':'Hidden'}</span></td><Actions onEdit={()=>open(s)} onDelete={s.id==='00000000-0000-0000-0000-000000000001'?null:()=>remove(s)}/></tr>)}</GridTable>}
  {tab==='faqs'&&<GridTable heads={['Question','Answer','Order','Status','Actions']}>{faqs.map(f=><tr key={f.id} className="border-t border-gold/20"><td className="py-5 px-6 font-display text-xl text-maroon max-w-xs">{f.question}</td><td className="py-5 px-6 text-ink/70 text-sm max-w-sm truncate">{f.answer}</td><td className="py-5 px-6 font-medium text-ink/75">{f.sortOrder}</td><td className="py-5 px-6"><span className={`inline-block px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border ${f.active?'bg-green-50 text-green-800 border-green-200':'bg-red-50 text-red-800 border-red-200'}`}>{f.active?'Active':'Hidden'}</span></td><Actions onEdit={()=>setEditing({...f})} onDelete={()=>remove(f)}/></tr>)}</GridTable>}
  {tab==='customers'&&<GridTable heads={['Customer','Email','Phone','Orders','Wishlist','Joined']}>{customers.length===0?<tr><td colSpan={6} className="py-16 text-center text-sm text-ink/40">No customers registered yet.</td></tr>:customers.map(c=><tr key={c.id} className="border-t border-gold/20"><td className="py-5 px-6"><div className="font-display text-xl text-maroon leading-tight">{c.name||'—'}</div>{c.addressLine1&&<div className="text-xs text-ink/45 mt-1">{[c.addressLine1,c.city,c.state].filter(Boolean).join(', ')}</div>}</td><td className="py-5 px-6 text-sm text-ink/75">{c.email}</td><td className="py-5 px-6 font-medium text-ink/75">{c.phone||'—'}</td><td className="py-5 px-6 font-medium text-ink/75">{c._count?.orders||0}</td><td className="py-5 px-6 text-xs text-ink/70 max-w-xs">{c.wishlist&&c.wishlist.length>0?<div className="flex flex-col gap-1.5">{c.wishlist.map((w,i)=><span key={i} className="inline-block bg-gold/15 text-antique border border-gold/30 px-2 py-0.5 rounded-sm font-semibold truncate max-w-[200px]" title={w.product.name}>{w.product.name}</span>)}</div>:<span className="text-ink/35">—</span>}</td><td className="py-5 px-6 text-sm text-ink/55">{new Date(c.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td></tr>)}</GridTable>}
  {tab==='orders'&&<div className="space-y-6">{orders.map(o=>(
    <div key={o._id} className="border border-gold/35 bg-ivory p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gold/20 pb-5 mb-5 gap-4">
        <div>
          <span className="font-royal text-xs uppercase tracking-[0.2em] text-maroon/60 block mb-1">Order ID</span>
          <span className="font-royal text-sm font-semibold text-antique">#{o._id.toUpperCase()}</span>
          {o.createdAt && (
            <span className="text-xs text-ink/50 block mt-1">
              {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              {' '}&bull;{' '}
              {new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
          )}
        </div>
        <div>
          <span className="font-royal text-xs uppercase tracking-[0.2em] text-maroon/60 block mb-1">Customer</span>
          <span className="text-sm font-medium text-ink block">{o.user?.email}</span>
          {(o.shippingDetails?.phone || o.user?.phone) && (
            <span className="text-xs text-antique block mt-0.5 font-medium">{(o.shippingDetails?.phone || o.user?.phone)}</span>
          )}
        </div>
        <div>
          <span className="font-royal text-xs uppercase tracking-[0.2em] text-maroon/60 block mb-1">Payment Status</span>
          <span className="inline-block text-xs uppercase tracking-wider px-3 py-1 border border-gold/30 bg-cream/40 text-antique capitalize">{o.paymentStatus}</span>
        </div>
        <div>
          <span className="font-royal text-xs uppercase tracking-[0.2em] text-maroon/60 block mb-1">Coupon</span>
          <span className="text-sm text-ink/75">{o.couponCode ? `Code: ${o.couponCode}` : 'None'}</span>
        </div>
        <div className="md:text-right">
          <span className="font-royal text-xs uppercase tracking-[0.2em] text-maroon/60 block mb-1">Total</span>
          <strong className="font-display text-2xl text-maroon">INR {Number(o.totalAmount).toFixed(2)}</strong>
        </div>
      </div>
      
      {/* Ordered Items */}
      <div className="space-y-4 mb-5">
        <p className="font-royal text-xs uppercase tracking-[0.2em] text-maroon/70">Ordered Items</p>
        <div className="divide-y divide-gold/10">
          {(o.products || []).map(p=>(
            <div key={p._id} className="flex justify-between py-3 text-sm">
              <div className="flex gap-3 items-center">
                <span className="font-display text-xl text-maroon">{p.name}</span>
                <span className="text-xs text-antique bg-cream border border-gold/25 px-2 py-0.5">{p.size}</span>
                <span className="text-ink/50">x {p.quantity}</span>
              </div>
              <span className="text-ink/80 font-medium">INR {(Number(p.price) * p.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
 
      {/* Order Status Action and Shipping Details */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-5 border-t border-gold/20 gap-4">
        <div className="text-xs text-ink/70 max-w-md leading-relaxed">
          <span className="font-royal text-xs uppercase tracking-[0.2em] text-maroon/60 block mb-1">Shipping Details</span>
          {o.shippingDetails ? (
            <p>
              <strong className="text-ink">{o.shippingDetails.name}</strong> ({o.shippingDetails.phone})<br />
              {o.shippingDetails.addressLine1}
              {o.shippingDetails.addressLine2 ? `, ${o.shippingDetails.addressLine2}` : ''}, {o.shippingDetails.city}, {o.shippingDetails.state} {o.shippingDetails.postalCode}, {o.shippingDetails.country}
            </p>
          ) : 'No shipping details'}
        </div>
        
        <div className="flex items-center gap-3">
          <span className="font-royal text-xs uppercase tracking-[0.2em] text-maroon/60">Change Status</span>
          <select 
            value={o.status || 'pending'} 
            onChange={e => handleStatusChange(o._id, e.target.value)} 
            className="input text-xs w-44 py-1.5 px-3 font-royal uppercase tracking-wider"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>
  ))}
  {!orders.length&&<p className="py-20 text-center text-sm text-ink/45">No orders yet.</p>}
  </div>}
  {tab==='settings'&&<div className="border border-gold/35 bg-ivory p-8 shadow-sm max-w-2xl mx-auto"><form onSubmit={saveSettings} className="space-y-6"><h2 className="font-display text-4xl text-maroon mb-6">Maison Settings</h2><Field label="Google Maps Link (Full URL to open in Google Maps)"><input className="input" value={settings.google_maps_url||''} onChange={e=>setSettings(s=>({...s,google_maps_url:e.target.value}))} placeholder="https://maps.google.com/?q=..."/></Field><Field label="Store Address (shown on customer site)"><textarea className="input min-h-24" value={settings.store_address||''} onChange={e=>setSettings(s=>({...s,store_address:e.target.value}))} placeholder="123 Royal Avenue, Dubai, UAE"/></Field><div className="grid gap-4 md:grid-cols-2"><Field label="Instagram URL"><input className="input" value={settings.instagram_handle||''} onChange={e=>setSettings(s=>({...s,instagram_handle:e.target.value}))} placeholder="https://instagram.com/masionjaziz"/></Field><Field label="Facebook URL"><input className="input" value={settings.facebook_handle||''} onChange={e=>setSettings(s=>({...s,facebook_handle:e.target.value}))} placeholder="https://facebook.com/masionjaziz"/></Field><Field label="Store Contact Email"><input className="input" type="email" value={settings.store_email||''} onChange={e=>setSettings(s=>({...s,store_email:e.target.value}))} placeholder="contact@masionjaziz.com"/></Field><Field label="Store Contact Phone"><input className="input" value={settings.store_phone||''} onChange={e=>setSettings(s=>({...s,store_phone:e.target.value}))} placeholder="+91 98765 43210"/></Field></div><button type="submit" disabled={savingSettings} className="btn-dark mt-4">{savingSettings?'Saving...':'Save Settings'}</button></form></div>}
  </div>{editing&&<div className="fixed inset-0 z-[80] overflow-auto bg-ink/75 p-4"><form onSubmit={save} className="arabesque mx-auto my-8 w-full max-w-3xl border border-gold/60 bg-ivory p-7 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-display text-4xl text-maroon">{editing.id||editing._id?'Edit':'New'} {labels[tab]}</h2><button type="button" onClick={()=>setEditing(null)}><X/></button></div><div className="mt-7 grid gap-4 md:grid-cols-2">{tab==='products'&&<ProductForm data={editing} set={set} categories={categories}/>} {tab==='categories'&&<CategoryForm data={editing} set={set}/>} {tab==='coupons'&&<CouponForm data={editing} set={set} categories={categories} products={products}/>} {tab==='slides'&&<SlideForm data={editing} set={set} products={products}/>} {tab==='faqs'&&<FaqForm data={editing} set={set}/>} {tab==='products'&&<MultiImageField data={editing} upload={uploadGalleryImage} uploading={galleryUploading} onDelete={deleteGalleryImage} primaryUpload={upload} primaryUploading={uploading}/>} {['categories','slides'].includes(tab)&&<ImageField data={editing} upload={upload} uploading={uploading}/>}</div>{error&&<p className="mt-5 text-xs text-red-800">{error}</p>}<button disabled={uploading||galleryUploading} className="btn-dark mt-6">Save {labels[tab]}</button></form></div>}</div>;
}

function GridTable({heads,children}){return <div className="overflow-auto border border-gold/40 bg-ivory"><table className="w-full min-w-[760px] text-left"><thead className="bg-maroon text-[11px] uppercase tracking-[.2em] text-champagne"><tr>{heads.map((h,i)=><th key={h} className={`py-5 px-6 ${i===heads.length-1?'text-right':''}`}>{h}</th>)}</tr></thead><tbody className="text-sm">{children}</tbody></table></div>}
function Actions({onEdit,onDelete}){return <td className="py-5 px-6"><div className="flex justify-end gap-5"><button onClick={onEdit} className="text-maroon hover:text-gold transition-colors" aria-label="Edit"><Pencil size={18}/></button>{onDelete?<button onClick={onDelete} className="text-maroon hover:text-red-700 transition-colors" aria-label="Delete"><Trash2 size={18}/></button>:<button disabled className="opacity-20 cursor-not-allowed text-maroon" aria-label="Delete"><Trash2 size={18}/></button>}</div></td>}
function ProductForm({data,set,categories}){return <><Field label="Name"><input className="input" value={data.name} onChange={e=>set('name',e.target.value)} required/></Field><Field label="Slug"><input className="input" value={data.slug} onChange={e=>set('slug',e.target.value)} required/></Field><Field label="Category"><select className="input" value={data.categoryId||''} onChange={e=>set('categoryId',e.target.value)}><option value="">Unassigned</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><Field label="Fragrance family"><input className="input" value={data.family} onChange={e=>set('family',e.target.value)} required/></Field><div className="md:col-span-2 border border-gold/20 bg-cream/30 p-4"><div className="flex justify-between items-center mb-3"><span className="text-[10px] uppercase tracking-[.18em] font-semibold text-maroon">Product Sizes & Variants</span><button type="button" onClick={()=>{const currentSizes=data.sizes||[];set('sizes', [...currentSizes, { size: '', price: '', stock: '' }]);}} className="text-[9px] uppercase tracking-wider text-maroon hover:text-gold flex items-center gap-1 border border-gold/30 px-2 py-1 bg-ivory"><Plus size={10}/> Add Size</button></div><div className="space-y-3">{(data.sizes||[{size:'75ml',price:'',stock:''}]).map((item,idx)=><div key={idx} className="flex gap-3 items-end"><label className="flex-1"><span className="mb-1 block text-[8px] uppercase tracking-[.15em] text-maroon/60">Size</span><input className="input text-xs" value={item.size} placeholder="e.g. 50ml" required onChange={e=>{const list=[...(data.sizes||[])];list[idx]={...list[idx],size:e.target.value};set('sizes',list)}}/></label><label className="flex-1"><span className="mb-1 block text-[8px] uppercase tracking-[.15em] text-maroon/60">Price (INR)</span><input className="input text-xs" type="number" placeholder="Price" required min="1" value={item.price} onChange={e=>{const list=[...(data.sizes||[])];list[idx]={...list[idx],price:e.target.value};set('sizes',list)}}/></label><label className="flex-1"><span className="mb-1 block text-[8px] uppercase tracking-[.15em] text-maroon/60">Stock</span><input className="input text-xs" type="number" placeholder="Stock" required min="0" value={item.stock} onChange={e=>{const list=[...(data.sizes||[])];list[idx]={...list[idx],stock:e.target.value};set('sizes',list)}}/></label><button type="button" disabled={(data.sizes||[]).length<=1} onClick={()=>{const list=[...(data.sizes||[])];list.splice(idx,1);set('sizes',list)}} className="p-2 text-red-800 hover:text-red-600 disabled:opacity-30 self-center mb-1"><Trash2 size={14}/></button></div>)}</div></div><Field label="Image description"><input className="input" value={data.imageAlt||''} onChange={e=>set('imageAlt',e.target.value)}/></Field><Field label="Notes, comma separated"><input className="input" value={data.notes} onChange={e=>set('notes',e.target.value)} required/></Field><Field label="Accords, comma separated"><input className="input" value={data.accords} onChange={e=>set('accords',e.target.value)} required/></Field><Field label="Why customers love it, comma separated" className="md:col-span-2"><input className="input" value={data.loveReasons||''} onChange={e=>set('loveReasons',e.target.value)}/></Field><Field label="Description" className="md:col-span-2"><textarea className="input min-h-28" value={data.description} onChange={e=>set('description',e.target.value)} required/></Field><div className="md:col-span-2 flex flex-wrap gap-x-8 gap-y-3 border-t border-gold/15 pt-4 mt-2"><Check label="Royal Collection" checked={data.featured} onChange={v=>set('featured',v)}/><Check label="Premium" checked={data.premium} onChange={v=>set('premium',v)}/><Check label="Most Selling" checked={data.mostSelling} onChange={v=>set('mostSelling',v)}/><Check label="Trending" checked={data.trending} onChange={v=>set('trending',v)}/></div></>}
function CategoryForm({data,set}){return <><Field label="Name"><input className="input" value={data.name} onChange={e=>set('name',e.target.value)} required/></Field><Field label="Slug"><input className="input" value={data.slug} onChange={e=>set('slug',e.target.value)} required/></Field><Field label="Display order"><input className="input" type="number" value={data.sortOrder} onChange={e=>set('sortOrder',e.target.value)}/></Field><Check label="Visible to customers" checked={data.active} onChange={v=>set('active',v)}/><Field label="Description" className="md:col-span-2"><textarea className="input min-h-24" value={data.description} onChange={e=>set('description',e.target.value)}/></Field></>}
function CouponForm({data,set,categories}){
  const selectedScopeValue = data.scope === 'category' && data.categoryId ? `category:${data.categoryId}` : 'all';
  const handleScopeChange = (e) => {
    const val = e.target.value;
    if (val === 'all') {
      set('scope', 'all');
      set('categoryId', null);
    } else if (val.startsWith('category:')) {
      set('scope', 'category');
      set('categoryId', val.split(':')[1]);
    }
  };
  return <><Field label="Coupon code"><input className="input uppercase" value={data.code} onChange={e=>set('code',e.target.value.toUpperCase())} required/></Field><Field label="Discount value (%)"><input className="input" type="number" min="1" max="100" value={data.value} onChange={e=>{const v=Number(e.target.value);set('value',v>100?100:v<1?1:v)}} required/></Field><Field label="Applies to"><select className="input" value={selectedScopeValue} onChange={handleScopeChange}><option value="all">All products</option>{categories.map(c=><option key={c.id} value={`category:${c.id}`}>Category: {c.name}</option>)}</select></Field><Field label="Minimum order"><input className="input" type="number" value={data.minimumOrder} onChange={e=>set('minimumOrder',e.target.value)}/></Field><Field label="Maximum discount (optional)"><input className="input" type="number" value={data.maximumDiscount} onChange={e=>set('maximumDiscount',e.target.value)}/></Field><Field label="Starts at"><input className="input" type="datetime-local" value={data.startsAt} onChange={e=>set('startsAt',e.target.value)}/></Field><Field label="Expires at"><input className="input" type="datetime-local" value={data.expiresAt} onChange={e=>set('expiresAt',e.target.value)}/></Field><Field label="Description" className="md:col-span-2"><textarea className="input" value={data.description} onChange={e=>set('description',e.target.value)}/></Field><div className="md:col-span-2 flex flex-wrap gap-x-8 gap-y-3"><Check label="Coupon active" checked={data.active} onChange={v=>set('active',v)}/><Check label="Once per customer (each customer can use this coupon only once)" checked={!!data.perCustomer} onChange={v=>set('perCustomer',v)}/></div></>
}
function SlideForm({data,set,products}){const product=products.find(p=>p._id===data.productId);return <><Field label="Headline"><input className="input" value={data.title} onChange={e=>set('title',e.target.value)} required/></Field><Field label="Linked product"><select className="input" value={data.productId||''} onChange={e=>{const p=products.find(x=>x._id===e.target.value);set('productId',e.target.value);if(p)set('ctaUrl',`/product/${p.slug}`)}}><option value="">No linked product</option>{products.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}</select></Field><Field label="Button label"><input className="input" value={data.ctaLabel} onChange={e=>set('ctaLabel',e.target.value)} required/></Field><Field label="Button link"><input className="input" value={data.ctaUrl} onChange={e=>set('ctaUrl',e.target.value)} required/></Field><Field label="Display order"><input className="input" type="number" value={data.sortOrder} onChange={e=>set('sortOrder',e.target.value)}/></Field><Check label="Slide active" checked={data.active} onChange={v=>set('active',v)}/><Field label="Subtitle" className="md:col-span-2"><textarea className="input min-h-24" value={data.subtitle} onChange={e=>set('subtitle',e.target.value)}/></Field>{product&&<p className="md:col-span-2 text-xs text-antique">This slide opens {product.name}.</p>}</>}
function Check({label,checked,onChange}){return <label className="flex items-center gap-3 text-xs"><input type="checkbox" checked={!!checked} onChange={e=>onChange(e.target.checked)}/>{label}</label>}
function ImageField({data,upload,uploading}){return <Field label="Image" className="md:col-span-2"><div className="grid gap-4 border border-dashed border-gold/50 p-4 sm:grid-cols-[120px_1fr] sm:items-center">{data.imageUrl?<img src={data.imageUrl} className="h-28 w-28 object-cover" alt="Preview"/>:<div className="grid h-28 w-28 place-items-center bg-cream"><ImageUp className="text-gold"/></div>}<div><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} disabled={uploading}/><p className="mt-2 text-[10px] text-ink/45">JPEG, PNG, WebP or AVIF. Maximum 8 MB.</p><p className="mt-2 text-xs text-antique">{uploading?'Uploading...':data.imagePublicId?'Cloudinary image ready':''}</p></div></div></Field>}
function MultiImageField({data,upload,uploading,onDelete,primaryUpload,primaryUploading}){
  const productId=data._id||data.id;
  const images=data.images||[];
  return(
    <div className="md:col-span-2 space-y-5">
      <Field label="Cover / Primary Image">
        <div className="grid gap-4 border border-dashed border-gold/50 p-4 sm:grid-cols-[120px_1fr] sm:items-center">
          {data.imageUrl?<img src={data.imageUrl} className="h-28 w-28 object-cover border border-gold/30" alt="Cover"/>:<div className="grid h-28 w-28 place-items-center bg-cream"><ImageUp className="text-gold"/></div>}
          <div><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={primaryUpload} disabled={primaryUploading}/><p className="mt-2 text-[10px] text-ink/45">JPEG, PNG, WebP or AVIF. Max 8 MB.</p><p className="mt-2 text-xs text-antique">{primaryUploading?'Uploading...':data.imagePublicId?'Cloudinary image ready':''}</p></div>
        </div>
      </Field>
      <div className="border border-dashed border-gold/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] uppercase tracking-[.18em] font-semibold text-maroon flex items-center gap-2"><GalleryHorizontal size={13}/>Gallery Images ({images.length})</span>
          <label className={`cursor-pointer text-[9px] uppercase tracking-wider text-maroon hover:text-gold flex items-center gap-1 border border-gold/30 px-2 py-1 bg-ivory transition ${uploading||!productId?'opacity-40 cursor-not-allowed':''}`}>
            <Plus size={10}/>{uploading?'Uploading...':'Add Image'}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={upload} disabled={uploading||!productId}/>
          </label>
        </div>
        {!productId&&<p className="text-[10px] text-amber-700 mb-2">Save the product first to add gallery images.</p>}
        {images.length===0?(
          <p className="text-[10px] text-ink/40 text-center py-4">No gallery images yet. Add images to create a slideshow on the product page.</p>
        ):(
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map(img=>(
              <div key={img.id} className="relative group">
                <img src={img.url} alt={img.alt||''} className="h-24 w-full object-cover border border-gold/30"/>
                <button type="button" onClick={()=>onDelete(productId,img.id)} className="absolute top-1 right-1 bg-red-800/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition" aria-label="Remove image"><X size={12}/></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function FaqForm({data,set}){return <><Field label="Question" className="md:col-span-2"><input className="input" value={data.question||''} onChange={e=>set('question',e.target.value)} required placeholder="e.g. Where do you ship?"/></Field><Field label="Answer" className="md:col-span-2"><textarea className="input min-h-32" value={data.answer||''} onChange={e=>set('answer',e.target.value)} required placeholder="Provide a clear, helpful answer..."/></Field><Field label="Sort order"><input className="input" type="number" value={data.sortOrder||0} onChange={e=>set('sortOrder',e.target.value)}/></Field><Check label="Visible to customers" checked={data.active} onChange={v=>set('active',v)}/></>;}
