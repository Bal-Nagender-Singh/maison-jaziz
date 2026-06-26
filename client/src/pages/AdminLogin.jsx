import { useState } from 'react';
import { Crown, LockKeyhole } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OrnamentalDivider } from '../components/RoyalUI';

export default function AdminLogin(){
  const [email,setEmail]=useState('admin@masionjaziz.com');const [password,setPassword]=useState('');const [error,setError]=useState('');
  const {adminLogin,loading}=useAuth();const navigate=useNavigate();
  const submit=async e=>{e.preventDefault();setError('');try{await adminLogin(email,password);navigate('/admin',{replace:true})}catch(err){setError(err.response?.data?.message||'Unable to sign in to the admin dashboard.')}};
  return <div className="arabesque grid min-h-screen place-items-center bg-maroon px-5 pb-16 pt-32"><form onSubmit={submit} className="w-full max-w-lg border border-gold/70 bg-ivory p-3 shadow-2xl"><div className="arabesque border border-gold/35 px-6 py-12 text-center md:px-12"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-gold text-antique"><Crown size={20}/></div><p className="mt-6 font-royal text-[9px] uppercase tracking-[.28em] text-antique">Restricted access</p><h1 className="mt-4 font-display text-5xl leading-none text-maroon md:text-6xl">Administration</h1><div className="mt-6"><OrnamentalDivider/></div><p className="mt-6 text-sm leading-7 text-ink/55">Authorized personnel only.</p><div className="mt-8 space-y-4"><label className="block text-left"><span className="mb-2 block text-[9px] uppercase tracking-[.18em] text-maroon/60">Admin ID</span><input className="input" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label className="block text-left"><span className="mb-2 block text-[9px] uppercase tracking-[.18em] text-maroon/60">Password</span><div className="relative"><LockKeyhole size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-antique"/><input className="input pl-11" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></div></label></div>{error&&<p role="alert" className="mt-4 text-xs leading-5 text-red-800">{error}</p>}<button disabled={loading} className="btn-dark mt-7 w-full disabled:opacity-50">{loading?'Signing in...':'Continue'}</button></div></form></div>;
}
