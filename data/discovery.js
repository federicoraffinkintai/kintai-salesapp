// Discovery: onesheet de la llamada + estructuración de colateral.

window.DISCOVERY_PREP = [
  { id:'encaje', label:'Encaje repasado', sub:'Las cuatro dimensiones antes de marcar', items:[
    { k:'Necesidad',   v:'Intensidad de circulante, NOF/Ventas, crecimiento, PMC, deudores' },
    { k:'Alternativas',v:'Banca (endeudamiento, DF/EBITDA, PN), proveedores, fondos propios, factoring y confirming' },
    { k:'Encaje',      v:'Modelo de negocio y cartera de deudores' },
    { k:'Percepción outbound', v:'¿Qué percepción de valor trajo de la llamada del SDR?' },
  ], formulas:[
    'NOF = Deudores + Existencias − Proveedores',
    'Intensidad de circulante = (Deudores + Existencias) / Activo total',
  ]},
  { id:'sector', label:'Sector estudiado', sub:'Qué encaja con Kintai en su industria',
    items:[{ k:'Mirar', v:'Tipo de deudores, diversificación, PMC y estacionalidad típicos del sector' }] },
  { id:'frame', label:'Personal frame', sub:'Actitud positiva, confianza, mentalidad ganadora', items:[] },
  { id:'confianza', label:'Framework de confianza', sub:'Los tres pilares que hay que transmitir', items:[
    { k:'Hablar su idioma', v:'Conoces su sector y su operativa' },
    { k:'Competencia',      v:'Esto está en buenas manos, sabe lo que hace' },
    { k:'Integridad',       v:'Vela por mis intereses, no solo por cerrar' },
  ]},
];

window.DISCOVERY_SWANS = [
  { id:'empresa', q:'¿Qué gana la EMPRESA con este deal?', ph:'Poder coger el pedido grande, dejar de estirar proveedores…' },
  { id:'persona', q:'¿Qué gana el DECISION-MAKER a nivel personal?', ph:'Dormir tranquilo, dejar de pelear con el banco, quedar bien ante el consejo…' },
  { id:'hipotesis', q:'Hipótesis de encaje · facturación viva estimada y estructura probable', ph:'Ciego · cuenta conjunta · gestión de cobro' },
];

window.DISCOVERY_OPEN = {
  agenda: [
    'Agradece la intro del intermediario',
    'Preséntate: nombre, rol, empresa',
    'Marca la agenda e intro breve de producto (~2 min)',
    'Cede la palabra al cliente',
  ],
  say: 'La idea es intentar quitaros el menos tiempo posible. Somos una fintech, financiera alternativa, hacemos financiación de circulante. Dado que tenemos un approach de "traje a medida", antes de pasar el expediente a Riesgos me gusta reunirme, que me contéis un poco la empresa, contaros yo cómo funciona el producto, y decidir entre todos el mejor planteamiento.',
};

window.DISCOVERY_QUESTIONS = [
  { id:'negocio', label:'El negocio', qs:[
    '¿A qué os dedicáis y cuáles son vuestras líneas de negocio? Un repaso desde vuestros inicios hasta ahora.',
  ]},
  { id:'cartera', label:'Clientes y cartera', qs:[
    '¿Quién es tu cliente y a qué se dedica? ¿Empresas, particulares, administración pública, internacional?',
    '¿Cuántos clientes tenéis y cómo de diversificada está la cartera? ¿Hay concentración?',
    '¿La facturación es recurrente o por proyectos puntuales?',
  ]},
  { id:'ciclo', label:'Cobros y ciclo productivo', qs:[
    '¿Cómo es la dinámica con un cliente? Desde que le conoces, ¿qué ocurre? ¿Se firma contrato? ¿Pedidos?',
    '¿Cuál es vuestro ciclo productivo, desde que fabricáis o prestáis el servicio hasta que cobráis?',
    '¿Cada cuánto compras? Cuando pagas, ¿te puedes financiar con tus proveedores?',
    '¿Fabricas o transformas? ¿Cuánto tardas en entregar? ¿Cada cuánto entregas?',
    '¿Políticas de cobro con tus clientes? Periodo y método.',
    '¿Cuánta facturación tenéis pendiente de cobro ahora mismo? Haz el ejemplo con lo que te acaba de contar.',
    '¿Cómo lo estás solucionando hasta ahora? ¿Te anticipas facturas? ¿Trabajas con financiación alternativa?',
  ]},
  { id:'necesidad', label:'Necesidad de financiación', qs:[
    '¿Cuánto necesitáis y para qué destino? Importe ideal e importe mínimo útil.',
    '¿Qué financiación tenéis ya contratada? ¿Qué os gusta y qué no? ¿Cuál sería tu producto ideal?',
    '¿Qué urgencia tenéis? ¿Cuándo sería lo ideal recibir el dinero?',
  ]},
];

