'use client';
import Link from 'next/link';import Image from 'next/image';import { usePathname } from 'next/navigation';
import { BarChart3, Bell, Gift, History, Home, ShoppingBasket, UserRound, X, type LucideIcon } from 'lucide-react';
import { useApp } from '@/context/app-context';
import {ChatAssistant} from '@/components/chat-assistant';
const nav:{href:string;label:string;icon:LucideIcon}[]=[{href:'/',label:'Inicio',icon:Home},{href:'/canasta',label:'Canasta',icon:ShoppingBasket},{href:'/comparar',label:'Comparar',icon:BarChart3},{href:'/actividad',label:'Actividad',icon:History},{href:'/recompensas',label:'Beneficios',icon:Gift}];
export function Shell({children}:{children:React.ReactNode}){
 const pathname=usePathname();const {notice,dismiss}=useApp();
 return <div className="app-window"><header className="topbar"><Link href="/" className="brand" aria-label="CesTick, inicio"><span className="brand-mark"><Image src="/images/LOGO.png" alt="" width={42} height={42} priority/></span><span>CesTick</span></Link><div className="topbar-actions"><Link href="/alertas" className="round-icon" aria-label="Alertas de precios"><Bell size={19}/></Link><Link href="/perfil" className={`round-icon profile-shortcut ${pathname==='/perfil'?'active':''}`} aria-label="Mi perfil"><UserRound size={19}/></Link></div></header>
  <main className="main-content">{children}</main>
  <nav className="bottom-nav" aria-label="Navegación principal">{nav.map(({href,label,icon:Icon})=>{const active=pathname===href||(href==='/actividad'&&['/historial','/alertas'].includes(pathname));return <Link key={href} className={`nav-item ${active?'active':''}`} href={href}><Icon size={22} strokeWidth={2}/><span>{label}</span></Link>})}</nav>
  {notice&&<div className="toast" role="status"><span>{notice}</span><button onClick={dismiss} aria-label="Cerrar aviso"><X size={18}/></button></div>}
  <ChatAssistant/>
 </div>;
}
