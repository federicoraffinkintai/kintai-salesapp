// Conversation playbook — se engancha a window.PILLARS (definido en scoring.js)

window.SCRIPTS = {
  need: {
    blurb: 'Validar que hay presión real de circulante hoy.',
    questions: [
      { q:'¿Cómo está organizando hoy el circulante? ¿Quién financia el desfase entre pagar al proveedor y cobrar del cliente?',
        purpose:'Validar NOF/Facturación y método actual.',
        listen:['Tira de pólizas','Estira proveedores','Línea al límite','Confirming, factoring'] },
      { q:'¿Cómo van las ventas frente al año pasado? ¿Creciendo, plano o ajustando?',
        purpose:'Confirmar el crecimiento que tensa las NOF.',
        listen:['Crecemos a doble dígito','Pipeline cargado','Estancado','Caída'] },
      { q:'De vuestro activo, ¿cuánto está en stock y en facturas pendientes de cobro?',
        purpose:'Validar intensidad de circulante.',
        listen:['Casi todo','Mucho stock','Clientes que no pagan'] },
      { q:'Cuando crecéis, ¿el banco os acompaña o cada renovación es una negociación?',
        purpose:'Detectar el hueco de financiación externa.',
        listen:['Cada año peor','Renovación complicada','Sin problemas'] },
      { q:'¿Hay algún pico estacional o un cliente grande que os obligue a adelantar caja?',
        purpose:'Necesidad puntual y picos.',
        listen:['Sí, campañas','Obras grandes','Adelantos a proveedor'] },
    ],
  },
  alt: {
    blurb: 'Encontrar dónde la banca ya les dijo que no.',
    questions: [
      { q:'¿Cómo tenéis las pólizas con el banco? ¿Os están subiendo precio o bajando líneas?',
        purpose:'Detectar restricción bancaria.',
        listen:['Nos subieron el tipo','Bajaron la línea','Recortaron el confirming'] },
      { q:'¿Habéis intentado ampliar línea este año? ¿Qué os pidieron y cómo acabó?',
        purpose:'Fricción y velocidad de la alternativa.',
        listen:['Avales personales','Tres meses de proceso','Lo denegaron'] },
      { q:'¿Cuántas entidades tenéis y cuánto os ocupa la CIRBE?',
        purpose:'Validar deuda/EBITDA y capacidad restante.',
        listen:['Estamos al límite','Cinco bancos','No queda margen'] },
      { q:'Cuando entra un pedido grande de golpe, ¿de dónde sale el dinero?',
        purpose:'Mapear alternativas reales.',
        listen:['Estiramos proveedores','Bolsa propia','No lo cogemos'] },
    ],
  },
  fit: {
    blurb: 'Confirmar que cobran tarde y a cliente empresa.',
    questions: [
      { q:'¿A cuánto cobráis de media? ¿Quién marca el plazo, vosotros o el cliente?',
        purpose:'Validar el PMC real frente al del balance.',
        listen:['90 días','120 días','Lo marca el cliente','Cliente público'] },
      { q:'¿Vendéis a empresa, a particular o mezcla? ¿Cuántos clientes son el 80% del negocio?',
        purpose:'B2B y fragmentación de cartera.',
        listen:['B2B','Industria','Tres clientes son el 70%'] },
      { q:'¿Cómo documentáis la venta: factura, albarán firmado, certificación?',
        purpose:'Verificar que la factura es anticipable.',
        listen:['Factura y albarán','Certificación de obra','Contrato marco'] },
      { q:'¿Habéis tenido morosidad o algún pagador que os dejara colgados?',
        purpose:'Calidad crediticia de los pagadores.',
        listen:['Sí, uno gordo','Filtramos clientes','Seguro de crédito'] },
    ],
  },
  budget: {
    blurb: 'Aterrizar el coste que ya pagan y cerrar precio.',
    questions: [
      { q:'¿Qué estáis pagando hoy en total entre pólizas, descuento y comisiones?',
        purpose:'Anclar contra su coste actual, no contra cero.',
        listen:['No lo tengo calculado','Un 6-7%','Nos cuesta caro'] },
      { q:'Si mañana tuvierais la caja liberada, ¿en qué la usaríais y cuánto os haría ganar?',
        purpose:'Rendimiento del circulante frente al pricing.',
        listen:['Comprar mejor','Coger más obra','Descuento por pronto pago'] },
      { q:'¿Qué os ha costado este año no poder tirar de caja cuando hacía falta?',
        purpose:'Coste de oportunidad, la palanca más potente.',
        listen:['Dejamos pedidos','Perdimos un cliente','Compramos peor'] },
      { q:'¿Quién decide una línea de financiación nueva y qué necesita ver para decir que sí?',
        purpose:'Decisor y criterio de compra.',
        listen:['Lo veo yo','El consejo','El director financiero'] },
    ],
  },
};

window.PILLARS.forEach(p => { p.script = window.SCRIPTS[p.id]; });

