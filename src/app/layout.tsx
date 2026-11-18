import type {Metadata} from 'next';import {AppProvider} from '@/context/app-context';import {Shell} from '@/components/shell';import './globals.css';
export const metadata:Metadata={title:'CesTick · Comparador de precios',description:'CesTick te ayuda a comparar el precio de la canasta básica en tiendas de tu zona y compartir precios con tu comunidad.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body><AppProvider><Shell>{children}</Shell></AppProvider></body></html>}
