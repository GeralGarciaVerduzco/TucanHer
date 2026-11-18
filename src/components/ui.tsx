import Link from 'next/link'; import type {ReactNode} from 'react'; import {ChevronRight} from 'lucide-react';
export function Panel({children,className=''}:{children:ReactNode;className?:string}){return <section className={`panel ${className}`}>{children}</section>}
export function PageTitle({title,subtitle}:{title:string;subtitle?:string}){return <div className="page-heading"><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>}
export function SectionHeader({title,href,action='Ver todo'}:{title:string;href?:string;action?:string}){return <div className="section-heading"><h2>{title}</h2>{href&&<Link href={href}>{action}<ChevronRight size={17}/></Link>}</div>}
export function PrimaryLink({href,children}:{href:string;children:ReactNode}){return <Link href={href} className="primary-button">{children}<ChevronRight size={19}/></Link>}
