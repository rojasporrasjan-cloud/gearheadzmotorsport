import PDFDocument from 'pdfkit';
import fs from 'fs';

const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
doc.pipe(fs.createWriteStream('Guia_Chris_Admin_Gearheadz.pdf'));

// Cabecera
doc.rect(0, 0, 612, 100).fill('#0C0C0C');
doc.fillColor('#E8001C').font('Helvetica-Bold').fontSize(24).text('MANUAL DE ADMINISTRACION', 50, 40);
doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica').text('Para: Chris | Gearheadz Motorsports', 50, 70);

doc.moveDown(3);

function addSection(title, content) {
    doc.fillColor('#E8001C').font('Helvetica-Bold').fontSize(16).text(title);
    doc.moveDown(0.5);
    doc.fillColor('#000000').font('Helvetica').fontSize(11).text(content, { align: 'justify', lineGap: 3 });
    doc.moveDown(1.5);
}

const sections = [
    {
        title: "1. Acceso al Panel",
        content: "Para ingresar a la bóveda de tu tienda, debes ir a: gearheadzmotorsports.com/admin.html\n\nUsuario: Tu correo electrónico registrado.\nContraseña temporal (pruebas): gearheadz2026"
    },
    {
        title: "2. El Dashboard",
        content: "Al entrar verás tu centro de mando. Presta atención a las tarjetas de colores:\n- Rojo: Productos SOLD OUT.\n- Amarillo: Productos con poco stock (5 o menos unidades).\n- Verde: Total de dinero ingresado."
    },
    {
        title: "3. Sección de Productos (Drops)",
        content: "Aquí administras tu catálogo. Para agregar un producto haz clic en '+ NUEVO PRODUCTO'.\nLlena el nombre, precio, stock, categoría y tallas. Selecciona tu imagen.\n\nA la derecha verás una vista previa idéntica a la página web. Si pones el stock en 0, la página automáticamente mostrará la etiqueta SOLD OUT y bloqueará el botón de compra.\nSi deseas editar el inventario de un producto existente, búscalo en la lista y presiona Editar."
    },
    {
        title: "4. Sección de Eventos",
        content: "Organiza car meets y track days.\nHaz clic en '+ NUEVO EVENTO'. Llena la fecha, horas y ubicación. Puedes usar el buscador de Google Maps integrado para generar un mapa interactivo.\n\nSi el evento tiene costo, pon el precio del ticket y se habilitará la compra online. Si tienes un Reel de promoción en Instagram, pega el link y el video aparecerá directamente en la página."
    },
    {
        title: "5. Pedidos y Ventas",
        content: "Cada vez que alguien pague con su tarjeta vía Stripe, el pedido aparecerá aquí.\nPodrás ver el nombre, email, teléfono, dirección de envío y los productos exactos que ordenaron.\n\nFlujo de trabajo recomendado:\n1. Verifica el pago en tu aplicación de Stripe.\n2. Prepara el paquete físico.\n3. Envía el paquete por mensajería.\n4. Cambia el estado del pedido de PENDIENTE a ENVIADO en el panel."
    },
    {
        title: "6. Post Generator (Herramienta Exclusiva)",
        content: "En el menú 'Developer' encontrarás el Post Generator.\nEsta herramienta te permite crear imágenes súper profesionales para Instagram Stories o Posts en cuestión de segundos, sin necesidad de usar Photoshop.\n\nSelecciona un fondo JDM, ajusta tu producto usando los controles de rotación y tamaño, añade stickers de la marca, y presiona Exportar."
    }
];

sections.forEach(s => addSection(s.title, s.content));

// Footer
doc.rect(0, 750, 612, 50).fill('#0C0C0C');
doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Oblique').text('Gearheadz Motorsports - Documento Confidencial', 50, 768, { align: 'center' });

doc.end();
