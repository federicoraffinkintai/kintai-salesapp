// ============= ACTIVIDAD Y GENERACIÓN DE DEALS · Q4 2026 =============
// Dos cosas que el export de HubSpot no trae y que aquí se declaran como
// modelo, no como dato: (1) el embudo de actividad del AE — discoveries,
// propuestas, activaciones, clientes — y (2) el esfuerzo de contacto que hace
// falta para levantar los deals de cada canal. Los pasos están calibrados para
// que la cadena cuadre con el objetivo de clientes del trimestre; el día que el
// CRM registre reuniones y llamadas por AE, estas cifras se sustituyen por las
// medidas y la comparación objetivo/real sale sola.
window.AEACT_META = {
  fuente: 'Modelo de actividad Q4 2026 · pasos fijados por dirección',
  aviso: 'HubSpot no registra hoy reuniones, llamadas ni emails por AE: la columna de actividad es objetivo, no medición. Lo único medido aquí son los deals abiertos del pipeline.',
  instrumentar: 'Para cerrar el bucle hay que registrar en HubSpot el tipo de reunión (discovery / propuesta) y la actividad de contacto con propietario, para poder comparar el objetivo con el real.',
};

// Embudo de actividad del AE, del discovery al cliente. `paso` es la conversión
// desde el hito anterior. El primer paso es deal trabajado → discovery.
window.AEACT_FUNNEL = [
  { id:'deals',      label:'Deals trabajados', color:'#767D8C',
    desc:'Oportunidades de nuevo negocio abiertas a su nombre en el trimestre.' },
  { id:'discovery',  label:'Discoveries',  color:'#4054A8',
    desc:'Reunión de descubrimiento celebrada con el decisor.' },
  { id:'data',       label:'Data gatherings', color:'#2E93A8',
    desc:'Documentación completa: cuentas, mayor de clientes y deudores.' },
  { id:'risk',       label:'Risk analysis', color:'#6E3B8E',
    desc:'Verificación de deudor, pre CRA y comité de riesgos.' },
  { id:'propuesta',  label:'Propuestas',   color:'#8E6E2A',
    desc:'Propuesta con límite y precio sobre la mesa.' },
  { id:'activacion', label:'Activaciones', color:'#2E7D5B',
    desc:'Firma y alta de la línea en sistema.' },
  { id:'cliente',    label:'Clientes',     color:'#1F5C42',
    desc:'Línea activada y disponible para disponer.' },
];

// Los pasos NO son los mismos en las dos unidades, y es lo que los distingue:
// Pymes trabaja mucho deal de poco ticket y pierde la mitad antes del
// discovery; Mid Market trabaja pocas operaciones, muy cualificadas, y las
// lleva casi todas a reunión. Cada juego está anclado en los deals por cliente
// de su unidad, así que la cadena cuadra con el objetivo comprometido.
window.AEACT_PASOS = {
  pymes:  { discovery:0.48, data:0.72, risk:0.80, propuesta:0.70, activacion:0.55, cliente:0.95,
    ancla:'10 deals trabajados por cliente, los que declara el objetivo: 80 deals para 8 clientes.' },
  midmkt: { discovery:0.70, data:0.85, risk:0.88, propuesta:0.83, activacion:0.65, cliente:0.95,
    ancla:'3,7 deals trabajados por cliente, los que mide el histórico de Mid Market: 1.484 deals de Paula para 398 clientes.' },
};
window.aeactPasos = function (unidad) { return window.AEACT_PASOS[unidad] || window.AEACT_PASOS.pymes; };
window.aeactEndToEnd = function (unidad) {
  const p = window.aeactPasos(unidad);
  return p.discovery * p.data * p.risk * p.propuesta * p.activacion * p.cliente;
};

// Las tres conversiones que manda dirección mirar en la ficha de cada AE, con
// los saltos del embudo que las componen.
window.AEACT_CONV = [
  { id:'discRisk', label:'Discovery → Risk', pasos:['data','risk'],
    desc:'De la reunión de descubrimiento a riesgos: mide si el AE sabe sacar la documentación.' },
  { id:'negoAct',  label:'Negociación → Activación', pasos:['activacion'],
    desc:'De la propuesta a la firma: mide si sabe negociar el precio y el límite.' },
  { id:'actWon',   label:'Activación → Won', pasos:['cliente'],
    desc:'De la firma a la línea dispuesta: mide si la operación acaba siendo cliente de verdad.' },
];

// Fase del pipeline vivo que evidencia cada hito, para poner al lado del
// objetivo lo que hoy hay de verdad abierto.
// La fase 'data' del pipeline no distingue la reunión de descubrimiento de la
// documentación, así que solo evidencia el hito de data gathering: discovery se
// queda sin evidencia en el CRM hasta que se registre el tipo de reunión.
window.AEACT_FASE_HITO = { data:'data', risk:'risk', propuesta:'nego', activacion:'act' };

// Precio por deal imputado: mezcla de segmentos del objetivo × precio del
// segmento de la hoja de outbound. Es imputación declarada, no tarifa del CRM.
window.AEACT_SEG_PRECIO = { big:100, mid:50, midmkt:150, small:25 };

