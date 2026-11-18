'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Bell,ChartNoAxesCombined,Gift,MapPin,ShoppingBasket,Users} from 'lucide-react';
import {useApp} from '@/context/app-context';
import {money,products,stores} from '@/data/demo';
import {Mascot} from '@/components/mascot';
import {Panel,SectionHeader} from '@/components/ui';

type LocationStatus='loading'|'located'|'manual'|'unmapped'|'denied'|'error'|'unsupported';
type Coordinates={latitude:number;longitude:number;accuracy:number};
function zoneFromCoordinates(latitude:number,longitude:number){
  if(latitude>21.02&&latitude<21.32&&longitude>-87.02&&longitude<-86.68)return 'Cancún, Q. Roo';
  if(latitude>20.48&&latitude<20.82&&longitude>-87.27&&longitude<-86.83)return 'Playa del Carmen, Q. Roo';
  if(latitude>20.08&&latitude<20.34&&longitude>-87.66&&longitude<-87.28)return 'Tulum, Q. Roo';
  if(latitude>18.34&&latitude<18.72&&longitude>-88.52&&longitude<-88.12)return 'Chetumal, Q. Roo';
  return '';
}
const regionOptions=['Cancún, Q. Roo','Región 510, Cancún','Centro de Cancún','Playa del Carmen, Q. Roo','Tulum, Q. Roo','Chetumal, Q. Roo'];

