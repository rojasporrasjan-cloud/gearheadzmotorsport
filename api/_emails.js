import { Resend } from 'resend';

// Initialize only if we have a key
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Ventas GearHeadz <ventas@gearheadzmotorsports.com>';

export async function sendConfirmationEmail(order) {
  if (!resend) {
    console.warn('[Emails] RESEND_API_KEY not configured. Skipping confirmation email.');
    return;
  }
  
  if (!order.customer?.email) {
    console.warn('[Emails] No customer email provided for order', order.id);
    return;
  }

  const itemsHtml = order.items.map(i => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">
        <strong>${i.name}</strong><br/>
        <small style="color: #666;">Talla: ${i.size} | Cantidad: ${i.qty}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eaeaea; text-align: right;">
        $${Number(i.price).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #E8001C; font-style: italic; text-transform: uppercase;">GEARHEADZ MOTORSPORTS</h1>
      <h2>¡Gracias por tu compra, ${order.customer.name.split(' ')[0]}!</h2>
      <p>Tu orden <strong>${order.orderNum}</strong> ha sido confirmada y estamos preparándola.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
        ${itemsHtml}
        <tr>
          <td style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
          <td style="padding: 10px; text-align: right; color: #E8001C;"><strong>$${Number(order.total).toFixed(2)}</strong></td>
        </tr>
      </table>

      <h3 style="margin-top: 30px;">Detalles de Envío</h3>
      <p style="background: #f9f9f9; padding: 15px; border-radius: 4px; color: #333;">
        <strong>${order.shipping?.name || order.customer.name}</strong><br/>
        ${order.shipping?.address?.line1 || ''} ${order.shipping?.address?.line2 || ''}<br/>
        ${order.shipping?.address?.city || ''}, ${order.shipping?.address?.state || ''} ${order.shipping?.address?.postal_code || ''}
      </p>

      <p>Te enviaremos otro correo en cuanto tu orden vaya en camino con el número de seguimiento.</p>
      <p style="color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">Este es un correo automático, por favor no respondas a esta dirección.</p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer.email,
      subject: `Orden Confirmada ${order.orderNum} - GearHeadz`,
      html
    });
    console.log('[Emails] Confirmation sent:', data);
    return data;
  } catch (error) {
    console.error('[Emails] Failed to send confirmation:', error);
  }
}

export async function sendShippingEmail(orderId, trackingNumber, trackingCarrier, customerEmail, customerName) {
  if (!resend) {
    console.warn('[Emails] RESEND_API_KEY not configured. Skipping shipping email.');
    return;
  }

  if (!customerEmail) {
    console.warn('[Emails] No customer email provided for shipping notification.');
    return;
  }

  const carrierLower = (trackingCarrier || '').toLowerCase();
  let trackingLink = '#';
  if (carrierLower.includes('ups')) trackingLink = `https://www.ups.com/track?tracknum=${trackingNumber}`;
  else if (carrierLower.includes('usps')) trackingLink = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  else if (carrierLower.includes('fedex')) trackingLink = `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #E8001C; font-style: italic; text-transform: uppercase;">GEARHEADZ MOTORSPORTS</h1>
      <h2>¡Buenas noticias${customerName ? ', ' + customerName.split(' ')[0] : ''}!</h2>
      <p>Tu orden <strong>${orderId}</strong> ya va en camino hacia ti.</p>
      
      <div style="background: #111; color: #fff; padding: 25px; border-radius: 6px; margin: 25px 0; border: 1px solid #333;">
        <p style="margin: 0; color: #aaa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Empresa de envío</p>
        <p style="margin: 5px 0 20px 0; font-size: 20px; font-weight: bold; font-style: italic;">${trackingCarrier || 'Envío Estándar'}</p>
        
        <p style="margin: 0; color: #aaa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Número de rastreo</p>
        <p style="margin: 5px 0 20px 0; font-size: 20px; font-weight: bold; letter-spacing: 1px;">${trackingNumber || 'N/A'}</p>
        
        ${trackingNumber ? `
          <a href="${trackingLink}" style="display: inline-block; background: #E8001C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-weight: bold; margin-top: 10px; font-size: 14px;">
            RASTREAR PAQUETE
          </a>
        ` : ''}
      </div>

      <p style="font-size: 16px; font-style: italic; margin-top: 30px;">Gracias por confiar en la cultura. ¡Esperamos que lo disfrutes! 🏁</p>
      <p style="color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">Este es un correo automático, por favor no respondas a esta dirección.</p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Tu orden ${orderId} ha sido enviada - GearHeadz`,
      html
    });
    console.log('[Emails] Shipping email sent:', data);
    return data;
  } catch (error) {
    console.error('[Emails] Failed to send shipping email:', error);
  }
}
