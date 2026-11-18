'use client';
import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react';
import {products,stores} from '@/data/demo';

export type PriceReport={id:string;storeId:string;productId:string;price:number;region:string;createdAt:string};
export type DeviceLocation={latitude:number;longitude:number;accuracy:number};
type State={basket:string[];region:string;priceReports:PriceReport[]};
type AppContextValue=State&{location:DeviceLocation|null;setLocation:(location:DeviceLocation|null)=>void;notice:string;dismiss:()=>void;toggleBasket:(id:string)=>void;setRegion:(region:string)=>void;addPriceReport:(storeId:string,productId:string,price:number)=>void};
const initial:State={basket:products.map(product=>product.id),region:'',priceReports:[]};
const Context=createContext<AppContextValue|null>(null);

export function AppProvider({children}:{children:ReactNode}){
  const [state,setState]=useState<State>(initial);const [ready,setReady]=useState(false);const [notice,setNotice]=useState('');const [location,setLocation]=useState<DeviceLocation|null>(null);
  useEffect(()=>{try{const raw=window.localStorage.getItem('canasta-comunidad-v2');if(raw){const saved=JSON.parse(raw) as Partial<State>;setState({...initial,...saved});}}catch{}setReady(true)},[]);
  useEffect(()=>{if(ready)window.localStorage.setItem('canasta-comunidad-v2',JSON.stringify(state));},[state,ready]);
  const toggleBasket=useCallback((id:string)=>setState(current=>({...current,basket:current.basket.includes(id)?current.basket.filter(item=>item!==id):[...current.basket,id]})),[]);
  const setRegion=useCallback((region:string)=>setState(current=>({...current,region})),[]);
  const addPriceReport=useCallback((storeId:string,productId:string,price:number)=>{
    if(!Number.isFinite(price)||price<=0)return;
    setState(current=>({ ...current,priceReports:[{id:crypto.randomUUID(),storeId,productId,price,region:current.region,createdAt:new Date().toISOString()},...current.priceReports]}));
    const product=products.find(item=>item.id===productId);const store=stores.find(item=>item.id===storeId);
    setNotice(`Precio de ${product?.name??'producto'} compartido para ${store?.name??'la tienda'}.`);
  },[]);
  return <Context.Provider value={{...state,location,setLocation,notice,dismiss:()=>setNotice(''),toggleBasket,setRegion,addPriceReport}}>{children}</Context.Provider>;
}
export function useApp(){const value=useContext(Context);if(!value)throw new Error('useApp requiere AppProvider');return value;}
