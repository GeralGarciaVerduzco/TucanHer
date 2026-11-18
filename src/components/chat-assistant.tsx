'use client';

import {useEffect,useMemo,useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {Bot,ChevronDown,MessageCircle,Send,Sparkles,X} from 'lucide-react';
import {useApp} from '@/context/app-context';
import {money,products,stores} from '@/data/demo';

type Message={id:number;role:'assistant'|'user';text:string;href?:string;linkLabel?:string};
const suggestions=['¿Dónde me conviene comprar?','¿Qué puedo comprar con $300?','Buscar sucursales','¿Cómo aporto un precio?'];
function distanceKm(lat1:number,lon1:number,lat2:number,lon2:number){const radians=(degrees:number)=>degrees*Math.PI/180;const dLat=radians(lat2-lat1);const dLon=radians(lon2-lon1);const value=Math.sin(dLat/2)**2+Math.cos(radians(lat1))*Math.cos(radians(lat2))*Math.sin(dLon/2)**2;return 6371*2*Math.atan2(Math.sqrt(value),Math.sqrt(1-value));}

export function ChatAssistant(){
  const {basket,region,priceReports,location}=useApp();
  const [open,setOpen]=useState(false);const [input,setInput]=useState('');const [messages,setMessages]=useState<Message[]>([{id:0,role:'assistant',text:'¡Hola! Soy el asistente de CesTick. Puedo ayudarte a comparar tu canasta, revisar precios y sucursales, o explicarte cómo aportar un precio.'}]);
  const listRef=useRef<HTMLDivElement>(null);const inputRef=useRef<HTMLInputElement>(null);const nextId=useRef(1);
  const selected=useMemo(()=>products.filter(product=>basket.includes(product.id)),[basket]);
  useEffect(()=>{if(open&&listRef.current)listRef.current.scrollTop=listRef.current.scrollHeight},[messages,open]);
  useEffect(()=>{if(open)inputRef.current?.focus()},[open]);

  function replyTo(question:string):Omit<Message,'id'|'role'>{
    const text=question.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const budgetMatch=text.match(/(?:\$\s*)?(\d[\d,]*(?:\.\d{1,2})?)/);
    const store=stores.find(item=>text.includes(item.name.toLocaleLowerCase('es'))||(item.id==='aurrera'&&text.includes('aurrera')));
    const product=products.find(item=>text.includes(item.name.toLocaleLowerCase('es'))||text.includes(item.id));

    if(/\b(hola|buenas|buenos dias|buenas tardes|buenas noches)\b/.test(text))return {text:'¡Hola! Dime qué necesitas: comparar tu canasta, buscar una sucursal, conocer el precio de un producto o subir un aporte.'};
    if(/\b(ayuda|que puedes hacer|como funciona|opciones)\b/.test(text))return {text:'Puedo calcular qué tienda tiene el menor total estimado para tu canasta, sugerir productos dentro de un presupuesto, consultar precios de muestra y aportes de tu zona, mostrar las sucursales cargadas y guiarte para aportar con ticket. ¿Qué quieres hacer?',href:'/comparar',linkLabel:'Abrir comparador'};

    if(/\b(aportar|compartir|subir|registrar)\b/.test(text)&&/\b(precio|ticket|compra|aporte)\b/.test(text))return {text:'Para aportar un precio, abre “Compartir un precio” y sube una foto de tu ticket. CesTick intenta leer tienda, sucursal, fecha, productos, cantidades e importes; revisa los campos y confirma antes de guardar. El ticket es necesario para verificar el aporte.',href:'/comunidad',linkLabel:'Aportar precio'};
    if(/\b(beneficio|beneficios|cupon|cupones|puntos|recompensa|recompensas)\b/.test(text))return {text:'Cada aporte válido suma 10 puntos para la tienda de ese ticket. Los puntos y beneficios se consultan por tienda en la sección Beneficios; los saldos no se combinan entre comercios.',href:'/recompensas',linkLabel:'Ver beneficios'};
    if(/\b(historial|alerta|seguir precio|seguimiento)\b/.test(text))return {text:'En Actividad encuentras el historial de compras y el seguimiento de productos. Las alertas te muestran cambios de referencia disponibles en la app.',href:'/actividad',linkLabel:'Ir a Actividad'};

    if(/\b(sucursal|sucursales|cerca|cercana|cercano|distancia|llegar|ubicacion|donde esta|donde queda|mapa)\b/.test(text)){
      if(store){const branches=store.branches.map(branch=>({...branch,distance:location?distanceKm(location.latitude,location.longitude,branch.latitude,branch.longitude):null})).sort((a,b)=>(a.distance??Infinity)-(b.distance??Infinity));if(!branches.length)return {text:`Todavía no hay sucursales de ${store.name} cargadas en CesTick. En Comparar puedes consultar las tiendas y sucursales disponibles; puedes compartirnos un enlace de Maps para agregar otra.`,href:'/comparar',linkLabel:'Ver tiendas'};const branchText=branches.map(branch=>`${branch.name}${branch.distance!==null?` (a ${branch.distance.toFixed(1)} km aprox.)`:''}`).join(' · ');return {text:`Sucursales de ${store.name} registradas: ${branchText}.${location?' La distancia es aproximada en línea recta.':' Cuando CesTick tenga tu ubicación autorizada podrá calcular la distancia.'}`,href:'/comparar',linkLabel:'Ver mapa y sucursales'};}
      const loaded=stores.filter(item=>item.branches.length);const lines=loaded.map(item=>{const nearest=item.branches.map(branch=>({...branch,distance:location?distanceKm(location.latitude,location.longitude,branch.latitude,branch.longitude):null})).sort((a,b)=>(a.distance??Infinity)-(b.distance??Infinity))[0];return `${item.name}: ${nearest.name}${nearest.distance!==null?` · ${nearest.distance.toFixed(1)} km aprox.`:''}`});return {text:`Estas son las sucursales registradas${location?' más cercanas':' (aún no puedo calcular distancias porque no tengo tu ubicación en esta sesión)'}: ${lines.join('; ')}. Abre una tienda para ver su mapa.`,href:'/comparar',linkLabel:'Ver sucursales en el mapa'};
    }

    if(budgetMatch&&/\b(presupuesto|con|alcanz|comprar|compra|dinero|pesos|canasta)\b/.test(text)){
      const budget=Number(budgetMatch[1].replaceAll(',',''));if(budget>0&&budget<=100000){let plan:{total:number;items:typeof products}={total:0,items:[]};for(let mask=1;mask<(1<<products.length);mask++){const items=products.filter((_,index)=>mask&(1<<index));const total=items.reduce((sum,item)=>sum+item.price,0);if(total<=budget&&(items.length>plan.items.length||(items.length===plan.items.length&&total>plan.total)))plan={total,items};}return plan.items.length?{text:`Con ${money(budget)} puedes llevar, como referencia de precios de muestra, ${plan.items.map(item=>`${item.name} (${money(item.price)})`).join(', ')}. Total estimado: ${money(plan.total)}; te quedarían ${money(budget-plan.total)}. Los precios pueden cambiar y no son cotizaciones actuales.`,href:'/canasta',linkLabel:'Ajustar mi canasta'}:{text:`No encuentro un producto de muestra que quepa en ${money(budget)}. Puedes revisar la canasta y ajustar tu presupuesto.`,href:'/canasta',linkLabel:'Ver canasta'};}}

    if(store&&product&&/\b(precio|cuesta|vale|cuanto)\b/.test(text)){const report=priceReports.find(entry=>entry.storeId===store.id&&entry.productId===product.id&&entry.region===region);const price=report?.price??store.prices[product.id];return {text:`${product.name} en ${store.name}: ${money(price)}${report?' (aporte de tu zona)':' (precio de muestra, puede no estar vigente)'}.`,href:`/producto?producto=${product.id}`,linkLabel:'Ver detalle del producto'};}

    if(/\b(comparar|conviene|barato|barata|menor|ahorrar|mejor precio|total|tienda)\b/.test(text)||text===''){
      if(product){const rows=stores.map(item=>{const report=priceReports.find(entry=>entry.storeId===item.id&&entry.productId===product.id&&entry.region===region);return {name:item.name,price:report?.price??item.prices[product.id],reported:Boolean(report)}}).sort((a,b)=>a.price-b.price);const best=rows[0];return {text:`Para ${product.name} (${product.size}), el menor valor disponible es ${money(best.price)} en ${best.name}${best.reported?' (aporte de tu zona)':' (precio de muestra)'}; los demás valores pueden ser provisionales.`,href:`/producto?producto=${product.id}`,linkLabel:'Ver detalle del producto'};}
      if(!selected.length)return {text:'Tu canasta está vacía. Agrega productos para calcular el total estimado por tienda.',href:'/canasta',linkLabel:'Elegir productos'};
      const totals=stores.map(item=>{const lines=selected.map(itemProduct=>{const report=priceReports.find(entry=>entry.storeId===item.id&&entry.productId===itemProduct.id&&entry.region===region);return {price:report?.price??item.prices[itemProduct.id],reported:Boolean(report)}});return {name:item.name,total:lines.reduce((sum,line)=>sum+line.price,0),reported:lines.filter(line=>line.reported).length}}).sort((a,b)=>a.total-b.total);const best=totals[0];const avg=totals.reduce((sum,item)=>sum+item.total,0)/totals.length;return {text:`Con los ${selected.length} productos de tu canasta, el menor total estimado es ${money(best.total)} en ${best.name}. El promedio de referencia entre tiendas es ${money(avg)}. ${best.reported?`${best.reported} precios del total tienen aportes de tu zona.`:'La comparación se basa en precios de muestra, no en cotizaciones actuales.'}`,href:'/comparar',linkLabel:'Abrir comparación'};
    }
    if(store){const count=priceReports.filter(report=>report.storeId===store.id&&report.region===region).length;return {text:`En CesTick hay ${count} aporte${count===1?'':'s'} guardado${count===1?'':'s'} para ${store.name} en ${region||'tu zona actual'}. Los demás precios se muestran como referencia de muestra.`,href:'/comparar',linkLabel:`Ver ${store.name} en Comparar`};}
    if(product)return {text:`Puedo revisar ${product.name}. Pregúntame “¿cuánto cuesta el ${product.name}?” o abre su detalle para comparar los precios disponibles por tienda.`,href:`/producto?producto=${product.id}`,linkLabel:'Ver producto'};
    return {text:'No encontré esa información en CesTick todavía. Puedo ayudarte con la canasta, precios, tiendas, sucursales, beneficios o aportes con ticket. Prueba una de las opciones sugeridas.'};
  }

  function send(question=input){const trimmed=question.trim();if(!trimmed)return;const userMessage:Message={id:nextId.current++,role:'user',text:trimmed};const answer=replyTo(trimmed);setMessages(current=>[...current,userMessage,{id:nextId.current++,role:'assistant',...answer}]);setInput('');}
  function handleSubmit(event:FormEvent<HTMLFormElement>){event.preventDefault();send()}

  return <>
    {open&&<section className="chat-panel" role="dialog" aria-label="Asistente de CesTick" aria-modal="false">
      <header className="chat-header"><span className="chat-avatar"><Bot size={20}/></span><div><strong>Asistente CesTick</strong><small><span/>Listo para ayudarte</small></div><button type="button" className="chat-close" onClick={()=>setOpen(false)} aria-label="Cerrar chat"><X size={19}/></button></header>
      <div className="chat-messages" ref={listRef} aria-live="polite">{messages.map(message=><article key={message.id} className={`chat-message ${message.role}`}><p>{message.text}</p>{message.href&&message.linkLabel&&<Link href={message.href} onClick={()=>setOpen(false)}>{message.linkLabel}<span>→</span></Link>}</article>)}{messages.length===1&&<div className="chat-suggestions">{suggestions.map(suggestion=><button type="button" key={suggestion} onClick={()=>send(suggestion)}>{suggestion}</button>)}</div>}</div>
      <form className="chat-input-row" onSubmit={handleSubmit}><input ref={inputRef} value={input} onChange={event=>setInput(event.target.value)} placeholder="Escribe tu pregunta…" aria-label="Escribe tu pregunta"/><button type="submit" disabled={!input.trim()} aria-label="Enviar mensaje"><Send size={17}/></button></form>
      <p className="chat-disclaimer"><Sparkles size={12}/> Respuestas según los datos disponibles en CesTick.</p>
    </section>}
    <button type="button" className={`chat-launcher ${open?'is-open':''}`} onClick={()=>setOpen(!open)} aria-label={open?'Minimizar asistente':'Abrir asistente de CesTick'} aria-expanded={open}>{open?<ChevronDown size={23}/>:<><MessageCircle size={21}/><span>¿Te ayudo?</span></>}</button>
  </>;
}
