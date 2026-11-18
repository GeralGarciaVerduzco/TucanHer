'use client';

import {useEffect,useMemo,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {ArrowRight,Check,ChevronDown,Clock3,Lightbulb,MapPin,Plus,ShoppingBasket,Store,Users} from 'lucide-react';
import {useApp} from '@/context/app-context';
import {money,products,stores} from '@/data/demo';
import {PageTitle,Panel,PrimaryLink,SectionHeader} from '@/components/ui';

const regions=['Cancún, Q. Roo','Región 510, Cancún','Centro de Cancún','Playa del Carmen, Q. Roo','Tulum, Q. Roo','Chetumal, Q. Roo'];
function distanceKm(lat1:number,lon1:number,lat2:number,lon2:number){const radians=(degrees:number)=>degrees*Math.PI/180;const dLat=radians(lat2-lat1);const dLon=radians(lon2-lon1);const value=Math.sin(dLat/2)**2+Math.cos(radians(lat1))*Math.cos(radians(lat2))*Math.sin(dLon/2)**2;return 6371*2*Math.atan2(Math.sqrt(value),Math.sqrt(1-value));}

export function Screens({section}:{section:string}){
  switch(section){case'canasta':return <Basket/>;case'comparar':return <Compare/>;case'comunidad':return <Community/>;case'perfil':return <Profile/>;default:return null;}
}

function Basket(){
  const {basket,toggleBasket}=useApp();const selected=products.filter(product=>basket.includes(product.id));
  return <div className="stack"><PageTitle title="Canasta básica" subtitle="Elige lo que compra tu hogar. Compararemos el costo en las tiendas de tu zona."/><div className="basket-toolbar"><span><ShoppingBasket size={18}/>{selected.length} productos</span><span className="fresh-chip">Canasta familiar</span></div><div className="product-grid">{products.map(product=><button key={product.id} type="button" aria-pressed={basket.includes(product.id)} onClick={()=>toggleBasket(product.id)} className={`panel product ${basket.includes(product.id)?'selected':''}`}><span className="product-emoji" aria-hidden>{product.emoji}</span><strong>{product.name}</strong><small>{product.size}</small><span className="product-price">Promedio {money(product.price)}</span><span className="select-indicator">{basket.includes(product.id)?<Check size={14}/>:<span>+</span>}</span></button>)}</div><Panel className="total-panel"><span>Estimado de referencia</span><strong>{money(selected.reduce((sum,product)=>sum+product.price,0))}</strong><small>Promedio de muestra. El precio final depende de la tienda y de los reportes locales.</small></Panel><PrimaryLink href="/comparar">Comparar mi canasta</PrimaryLink></div>;
}

function Compare(){
  const {basket,region,priceReports,setRegion,location,setLocation}=useApp();const [branchStoreId,setBranchStoreId]=useState<string|null>(null);const [selectedBranchId,setSelectedBranchId]=useState<string|null>(null);const [sortMode,setSortMode]=useState<'menor-total'|'mayor-total'|'mas-cerca'|'mas-lejos'>('menor-total');const selected=products.filter(product=>basket.includes(product.id));
  useEffect(()=>{if(location||!navigator.permissions?.query||!navigator.geolocation)return;let active=true;navigator.permissions.query({name:'geolocation'}).then(permission=>{if(!active||permission.state!=='granted')return;navigator.geolocation.getCurrentPosition(position=>{if(active)setLocation({latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy});},()=>{}, {enableHighAccuracy:false,timeout:10000,maximumAge:300000});}).catch(()=>{});return()=>{active=false};},[location,setLocation]);
  const comparisons=useMemo(()=>stores.map(store=>{
    const lines=selected.map(product=>{const report=priceReports.find(item=>item.storeId===store.id&&item.productId===product.id&&item.region===region);return {product,price:report?.price??store.prices[product.id as keyof typeof store.prices],report};});
    return {...store,lines,total:lines.reduce((sum,line)=>sum+line.price,0),freshCount:lines.filter(line=>line.report).length};
  }),[selected,priceReports,region]);
  const getStoreDistance=(store:typeof comparisons[number])=>location&&store.branches.length?Math.min(...store.branches.map(branch=>distanceKm(location.latitude,location.longitude,branch.latitude,branch.longitude))):null;
  const orderedComparisons=[...comparisons].sort((a,b)=>{
    if(sortMode==='menor-total')return a.total-b.total;
    if(sortMode==='mayor-total')return b.total-a.total;
    const distanceA=getStoreDistance(a);const distanceB=getStoreDistance(b);
    if(distanceA===null)return distanceB===null?0:1;
    if(distanceB===null)return -1;
    return sortMode==='mas-cerca'?distanceA-distanceB:distanceB-distanceA;
  });
  const best=selected.length?comparisons.reduce((lowest,item)=>item.total<lowest.total?item:lowest,comparisons[0]):undefined;const average=comparisons.length?comparisons.reduce((sum,item)=>sum+item.total,0)/comparisons.length:0;
  const splitTotal=selected.reduce((sum,product)=>sum+Math.min(...comparisons.map(store=>store.lines.find(line=>line.product.id===product.id)?.price??Number.POSITIVE_INFINITY)),0);
  return <div className="stack"><PageTitle title="Compara precios" subtitle="Consulta el costo provisional de tu canasta en varios comercios."/><label className="region-select"><MapPin size={19}/><span>Tu zona</span><select value={region} onChange={event=>setRegion(event.target.value)}><option value="">Elige una zona</option>{regions.map(option=><option key={option}>{option}</option>)}</select></label>
    <Panel className="smart-pick"><div className="smart-pick-top"><span className="smart-icon"><Lightbulb size={21}/></span><span className="fresh-chip">Recomendación inteligente · demo</span></div><p>Para tu canasta de {selected.length} productos, la opción de menor costo disponible es:</p>{best?<><h2>{best.name}</h2><strong className="smart-price">{money(best.total)}</strong><p className="smart-reason">{average>best.total?`Ahorrarías ${money(average-best.total)} frente al promedio de las tiendas comparadas.`:'Es el costo más bajo entre los precios disponibles.'} {best.freshCount?`${best.freshCount} precios tienen un reporte reciente de tu zona.`:'La comparación usa precios de muestra; aún no hay aportes recientes en esta zona.'}</p>{splitTotal<best.total&&<p className="smart-reason"><strong>Si te queda cómodo visitar varias tiendas,</strong> los mejores precios por producto sumarían {money(splitTotal)} (hasta {money(best.total-splitTotal)} menos antes de traslados).</p>}</>:<p>Selecciona productos en tu canasta para obtener una recomendación.</p>}</Panel>
    <div className="compare-heading"><SectionHeader title="Tiendas de la zona"/><span className="example-label">PROVISIONALES · NO VIGENTES</span></div>
    <label className="store-sort"><span>Ordenar por</span><select value={sortMode} onChange={event=>setSortMode(event.target.value as typeof sortMode)}><option value="menor-total">Menor total de la canasta</option><option value="mayor-total">Mayor total de la canasta</option><option value="mas-cerca">Sucursal más cercana</option><option value="mas-lejos">Sucursal más lejana</option></select></label>
    {(sortMode==='mas-cerca'||sortMode==='mas-lejos')&&<p className="sort-note">Distancia aproximada en línea recta a la sucursal registrada más cercana. Las tiendas sin sucursales cargadas aparecen al final.</p>}
    {orderedComparisons.map((comparison,index)=>{
      const expanded=branchStoreId===comparison.id;
      const storeDistance=getStoreDistance(comparison);
      const googleKey=process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY;
      return <Panel key={comparison.id} className={`comparison-card ${index===0?'is-best':''}`}>
        <div className="comparison-top"><span className="store-icon"><Store size={23}/></span><div className="store-data"><strong>{comparison.name}</strong><small>{comparison.freshCount?`${comparison.freshCount} precios reportados en ${region}`:'Sin reportes recientes en esta zona'}{storeDistance!==null?` · Sucursal a ${storeDistance.toFixed(1)} km` : comparison.branches.length?' · Distancia no disponible':' · Sin sucursal cargada'}</small></div><div className="store-end"><strong>{money(comparison.total)}</strong>{sortMode==='menor-total'&&index===0&&<span className="best-chip">Menor total</span>}</div></div>
        <div className="comparison-lines">{comparison.lines.length?comparison.lines.map(line=><div className="comparison-line" key={line.product.id}><span>{line.product.emoji} {line.product.name}</span><span>{money(line.price)}{line.report&&<small> · ahora</small>}</span></div>):<p className="empty-message">Elige productos para ver el detalle.</p>}</div>
        <button className="branch-toggle" type="button" aria-expanded={expanded} onClick={()=>{setBranchStoreId(expanded?null:comparison.id);setSelectedBranchId(null);}}><MapPin size={16}/>{expanded?'Ocultar sucursales':'Ver sucursales'}</button>
        {expanded&&<div className="branch-list">{comparison.branches.length?comparison.branches.map(item=>{
          const selected=selectedBranchId===item.id;
          const km=location?distanceKm(location.latitude,location.longitude,item.latitude,item.longitude):null;
          const destination=`${item.latitude},${item.longitude}`;
          const mapUrl=googleKey?(location?`https://www.google.com/maps/embed/v1/directions?key=${encodeURIComponent(googleKey)}&origin=${encodeURIComponent(`${location.latitude},${location.longitude}`)}&destination=${encodeURIComponent(destination)}&mode=driving&units=metric`:`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(googleKey)}&q=${encodeURIComponent(destination)}&zoom=15`):'';
          return <div className="branch-entry" key={item.id}>
            <button type="button" className={`branch-option ${selected?'active':''}`} aria-expanded={selected} onClick={()=>setSelectedBranchId(selected?null:item.id)}><span><strong>{item.name}</strong><small>{km!==null?`${km.toFixed(1)} km aprox. desde tu ubicación`:'Distancia no disponible'}</small></span><ChevronDown className="branch-chevron" size={17}/></button>
            {selected&&<div className="branch-detail"><div className="branch-detail-head"><strong>{item.name}</strong>{km!==null&&<span>{km.toFixed(1)} km aprox.</span>}</div>{mapUrl?<iframe className="branch-map-frame" title={`Mapa y ruta a ${item.name}`} src={mapUrl} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>:<div className="branch-map-fallback"><MapPin size={24}/><span>Ubicación de la sucursal</span><small>Configura Maps Embed API para mostrar el mapa aquí.</small></div>}{!location&&<small>Cuando la app recupere la ubicación autorizada, mostrará aquí la distancia y la ruta.</small>}</div>}
          </div>;
        }):<p className="branch-empty">Aún no hay sucursales cargadas para {comparison.name}. Comparte un enlace de Google Maps para agregar una.</p>}</div>}
      </Panel>;
    })}
    <Panel className="data-note"><Clock3 size={18}/><p>Los precios de tienda son provisionales e ilustrativos, no cotizaciones actuales. Tus aportaciones actualizan esta comparación al instante en este navegador; compartirlas con toda la comunidad requiere conectar un servicio de datos común.</p></Panel><PrimaryLink href="/comunidad">Compartir un precio</PrimaryLink>
  </div>;
}

function Community(){
  const {region,priceReports,addPriceReport,setRegion}=useApp();const [storeId,setStoreId]=useState(stores[0].id);const [productId,setProductId]=useState(products[0].id);const [price,setPrice]=useState('');const [saved,setSaved]=useState(false);
  const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const amount=Number(price);if(!amount||amount<=0)return;addPriceReport(storeId,productId,amount);setSaved(true);setPrice('');window.setTimeout(()=>setSaved(false),3200);};
  const recent=priceReports.filter(report=>report.region===region);const productName=(id:string)=>products.find(product=>product.id===id)?.name??'Producto';const legacyStores:Record<string,string>={sol:'Mercado Sol',ahorro:'Super Ahorro',barrio:'Mercado del Barrio'};const storeName=(id:string)=>stores.find(store=>store.id===id)?.name??legacyStores[id]??'Tienda';
  return <div className="stack"><PageTitle title="Precios de la comunidad" subtitle="Un precio compartido ayuda a que las familias de tu zona comparen mejor."/><label className="region-select"><MapPin size={19}/><span>Tu zona</span><select value={region} onChange={event=>setRegion(event.target.value)}><option value="">Elige una zona</option>{regions.map(option=><option key={option}>{option}</option>)}</select></label><Panel className="report-panel"><span className="eyebrow">APORTA UN PRECIO</span><h2>¿Cuánto viste hoy?</h2><p>Comparte el precio del producto y comercio que acabas de visitar.</p><form onSubmit={submit} className="report-form"><label>Producto<select value={productId} onChange={event=>setProductId(event.target.value)}>{products.map(product=><option key={product.id} value={product.id}>{product.name} · {product.size}</option>)}</select></label><label>Tienda<select value={storeId} onChange={event=>setStoreId(event.target.value)}>{stores.map(store=><option key={store.id} value={store.id}>{store.name}</option>)}</select></label><label>Precio observado (MXN)<input type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" value={price} onChange={event=>setPrice(event.target.value)} required/></label>{!region&&<p className="location-help">Elige primero una zona para compartir el precio.</p>}<button className="primary-button" type="submit" disabled={!region}><Plus size={19}/>Compartir precio</button>{saved&&<p className="form-success" role="status"><Check size={16}/>Precio agregado a esta zona.</p>}</form></Panel><SectionHeader title="Aportes recientes"/>{recent.length?recent.slice(0,8).map(report=><Panel key={report.id} className="report-row"><span className="icon-tile"><Users size={21}/></span><div><strong>{productName(report.productId)} · {storeName(report.storeId)}</strong><small>{region} · {new Date(report.createdAt).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}</small></div><strong>{money(report.price)}</strong></Panel>):<Panel className="empty-community"><Users size={25}/><strong>Aún no hay aportes de vecinos en esta zona.</strong><span>Agrega el primero para que aparezca en la comparación de este navegador.</span></Panel>}<Panel className="data-note"><Clock3 size={18}/><p>Este prototipo conserva los aportes en el navegador actual; todavía no los comparte con otros dispositivos o comunidades.</p></Panel></div>;
}

