// Marcador de sprints: histórico propio, equipo, récords y logros.

// ---------- Resumen de un sprint a partir del registro de llamadas ----------
window.sprintStats = function (sprintId, log, callbacks) {
  const hits = [];
  for (const nif of Object.keys(log || {})) {
    for (const h of log[nif] || []) if (h.sprint === sprintId) hits.push({ ...h, nif });
  }
  const isDM = h => { const o = window.outcomeById(h.outcome); return o && o.reachesDM; };
  const meetings = hits.filter(h => h.outcome === 'dm_meeting');
  return {
    calls: hits.length,
    gk: hits.filter(h => /^gk_/.test(h.outcome)).length,
    gkPassed: hits.filter(h => h.outcome === 'gk_passed').length,
    gkInfo: hits.filter(h => h.outcome === 'gk_info').length,
    dm: hits.filter(isDM).length,
    meetings: meetings.length,
    callbacks: hits.filter(h => h.outcome === 'dm_callback').length,
    noAnswer: hits.filter(h => h.outcome === 'no_answer').length,
    // una reunión sobre un lead que traía callback pendiente
    rescues: meetings.filter(m => callbacks && callbacks[m.nif]).length,
    leads: new Set(hits.map(h => h.nif)).size,
    firstTs: hits.length ? Math.min(...hits.map(h => h.ts)) : null,
    lastTs: hits.length ? Math.max(...hits.map(h => h.ts)) : null,
  };
};

window.rate = (a, b) => (b > 0 ? (a / b) * 100 : 0);

// ---------- Logros ----------
// Premian la conducta que produce reuniones, no solo la suerte de un día.
window.BADGES = [
  { id:'centenario', name:'Centenario', desc:'100 llamadas en un solo sprint',
    icon:'100', test:(s, agg) => s.some(x => x.calls >= 100) },
  { id:'triplete', name:'Triplete', desc:'3 reuniones en un solo sprint',
    icon:'III', test:s => s.some(x => x.meetings >= 3) },
  { id:'portero', name:'Rompe-filtros', desc:'10 gatekeepers superados en un sprint',
    icon:'⌘', test:s => s.some(x => x.gkPassed >= 10) },
  { id:'rescate', name:'Rescate', desc:'Una reunión salida de un callback pendiente',
    icon:'↺', test:s => s.some(x => x.rescues > 0) },
  { id:'cazanombres', name:'Cazanombres', desc:'25 nombres de gatekeeper capturados',
    icon:'✎', test:(s, agg) => agg.gkNames >= 25 },
  { id:'constancia', name:'Constancia', desc:'5 sprints completados',
    icon:'5', test:s => s.length >= 5 },
  { id:'racha', name:'Racha', desc:'Reunión en 3 sprints seguidos',
    icon:'▲', test:s => {
      let run = 0;
      for (const x of s) { run = x.meetings > 0 ? run + 1 : 0; if (run >= 3) return true; }
      return false;
    } },
  { id:'eficiencia', name:'Precisión', desc:'Más del 5% de llamadas convertidas en reunión',
    icon:'◎', test:(s, agg) => agg.calls >= 50 && window.rate(agg.meetings, agg.calls) > 5 },
  { id:'maraton', name:'Maratón', desc:'500 llamadas acumuladas',
    icon:'500', test:(s, agg) => agg.calls >= 500 },
  { id:'sinfallar', name:'Disciplina', desc:'Un sprint entero sin dejar llamadas sin registrar',
    icon:'✓', test:s => s.some(x => x.calls >= 40 && x.leads === x.calls) },
];

// ---------- Récords que merece la pena batir ----------
window.RECORDS = [
  { id:'meetings', label:'Reuniones en un sprint', get:s => Math.max(0, ...s.map(x => x.meetings)), unit:'' },
  { id:'calls',    label:'Llamadas en un sprint',  get:s => Math.max(0, ...s.map(x => x.calls)), unit:'' },
  { id:'gk',       label:'Gatekeepers superados',  get:s => Math.max(0, ...s.map(x => x.gkPassed)), unit:'' },
  { id:'rate',     label:'Mejor tasa de conversión', unit:'%',
    get:s => { const v = s.filter(x => x.calls >= 20).map(x => window.rate(x.meetings, x.calls)); return v.length ? Math.max(...v) : 0; } },
];

// ---------- Equipo de ejemplo ----------
// Datos inventados para poder juzgar el marcador. Se sustituyen al conectar el CRM.
window.TEAM_DEMO = [
  { id:'nuria',  name:'Núria Bastida',  sprints:14, calls:1180, gk:742, gkPassed:196, dm:238, meetings:31, badges:['centenario','triplete','portero','constancia','racha','maraton','eficiencia'] },
  { id:'ignasi', name:'Ignasi',         self:true },
  { id:'marc',   name:'Marc Puigdemunt',sprints:11, calls:905,  gk:601, gkPassed:142, dm:171, meetings:22, badges:['centenario','triplete','constancia','maraton'] },
  { id:'alba',   name:'Alba Ferrer',    sprints:9,  calls:712,  gk:455, gkPassed:131, dm:160, meetings:24, badges:['triplete','portero','constancia','maraton','eficiencia'] },
  { id:'dani',   name:'Dani Ochoa',     sprints:7,  calls:534,  gk:349, gkPassed:88,  dm:107, meetings:12, badges:['centenario','constancia','maraton'] },
  { id:'lucia',  name:'Lucía Requena',  sprints:5,  calls:388,  gk:251, gkPassed:71,  dm:94,  meetings:15, badges:['triplete','constancia','eficiencia'] },
];

window.TEAM_RANKS = [
  { id:'meetings', label:'Reuniones',  get:m => m.meetings, fmt:v => v },
  { id:'rate',     label:'Conversión', get:m => window.rate(m.meetings, m.calls), fmt:v => v.toFixed(1).replace('.', ',') + '%' },
  { id:'gkrate',   label:'Paso de filtro', get:m => window.rate(m.gkPassed, m.gk), fmt:v => v.toFixed(0) + '%' },
  { id:'calls',    label:'Volumen',    get:m => m.calls, fmt:v => v.toLocaleString('es-ES') },
];
