export type Product = {id:string;name:string;size:string;price:number;emoji:string};
export type StoreBranch={id:string;name:string;latitude:number;longitude:number};
export type Store={id:string;name:string;branches:StoreBranch[];prices:Record<string,number>};

// Precios de muestra para diseñar el comparador. Deben sustituirse con reportes reales de la comunidad.
export const products:Product[]=[
  {id:'leche',name:'Leche',size:'1 L',price:27.5,emoji:'🥛'},
  {id:'arroz',name:'Arroz',size:'1 kg',price:25.3,emoji:'🍚'},
  {id:'huevos',name:'Huevo',size:'12 piezas',price:45.8,emoji:'🥚'},
  {id:'tortillas',name:'Tortillas',size:'1 kg',price:24.2,emoji:'🫓'},
  {id:'frijol',name:'Frijol',size:'1 kg',price:37.8,emoji:'🫘'},
  {id:'aceite',name:'Aceite',size:'1 L',price:62.8,emoji:'🫙'},
  {id:'tomate',name:'Tomate',size:'1 kg',price:28.7,emoji:'🍅'},
  {id:'pan',name:'Pan de caja',size:'1 paquete',price:38.1,emoji:'🍞'},
];

export const stores:Store[]=[
  {id:'walmart',name:'Walmart',branches:[{id:'walmart-cancun',name:'Walmart Cancún',latitude:21.1543865,longitude:-86.8335113}],prices:{leche:28.5,arroz:24.9,huevos:44.9,tortillas:24,frijol:36.9,aceite:58.9,tomate:29,pan:35.5}},
  {id:'chedraui',name:'Chedraui',branches:[{id:'cancun-portillo',name:'Chedraui Cancún Portillo',latitude:21.1653033,longitude:-86.8434209}],prices:{leche:27.9,arroz:26.5,huevos:43.9,tortillas:26,frijol:37.9,aceite:62.5,tomate:27.5,pan:38.9}},
  {id:'aurrera',name:'Bodega Aurrera',branches:[{id:'multiplaza-kabah',name:'Bodega Aurrera Multiplaza Kabah',latitude:21.1712074,longitude:-86.8591003},{id:'aurrera-cancun',name:'Bodega Aurrera, Cancún',latitude:21.168864,longitude:-86.8728327},{id:'aurrera-nichupte',name:'Bodega Aurrera Nichupté',latitude:21.1411099,longitude:-86.8783667}],prices:{leche:26.5,arroz:23.5,huevos:42.5,tortillas:22,frijol:34.5,aceite:55.9,tomate:24.9,pan:34.9}},
  {id:'soriana',name:'Soriana',branches:[{id:'soriana-hiper-cancun',name:'Soriana Híper Cancún',latitude:21.152561,longitude:-86.845162}],prices:{leche:29.5,arroz:24.5,huevos:46,tortillas:25,frijol:38.5,aceite:60.9,tomate:26.5,pan:37}},
  {id:'oxxo',name:'OXXO',branches:[{id:'oxxo-muray',name:'OXXO Muray',latitude:21.1409754,longitude:-86.8354703}],prices:{leche:32,arroz:32,huevos:48,tortillas:31,frijol:41,aceite:70,tomate:35,pan:46}},
];

export const money=(n:number)=>n.toLocaleString('es-MX',{style:'currency',currency:'MXN'});