window.DISCOVERY_PITCH = {
  intro: 'Para usar literal o como referencia. Personaliza siempre el corchete con lo que el cliente te acaba de contar.',
  blocks: [
    'Aprovechando que estamos hablando de circulante, te cuento cómo funciona nuestro producto. Siempre empiezo contando cómo nació, porque tiene sentido para que entiendas cómo funciona.',
    'Ignasi, actualmente CEO de Kintai, llevaba el departamento de ventas de Novicap —una financiera alternativa que lleva años en el mercado— y estaba constantemente evaluando necesidades de financiación de empresas, como yo ahora. Y se dio cuenta de que el factoring es un producto muy rígido.',
    'Seguro que habéis probado algún producto de factoring con la banca o financieras alternativas y sabéis cómo funciona: básicamente tienes que tener una FACTURA —no un pedido, ni un contrato—, es decir, tienes que haber entregado ya el bien o el servicio, de un deudor grande y solvente, idealmente que facture más de 200M, y que además permita la cesión de dicha factura.',
    'Es decir, si tú tienes [PERSONALIZAR], el banco te dice: suerte. "Anticipar 2.000 facturas es un follón, te doy riesgo directo, una póliza y con eso tiras." En esos casos, el factoring tradicional no te soluciona.',
    'Y por eso nosotros diseñamos un producto que ataca justamente esos tres puntos. Somos capaces de anticipar:',
  ],
  pillars: [
    { t:'Carteras muy diversificadas', d:'De todo tipo de deudores. No me hace falta que tus clientes sean grandes y solventes.' },
    { t:'Antes de que exista la factura', d:'Con el pedido ya puedo ir anticipándote.' },
    { t:'Sin notificar a tu cliente', d:'La joya de la corona: factoring ciego. Ni verifico la factura con él, ni le notifico la cesión, ni me tiene que pagar a mí.' },
  ],
  close: [
    'Y tú me podrías decir: vale, ¿pero cómo lo hacéis? Porque al final todo esto es asumir más riesgo. Pues básicamente es gracias a la DIVERSIFICACIÓN.',
    'Tus facturas y pedidos son mi garantía. Si tú no me pagas, notificaré a tus clientes de que me tienen que pagar a mí. Si tú me das un solo cliente —como funciona la banca—, voy a querer que sea solvente, que ya hayas entregado para que no haya disputa comercial, y que sepa que existo. Pero si me das veinte clientes y te anticipo menos de cada uno —solemos anticipar alrededor del 50%—, diversifico mi riesgo entre todos. Y eso me permite anticipar más: clientes más pequeños, pedidos, o hacerlo en ciego.',
    'De hecho, al producto lo bautizamos como factoring estadístico, porque es un cálculo de probabilidades.',
    '¿Se entiende? ¿Te encaja lo que te he contado?',
  ],
  variants: [
    { id:'diversificada', when:'Cartera muy diversificada, muchos clientes pequeños',
      say:'una cartera muy diversificada como la vuestra' },
    { id:'cesion', when:'Clientes que no permiten la cesión o sensibles a la notificación',
      say:'clientes que no permiten la cesión o a los que no quieres avisar' },
    { id:'ciclo', when:'Ciclo largo: muchos costes antes de facturar',
      say:'que asumes muchos costes antes de entregar y luego cobras relativamente rápido, con lo que lo que te interesa es anticipar el pedido y no la factura' },
    { id:'b2c', when:'Clientes B2C o plataformas (Airbnb, Booking…)',
      say:'clientes que son particulares a los que no puedes notificar ni ceder' },
  ],
};

window.DISCOVERY_CLOSE = {
  urgencia: 'A nivel de timings, ¿esto es algo que necesitáis para mañana o tenemos un poco más de margen para trabajarlo bien? Si me lo pedís, lo priorizo con Riesgos.',
  plazos: [
    'Riesgos sanciona en 48-72h laborables (24-48h si se prioriza y el expediente está completo)',
    'Correo de seguimiento el mismo día, con documentación pendiente y open banking',
  ],
  cierre: 'Lo que haríamos es: yo hablo con Riesgos y os vengo con un número. A partir de ahí tomamos decisiones. Os mando ahora el correo con la documentación que necesito, y calculad que en cuanto lo tenga todo, en unos 3-4 días laborables tengo resolución.',
  pasos: [
    { id:'docs', q:'Documentación pendiente' },
    { id:'fecha', q:'Fecha ideal de resolución o de dinero' },
    { id:'siguiente', q:'Siguiente contacto' },
  ],
};

window.DISCOVERY_DOCS = [
  { g:'Obligatoria para Riesgos', req:true, items:[
    'Modelo 200 2025', 'Modelos 303 2025 + 2026', 'CIRBE detallada julio',
    'Cuentas provisionales 2026', 'Modelo 347 2025 (solo si <6M€)',
    'Certificados al día con Hacienda y SS (solo si <1M€)',
  ]},
  { g:'Validación de colateral', req:false, note:'No obligatoria, pero acelera mucho', items:[
    'Libro diario, solo cuenta 43 — de agosto 25 a agosto 26, en Excel',
    'Facturas pendientes de cobro en PDF',
    'Extracto bancario de la cuenta donde cobran de clientes, un año, en Excel',
  ]},
  { g:'Compliance', req:false, note:'No obligatoria ahora', items:[
    'Escritura de constitución', 'Acta de titularidad real', 'DNI del administrador o administradores',
    'Poderes del administrador (si no están en la escritura)', 'Declaración responsable Kintai',
  ]},
];

window.RIESGOS_RESUMEN = [
  { id:'modelo', label:'Modelo de negocio' },
  { id:'cartera', label:'Cartera de clientes' },
  { id:'ciclo', label:'Ciclo operativo' },
  { id:'necesidad', label:'Necesidad de financiación' },
  { id:'encaje', label:'Encaje y propuesta Kintai' },
  { id:'otros', label:'Otros aspectos relevantes' },
];
