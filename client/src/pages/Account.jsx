import { useEffect, useState } from 'react';
import { LogOut, Package, ShieldCheck, User, Save, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../services/api';

export default function Account() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { add } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState(user?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(user?.addressLine2 || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [zipCode, setZipCode] = useState(user?.zipCode || '');
  const [country, setCountry] = useState(user?.country || 'India');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => updateUser(data.user)).catch(() => {});
    api.get('/orders/my-orders').then(({ data }) => setOrders(data)).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const { data } = await api.put('/auth/profile', {
        name,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        country
      });
      updateUser(data.user);
      setSuccess('Profile details saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyWishlist = (product) => {
    const defaultSize = product.sizes?.length > 0 ? product.sizes[0].size : product.size;
    const defaultPrice = product.sizes?.length > 0 ? product.sizes[0].price : product.price;
    const defaultStock = product.sizes?.length > 0 ? product.sizes[0].stock : product.stock;
    add({
      ...product,
      size: defaultSize,
      price: defaultPrice,
      stock: defaultStock
    }, 1);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen px-6 pb-28 pt-40 md:px-10">
      <div className="mx-auto max-w-[1380px]">
        {/* Header */}
        <div className="flex flex-col justify-between gap-8 border-b border-gold/30 pb-12 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-gold uppercase tracking-[.25em] text-[9px] font-royal">Private client</p>
            <h1 className="display mt-5 font-display text-6xl md:text-8xl text-maroon">Your account</h1>
            <p className="mt-5 text-xs tracking-wider text-antique">{user.name || user.email}</p>
          </div>
          <div className="flex gap-3">
            {user.role === 'admin' && (
              <Link className="btn-outline font-royal text-[9px] uppercase tracking-luxury" to="/admin">
                Admin dashboard
              </Link>
            )}
            <button className="btn-outline gap-2 font-royal text-[9px] uppercase tracking-luxury" onClick={logout}>
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid gap-16 py-14 lg:grid-cols-12">
          {/* Left Column: Personal & Shipping Details (5/12 space on desktop) */}
          <div className="lg:col-span-5 border border-gold/30 bg-ivory p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gold/20 pb-4 mb-6">
              <User size={18} className="text-antique" />
              <h2 className="font-display text-2xl text-maroon">Profile</h2>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[9px] uppercase tracking-[.18em] text-maroon/60">Full Name</span>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[9px] uppercase tracking-[.18em] text-maroon/60">Phone Number</span>
                  <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-[9px] uppercase tracking-[.18em] text-maroon/60">Address Line 1</span>
                <input className="input" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Suite, building, street" />
              </label>

              <label className="block">
                <span className="mb-2 block text-[9px] uppercase tracking-[.18em] text-maroon/60">Address Line 2 (Optional)</span>
                <input className="input" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Apartment, unit, landmark" />
              </label>

              <div className="grid gap-4 grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[9px] uppercase tracking-[.18em] text-maroon/60">City</span>
                  <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[9px] uppercase tracking-[.18em] text-maroon/60">State</span>
                  <input className="input" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Maharashtra" />
                </label>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[9px] uppercase tracking-[.18em] text-maroon/60">ZIP / Postal Code</span>
                  <input className="input" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="e.g. 400001" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[9px] uppercase tracking-[.18em] text-maroon/60">Country</span>
                  <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. India" />
                </label>
              </div>

              {success && (
                <div className="flex items-center gap-2 text-xs text-green-800 bg-green-50/50 border border-green-200/50 p-3 rounded">
                  <ShieldCheck size={14} className="text-green-700 shrink-0" />
                  <span>{success}</span>
                </div>
              )}
              {error && (
                <p role="alert" className="text-xs text-red-800 bg-red-50/50 border border-red-200/50 p-3 rounded">
                  {error}
                </p>
              )}

              <button disabled={loading} className="btn-dark w-full gap-2 flex items-center justify-center">
                <Save size={14} />
                {loading ? 'Saving details...' : 'Save Profile Details'}
              </button>
            </form>
          </div>

          {/* Right Column: Tabbed Interface for Order History & Wishlist (7/12 space on desktop) */}
          <div className="lg:col-span-7">
            <div className="flex border-b border-gold/20 mb-6 gap-6">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 pb-4 text-2xl font-display transition relative ${
                  activeTab === 'orders' ? 'text-maroon' : 'text-antique/60 hover:text-antique'
                }`}
              >
                <Package size={18} />
                <span>Order History</span>
                {activeTab === 'orders' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wishlist')}
                className={`flex items-center gap-2 pb-4 text-2xl font-display transition relative ${
                  activeTab === 'wishlist' ? 'text-maroon' : 'text-antique/60 hover:text-antique'
                }`}
              >
                <Heart size={18} />
                <span>Wishlist</span>
                {activeTab === 'wishlist' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold" />
                )}
              </button>
            </div>

            {activeTab === 'orders' ? (
              orders.length ? (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o._id} className="border border-gold/30 bg-ivory p-6 shadow-sm">
                      {/* Header Info */}
                      <div className="grid gap-4 border-b border-gold/20 pb-4 mb-4 md:grid-cols-4 items-center">
                        <div>
                          <p className="text-[9px] uppercase tracking-luxury text-maroon/60">Order</p>
                          <p className="mt-1 text-xs font-royal text-antique font-semibold">#{o._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-luxury text-maroon/60">Date</p>
                          <p className="mt-1 text-xs text-ink/75">{new Date(o.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-luxury text-maroon/60">Order Status</p>
                          <span className="inline-block mt-1 text-[10px] uppercase tracking-wider px-2.5 py-0.5 border border-gold bg-cream text-maroon font-semibold">
                            {o.status || 'pending'}
                          </span>
                        </div>
                        <div className="md:text-right">
                          <p className="text-[9px] uppercase tracking-luxury text-maroon/60">Total</p>
                          <p className="mt-1 font-display text-xl text-maroon">₹{Number(o.totalAmount).toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Ordered Items List */}
                      <div className="space-y-3 mb-4">
                        <p className="font-royal text-[9px] uppercase tracking-luxury text-maroon/60">Items</p>
                        <div className="divide-y divide-gold/10">
                          {(o.products || []).map((p) => (
                            <div key={p._id} className="flex justify-between py-2 text-xs">
                              <div className="flex gap-2 items-center">
                                <span className="font-display text-lg text-maroon">{p.name}</span>
                                <span className="text-[10px] text-antique bg-cream border border-gold/25 px-1.5 py-0.5">{p.size}</span>
                                <span className="text-ink/50">x {p.quantity}</span>
                              </div>
                              <span className="text-ink/80">₹{(Number(p.price) * p.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div className="pt-4 border-t border-gold/20 flex flex-col sm:flex-row justify-between text-[10px] text-antique gap-2">
                        <span>Payment Status: <strong className="uppercase text-maroon">{o.paymentStatus}</strong></span>
                        {o.couponCode && <span>Applied Coupon: <strong className="text-maroon uppercase">{o.couponCode}</strong></span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid min-h-64 place-items-center border border-gold/35 bg-ivory/50 text-center p-8">
                  <div>
                    <Package className="mx-auto text-gold" size={32} strokeWidth={1} />
                    <h3 className="mt-5 font-display text-3xl text-maroon">Your archive is empty</h3>
                    <p className="mt-2 text-xs text-ink/45">Your fragrance orders will appear here.</p>
                    <Link className="btn-dark mt-6 inline-block" to="/collection">
                      Discover collection
                    </Link>
                  </div>
                </div>
              )
            ) : (
              wishlist.length ? (
                <div className="space-y-4">
                  {wishlist.map((p) => {
                    const defaultSize = p.sizes?.length > 0 ? p.sizes[0].size : p.size;
                    const defaultPrice = p.sizes?.length > 0 ? p.sizes[0].price : p.price;
                    return (
                      <div key={p._id} className="border border-gold/30 bg-ivory p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-between">
                        <div className="flex gap-4 items-center sm:items-start w-full sm:w-auto">
                          <img src={p.image} className="h-24 w-20 border border-gold/30 object-cover shrink-0" alt={p.name} />
                          <div>
                            <h3 className="font-display text-2xl text-maroon">{p.name}</h3>
                            <p className="text-xs text-antique mt-1">{p.family}</p>
                            {p.notes && (
                              <p className="mt-2 text-[10px] text-ink/50 leading-relaxed max-w-md">Accords: {p.notes.join(' / ')}</p>
                            )}
                            <p className="mt-3 font-royal text-sm text-antique">
                              ₹{Number(defaultPrice).toLocaleString('en-IN')} <span className="text-[10px] text-ink/45 ml-1">({defaultSize})</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0 justify-end">
                          <button
                            type="button"
                            onClick={() => handleBuyWishlist(p)}
                            className="btn-dark py-2 px-4 text-xs font-semibold uppercase tracking-luxury flex-1 sm:flex-none text-center"
                          >
                            Order Now
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(p)}
                            className="btn-outline py-2 px-4 text-[9px] uppercase tracking-luxury flex-1 sm:flex-none text-center"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid min-h-64 place-items-center border border-gold/35 bg-ivory/50 text-center p-8">
                  <div>
                    <Heart className="mx-auto text-gold" size={32} strokeWidth={1} />
                    <h3 className="mt-5 font-display text-3xl text-maroon">Your wishlist is empty</h3>
                    <p className="mt-2 text-xs text-ink/45">Save your favorite fragrances to order them later.</p>
                    <Link className="btn-dark mt-6 inline-block" to="/collection">
                      Discover collection
                    </Link>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
