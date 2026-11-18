'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,MapPin} from 'lucide-react';
import {useApp} from '@/context/app-context';
import {products} from '@/data/demo';
import {Mascot} from '@/components/mascot';
import {Panel} from '@/components/ui';

type LocationStatus='loading'|'located'|'manual'|'unmapped'|'denied'|'error'|'unsupported';
type Coordinates={latitude:number;longitude:number;accuracy:number};
type ReverseAddress={name?:string;display_name?:string;address?:Record<string,string>};
const addressRequests=new Map<string,Promise<string>>();
function formatAddress(result:ReverseAddress){
  const address=result.address??{};const road=address.road??address.pedestrian??address.path??'';const street=road?`${road}${address.house_number?` ${address.house_number}`:''}`:'';const locality=address.neighbourhood??address.suburb??address.quarter??address.city_district??'';const city=address.city??address.town??address.village??address.municipality??'';const parts=[result.name,street,locality,city,address.state, address.postcode].filter(Boolean);const unique=parts.filter((part,index)=>parts.findIndex(other=>other?.toLocaleLowerCase('es')===part?.toLocaleLowerCase('es'))===index);return unique.join(', ')||result.display_name||'';
}
function reverseGeocode(latitude:number,longitude:number){
  const cacheKey=`canasta-address-v1:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;const inFlight=addressRequests.get(cacheKey);if(inFlight)return inFlight;
  try{const cached=window.localStorage.getItem(cacheKey);if(cached){const saved=JSON.parse(cached) as {address:string;expiresAt:number};if(saved.expiresAt>Date.now())return Promise.resolve(saved.address);window.localStorage.removeItem(cacheKey)}}catch{}
  const query=new URLSearchParams({format:'jsonv2',lat:String(latitude),lon:String(longitude),zoom:'18',addressdetails:'1',namedetails:'1','accept-language':'es'});
  const request=fetch(`https://nominatim.openstreetmap.org/reverse?${query.toString()}`,{headers:{'Accept-Language':'es-MX,es;q=0.9'}}).then(async response=>{if(!response.ok)throw new Error('No se pudo resolver la dirección');const result=await response.json() as ReverseAddress;const address=formatAddress(result);if(address)try{window.localStorage.setItem(cacheKey,JSON.stringify({address,expiresAt:Date.now()+30*24*60*60*1000}))}catch{}return address}).catch(()=> '').finally(()=>addressRequests.delete(cacheKey));
  addressRequests.set(cacheKey,request);return request;
}
function zoneFromCoordinates(latitude:number,longitude:number){
  if(latitude>21.02&&latitude<21.32&&longitude>-87.02&&longitude<-86.68)return 'Cancún, Q. Roo';
  if(latitude>20.48&&latitude<20.82&&longitude>-87.27&&longitude<-86.83)return 'Playa del Carmen, Q. Roo';
  if(latitude>20.08&&latitude<20.34&&longitude>-87.66&&longitude<-87.28)return 'Tulum, Q. Roo';
  if(latitude>18.34&&latitude<18.72&&longitude>-88.52&&longitude<-88.12)return 'Chetumal, Q. Roo';
  return '';
}
export default function Home(){
  const {region,setRegion,location,setLocation}=useApp();const [locationStatus,setLocationStatus]=useState<LocationStatus>('loading');const [locationAddress,setLocationAddress]=useState('');const locationRequested=useRef(false);
  const requestLocation=useCallback(()=>{if(locationRequested.current)return;locationRequested.current=true;if(location){setLocationStatus('located');return;}setLocationStatus('loading');if(!navigator.geolocation){setLocationStatus('unsupported');return;}navigator.geolocation.getCurrentPosition(position=>{const {latitude,longitude,accuracy}=position.coords;setLocation({latitude,longitude,accuracy});const detected=accuracy<=25000?zoneFromCoordinates(latitude,longitude):'';if(detected){setRegion(detected);setLocationStatus('located');}else setLocationStatus('unmapped');},error=>setLocationStatus(error.code===1?'denied':'error'),{enableHighAccuracy:false,timeout:10000,maximumAge:300000});},[location,setLocation,setRegion]);
  useEffect(()=>{requestLocation();},[requestLocation]);
  useEffect(()=>{if(!location){setLocationAddress('');return}let active=true;setLocationAddress('Buscando dirección…');reverseGeocode(location.latitude,location.longitude).then(address=>{if(active)setLocationAddress(address||'Dirección no disponible')});return()=>{active=false}},[location?.latitude,location?.longitude]);
  const regionLabel=region||(locationStatus==='loading'?'Buscando zona':locationStatus==='denied'?'Sin ubicación':locationStatus==='unsupported'?'Elige una zona':'Zona no identificada');
  return <div className="stack">
    <div className="welcome"><div><p className="eyebrow">CesTick · CANASTA COMUNITARIA</p><h1>El ahorro empieza en tu zona.</h1></div><span className="region-pill"><MapPin size={15}/>{regionLabel}</span></div>
    <Panel className="hero"><div className="hero-copy"><div className="hero-kicker">COMPARA · DECIDE · COMPARTE</div><h2>Tu canasta básica, al mejor precio.</h2><p>Compara tiendas cercanas con ayuda de los precios que comparte la comunidad.</p><Link href="/comparar" className="small-primary">Comparar mi canasta <ArrowRight size={17}/></Link></div><Mascot/></Panel>
    {location&&<GoogleMap coordinates={location} address={locationAddress}/>}
  </div>;
}

function GoogleMap({coordinates,address}:{coordinates:Coordinates;address:string}){
  const apiKey=process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY;const query=`${coordinates.latitude},${coordinates.longitude}`;const mapsUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return <Panel className="google-map-card"><div className="map-heading"><div><span className="eyebrow">ESTÁS AQUÍ</span><h2 className="address-title">{address||'Buscando dirección…'}</h2></div><span className="accuracy-pill">±{Math.round(coordinates.accuracy)} m</span></div>{apiKey?<iframe className="google-map-frame" title={`Mapa de ${address||'tu dirección'}`} src={`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}&zoom=17`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>:<div className="map-key-needed"><MapPin size={27}/><strong>{address||'Dirección no disponible'}</strong><p>Para ver Google Maps dentro de la página, agrega una clave restringida de Maps Embed API. Mientras tanto puedes abrir el punto exacto en Google Maps.</p><a className="outline-button" href={mapsUrl} target="_blank" rel="noreferrer">Abrir en Google Maps <ArrowRight size={16}/></a></div>}<p className="map-privacy">La dirección aproximada usa datos de <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a> y puede corresponder al sitio cartográfico más cercano. Google Maps también recibe las coordenadas para mostrar el mapa.</p></Panel>;
}
