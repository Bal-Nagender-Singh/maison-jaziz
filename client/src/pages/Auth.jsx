import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Phone, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OrnamentalDivider } from '../components/RoyalUI';

export default function Auth(){
  const [email,setEmail]=useState('');
  const [phone,setPhone]=useState('');
  const [otp,setOtp]=useState('');
  const [step,setStep]=useState('email');
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const {requestOtp,verifyOtp,loading,user,initialized}=useAuth();
  const nav=useNavigate();
  const loc=useLocation();

  useEffect(() => {
    if (initialized && user) {
      nav('/account', { replace: true });
    }
  }, [user, initialized, nav]);

  if (!initialized) {
    return <div className="grid min-h-screen place-items-center bg-ivory"><p className="eyebrow text-gold">Opening Masion Jaziz...</p></div>;
  }

  const submit=async e=>{
    e.preventDefault();setError('');setNotice('');
    try{
      if(step==='email'){
        if(!phone.trim()){setError('Phone number is required.');return;}
        await requestOtp(email,phone);
        setStep('otp');
        setNotice('Access code sent. Check your email for the six-digit code.');
      }else{
        await verifyOtp(email,otp,phone);
        setNotice('Verified. Opening your account...');
        setTimeout(()=>nav(loc.state?.from?.pathname||'/account',{replace:true}),350);
      }
    }catch(err){
      const message=err.response?.data?.message||'Unable to continue. Confirm that the API and email service are running.';
      setError(/expired/i.test(message)?'This OTP has expired. Request a new code.':/invalid/i.test(message)?'Invalid OTP. Check the six digits and try again.':message);
    }
  };

  return <div className="arabesque flex min-h-screen items-center justify-center bg-maroon px-5 py-28">
    <form onSubmit={submit} className="w-full max-w-lg border border-gold/70 bg-ivory p-3 shadow-2xl">
      <div className="arabesque border border-gold/35 px-6 py-12 text-center md:px-12">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-gold text-antique">{step==='email'?<Phone size={20}/>:<ShieldCheck size={20}/>}</div>
        <p className="mt-6 font-royal text-[9px] uppercase tracking-[.28em] text-antique">Private client access</p>
        <h1 className="mt-4 font-display text-5xl leading-none text-maroon md:text-6xl">{step==='email'?'Welcome to the Maison':'Enter your code'}</h1>
        <div className="mt-6"><OrnamentalDivider/></div>
        <p className="mt-6 text-sm leading-7 text-ink/55">{step==='email'?'Sign in without a password. Enter your email and phone — we will send a private six-digit code.':<>A code was sent to <strong className="text-maroon">{email}</strong>. It expires in ten minutes.</>}</p>
        <div className="mt-8 space-y-3">
          {step==='email'?(<>
            <input className="input text-center" type="email" autoComplete="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required/>
            <input className="input text-center" type="tel" autoComplete="tel" placeholder="Phone number (required)" value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9+\-\s()]/g,''))} required/>
          </>):(
            <input className="input text-center font-display text-3xl tracking-[.35em]" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength="6" placeholder="000000" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} required/>
          )}
        </div>
        {notice&&<p className="mt-4 flex items-center justify-center gap-2 text-xs text-green-800"><CheckCircle2 size={14}/>{notice}</p>}
        {error&&<p role="alert" className="mt-4 text-xs leading-5 text-red-800">{error}</p>}
        <button disabled={loading} className="btn-dark mt-7 w-full disabled:opacity-50">{loading?'Please wait':step==='email'?'Send Access Code':'Verify and Continue'}</button>
        {step==='otp'&&<button type="button" onClick={()=>{setStep('email');setOtp('');setError('');setNotice('')}} className="mx-auto mt-6 flex items-center gap-2 text-[9px] uppercase tracking-[.16em] text-maroon/60"><ArrowLeft size={13}/>Use another email</button>}
      </div>
    </form>
  </div>;
}

