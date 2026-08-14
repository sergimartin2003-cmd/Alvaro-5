# AIMX Esports 🎮

Web oficial de **AIMX Esports** (organización española de Fortnite competitivo).
Es la web original completa (un único `index.html` autocontenido: HTML + CSS + JS + imágenes
embebidas en base64), con el **sistema de pagos conectado**: compra **sin registro**,
formulario de datos de envío, aviso del pedido por email y pago con **PayPal**.

## Flujo de compra

1. En **Shop**, el cliente elige talla y cantidad de la *AIMX Red Jersey* y la añade al carrito.
2. Abre el carrito y pulsa **Proceed to checkout**.
3. En el checkout rellena sus **datos de envío** (sin cuenta) y pulsa **Pagar con PayPal**:
   - El pedido se envía por email a `xsonicx2010@gmail.com` (vía FormSubmit).
   - Se redirige a **PayPal** para enviar el importe a `xsonicx2010@gmail.com`.

El formulario **Join** (recruitment) también envía las solicitudes a ese mismo email.

## Configuración

Todo está en el objeto `CONFIG` dentro de `index.html`:

```js
const CONFIG = {
  jerseyPrice: 29.99,
  PAYPAL_EMAIL: "xsonicx2010@gmail.com", // cuenta PayPal que recibe el pago
  FORM_EMAIL:   "xsonicx2010@gmail.com", // email que recibe pedidos y solicitudes
  CURRENCY: "EUR",
  STORE_NAME: "AIMX Esports",
};
```

- Precio: `jerseyPrice` · Jugadores: array `players` · Redes: enlaces de la sección SOCIALS.

## ⚠️ Activar el envío de emails (FormSubmit)

El email usa [FormSubmit](https://formsubmit.co) (gratis, sin backend). **La primera vez** que
alguien envíe un pedido o una solicitud, FormSubmit mandará un correo de confirmación a
`xsonicx2010@gmail.com`: hay que **abrirlo y pulsar el enlace de activación una vez**. Después,
todos los envíos llegan solos. Los datos de envío también viajan en la transacción de PayPal
como respaldo.

## Despliegue

Sitio 100% estático (un solo archivo). Se despliega en Vercel sin configuración.

## Archivos

- `index.html` — la web completa (todo embebido) con el sistema de pagos.
- `vercel.json` — configuración de despliegue.