// ============= FEEDBACK LOOP =============
window.computeAdjustment = function (c, validations, feedback) {
  const V = validations || {}, F = feedback || {};
  const pillars = {};
  let totalSignals = 0, deltaSum = 0, origSum = 0;

  for (const p of window.PILLARS) {
    const orig = c[p.key] || 0;
    let delta = 0, validated = 0, denied = 0, scriptSignals = 0;

    for (const v of p.vars) {
      const val = V[`${p.id}-${v.id}`];
      if (!val) continue;
      const share = Math.abs(window.auditVar(v, c).m) / Math.max(1, Math.abs(orig));
      if (val === 'confirm') { delta += share * 0.15; validated++; totalSignals++; }
      if (val === 'deny')    { delta -= share * 0.30; denied++;    totalSignals++; }
    }
    (p.script?.questions || []).forEach((q, i) => {
      const fb = F[`${p.id}-${i}`];
      if (!fb || !fb.vote) return;
      scriptSignals++; totalSignals++;
      if (fb.vote === 'up')   delta += 0.03;
      if (fb.vote === 'same') delta += 0.01;
      if (fb.vote === 'down') delta -= 0.08;
    });

    const adjusted = orig * (1 + delta);
    pillars[p.id] = { orig, delta, adjusted, validated, denied, scriptSignals };
    origSum += orig; deltaSum += adjusted - orig;
  }

  const origGlobal = c.g || 0;
  return { pillars, origGlobal, adjustedGlobal: origGlobal + deltaSum, weightedDelta: origGlobal ? deltaSum / Math.abs(origGlobal) : 0, totalSignals };
};

// ============= COHORTS =============
window.COHORTS = [
  { id:'industria-pmc', name:'Industria con PMC > 90', desc:'Fábricas que cobran tarde. Encaje claro de anticipo.', pillar:'fit',
    filter:c => /industria manufacturera|fabricaci|metal|qu[ií]mic/i.test(c.sector||'') && (c.pmc||0) > 90,
    pitch:'En vuestro sector vemos cobros a 90-120 días mientras la materia prima se paga casi al contado. Os llamo porque tenemos forma de cerrar ese hueco sin tocar la línea del banco.' },
  { id:'crece-deuda-alta', name:'Crecen >30% con banco saturado', desc:'Crecimiento que tensa circulante y deuda/EBITDA alta.', pillar:'need',
    filter:c => (c.v_crec||0) > 0.3 && ((c.v_deuda_ebitda||0) > 6 || (c.ebitda||0) < 0),
    pitch:'Estáis creciendo bien y eso aprieta el circulante justo cuando el banco está más exigente. ¿Vemos si encaja una llamada de quince minutos?' },
  { id:'ebitda-neg', name:'EBITDA negativo, banca bloqueada', desc:'Banca cerrada por scoring. Kintai como alternativa real.', pillar:'alt',
    filter:c => (c.ebitda||0) < 0 && (c.ventas||0) > 3e6,
    pitch:'Sé que con EBITDA en negativo el banco no abre líneas nuevas. Nosotros miramos vuestros cobros, no vuestro balance.' },
  { id:'construccion', name:'Construcción e instalaciones', desc:'Certificaciones a 90+ días y retenciones de garantía.', pillar:'fit',
    filter:c => /construcci/i.test(c.sector||'') && (c.pmc||0) > 75,
    pitch:'En obra es habitual certificar y cobrar meses después mientras el material se paga a treinta. Os llamo para enseñaros cómo otros del sector anticipan la certificación.' },
  { id:'mayorista', name:'Comercio mayorista', desc:'La tijera clásica entre cobro y pago.', pillar:'fit',
    filter:c => /comercio/i.test(c.sector||'') && (c.pmc||0) > 60,
    pitch:'En distribución cobráis a sesenta o noventa y el proveedor os cobra a treinta. Ese mes de diferencia es capital vuestro parado.' },
  { id:'servicios-nomina', name:'Servicios con nómina adelantada', desc:'Coste 100% personal contra cobro a 80+ días.', pillar:'need',
    filter:c => /servicio|administrativ|profesional|t[eé]cnic/i.test(c.sector||'') && (c.pmc||0) > 70,
    pitch:'Vuestro coste sale cada mes en nóminas y el cliente paga a ochenta días. Son casi tres nóminas financiadas por vosotros de forma permanente.' },
  { id:'linea-grande', name:'Línea potencial > 500k€', desc:'Los tickets más grandes del top.', pillar:'budget',
    filter:c => (c.linea||0) >= 500000,
    pitch:'Por vuestro volumen de cartera podríamos hablar de una línea relevante. Me gustaría entender cómo lo estáis cubriendo hoy.' },
];

// Los tramos de la matriz de campañas son los mismos del modelo de mercado, no
// una rejilla propia: antes empezaba en 3M€ y dejaba fuera a SME Mid y Small,
// que son los dos segmentos con objetivo de cuota.
window.TIERS = (function () {
  const B = window.MKT_BOUNDS || {};
  return Object.keys(B).map(id => {
    const t = (window.MKT_TIERS || []).find(x => x.id === id);
    const [lo, hi] = B[id];
    return { id, label: t ? t.label : id, min: lo, max: hi == null ? Infinity : hi };
  });
})();

window.SECTOR_GROUPS = [
  { id:'industria',    label:'Industria',       match:/industria manufacturera|fabricaci|metal|qu[ií]mic|maquinari/i },
  { id:'construccion', label:'Construcción',    match:/construcci|obra|edific|hormig|cement/i },
  { id:'comercio',     label:'Comercio',        match:/comercio|al por mayor|distribuci/i },
  { id:'transporte',   label:'Transporte',      match:/transporte|log[ií]stic|almacenamiento/i },
  { id:'servicios',    label:'Servicios',       match:/servicio|consultor|profesional|administrativ|t[eé]cnic/i },
  { id:'agro',         label:'Agroalimentario', match:/agricultura|aliment|agr[ií]|bebid|ganader|pesca/i },
  { id:'tecnologia',   label:'Tecnología',      match:/informaci|comunicaci|inform[aá]tic/i },
  { id:'otros',        label:'Otros',           match:/.*/ },
];

window.classifySector = function (s) {
  for (const g of window.SECTOR_GROUPS) if (g.match.test(s || '')) return g;
  return window.SECTOR_GROUPS[window.SECTOR_GROUPS.length - 1];
};
