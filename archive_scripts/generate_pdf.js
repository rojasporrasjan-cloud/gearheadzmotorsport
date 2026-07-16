import PDFDocument from 'pdfkit';
import fs from 'fs';

const doc = new PDFDocument({ margin: 50, size: 'LETTER' });

doc.pipe(fs.createWriteStream('Estado_Proyecto_Gearheadz.pdf'));

// ── CABECERA ──
doc.rect(0, 0, 612, 120).fill('#0C0C0C');
doc.fillColor('#E8001C').font('Helvetica-Bold').fontSize(28).text('GEARHEADZ', 50, 45, { continued: true });
doc.fillColor('#FFFFFF').font('Helvetica').text(' MOTORSPORTS');
doc.fillColor('#AAAAAA').fontSize(12).font('Helvetica').text('Reporte de Estado y Entrega de E-Commerce', 50, 80);

// ── ESTADO ACTUAL ──
doc.fillColor('#000000').font('Helvetica-Bold').fontSize(18).text('1. Estado General del Proyecto', 50, 160);
doc.moveDown(0.5);
doc.font('Helvetica').fontSize(12).text('El desarrollo del sitio web a nivel de código se encuentra completado al 100%. Esto incluye el diseño (frontend), el catálogo de ropa, el sistema de carrito de compras y el Panel de Administración interactivo.', { align: 'justify', lineGap: 4 });
doc.moveDown(1.5);

// ── LO QUE FALTA (STRIPE) ──
doc.fillColor('#E8001C').font('Helvetica-Bold').fontSize(18).text('2. ¿Qué falta para finalizar la página?');
doc.moveDown(0.5);
doc.fillColor('#000000').font('Helvetica-Bold').fontSize(12).text('INTEGRACIÓN DE PAGOS (STRIPE)');
doc.moveDown(0.3);
doc.font('Helvetica').text('Para que el sitio web pueda procesar pagos reales con tarjetas de crédito de los clientes, es de vital importancia enlazar la cuenta oficial de Stripe del negocio.', { align: 'justify', lineGap: 4 });
doc.moveDown(0.5);
doc.font('Helvetica-Bold').text('Acciones requeridas por el cliente/administrador:');
doc.font('Helvetica').text('  • Crear/Acceder a la cuenta en Stripe.com', { lineGap: 4 });
doc.text('  • Obtener la "Clave Secreta" (Secret Key) de producción de Stripe.', { lineGap: 4 });
doc.text('  • Ingresar esta clave en la plataforma de alojamiento web (Vercel) en la sección de "Variables de Entorno" (Environment Variables).', { lineGap: 4 });
doc.moveDown(0.5);
doc.text('Una vez agregada esta clave, el carrito de compras procesará automáticamente las ventas de ropa y tickets y las enviará a la cuenta de banco de Gearheadz.', { align: 'justify', lineGap: 4 });
doc.moveDown(1.5);

// ── GUÍA BÁSICA ADMIN ──
doc.fillColor('#000000').font('Helvetica-Bold').fontSize(18).text('3. Guía de Administración');
doc.moveDown(0.5);
doc.font('Helvetica').text('La página incluye un panel de administración secreto para gestionar la tienda. Para ingresar:', { lineGap: 4 });
doc.moveDown(0.5);
doc.font('Helvetica-Bold').text('Link de acceso: ', { continued: true }).font('Helvetica').text('tu-sitio.com/admin.html', { link: 'https://gearheadzmotorsports.com/admin.html', underline: true });
doc.font('Helvetica-Bold').text('Contraseña (si Firebase no está enlazado): ', { continued: true }).font('Helvetica').text('gearheadz2026');
doc.moveDown(0.8);
doc.font('Helvetica-Bold').text('Funciones del panel:');
doc.font('Helvetica').text('  • Agregar y editar productos, incluyendo tallas y estado de inventario (Stock).', { lineGap: 4 });
doc.text('  • Revisar detalles de pedidos completados (direcciones de envío y datos de clientes).', { lineGap: 4 });
doc.text('  • Publicar nuevos eventos oficiales (Race schedule).', { lineGap: 4 });
doc.text('  • Usar el Generador de Posts exclusivo para crear imágenes para Instagram.', { lineGap: 4 });

// ── FOOTER ──
doc.rect(0, 750, 612, 50).fill('#0C0C0C');
doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Oblique').text('Documento generado automáticamente para Gearheadz Motorsports', 50, 768, { align: 'center' });

doc.end();
