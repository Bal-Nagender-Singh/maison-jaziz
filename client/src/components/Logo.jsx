import { Link } from 'react-router-dom';
export default function Logo({ light = false }) {
  return <Link to="/" className={`block text-center ${light ? 'text-white' : 'text-ink'}`} aria-label="Masion Jaziz home"><span className="block font-display text-2xl leading-none tracking-[.12em]">MASION JAZIZ</span><span className="mt-1 block text-[7px] uppercase tracking-[.48em] opacity-70">Maison de parfum</span></Link>;
}