export default function Home(){
  const {basket,region,priceReports,setRegion,location,setLocation}=useApp();const [locationStatus,setLocationStatus]=useState<LocationStatus>('loading');const locationRequested=useRef(false);const items=products.filter(product=>basket.includes(product.id));
  const requestLocation=useCallback(()=>{if(locationRequested.current)return;locationRequested.current=true;if(location){setLocationStatus('located');return;}setLocationStatus('loading');if(!navigator.geolocation){setLocationStatus('unsupported');return;}navigator.geolocation.getCurrentPosition(position=>{const {latitude,longitude,accuracy}=position.coords;setLocation({latitude,longitude,accuracy});const detected=accuracy<=25000?zoneFromCoordinates(latitude,longitude):'';if(detected){setRegion(detected);setLocationStatus('located');}else setLocationStatus('unmapped');},error=>setLocationStatus(error.code===1?'denied':'error'),{enableHighAccuracy:false,timeout:10000,maximumAge:300000});},[location,setLocation,setRegion]);
  useEffect(()=>{requestLocation();},[requestLocation]);
  const totals=stores.map(store=>({name:store.name,total:items.reduce((sum,product)=>sum+store.prices[product.id as keyof typeof store.prices],0)})).sort((a,b)=>a.total-b.total);const best=items.length?totals[0]:undefined;const localReports=priceReports.filter(report=>report.region===region).length;
  const locationMessage=locationStatus==='loading'?'Solicitando permiso para ubicar tu zona…':locationStatus==='located'?`Estamos en ${region}.`:locationStatus==='manual'?`Zona seleccionada: ${region}.`:locationStatus==='unmapped'?'Ubicación detectada, pero aún no tenemos una zona de precios para ese lugar.':locationStatus==='denied'?'No tenemos permiso para ver tu ubicación. Elige tu zona manualmente.':locationStatus==='unsupported'?'Este navegador no ofrece ubicación. Elige tu zona manualmente.':'No pudimos obtener tu ubicación. Elige tu zona manualmente.';
  return <div className="stack">
    <div className="welcome"><div><p className="eyebrow">CANASTA COMUNITARIA</p><h1>El ahorro empieza en tu zona.</h1></div><span className="region-pill"><MapPin size={15}/>{region||'Buscando zona'}</span></div>
    <Panel className="hero"><div className="hero-copy"><div className="hero-kicker">COMPARA · DECIDE · COMPARTE</div><h2>Tu canasta básica, al mejor precio.</h2><p>Compara tiendas cercanas con ayuda de los precios que comparte la comunidad.</p><Link href="/comparar" className="small-primary">Comparar mi canasta <ArrowRight size={17}/></Link></div><Mascot/></Panel>
    <Panel className={`location-status ${locationStatus==='located'?'location-found':''}`}><div className="location-status-icon"><MapPin size={20}/></div><div className="location-status-copy"><strong>{locationMessage}</strong><small>La app no guarda tus coordenadas; se usan para mostrar el punto en el mapa.</small></div>{(locationStatus==='denied'||locationStatus==='error'||locationStatus==='unsupported')&&<button className="location-retry" onClick={()=>{locationRequested.current=false;requestLocation();}}>Intentar de nuevo</button>}<label className="location-manual"><span>{region?'Cambiar zona':'Seleccionar zona'}</span><select value={region} onChange={event=>{setRegion(event.target.value);setLocationStatus('manual');}}><option value="">Elegir zona</option>{regionOptions.map(option=><option key={option}>{option}</option>)}</select></label></Panel>
    {location&&<GoogleMap coordinates={location}/>}
    <div className="stats-grid"><Link className="panel stat" href="/canasta"><ShoppingBasket className="accent"/><div><small>Productos básicos</small><strong>{items.length}</strong><span>en tu canasta</span></div></Link><Link className="panel stat" href="/comunidad"><Users className="accent"/><div><small>Aportes en tu zona</small><strong>{localReports}</strong><span>{localReports?'reportes en este navegador':'sé la primera persona en aportar'}</span></div></Link></div>
    <SectionHeader title="Mejor precio disponible" href="/comparar" action="Ver comparación"/><Link href="/comparar" className="panel home-best"><span className="store-icon"><ChartNoAxesCombined size={23}/></span><div><strong>{best?.name??'Elige productos básicos'}</strong><small>Menor total estimado para tu canasta · precio de muestra</small></div><b>{best?money(best.total):'—'}</b></Link>
    <div className="home-next-steps"><Link href="/actividad" className="panel home-next-step"><Bell size={19}/><span><strong>Seguir precios</strong><small>Alertas e historial en Actividad</small></span></Link><Link href="/recompensas" className="panel home-next-step"><Gift size={19}/><span><strong>Ver beneficios</strong><small>Cupones locales y puntos</small></span></Link></div>
    <Panel className="community-invite"><div><span className="eyebrow">PRECIOS DE LA COMUNIDAD</span><h2>¿Viste otro precio en tu tienda?</h2><p>Compártelo para que otras familias de {region} puedan comparar.</p></div><Link href="/comunidad" className="outline-button">Aportar precio <ArrowRight size={17}/></Link></Panel>
    <Panel className="data-note"><MapPin size={18}/><p>Esta versión usa precios de muestra. Los aportes se reflejan al instante en tu navegador; compartirlos en tiempo real con toda la comunidad requiere conectar un servicio común.</p></Panel>
  </div>;
}

function GoogleMap({coordinates}:{coordinates:Coordinates}){
  const apiKey=process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY;const query=`${coordinates.latitude},${coordinates.longitude}`;const mapsUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return <Panel className="google-map-card"><div className="map-heading"><div><span className="eyebrow">TU UBICACIÓN</span><h2>Estamos aquí</h2></div><span className="accuracy-pill">±{Math.round(coordinates.accuracy)} m</span></div>{apiKey?<iframe className="google-map-frame" title="Tu ubicación en Google Maps" src={`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}&zoom=17`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>:<div className="map-key-needed"><MapPin size={27}/><strong>Ubicación exacta detectada</strong><span>{coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}</span><p>Para ver Google Maps dentro de la página, agrega una clave restringida de Maps Embed API. Mientras tanto puedes abrir el punto exacto en Google Maps.</p><a className="outline-button" href={mapsUrl} target="_blank" rel="noreferrer">Abrir en Google Maps <ArrowRight size={16}/></a></div>}<p className="map-privacy">La precisión del punto depende del dispositivo y del permiso otorgado. Al abrir Google Maps, se comparte con Google la ubicación mostrada.</p></Panel>;
}
