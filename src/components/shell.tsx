'use client';
import Link from 'next/link';import { usePathname } from 'next/navigation';
import { BarChart3, Home, ShoppingBasket, MapPinned, UserRound, X, type LucideIcon } from 'lucide-react';
import { useApp } from '@/context/app-context';
const nav:{href:string;label:string;icon:LucideIcon}[]=[{href:'/',label:'Inicio',icon:Home},{href:'/canasta',label:'Canasta',icon:ShoppingBasket},{href:'/comparar',label:'Comparar',icon:BarChart3},{href:'/comunidad',label:'Comunidad',icon:MapPinned},{href:'/perfil',label:'Mi zona',icon:UserRound}];
export function Shell({children}:{children:React.ReactNode}){
 const pathname=usePathname();const {notice,dismiss}=useApp();
 return <div className="app-window"><header className="topbar"><Link href="/" className="brand"><span className="brand-mark"><ShoppingBasket size={21}/></span>Canasta<span>Comunidad</span></Link><Link href="/comparar" className="round-icon" aria-label="Comparar precios"><BarChart3 size={21}/></Link></header>
  <main className="main-content">{children}</main>
  <nav className="bottom-nav" aria-label="Navegación principal">{nav.map(({href,label,icon:Icon})=><Link key={href} className={`nav-item ${pathname===href?'active':''}`} href={href}><Icon size={22} strokeWidth={2}/><span>{label}</span></Link>)}</nav>
  {notice&&<div className="toast" role="status"><span>{notice}</span><button onClick={dismiss} aria-label="Cerrar aviso"><X size={18}/></button></div>}
 </div>;
}
