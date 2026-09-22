// ============= ETAPAS · TRES MÉTRICAS · COMPETENCIAS =============
// Una sola batería de métricas para todas las etapas: conversión a la etapa
// siguiente, ticket medio y penetración sobre los deudores disponibles del
// cliente. Lo mismo en cada etapa, para poder compararlas entre sí y entre AE.
window.SM_META = {
  nota: 'Cada etapa se mide con las mismas tres métricas: conversión, ticket medio y porcentaje sobre deudores disponibles. La conversión es la métrica ancla —traduce a nivel— y las otras dos explican la calidad de lo que pasa.',
};

window.SM_METRICAS = [
  { id:'conv', label:'Conversión a la siguiente etapa', unidad:'%', ancla:true, fuente:'hubspot',
    def:'Deals que avanzan sobre los que llegaron a la etapa.' },
  { id:'ticket', label:'Ticket medio', unidad:'€', fuente:'hubspot',
    def:'Importe medio de línea de los deals que avanzan desde esta etapa.' },
  { id:'deud', label:'% sobre deudores disponibles', unidad:'%', fuente:'pendiente',
    def:'Deudores del cliente que entran en la operación sobre los que tiene disponibles. Mide si se captura la cartera entera o solo una punta.' },
];

window.SM_FUENTES = {
  hubspot:   { label:'HubSpot · hoy', desc:'Sale del export de deals sin trabajo previo.', color:'#2E7D5B' },
  pendiente: { label:'Por instrumentar', desc:'Hace falta cargar los deudores disponibles del cliente en el CRM.', color:'#B8731F' },
};

// Cada etapa: qué significa cada métrica ahí y qué competencias la mueven.
// b = bandas de conversión que proponen el nivel 1-4.
window.SM_ETAPAS = [
  { id:'disc', label:'Discovery', color:'#4054A8',
    desc:'Reunión de descubrimiento y encaje de producto.',
    m:{ conv:'Discovery que pasan a documentación.',
        ticket:'Línea estimada de los que pasan: si el discovery es bueno, el ticket sube.',
        deud:'Deudores identificados en la reunión sobre los que el cliente tiene.' },
    b:['menos del 35%','35 a 50%','50 a 65%','más del 65%'],
    comps:['disc','exec'] },
  { id:'data', label:'Documentación', color:'#6E3B8E',
    desc:'Cuentas, mayor de clientes y expediente para riesgos.',
    m:{ conv:'Expedientes que llegan completos a riesgos.',
        ticket:'Línea propuesta una vez vistas las cuentas.',
        deud:'Deudores con documentación aportada sobre los identificados.' },
    b:['menos del 50%','50 a 65%','65 a 80%','más del 80%'],
    comps:['fin','exec'] },
  { id:'risk', label:'Riesgos', color:'#B23A3A',
    desc:'Verificación, pre CRA y comité.',
    m:{ conv:'Operaciones aprobadas en comité.',
        ticket:'Límite aprobado medio.',
        deud:'Deudores aprobados sobre los presentados.' },
    b:['menos del 50%','50 a 65%','65 a 80%','más del 80%'],
    comps:['fin','exec'] },
  { id:'prop', label:'Propuesta', color:'#2E7D5B',
    desc:'Límite y precio sobre la mesa.',
    m:{ conv:'Propuestas que terminan firmadas.',
        ticket:'Línea firmada media frente a la aprobada.',
        deud:'Deudores incluidos en el contrato sobre los aprobados.' },
    b:['menos del 40%','40 a 55%','55 a 70%','más del 70%'],
    comps:['nego','disc'] },
  { id:'act', label:'Activación', color:'#2E93A8',
    desc:'De la firma al primer dispuesto.',
    m:{ conv:'Clientes firmados que llegan a disponer.',
        ticket:'Primer dispuesto medio sobre el límite.',
        deud:'Deudores con factura cedida sobre los contratados.' },
    b:['menos del 60%','60 a 75%','75 a 90%','más del 90%'],
    comps:['exec','nego'] },
];

window.smComp = function (id) { return window.SK_COMPS.find(c => c.id === id); };

// Qué etapas pone en juego cada competencia, para la lectura inversa.
window.smPorComp = function () {
  return (window.SK_COMPS || []).map(c => ({ comp:c,
    etapas: window.SM_ETAPAS.filter(e => e.comps.indexOf(c.id) >= 0),
    ancla: window.SM_ETAPAS.filter(e => e.comps[0] === c.id) }));
};
