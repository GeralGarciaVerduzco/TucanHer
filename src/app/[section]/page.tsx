import {notFound} from 'next/navigation';import {Screens} from '@/components/screens';
const sections=['canasta','comparar','comunidad','perfil'];
export function generateStaticParams(){return sections.map(section=>({section}));}
export default async function Page({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!sections.includes(section))notFound();return <Screens section={section}/>;}