// Insignias de la ficha del AE. Se prueban sobre el objetivo y el pipeline
// vivo, no sobre histórico: cuatro de los seis AE no tienen histórico propio.
window.AEACT_BADGES = [
  { id:'cobertura', name:'Cobertura', desc:'Forecast ponderado por encima del 60% de su objetivo',
    icon:'60', test:a => a.cob != null && a.cob >= 0.6 },
  { id:'pipeline',  name:'Con pipeline', desc:'Deals abiertos a su nombre en el CRM',
    icon:'◇', test:a => !!a.pipe },
  { id:'millonario',name:'Diez millones', desc:'Objetivo de trimestre de 10M€ o más',
    icon:'10M', test:a => a.obj.eur >= 1e7 },
  { id:'ticket',    name:'Ticket grande', desc:'Ticket medio comprometido de 300k€ o más',
    icon:'300k', test:a => a.ticket != null && a.ticket >= 3e5 },
  { id:'cartera',   name:'Cartera', desc:'Gestiona volumen recurrente, no solo nuevo negocio',
    icon:'↺', test:a => (a.obj.recurrente || 0) > 0 },
  { id:'multicanal',name:'Multicanal', desc:'Levanta deals en dos canales o más',
    icon:'2', test:a => (a.canal || []).length >= 2 },
  { id:'ritmo',     name:'Ritmo alto', desc:'Tres discoveries por semana o más',
    icon:'3/s', test:a => a.hitos && a.hitos[1] && a.hitos[1].sem >= 3 },
];

// Esfuerzo de contacto por canal: cuántas llamadas y emails hacen falta para
// levantar un deal, y el mantenimiento que pide la relación (llamada semanal al
// partner en cartera, toque mensual al contacto). Son supuestos declarados.
window.AEACT_CANALES = [
  { id:'Partners', label:'Partners', color:'#C8A24C',
    llamadas:2, emails:4, mant:1,
    desc:'El deal lo trae el partner: el esfuerzo es activarlo y mantenerlo caliente con una llamada semanal por partner en cartera.',
    mantLabel:'llamada semanal por partner en cartera' },
  { id:'Outbound', label:'Outbound', color:'#2E7D5B',
    llamadas:12, emails:18, mant:0,
    desc:'Del listado al discovery. El SDR abre y el AE cierra la agenda: el ratio incluye los intentos que no llegan al decisor.',
    mantLabel:null },
  { id:'Contactos', label:'Contactos', color:'#2E93A8',
    llamadas:6, emails:9, mant:0.25,
    desc:'Base propia de contactos de Mid Market: menos intentos por deal, pero pide toque mensual para no enfriarse.',
    mantLabel:'toque mensual por contacto en seguimiento' },
];

// Mezcla de canales para generar los deals de cada AE. Los cuatro de Pymes ya
// la traen en su objetivo (40 partners + 40 outbound); los dos de Mid Market se
// declaran aquí, y la base de relación (partners o contactos) es la cartera con
// la que trabajan.
window.AEACT_AE = {
  adrian: { base:{ Partners:12 } },
  lina:   { base:{ Partners:12 } },
  silvia: { base:{ Partners:12 } },
  arnau:  { base:{ Partners:12 } },
  // De los 60 deals de Paula solo 22 son nuevo negocio: el resto es cartera
  // que se renueva sin pasar por discovery, así que no entra en el embudo.
  paula:  { dealsEmbudo:22,
    embudoNota:'22 de sus 60 deals son nuevo negocio; los otros 38 son renovación de cartera y no hacen discovery.',
    canal:[{ id:'Contactos', deals:40 }, { id:'Partners', deals:20 }],
    base:{ Contactos:180, Partners:8 } },
  // Alex no lleva deals en el objetivo: se derivan de sus 30 clientes con los
  // deals por cliente medidos en el histórico del equipo de Mid Market.
  alex:   { derivar:{ clientes:30, dealsPorCliente:3.7, ref:'Paula · 1.484 deals para 398 clientes en el histórico' },
    canal:[{ id:'Outbound', deals:0.5 }, { id:'Contactos', deals:0.5 }],
    base:{ Contactos:120 } },
};

