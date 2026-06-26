import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({children,admin=false}){
  const {user,initialized}=useAuth();const location=useLocation();
  if(!initialized)return <div className="grid min-h-screen place-items-center bg-ivory"><p className="eyebrow text-gold">Opening your private account...</p></div>;
  if(!user)return <Navigate to={admin?'/admin':'/login'} state={{from:location}} replace/>;
  if(admin&&user.role!=='admin')return <Navigate to="/account" replace/>;
  return children;
}
