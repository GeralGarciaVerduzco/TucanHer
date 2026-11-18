'use client';
import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react';
import {products,stores} from '@/data/demo';

export type ReceiptItemMetadata={productId:string;productName:string;quantity:number;unitPrice:number};
export type PriceReport={id:string;storeId:string;productId:string;price:number;region:string;createdAt:string;branchName?:string;receiptFileName?:string;receiptTotal?:number;purchaseDate?:string;quantity?:number;receiptItems?:ReceiptItemMetadata[]};
export type ReceiptMetadata={branch:string;fileName:string;purchaseDate:string;quantity:number;items:ReceiptItemMetadata[]};
export type DeviceLocation={latitude:number;longitude:number;accuracy:number};
type State={basket:string[];region:string;priceReports:PriceReport[];storePoints:Record<string,number>;redeemedRewards:string[]};
type AppContextValue=State&{location:DeviceLocation|null;setLocation:(location:DeviceLocation|null)=>void;notice:string;dismiss:()=>void;toggleBasket:(id:string)=>void;setRegion:(region:string)=>void;addPriceReport:(storeId:string,productId:string,price:number,receipt?:ReceiptMetadata)=>void;awardStoreContribution:(storeId:string)=>void;redeemStoreReward:(storeId:string,rewardId:string,cost:number)=>void};
const initial:State={basket:products.map(product=>product.id),region:'',priceReports:[],storePoints:{},redeemedRewards:[]};
const Context=createContext<AppContextValue|null>(null);

export function AppProvider({children}:{children:ReactNode}){
  const [state,setState]=useState<State>(initial);const [ready,setReady]=useState(false);const [notice,setNotice]=useState('');const [location,setLocation]=useState<DeviceLocation|null>(null);
  useEffect(()=>{try{const raw=window.localStorage.getItem('canasta-comunidad-v3')??window.localStorage.getItem('canasta-comunidad-v2');if(raw){const saved=JSON.parse(raw) as Partial<State>;const storePoints={...saved.storePoints};delete storePoints['mercado-local'];setState({...initial,...saved,priceReports:(saved.priceReports??[]).filter(report=>report.storeId!=='mercado-local'),storePoints,redeemedRewards:(saved.redeemedRewards??[]).filter(id=>!id.startsWith('mercado-local-'))});}}catch{}setReady(true)},[]);
  useEffect(()=>{if(ready)window.localStorage.setItem('canasta-comunidad-v3',JSON.stringify(state));},[state,ready]);
  const toggleBasket=useCallback((id:string)=>setState(current=>({...current,basket:current.basket.includes(id)?current.basket.filter(item=>item!==id):[...current.basket,id]})),[]);
  const setRegion=useCallback((region:string)=>setState(current=>({...current,region})),[]);
  const addPriceReport=useCallback((storeId:string,productId:string,price:number,receipt?:ReceiptMetadata)=>{
    if(!Number.isFinite(price)||price<=0)return;
    setState(current=>({ ...current,priceReports:[{id:crypto.randomUUID(),storeId,productId,price,region:current.region,createdAt:new Date().toISOString(),...(receipt?{branchName:receipt.branch,receiptFileName:receipt.fileName,purchaseDate:receipt.purchaseDate,quantity:receipt.quantity,receiptItems:receipt.items}:{})},...current.priceReports]}));
    const product=products.find(item=>item.id===productId);const store=stores.find(item=>item.id===storeId);
    setNotice(`Precio de ${product?.name??'producto'} compartido para ${store?.name??'la tienda'}.`);
  },[]);
  const awardStoreContribution=useCallback((storeId:string)=>{const reward=10;setState(current=>({...current,storePoints:{...current.storePoints,[storeId]:(current.storePoints[storeId]??0)+reward}}));const store=stores.find(item=>item.id===storeId);setNotice(`Ganaste ${reward} puntos para ${store?.name??'esta tienda'}.`);},[]);
  const redeemStoreReward=useCallback((storeId:string,rewardId:string,cost:number)=>{setState(current=>{const balance=current.storePoints[storeId]??0;if(balance<cost||current.redeemedRewards.includes(rewardId))return current;return {...current,storePoints:{...current.storePoints,[storeId]:balance-cost},redeemedRewards:[...current.redeemedRewards,rewardId]};});const store=stores.find(item=>item.id===storeId);setNotice(`Beneficio canjeado para ${store?.name??'esta tienda'}.`);},[]);
  return <Context.Provider value={{...state,location,setLocation,notice,dismiss:()=>setNotice(''),toggleBasket,setRegion,addPriceReport,awardStoreContribution,redeemStoreReward}}>{children}</Context.Provider>;
}
export function useApp(){const value=useContext(Context);if(!value)throw new Error('useApp requiere AppProvider');return value;}