window.aeActividad = function () {
  const q4 = window.aeQ4();
  const F = window.AEACT_FUNNEL;
  const canalDe = (id) => window.AEACT_CANALES.find(c => c.id === id);

  const list = q4.list.map(a => {
    const cfg = window.AEACT_AE[a.key] || {};
    // Deals del trimestre: los del objetivo o, si no los lleva, derivados de
    // sus clientes con los deals por cliente de referencia.
    const der = cfg.derivar || null;
    const deals = a.obj.deals != null ? a.obj.deals
      : der ? Math.round(der.clientes * der.dealsPorCliente) : null;
    // Los deals que pasan por el embudo: solo nuevo negocio.
    const dealsEmbudo = cfg.dealsEmbudo != null ? cfg.dealsEmbudo : deals;
    const pasos = window.aeactPasos(a.unidad);

    // Cadena hacia adelante desde los deals de nuevo negocio, con los pasos de
    // su unidad.
    const hitos = [];
    let v = dealsEmbudo;
    F.forEach((f, i) => {
      const paso = i > 0 ? pasos[f.id] : null;
      if (i > 0) v = v == null ? null : v * paso;
      hitos.push({ ...f, paso, n: v, sem: v == null ? null : v / q4.t.semanas,
        // Lo que hoy está vivo en la fase que evidencia el hito.
        vivo: (() => {
          const fase = window.AEACT_FASE_HITO[f.id];
          if (!fase || !a.pipe) return null;
          const x = a.pipe.fases.find(y => y.id === fase);
          return x ? x.n : 0;
        })() });
    });
    const cliente = hitos[hitos.length - 1];
    // Coherencia: los clientes que sale del embudo contra los comprometidos.
    const objCli = a.obj.clientes || (der ? der.clientes : null);

    // Canales y esfuerzo de contacto.
    const canalSrc = cfg.canal || a.canal || null;
    const canal = (canalSrc || []).map(c => {
      const d = canalDe(c.id) || { llamadas:0, emails:0, mant:0 };
      // Un peso < 1 es fracción de los deals; un valor >= 1 son deals directos.
      const n = c.deals != null && c.deals < 1 && deals != null ? c.deals * deals : c.deals;
      const baseN = (cfg.base || {})[c.id] || 0;
      const mant = d.mant ? baseN * d.mant * q4.t.semanas : 0;
      return { ...d, id:c.id, deals:n, rLlam:d.llamadas, rEmail:d.emails,
        llamadasDeals: n == null ? null : n * d.llamadas,
        emails: n == null ? null : n * d.emails,
        base: baseN, mantLlamadas: mant,
        llamadas: n == null ? null : n * d.llamadas + mant,
        dealsSem: n == null ? null : n / q4.t.semanas };
    });
    const tot = {
      deals: canal.reduce((x, c) => x + (c.deals || 0), 0),
      llamadas: canal.reduce((x, c) => x + (c.llamadas || 0), 0),
      emails: canal.reduce((x, c) => x + (c.emails || 0), 0),
      mant: canal.reduce((x, c) => x + (c.mantLlamadas || 0), 0),
    };
    tot.toques = tot.llamadas + tot.emails;
    tot.toquesSem = tot.toques / q4.t.semanas;
    tot.toquesDia = tot.toques / (q4.t.dias * 5 / 7);
    tot.porDeal = tot.deals ? tot.toques / tot.deals : null;

    return { ...a, deals, dealsEmbudo, pasos, embudoNota: cfg.embudoNota || null, derivar: der, hitos, canal, tot, objCli,
      // Ticket medio comprometido y precio por deal imputado por mezcla.
      ticket: a.obj.ticket != null ? a.obj.ticket : (objCli ? a.obj.eur / objCli : null),
      pricing: (() => {
        const mz = (a.mezcla || []).filter(m => window.AEACT_SEG_PRECIO[m.id] != null && m.n);
        const n = mz.reduce((x, m) => x + m.n, 0);
        return n ? mz.reduce((x, m) => x + m.n * window.AEACT_SEG_PRECIO[m.id], 0) / n : null;
      })(),
      conv: window.AEACT_CONV.map(c => ({ ...c,
        v: c.pasos.reduce((x, k) => x * pasos[k], 1) })),
      cliModelo: cliente.n,
      desvio: objCli && cliente.n != null ? cliente.n / objCli - 1 : null,
      eurPorCliente: objCli ? a.obj.eur / objCli : null };
  });

  list.forEach(a => {
    a.badges = window.AEACT_BADGES.filter(b => { try { return b.test(a); } catch (e) { return false; } }).map(b => b.id);
  });

  const canalTot = window.AEACT_CANALES.map(c => {
    const l = list.map(a => a.canal.find(x => x.id === c.id)).filter(Boolean);
    return { ...c,
      deals: l.reduce((x, y) => x + (y.deals || 0), 0),
      llamadas: l.reduce((x, y) => x + (y.llamadas || 0), 0),
      emails: l.reduce((x, y) => x + (y.emails || 0), 0),
      base: l.reduce((x, y) => x + (y.base || 0), 0),
      ae: l.length };
  }).filter(c => c.deals > 0);

  const hitosTot = window.AEACT_FUNNEL.map((f, i) => ({ ...f,
    n: list.reduce((x, a) => x + (a.hitos[i].n || 0), 0),
    vivo: list.reduce((x, a) => x + (a.hitos[i].vivo || 0), 0) }));

  return { q4, t: q4.t, list, canalTot, hitosTot,
    tot: {
      deals: list.reduce((x, a) => x + (a.deals || 0), 0),
      llamadas: list.reduce((x, a) => x + a.tot.llamadas, 0),
      emails: list.reduce((x, a) => x + a.tot.emails, 0),
      toques: list.reduce((x, a) => x + a.tot.toques, 0),
      clientes: list.reduce((x, a) => x + (a.cliModelo || 0), 0),
      objCli: list.reduce((x, a) => x + (a.objCli || 0), 0),
    } };
};
