// Estructuración de colateral: de qué cartera sale la línea.
window.PERIODICIDAD = [
  { id:'semanal',    label:'Semanal',    dias:7 },
  { id:'quincenal',  label:'Quincenal',  dias:15 },
  { id:'mensual',    label:'Mensual',    dias:30 },
  { id:'bimestral',  label:'Bimestral',  dias:60 },
  { id:'trimestral', label:'Trimestral', dias:90 },
  { id:'puntual',    label:'Puntual',    dias:null },
];
window.perDias = id => (window.PERIODICIDAD.find(p => p.id === id) || {}).dias;

window.ORIGEN_CREDITO = [
  { id:'comercial', label:'Comercial' },
  { id:'canal',     label:'Canal' },
  { id:'subvencion',label:'Subvenciones' },
  { id:'plataforma',label:'Plataforma' },
];

window.TIPO_DEUDOR = [
  { id:'empresa_grande', label:'Empresa grande',  anticipable:70 },
  { id:'pyme',           label:'Pyme',            anticipable:50 },
  { id:'publica',        label:'Administración',  anticipable:60 },
  { id:'particular',     label:'Particular',      anticipable:35 },
  { id:'internacional',  label:'Internacional',   anticipable:45 },
  { id:'plataforma',     label:'Plataforma',      anticipable:50 },
];

window.OPERATIVA = [
  { id:'ciega',    label:'Ciega',            desc:'Sin notificar ni verificar. La joya de la corona.' },
  { id:'conjunta', label:'Cuenta conjunta',  desc:'Cobro a cuenta controlada por ambos.' },
  { id:'gcobro',   label:'Gestión de cobro', desc:'Kintai gestiona el cobro con el deudor.' },
  { id:'notificada',label:'Notificada',      desc:'Cesión notificada al deudor, factoring clásico.' },
];

window.METODO_PAGO = ['Transferencia', 'Pagaré', 'Confirming', 'Recibo domiciliado', 'Cheque', 'Efectivo'];

// colateral vivo = lo que está facturado y aún no cobrado, de media
window.calcSegmento = function (s) {
  const imp = +s.importe || 0;
  const dias = window.perDias(s.periodicidad);
  const esperado = +s.pagoEsperado || 0;
  // ciclos de facturación que conviven sin cobrar
  const ciclos = dias ? esperado / dias : 1;
  const vivo = imp * Math.max(0, ciclos);
  const pct = (+s.anticipable || 0) / 100;
  const anticipable = vivo * pct;
  const nd = +s.nDeudores || 0;
  const porDeudor = nd > 0 ? anticipable / nd : anticipable;
  const tope = +s.maxDeudor || 0;
  const concentrado = tope > 0 && nd > 0 && (porDeudor / anticipable) * 100 > tope;
  const retraso = esperado - (+s.pagoEstipulado || 0);
  return { vivo, anticipable, porDeudor, concentrado, ciclos, retraso };
};

window.emptySegmento = () => ({
  id: 's' + Math.random().toString(36).slice(2, 8),
  origen:'comercial', tipoDeudor:'pyme', nDeudores:'', periodicidad:'mensual',
  importe:'', pagoEstipulado:'', pagoEsperado:'', metodo:'Transferencia', iban:'',
  operativa:'ciega', anticipable:50, maxDeudor:20, nota:'',
});

window.emptyDeudor = () => ({
  id: 'd' + Math.random().toString(36).slice(2, 8),
  origen:'comercial', cif:'', nombre:'', periodicidad:'mensual',
  importe:'', pagoEstipulado:'', pagoEsperado:'', metodo:'Transferencia',
  operativa:'ciega', anticipable:50, maxDeudor:20,
});

// ---------- Producto solicitado ----------
window.PRODUCTO = {
  linea:       [ 'Crédito', 'Préstamo', 'Línea de factoring' ],
  amortizacion:[ 'Cuotas', 'A vencimiento' ],
  recurso:     [ 'Con recurso', 'Sin recurso' ],
  garantias:   [ 'Ninguna', 'Personal del administrador', 'Pignoración', 'Aval societario' ],
};

// ---------- Motivos de pérdida ----------
window.LOST_REASONS = [
  { g:'Colateral que tiene', id:'colateral', opts:[
    { id:'comercial_concentrado', label:'Comercial · concentrado' },
    { id:'canal_amazon',          label:'Canal · Amazon u otro marketplace' },
    { id:'subvenciones',          label:'Otros · subvenciones' },
    { id:'sin_colateral',         label:'No tiene colateral anticipable' },
  ]},
  { g:'Operativa que quiere y no damos', id:'operativa', opts:[
    { id:'ciega',  label:'Ciega' },
    { id:'wallet', label:'Wallet' },
    { id:'gcobro', label:'Gestión de cobro' },
  ]},
  { g:'Producto que quiere y no tenemos activo', id:'producto', opts:[
    { id:'credito_cuotas', label:'Crédito con amortización en cuotas' },
    { id:'con_recurso',    label:'Con recurso' },
    { id:'a_vto',          label:'A vencimiento' },
  ]},
  { g:'Garantías que está dispuesto a dar', id:'garantias', opts:[
    { id:'ninguna',  label:'Ninguna' },
    { id:'personal', label:'Personal' },
    { id:'otras',    label:'Otras' },
  ]},
];