function Profile(){
  const {basket,region,priceReports,setRegion}=useApp();const myReports=priceReports.filter(report=>report.region===region);
  return <div className="stack"><PageTitle title="Mi comunidad" subtitle="Tu canasta y los precios que has compartido."/><label className="region-select"><MapPin size={19}/><span>Zona de comparación</span><select value={region} onChange={event=>setRegion(event.target.value)}><option value="">Elige una zona</option>{regions.map(option=><option key={option}>{option}</option>)}</select></label><div className="stats-grid"><Panel className="stat"><ShoppingBasket className="accent"/><div><small>Productos en mi canasta</small><strong>{basket.length}</strong></div></Panel><Panel className="stat"><Users className="accent"/><div><small>Precios compartidos en esta zona</small><strong>{myReports.length}</strong></div></Panel></div><Panel className="community-invite"><h2>Los precios mejoran cuando los compartimos.</h2><p>Agrega una observación de una tienda y ayuda a que otras familias comparen.</p><Link href="/comunidad" className="small-primary">Compartir un precio <ArrowRight size={17}/></Link></Panel><Panel className="data-note"><Clock3 size={18}/><p>Los valores iniciales son de muestra. Para tener precios reales y sincronizados, el proyecto necesita una fuente común y actualización con datos verificados.</p></Panel></div>;
}
