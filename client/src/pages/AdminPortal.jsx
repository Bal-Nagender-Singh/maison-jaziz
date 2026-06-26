import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Admin from './Admin';
import AdminLogin from './AdminLogin';

export default function AdminPortal(){
  const {user,initialized}=useAuth();
  if(!initialized)return <div className="grid min-h-screen place-items-center bg-maroon text-champagne"><p className="font-royal text-[10px] uppercase tracking-[.25em]">Verifying access...</p></div>;
  if(!user)return <AdminLogin/>;
  if(user.role!=='admin')return <div className="arabesque grid min-h-screen place-items-center bg-maroon px-6 text-center text-ivory"><div className="max-w-lg border border-gold/50 p-10"><ShieldX size={42} className="mx-auto text-gold"/><p className="mt-6 font-royal text-[9px] uppercase tracking-[.25em] text-champagne">Access denied</p><h1 className="mt-4 font-display text-5xl">Restricted administration area</h1><p className="mt-5 text-sm leading-7 text-ivory/60">This account does not have administrator permission.</p><Link to="/account" className="btn-light mt-7">Return to Account</Link></div></div>;
  return <Admin/>;
}
