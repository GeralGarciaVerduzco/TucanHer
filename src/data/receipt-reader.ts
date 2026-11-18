import {products,stores} from '@/data/demo';

export type ReceiptLine={id:string;productId:string;productName:string;quantity:number;unitPrice:number};
export type ParsedReceipt={storeId:string;branch:string;date:string;lines:ReceiptLine[]};

const productTerms:Record<string,string[]>={
  leche:['leche','lacteos','milk'],
  arroz:['arroz','rice'],
  huevos:['huevo','huevos','egg'],
  tortillas:['tortilla','tortillas'],
  frijol:['frijol','frijoles'],
  aceite:['aceite','canola','nutrioli'],
  tomate:['tomate','jitomate'],
  pan:['pan','bimbo','bolillo'],
};
const clean=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const round=(value:number)=>Math.round(value*100)/100;

function parseMoney(line:string){
  const amounts=line.match(/(?:\d{1,3}(?:,\d{3})+|\d+)[.,]\d{2}/g);
  if(!amounts?.length)return null;
  const amount=Number((amounts.at(-1)??'').includes('.')?(amounts.at(-1)??'').replace(/,/g,''):(amounts.at(-1)??'').replace(',','.'));
  return Number.isFinite(amount)?amount:null;
}

function parseQuantity(line:string){
  const match=line.match(/\b(?:x|×)\s*(\d+(?:[.,]\d+)?)\b|\b(\d+(?:[.,]\d+)?)\s*[x×]\b/i);
  const quantity=Number((match?.[1]??match?.[2]??'1').replace(',','.'));
  return Number.isFinite(quantity)&&quantity>0?quantity:1;
}

function parseDate(text:string){
  const match=text.match(/\b(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})\b/);
  if(!match)return '';
  const day=Number(match[1]);const month=Number(match[2]);const rawYear=Number(match[3]);const year=rawYear<100?2000+rawYear:rawYear;
  if(day<1||day>31||month<1||month>12)return '';
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

export function parseReceiptText(text:string):ParsedReceipt{
  const normalized=clean(text);const lines=text.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  const store=stores.find(item=>normalized.includes(clean(item.name))|| (item.id==='aurrera'&&normalized.includes('aurrera')));
  const branch=store?.branches.find(item=>normalized.includes(clean(item.name)))?.name??'';
  const itemLines:ReceiptLine[]=[];
  for(const line of lines){
    const normalizedLine=clean(line);
    if(/\b(total|subtotal|iva|cambio|pago|efectivo|tarjeta|debito|credito|folio|autorizacion|regimen|rfc|ticket|cajero)\b/.test(normalizedLine))continue;
    const product=products.find(item=>(productTerms[item.id]??[item.name]).some(term=>normalizedLine.includes(clean(term))));
    const lineTotal=parseMoney(line);
    if(lineTotal===null)continue;
    const description=line.replace(/(?:\$\s*)?(?:\d{1,3}(?:,\d{3})+|\d+)[.,]\d{2}/g,' ').replace(/\b(?:x|×)\s*\d+(?:[.,]\d+)?\b|\b\d+(?:[.,]\d+)?\s*[x×]\b/gi,' ').replace(/^\s*\d+[.)\-:]?\s*/,' ').replace(/\s{2,}/g,' ').trim();
    if(!product&&description.replace(/[^a-záéíóúñ]/gi,'').length<3)continue;
    const quantity=parseQuantity(line);
    itemLines.push({id:crypto.randomUUID(),productId:product?.id??'',productName:product?.name??description,quantity,unitPrice:round(lineTotal/quantity)});
  }
  const addressLine=lines.find(line=>/\b(sucursal|suc\.?|avenida|av\.?|calle|col\.?|colonia|domicilio|c\.?p\.?)\b/i.test(line)&&!/^\s*(?:total|subtotal)/i.test(line));
  return {storeId:store?.id??'',branch:branch||addressLine||'',date:parseDate(text),lines:itemLines};
}

