# Gáldar FS Store 👕

Tienda de camisetas estática (HTML + CSS + JS, sin framework ni build). El cliente
compra **sin registrarse**: elige camisetas, rellena un formulario con sus datos de
envío y paga con **PayPal**. Los datos del pedido se envían por email al vendedor.

## Flujo de compra

1. El cliente añade camisetas al carrito (modelo, talla, cantidad).
2. Pulsa **Continuar la compra** y rellena el formulario de envío (sin cuenta).
3. Al pulsar **Pagar con PayPal**:
   - Los datos del pedido se envían por email a `xsonicx2010@gmail.com` (vía FormSubmit).
   - Se redirige a **PayPal** para enviar el importe a `xsonicx2010@gmail.com`.

## Configuración

Toda la configuración está en `script.js`, objeto `CONFIG`:

```js
const CONFIG = {
  PAYPAL_EMAIL: "xsonicx2010@gmail.com", // cuenta PayPal que recibe el dinero
  FORM_EMAIL:   "xsonicx2010@gmail.com", // email que recibe los datos del pedido
  CURRENCY:     "EUR",
  STORE_NAME:   "Gáldar FS Store"
};
```

El catálogo de camisetas (nombres, precios, colores) también está en `script.js`
en el array `PRODUCTS` — edítalo para cambiar productos o precios.

## ⚠️ Importante: activar el envío de emails (FormSubmit)

El envío del email usa [FormSubmit](https://formsubmit.co) (gratuito, sin backend).
**La primera vez** que alguien envíe un pedido, FormSubmit mandará un email de
confirmación a `xsonicx2010@gmail.com`. Hay que **abrir ese email y pulsar el enlace
de activación una sola vez**. A partir de ahí, todos los pedidos llegan al correo.

> Los datos de envío del comprador también se adjuntan en la transacción de PayPal
> como respaldo, por si el email fallara.

## Despliegue

Es un sitio 100% estático. Se despliega en Vercel sin configuración (no hay build).
`index.html` es la página principal y `gracias.html` la página de agradecimiento
tras el pago.

## Archivos

- `index.html` — tienda (hero, catálogo, carrito, checkout).
- `styles.css` — estilos.
- `script.js` — lógica de carrito, formulario, email y pago PayPal.
- `gracias.html` — página de confirmación tras el pago.
- `vercel.json` — configuración de despliegue estático.
