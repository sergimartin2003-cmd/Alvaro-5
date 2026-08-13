# AIMX Esports 🎮

Web de **AIMX Esports** (organización española de Fortnite competitivo) recreada como sitio
estático (HTML + CSS + JS, sin framework ni build), con **tienda de camisetas** integrada:
el cliente compra **sin registrarse**, rellena sus datos de envío y paga con **PayPal**.
Los datos del pedido se envían por email al equipo.

## Secciones

Hero · Academy (roster) · Staff · Competitive · Shop · News · Stats · Socials · Join (recruitment) · Footer.

## Flujo de compra

1. En **Shop**, el cliente elige talla y cantidad de la *AIMX Red Jersey* y pulsa **Add to cart** o **Buy now**.
2. En el carrito pulsa **Proceed to checkout** y rellena el formulario de envío (sin cuenta).
3. Al pulsar **Pagar con PayPal**:
   - Los datos del pedido se envían por email a `xsonicx2010@gmail.com` (vía FormSubmit).
   - Se redirige a **PayPal** para enviar el importe a `xsonicx2010@gmail.com`.

El formulario **Join** (recruitment) también envía las solicitudes al mismo email.

## Configuración

En `script.js`, objeto `CONFIG`:

```js
const CONFIG = {
  PAYPAL_EMAIL: "xsonicx2010@gmail.com", // cuenta PayPal que recibe el dinero
  FORM_EMAIL:   "xsonicx2010@gmail.com", // email que recibe los datos
  CURRENCY:     "EUR",
  STORE_NAME:   "AIMX Esports"
};
```

El producto y su precio están en `PRODUCT`; el roster y el staff en `ROSTER` / `STAFF`.

## ⚠️ Activar el envío de emails (FormSubmit)

El email usa [FormSubmit](https://formsubmit.co) (gratis, sin backend). **La primera vez** que
alguien envíe un pedido o solicitud, FormSubmit mandará un correo de confirmación a
`xsonicx2010@gmail.com`: hay que **abrirlo y pulsar el enlace de activación una vez**. Después,
todos los envíos llegan solos. Los datos de envío también viajan en la transacción de PayPal
como respaldo.

## Despliegue

Sitio 100% estático, sin build. Se despliega en Vercel sin configuración.
`index.html` es la página principal y `gracias.html` la confirmación tras el pago.

## Archivos

- `index.html` — web completa (todas las secciones + carrito + checkout).
- `styles.css` — tema AIMX (negro/rojo).
- `script.js` — carrito, tallas, checkout, email y PayPal.
- `gracias.html` — confirmación tras el pago.
- `vercel.json` — configuración de despliegue.
