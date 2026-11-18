# Canasta Comunidad — Comparador de canasta básica

Prototipo mobile first para que las familias comparen el costo de productos básicos en comercios de su zona y compartan precios observados.

## Enfoque del producto

1. Armar una canasta básica según las necesidades del hogar.
2. Comparar el costo de esa canasta en varios comercios cercanos.
3. Aportar un precio local para mejorar las comparaciones.
4. Mostrar una recomendación explicable basada en costo y precios disponibles.

## Stack

- Next.js 16 / App Router
- React 19 + TypeScript
- Tailwind CSS 4 y CSS personalizado
- `localStorage` para la demostración local

## Empezar

Requiere Node.js 20.9 o posterior.

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Vistas

| Ruta | Función |
|---|---|
| `/` | Resumen de la zona y acceso al comparador |
| `/canasta` | Elegir productos básicos |
| `/comparar` | Comparar el total por tienda y ver la recomendación |
| `/comunidad` | Compartir y consultar precios aportados en el navegador |
| `/perfil` | Cambiar zona y revisar la actividad local |

## Estado de los datos

Los precios iniciales de Walmart, Chedraui, Bodega Aurrera, Soriana, OXXO y Mercado local son **provisionales e ilustrativos**, no cotizaciones actuales. Los precios que se agregan se guardan en el navegador actual; no se sincronizan entre personas ni dispositivos. El comparador se actualiza de inmediato con esos aportes locales.

La recomendación actual usa reglas transparentes para elegir el menor total entre los precios disponibles. Todavía no hay un modelo de IA conectado, una base de datos compartida ni integración con fuentes en vivo de las tiendas. Por eso la app no presenta los precios de muestra como cotizaciones actuales.

## Ubicación y Google Maps

Al entrar a Inicio, el navegador solicita permiso de ubicación. Si se concede, la app usa la ubicación del dispositivo para mostrar un punto aproximado en el mapa y estima una zona compatible de Quintana Roo. Las coordenadas no se guardan en la app. Si la zona no se reconoce o se deniega el permiso, se puede seleccionar una zona manualmente.

Para incrustar el mapa interactivo de Google, crea una clave de Maps Embed API, restríngela a esa API y al dominio de la app, copia `.env.example` a `.env.local` y asigna `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY`. La clave de Embed API requiere un proyecto de Google Cloud con facturación habilitada. Si no hay clave, la página ofrece un enlace al punto exacto en Google Maps. Al cargar el mapa o abrir ese enlace, las coordenadas se envían a Google.

## Para habilitar precios comunitarios en tiempo real

- Conectar un backend compartido con actualizaciones en vivo.
- Definir catálogo, zonas y comercios de lanzamiento.
- Guardar fecha, unidad y fuente de cada precio.
- Moderar reportes, detectar errores y mostrar antigüedad/confianza.
- Integrar fuentes oficiales o acuerdos con comercios cuando estén disponibles.
- Reemplazar la recomendación local por un modelo evaluado con datos suficientes; siempre explicar sus criterios.

Sin reportes compartidos o una fuente de precios conectada, ningún comparador puede garantizar precios vigentes en todos los comercios.
