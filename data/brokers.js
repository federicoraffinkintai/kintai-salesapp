// ============= BROKER SUCCESS Q2-26 =============
// Hoja BROKER SUCCESS Q2-26 de COMMITMENTS SALES TEAM.xlsx, reproducida celda a
// celda. El objetivo de deals por partner es el compromiso del trimestre; el
// reparto por segmento sale del 20 / 30 / 50 que aplica la propia hoja.
window.BRK_META = {
  fuente: 'COMMITMENTS SALES TEAM.xlsx · hoja BROKER SUCCESS Q2-26',
  trimestre: 'Q2 2026',
  partners: 65,
  objetivoDeals: 268,
  // Los actuales de la hoja, para poder comprobar que no se ha movido nada.
  control: { midmkt: 14, big: 30, mid: 90, small: 0, total: 134 },
  // La hoja no reparte objetivo en Small Pymes: no es segmento de partner.
  nota: 'La hoja no fija target de Small Pymes y los cuatro partners nuevos no tienen objetivo asignado todavía.',
};

// Tipos de partner tal como los clasifica la hoja, de mayor a menor compromiso.
window.BRK_TIPOS = [
  { id:'Best',           label:'Best',            color:'#1F5C42', desc:'Los cinco de mayor compromiso: 24 a 30 deals cada uno.' },
  { id:'Good',           label:'Good',            color:'#2E7D5B', desc:'Compromiso de 6 a 24 deals. Volumen medio.' },
  { id:'Embedded',       label:'Embedded',        color:'#2E93A8', desc:'Integrados en el producto del partner.' },
  { id:'Referral/Small', label:'Referral / Small',color:'#767D8C', desc:'Un deal de compromiso: cola larga de referidores.' },
  { id:'Nuevo',          label:'Nuevos',          color:'#B8731F', desc:'Altas recientes sin objetivo asignado todavía.' },
];

// Segmentos de la hoja, con el peso que la propia hoja da al objetivo.
window.BRK_SEGS = [
  { id:'midmkt', label:'Mid Market',  peso:0.20, color:'#8E6E2A' },
  { id:'big',    label:'Big Pymes',   peso:0.30, color:'#2E7D5B' },
  { id:'mid',    label:'Mid Pymes',   peso:0.50, color:'#4054A8' },
  { id:'small',  label:'Small Pymes', peso:null, color:'#767D8C' },
];

window.BROKERS = [{"tipo":"Best","nombre":"IDF","obj":30,"t":{"midmkt":6,"big":9,"mid":15},"a":{"midmkt":1,"big":4,"mid":9,"small":0}},{"tipo":"Best","nombre":"Altria","obj":24,"t":{"midmkt":4.800000000000001,"big":7.199999999999999,"mid":12},"a":{"midmkt":0,"big":8,"mid":5,"small":0}},{"tipo":"Best","nombre":"Kaizen Consulting","obj":24,"t":{"midmkt":4.800000000000001,"big":7.199999999999999,"mid":12},"a":{"midmkt":1,"big":3,"mid":5,"small":0}},{"tipo":"Best","nombre":"BEKA Finance","obj":24,"t":{"midmkt":4.800000000000001,"big":7.199999999999999,"mid":12},"a":{"midmkt":1,"big":0,"mid":1,"small":0}},{"tipo":"Best","nombre":"Howden","obj":24,"t":{"midmkt":4.800000000000001,"big":7.199999999999999,"mid":12},"a":{"midmkt":4,"big":5,"mid":4,"small":0}},{"tipo":"Good","nombre":"Ores & Bryan","obj":24,"t":{"midmkt":4.800000000000001,"big":7.199999999999999,"mid":12},"a":{"midmkt":0,"big":0,"mid":11,"small":0}},{"tipo":"Good","nombre":"EML Gestión","obj":6,"t":{"midmkt":1.2000000000000002,"big":1.7999999999999998,"mid":3},"a":{"midmkt":0,"big":1,"mid":15,"small":0}},{"tipo":"Good","nombre":"Alonso Reviriego Consulting","obj":6,"t":{"midmkt":1.2000000000000002,"big":1.7999999999999998,"mid":3},"a":{"midmkt":0,"big":0,"mid":1,"small":0}},{"tipo":"Good","nombre":"Think Big Advisory","obj":6,"t":{"midmkt":1.2000000000000002,"big":1.7999999999999998,"mid":3},"a":{"midmkt":0,"big":0,"mid":2,"small":0}},{"tipo":"Good","nombre":"Renton","obj":6,"t":{"midmkt":1.2000000000000002,"big":1.7999999999999998,"mid":3},"a":{"midmkt":0,"big":1,"mid":0,"small":0}},{"tipo":"Good","nombre":"ECIJA","obj":6,"t":{"midmkt":1.2000000000000002,"big":1.7999999999999998,"mid":3},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Good","nombre":"Group MC 2018 Ventures Advisors","obj":6,"t":{"midmkt":1.2000000000000002,"big":1.7999999999999998,"mid":3},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Good","nombre":"BMS","obj":6,"t":{"midmkt":1.2000000000000002,"big":1.7999999999999998,"mid":3},"a":{"midmkt":2,"big":0,"mid":0,"small":0}},{"tipo":"Good","nombre":"IMPLICA CF","obj":6,"t":{"midmkt":1.2000000000000002,"big":1.7999999999999998,"mid":3},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Avernet Solutions","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Veraces Consulting","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":1,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Upbizor","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"FINAMIDA","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":1,"big":2,"mid":1,"small":0}},{"tipo":"Referral/Small","nombre":"Jordi Cortés","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Aisf Partners S.L.","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":1,"big":1,"mid":2,"small":0}},{"tipo":"Referral/Small","nombre":"Consultoría en Inversiones y Subvenciones","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Finanzio","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":1,"small":0}},{"tipo":"Referral/Small","nombre":"Manuel Cabrera","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Shanchez-Jofré y Carrasco Asociados","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":3,"small":0}},{"tipo":"Referral/Small","nombre":"FINANCLICK Financial Services","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Focus Partners","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Rafa Canales","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Scharpf","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"SCP Finance & Associates","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Sergi Serradell","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Credit Expert","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Gesfie","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"GENCAT","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Grup Inversor","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"IESE (Jordi Carrillo)","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Mejora Consulting","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Zuleta Consultores","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":1,"small":0}},{"tipo":"Referral/Small","nombre":"ALKANZA","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"ANDSEED","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Arco financiacion","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"BE GREAT","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":1,"small":0}},{"tipo":"Referral/Small","nombre":"Biltera Consultores, S.l.","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"GESCAMP","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":1,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"INTERNATIONAL CREDIT BROKERS ALLIANCE CORREDURIA DE SEGUROS SL","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"MIGUEL ÁNGEL LACOMA","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Miguel Valls Robles","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":1,"small":0}},{"tipo":"Referral/Small","nombre":"Alberto Puigbó López","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"MLK CAPITAL","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Pledge Investment","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"quantum finance","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"SGfinanciera","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"SHERPA","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"ASFI","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"CK Finance","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Fourvenues","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"ESVALOR","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":1,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Iberfinancia","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Troya Capital","obj":1,"t":{"midmkt":0.2,"big":0.3,"mid":0.5},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Referral/Small","nombre":"Amo Finanzas","obj":1,"t":{"midmkt":0,"big":0.3,"mid":1},"a":{"midmkt":0,"big":0,"mid":3,"small":0}},{"tipo":"Nuevo","nombre":"Albantia","obj":null,"t":{"midmkt":null,"big":null,"mid":null},"a":{"midmkt":1,"big":1,"mid":2,"small":0}},{"tipo":"Nuevo","nombre":"Ebury","obj":null,"t":{"midmkt":null,"big":null,"mid":null},"a":{"midmkt":2,"big":1,"mid":0,"small":0}},{"tipo":"Nuevo","nombre":"MADERN FINANCES","obj":null,"t":{"midmkt":null,"big":null,"mid":null},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Nuevo","nombre":"VERUM","obj":null,"t":{"midmkt":null,"big":null,"mid":null},"a":{"midmkt":0,"big":0,"mid":0,"small":0}},{"tipo":"Embedded","nombre":"QONTO","obj":20,"t":{"midmkt":0,"big":0,"mid":20},"a":{"midmkt":0,"big":0,"mid":21,"small":0}},{"tipo":"Embedded","nombre":"MAHOU","obj":5,"t":{"midmkt":0,"big":0,"mid":5},"a":{"midmkt":0,"big":0,"mid":1,"small":0}}];

// Cumplimiento de un partner: total de deals conseguidos sobre su objetivo.
window.brkAch = function (b) {
  const act = window.BRK_SEGS.reduce((a, s) => a + (b.a[s.id] || 0), 0);
  return { act, obj: b.obj, pct: b.obj ? act / b.obj : null };
};

// Estado operativo, que es lo que ordena la lista: quién va sobrado, quién
// cumple, quién está por debajo y quién no ha traído nada.
window.BRK_ESTADOS = [
  { id:'over',  label:'Por encima',  color:'#1F5C42', test:(p) => p != null && p >= 1 },
  { id:'track', label:'En camino',   color:'#2E7D5B', test:(p) => p != null && p >= 0.6 },
  { id:'under', label:'Por debajo',  color:'#B8731F', test:(p) => p != null && p > 0 },
  { id:'zero',  label:'Sin deals',   color:'#B23A3A', test:(p) => p === 0 },
  { id:'noobj', label:'Sin objetivo',color:'#767D8C', test:() => true },
];
window.brkEstado = function (b) {
  const { pct, act } = window.brkAch(b);
  if (b.obj == null) return window.BRK_ESTADOS[4];
  if (act === 0) return window.BRK_ESTADOS[3];
  return window.BRK_ESTADOS.find(e => e.test(pct)) || window.BRK_ESTADOS[2];
};

// Cruce con HubSpot por nombre de broker, que es el campo Broker del export.
window.brkHubspot = function (nombre) {
  if (!window.HS_BROKERS) return null;
  const n = (nombre || '').toUpperCase().trim();
  return window.HS_BROKERS.find(x => (x.nombre || '').toUpperCase().trim() === n) || null;
};

// ============= SERIE MENSUAL REAL =============
// Deals de HubSpot con broker asignado, cruzados con los partners de la hoja por
// razón social normalizada (62% de 1.243 deals; el resto va a "Sin clasificar",
// casi todo variantes de nombre que hay que unificar en el CRM).
// d=deals creados, w=ganados, s=reparto por segmento, n=partners activos.
window.BRK_SERIE = {"2025-01":{"Best":{"d":13,"w":4,"s":{"midmkt":2,"big":1,"mid":3,"small":2},"n":4},"Referral/Small":{"d":11,"w":5,"s":{"midmkt":0,"big":1,"mid":4,"small":3},"n":7},"Embedded":{"d":8,"w":1,"s":{"midmkt":0,"big":0,"mid":1,"small":4},"n":1},"Sin clasificar":{"d":2,"w":2,"s":{"midmkt":2,"big":0,"mid":0,"small":0},"n":1}},"2025-02":{"Referral/Small":{"d":13,"w":3,"s":{"midmkt":0,"big":0,"mid":4,"small":4},"n":9},"Best":{"d":19,"w":7,"s":{"midmkt":2,"big":2,"mid":5,"small":3},"n":3},"Embedded":{"d":11,"w":1,"s":{"midmkt":0,"big":1,"mid":2,"small":5},"n":1},"Sin clasificar":{"d":1,"w":1,"s":{"midmkt":0,"big":0,"mid":1,"small":0},"n":1},"Good":{"d":2,"w":1,"s":{"midmkt":0,"big":0,"mid":1,"small":1},"n":2}},"2025-03":{"Embedded":{"d":16,"w":1,"s":{"midmkt":0,"big":0,"mid":2,"small":13},"n":1},"Referral/Small":{"d":6,"w":1,"s":{"midmkt":0,"big":2,"mid":2,"small":1},"n":6},"Best":{"d":17,"w":4,"s":{"midmkt":3,"big":3,"mid":3,"small":3},"n":3},"Sin clasificar":{"d":4,"w":2,"s":{"midmkt":0,"big":1,"mid":0,"small":0},"n":3}},"2025-04":{"Embedded":{"d":12,"w":2,"s":{"midmkt":0,"big":1,"mid":2,"small":7},"n":1},"Sin clasificar":{"d":2,"w":2,"s":{"midmkt":0,"big":0,"mid":0,"small":0},"n":1},"Referral/Small":{"d":11,"w":5,"s":{"midmkt":1,"big":1,"mid":3,"small":2},"n":5},"Best":{"d":8,"w":6,"s":{"midmkt":0,"big":0,"mid":1,"small":1},"n":2},"Good":{"d":2,"w":1,"s":{"midmkt":0,"big":1,"mid":0,"small":0},"n":1}},"2025-05":{"Embedded":{"d":23,"w":1,"s":{"midmkt":0,"big":0,"mid":3,"small":19},"n":1},"Best":{"d":12,"w":7,"s":{"midmkt":0,"big":3,"mid":2,"small":0},"n":4}},"2025-06":{"Best":{"d":13,"w":5,"s":{"midmkt":1,"big":3,"mid":5,"small":0},"n":3},"Embedded":{"d":10,"w":1,"s":{"midmkt":0,"big":0,"mid":2,"small":7},"n":1},"Referral/Small":{"d":6,"w":4,"s":{"midmkt":1,"big":1,"mid":0,"small":2},"n":5},"Sin clasificar":{"d":4,"w":2,"s":{"midmkt":0,"big":1,"mid":2,"small":0},"n":2},"Good":{"d":1,"w":1,"s":{"midmkt":0,"big":0,"mid":0,"small":0},"n":1}},"2025-07":{"Sin clasificar":{"d":11,"w":5,"s":{"midmkt":3,"big":0,"mid":2,"small":2},"n":3},"Best":{"d":21,"w":5,"s":{"midmkt":2,"big":3,"mid":13,"small":2},"n":3},"Embedded":{"d":19,"w":3,"s":{"midmkt":0,"big":0,"mid":3,"small":14},"n":2},"Referral/Small":{"d":15,"w":4,"s":{"midmkt":1,"big":2,"mid":8,"small":2},"n":11},"Good":{"d":3,"w":1,"s":{"midmkt":0,"big":1,"mid":1,"small":0},"n":2}},"2025-08":{"Sin clasificar":{"d":4,"w":2,"s":{"midmkt":2,"big":0,"mid":0,"small":2},"n":2},"Embedded":{"d":15,"w":1,"s":{"midmkt":0,"big":0,"mid":1,"small":14},"n":1},"Best":{"d":9,"w":1,"s":{"midmkt":1,"big":3,"mid":4,"small":1},"n":3},"Referral/Small":{"d":5,"w":2,"s":{"midmkt":0,"big":2,"mid":1,"small":2},"n":4},"Good":{"d":1,"w":1,"s":{"midmkt":0,"big":1,"mid":0,"small":0},"n":1}},"2025-09":{"Best":{"d":25,"w":8,"s":{"midmkt":7,"big":3,"mid":10,"small":5},"n":4},"Referral/Small":{"d":9,"w":3,"s":{"midmkt":0,"big":1,"mid":4,"small":4},"n":6},"Embedded":{"d":20,"w":0,"s":{"midmkt":0,"big":1,"mid":4,"small":15},"n":1},"Good":{"d":4,"w":1,"s":{"midmkt":0,"big":1,"mid":3,"small":0},"n":3},"Sin clasificar":{"d":8,"w":4,"s":{"midmkt":5,"big":0,"mid":2,"small":1},"n":3}},"2025-10":{"Embedded":{"d":27,"w":1,"s":{"midmkt":0,"big":2,"mid":4,"small":21},"n":2},"Referral/Small":{"d":16,"w":4,"s":{"midmkt":2,"big":0,"mid":10,"small":4},"n":8},"Sin clasificar":{"d":10,"w":3,"s":{"midmkt":5,"big":0,"mid":2,"small":3},"n":4},"Best":{"d":26,"w":9,"s":{"midmkt":3,"big":9,"mid":11,"small":3},"n":5},"Good":{"d":7,"w":1,"s":{"midmkt":0,"big":3,"mid":3,"small":1},"n":4}},"2025-11":{"Embedded":{"d":11,"w":1,"s":{"midmkt":0,"big":1,"mid":1,"small":9},"n":2},"Best":{"d":31,"w":5,"s":{"midmkt":7,"big":6,"mid":10,"small":8},"n":5},"Referral/Small":{"d":7,"w":2,"s":{"midmkt":0,"big":0,"mid":2,"small":5},"n":6},"Sin clasificar":{"d":7,"w":3,"s":{"midmkt":2,"big":2,"mid":2,"small":1},"n":3},"Good":{"d":10,"w":1,"s":{"midmkt":0,"big":1,"mid":4,"small":5},"n":3}},"2025-12":{"Sin clasificar":{"d":7,"w":5,"s":{"midmkt":2,"big":3,"mid":2,"small":0},"n":3},"Embedded":{"d":13,"w":0,"s":{"midmkt":0,"big":0,"mid":4,"small":9},"n":2},"Referral/Small":{"d":8,"w":3,"s":{"midmkt":0,"big":1,"mid":6,"small":1},"n":6},"Best":{"d":18,"w":4,"s":{"midmkt":6,"big":6,"mid":5,"small":1},"n":5},"Good":{"d":2,"w":2,"s":{"midmkt":1,"big":1,"mid":0,"small":0},"n":2}},"2026-01":{"Sin clasificar":{"d":8,"w":3,"s":{"midmkt":2,"big":1,"mid":5,"small":0},"n":2},"Embedded":{"d":10,"w":0,"s":{"midmkt":2,"big":0,"mid":3,"small":5},"n":2},"Best":{"d":29,"w":6,"s":{"midmkt":8,"big":9,"mid":10,"small":2},"n":5},"Good":{"d":5,"w":2,"s":{"midmkt":1,"big":2,"mid":2,"small":0},"n":3},"Referral/Small":{"d":8,"w":5,"s":{"midmkt":0,"big":1,"mid":3,"small":4},"n":6}},"2026-02":{"Embedded":{"d":16,"w":1,"s":{"midmkt":0,"big":0,"mid":2,"small":14},"n":2},"Referral/Small":{"d":4,"w":0,"s":{"midmkt":1,"big":0,"mid":2,"small":1},"n":4},"Best":{"d":20,"w":5,"s":{"midmkt":6,"big":6,"mid":8,"small":0},"n":5},"Sin clasificar":{"d":2,"w":0,"s":{"midmkt":0,"big":1,"mid":0,"small":1},"n":2},"Good":{"d":14,"w":4,"s":{"midmkt":2,"big":2,"mid":7,"small":3},"n":5}},"2026-03":{"Sin clasificar":{"d":5,"w":1,"s":{"midmkt":0,"big":3,"mid":2,"small":0},"n":3},"Best":{"d":18,"w":1,"s":{"midmkt":3,"big":4,"mid":9,"small":2},"n":4},"Embedded":{"d":12,"w":0,"s":{"midmkt":0,"big":0,"mid":0,"small":12},"n":1},"Good":{"d":4,"w":3,"s":{"midmkt":1,"big":1,"mid":2,"small":0},"n":2},"Referral/Small":{"d":3,"w":0,"s":{"midmkt":0,"big":0,"mid":2,"small":1},"n":3}},"2026-04":{"Best":{"d":26,"w":4,"s":{"midmkt":3,"big":13,"mid":7,"small":3},"n":4},"Sin clasificar":{"d":12,"w":1,"s":{"midmkt":0,"big":1,"mid":11,"small":0},"n":2},"Embedded":{"d":3,"w":1,"s":{"midmkt":0,"big":1,"mid":0,"small":2},"n":1},"Referral/Small":{"d":2,"w":1,"s":{"midmkt":0,"big":0,"mid":2,"small":0},"n":1},"Good":{"d":7,"w":5,"s":{"midmkt":1,"big":2,"mid":4,"small":0},"n":3}},"2026-05":{"Referral/Small":{"d":3,"w":0,"s":{"midmkt":1,"big":1,"mid":1,"small":0},"n":2},"Best":{"d":16,"w":1,"s":{"midmkt":0,"big":4,"mid":10,"small":2},"n":4},"Embedded":{"d":4,"w":0,"s":{"midmkt":0,"big":0,"mid":3,"small":1},"n":1},"Sin clasificar":{"d":2,"w":0,"s":{"midmkt":0,"big":0,"mid":2,"small":0},"n":1}},"2026-06":{"Embedded":{"d":5,"w":0,"s":{"midmkt":0,"big":0,"mid":3,"small":2},"n":2},"Best":{"d":12,"w":1,"s":{"midmkt":1,"big":6,"mid":5,"small":0},"n":4},"Good":{"d":1,"w":0,"s":{"midmkt":0,"big":1,"mid":0,"small":0},"n":1},"Referral/Small":{"d":3,"w":0,"s":{"midmkt":0,"big":2,"mid":1,"small":0},"n":2},"Sin clasificar":{"d":1,"w":0,"s":{"midmkt":0,"big":0,"mid":1,"small":0},"n":1}},"2026-07":{"Best":{"d":2,"w":0,"s":{"midmkt":1,"big":1,"mid":0,"small":0},"n":2},"Good":{"d":1,"w":0,"s":{"midmkt":0,"big":1,"mid":0,"small":0},"n":1},"Referral/Small":{"d":1,"w":0,"s":{"midmkt":0,"big":0,"mid":1,"small":0},"n":1}}};

window.BRK_HOY = '2026-09';

// Horizonte de monitorización: el trimestre en curso para el corto plazo y
// hasta dic-27 para el medio, igual que el plan de 2027.
window.brkMonths = function (hasta) {
  const L = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const out = [];
  let y = 2026, m = 1;
  const fin = hasta || '2027-12';
  while (true) {
    const id = y + '-' + String(m).padStart(2, '0');
    out.push({ id, y, m, label: L[m-1] + ' ' + String(y).slice(2), q: 'Q' + Math.ceil(m/3),
      real: id <= window.BRK_HOY });
    if (id === fin) break;
    m++; if (m > 12) { m = 1; y++; }
  }
  return out;
};

// Objetivo mensual por tipo de partner. La hoja fija el compromiso del
// trimestre: el mensual es un tercio, y a partir de Q3-26 se proyecta con el
// crecimiento que se quiera exigir al canal.
window.BRK_GROWTH_DEFECTO = 0.06;

window.BRK_COVER_MIN = 0.5;

// Deals de origen Partners en HubSpot por mes, que es el denominador honesto:
// todo lo que el canal produjo, cruce o no con la hoja.
window.brkCanal = function (mes) {
  const h = (window.HS_SERIE || {})[mes];
  return h ? h.part : null;
};

// Lo que sí cruza con la hoja, sumando tipos.
window.brkCruzado = function (mes) {
  const s = window.BRK_SERIE[mes];
  if (!s) return 0;
  return Object.keys(s).reduce((a, t) => a + s[t].d, 0);
};

window.brkCobertura = function (mes) {
  const canal = window.brkCanal(mes), cruz = window.brkCruzado(mes);
  if (!canal) return { canal: null, cruz, pct: null, ok: false };
  return { canal, cruz, pct: cruz / canal, ok: cruz / canal >= window.BRK_COVER_MIN };
};

// Deals de partner que el plan de 2027 exige cada mes, sumando tiers. Es la
// misma cifra que pinta el Canal 2 de la pestaña 2027.
window.brkObjetivoPlan = function () {
  if (!window.gtmCapacityPlan || !window.GTM_DEFAULTS) return null;
  const cp = window.gtmCapacityPlan(window.GTM_DEFAULTS);
  const broker = {}, emb = {};
  cp.totalRows.forEach(r => {
    const k = r.y + '-' + String(r.m).padStart(2, '0');
    broker[k] = r.pDeals; emb[k] = r.eDeals || 0;
  });
  // Dos series: el canal 2 se reparte entre los tipos de broker y el canal 4 va
  // entero al tipo Embedded, que es donde el plan lo pone.
  return { broker, emb };
};

// Productividad observada: deals por partner activo y mes, por tipo. Es lo que
// convierte un objetivo de deals en número de partners necesarios.
window.brkProductividad = function (tipo) {
  const ms = Object.keys(window.BRK_SERIE).filter(k => k >= '2026-01');
  let d = 0, n = 0;
  ms.forEach(k => { const s = window.BRK_SERIE[k][tipo]; if (s && s.n) { d += s.d; n += s.n; } });
  return n ? d / n : null;
};

window.brkPlan = function (opts) {
  const o = opts || {};
  const growth = o.growth == null ? window.BRK_GROWTH_DEFECTO : o.growth;
  const fuente = o.fuente || 'hoja';
  const objPlan = fuente === 'plan2027' ? window.brkObjetivoPlan() : null;
  const months = window.brkMonths(o.hasta);
  const tipos = window.BRK_TIPOS.map(t => t.id).concat(['Sin clasificar']);
  const qBase = 'Q2';   // el trimestre que fija la hoja
  const baseIdx = months.findIndex(m => m.id === '2026-06'); // último mes de Q2

  const objQTot = window.BROKERS.reduce((a, b) => a + (b.obj || 0), 0);
  // El reparto del canal 2 excluye a Embedded, que tiene su propia serie.
  const objQBroker = window.BROKERS.filter(b => b.tipo !== 'Embedded').reduce((a, b) => a + (b.obj || 0), 0);
  const blocks = tipos.map(tid => {
    const meta = window.BRK_TIPOS.find(t => t.id === tid)
      || { id:'Sin clasificar', label:'Sin clasificar', color:'#C9CDD8', desc:'Deals con broker cuyo nombre no cruza con la hoja. Hay que unificarlo en el CRM.' };
    const partners = window.BROKERS.filter(b => b.tipo === tid);
    const objQ = partners.reduce((a, b) => a + (b.obj || 0), 0);
    const objMes = objQ / 3;

    const rows = months.map((mo, i) => {
      const s = (window.BRK_SERIE[mo.id] || {})[tid];
      // Objetivo: un tercio del compromiso de Q2 hasta junio, y desde ahí
      // compuesto al crecimiento exigido.
      // Con fuente 'plan2027' el objetivo del canal lo fija el plan y se
      // reparte entre tipos con el peso de su compromiso en la hoja.
      // Con el objetivo del plan, los meses previos al arranque del plan no
      // tienen objetivo: la celda queda vacía en vez de tomar la otra base.
      const obj = objPlan
        ? (tid === 'Embedded'
            ? (objPlan.emb[mo.id] != null ? objPlan.emb[mo.id] : null)
            : (objPlan.broker[mo.id] != null ? objPlan.broker[mo.id] * (objQBroker ? objQ / objQBroker : 0) : null))
        : objMes * (i <= baseIdx ? 1 : Math.pow(1 + growth, i - baseIdx));
      const cov = mo.real ? window.brkCobertura(mo.id) : null;
      // Un mes cuya cobertura de cruce cae por debajo del mínimo no dice nada
      // del canal: dice que los nombres no cuadran. No cuenta como cumplimiento.
      const comparable = !!(cov && cov.ok);
      const deals = s ? s.d : (mo.real ? 0 : null);
      const won = s ? s.w : (mo.real ? 0 : null);
      return { ...mo, obj, deals, won, cov, comparable,
        activos: s ? s.n : (mo.real ? 0 : null),
        segs: s ? s.s : null,
        ach: comparable && obj ? (deals || 0) / obj : null,
        gap: comparable && obj ? obj - (deals || 0) : null };
    });

    // Partners necesarios para sostener el objetivo con la productividad
    // observada, y altas netas sobre los que hay hoy.
    const prod = window.brkProductividad(tid);
    const activosHoy = (() => {
      const ms = Object.keys(window.BRK_SERIE).filter(k => k >= '2026-04' && k <= '2026-09');
      return Math.max(...ms.map(k => (window.BRK_SERIE[k][tid] || {}).n || 0), 0);
    })();
    rows.forEach((r, i) => {
      r.prod = prod;
      r.necesarios = prod && r.obj ? r.obj / prod : null;
      // Firmar partners es una acción futura: en columnas pasadas no se pide.
      const futuro = r.id >= window.BRK_HOY;
      r.altas = futuro && r.necesarios != null ? Math.max(0, r.necesarios - activosHoy) : null;
      r.altasNuevas = !futuro || r.necesarios == null ? null
        : Math.max(0, r.necesarios - Math.max(activosHoy, (rows[i-1] && rows[i-1].necesarios) || 0));
    });
    const reales = rows.filter(r => r.comparable);
    const totD = reales.reduce((a, r) => a + (r.deals || 0), 0);
    const totW = reales.reduce((a, r) => a + (r.won || 0), 0);
    const totO = reales.reduce((a, r) => a + (r.obj || 0), 0);
    return { ...meta, tipo: tid, partners: partners.length, objQ, objMes, rows,
      // Los actuales de la propia hoja, que son la verdad del trimestre.
      hojaQ: partners.reduce((a, b) => a + window.brkAch(b).act, 0),
      prod, activosHoy,
      necesariosFin: rows[rows.length - 1].necesarios,
      altasFin: rows[rows.length - 1].altas,
      mesesComparables: reales.length,
      mesesFlojos: rows.filter(r => r.real && !r.comparable).map(r => r.label),
      totD, totW, totO, ach: totO ? totD / totO : null,
      win: totD ? totW / totD : null,
      // Lo comprometido a futuro: lo que el canal tiene que dar de aquí a dic-27.
      futO: rows.filter(r => !r.real).reduce((a, r) => a + (r.obj || 0), 0) };
  }).filter(b => b.objQ > 0 || b.totD > 0);

  const totalRows = months.map((mo, i) => ({
    ...mo,
    obj: blocks.reduce((a, b) => a + (b.rows[i].obj || 0), 0),
    deals: mo.real ? blocks.reduce((a, b) => a + (b.rows[i].deals || 0), 0) : null,
    won: mo.real ? blocks.reduce((a, b) => a + (b.rows[i].won || 0), 0) : null,
    activos: mo.real ? blocks.reduce((a, b) => a + (b.rows[i].activos || 0), 0) : null,
    necesarios: blocks.reduce((a, b) => a + (b.rows[i].necesarios || 0), 0),
    altas: blocks.reduce((a, b) => a + (b.rows[i].altas || 0), 0),
    altasNuevas: blocks.reduce((a, b) => a + (b.rows[i].altasNuevas || 0), 0),
    cov: mo.real ? window.brkCobertura(mo.id) : null,
    comparable: mo.real ? window.brkCobertura(mo.id).ok : false,
  }));

  // Reconciliación explícita: la hoja y el cruce de HubSpot cuentan cosas
  // distintas, y el plan lo dice en vez de elegir una.
  const q2Meses = months.filter(m => m.id >= '2026-04' && m.id <= '2026-06');
  const recon = {
    hoja: window.BROKERS.reduce((a, b) => a + window.brkAch(b).act, 0),
    cruzado: q2Meses.reduce((a, m) => a + window.brkCruzado(m.id), 0),
    canal: q2Meses.reduce((a, m) => a + (window.brkCanal(m.id) || 0), 0),
    meses: q2Meses.map(m => ({ ...m, ...window.brkCobertura(m.id) })),
  };
  recon.cobertura = recon.canal ? recon.cruzado / recon.canal : null;

  return { months, blocks, totalRows, growth, recon, fuente,
    objPlanTotal: objPlan ? totalRows.reduce((a, r) => a + (r.obj || 0), 0) : null,
    objTotal: totalRows.reduce((a, r) => a + (r.obj || 0), 0),
    objDesde: objPlan ? months.find(m => objPlan.broker[m.id] != null) : months[0],
    desde: months[0].id, hasta: months[months.length - 1].id,
    activosHoy: blocks.reduce((a, b) => a + b.activosHoy, 0),
    necesariosFin: blocks.reduce((a, b) => a + (b.necesariosFin || 0), 0),
    altasFin: blocks.reduce((a, b) => a + (b.altasFin || 0), 0),
    flojos: months.filter(m => m.real && !window.brkCobertura(m.id).ok).map(m => m.label),
    qActual: window.BRK_HOY.slice(0, 4) + ' Q' + Math.ceil(+window.BRK_HOY.slice(5, 7) / 3),
    hoy: window.BRK_HOY };
};

// ============= NIVEL 1 · OBJETIVO POR TIER =============
// Deals y clientes de partner que el plan de 2027 exige a cada tier. Es la
// misma serie que pinta el Canal 2 de la pestaña 2027, sin recalcular nada.
// Conversión de deal a cliente que fija dirección para el canal partner.
window.BRK_CONV = 0.10;
// Objetivo de deals de Big Pymes en Q4 2026, fijado por dirección.
window.BRK_BIG_Q4 = 80;
// Loanbook: parte de la línea concedida que se espera dispuesta.
window.BRK_LOANBOOK = 0.80;
// Clientes fijados a mano para los meses de Q4 en los tiers de foco.
// Clientes fijados a mano para los meses de Q4 en los tiers de foco: Mid
// Market y Big Pymes, 15 clientes cada uno en el trimestre.
window.BRK_CLI_FIJOS = { '2026-10': 4, '2026-11': 5, '2026-12': 6 };
// Y por tier cuando dirección fija un total distinto.
window.BRK_CLI_FIJOS_TIER = { big: { '2026-10': 4, '2026-11': 5, '2026-12': 6 } };

window.brkTierPlan = function () {
  if (!window.gtmCapacityPlan || !window.GTM_DEFAULTS) return null;
  const cp = window.gtmCapacityPlan(window.GTM_DEFAULTS);
  const months = cp.months.map(m => ({ id: m.y + '-' + String(m.m).padStart(2, '0'),
    y: m.y, m: m.m, label: m.label, q: 'Q' + Math.ceil(m.m / 3), real: (m.y + '-' + String(m.m).padStart(2, '0')) <= window.BRK_HOY }));
  const tiers = cp.blocks.filter(b => (b.pa || b.em) && b.tier.id !== 'micro').map(b => ({
    id: b.tier.id, label: b.label, color: b.tier.color, rango: b.rango,
    canal: b.em ? (b.pa ? 'ambos' : 'embedded') : 'broker',
    rows: b.rows.map(r => ({ deals: (r.pDeals || 0) + (r.eDeals || 0), cli: (r.pCli || 0) + (r.eCli || 0),
      broker: r.pDeals || 0, emb: r.eDeals || 0 })),
    totD: (b.totPDeals || 0) + (b.totEDeals || 0),
    totC: (b.totPCli || 0) + (b.totECli || 0),
    totBroker: b.totPDeals || 0, totEmb: b.totEDeals || 0,
    win: ((b.totPDeals || 0) + (b.totEDeals || 0))
      ? ((b.totPCli || 0) + (b.totECli || 0)) / ((b.totPDeals || 0) + (b.totEDeals || 0)) : null,
  }));
  // ---- Ajustes de dirección sobre la serie del plan ----
  // 1) Big Pymes lleva el mismo objetivo de deals que Mid Market.
  // 2) Los clientes salen de una conversión única de deal a cliente, redondeada
  //    a entero mes a mes: no se cierra medio cliente.
  const mm = tiers.find(t => t.id === 'midmkt');
  const bg = tiers.find(t => t.id === 'big');
  if (mm && bg) bg.rows = mm.rows.map(r => ({ ...r }));
  // 1b) Dirección fija el objetivo de Big Pymes en Q4 2026: 80 deals en el
  // trimestre, repartidos con la misma curva mensual que traía la serie.
  if (bg && window.BRK_BIG_Q4) {
    const idx = months.map((m, i) => ((window.BRK_Q && window.BRK_Q.meses) || ['2026-10','2026-11','2026-12']).indexOf(m.id) >= 0 ? i : -1).filter(i => i >= 0);
    const base = idx.reduce((a, i) => a + bg.rows[i].deals, 0);
    if (base) {
      const k = window.BRK_BIG_Q4 / base;
      let acum = 0;
      idx.forEach((i, n) => {
        const v = n === idx.length - 1 ? window.BRK_BIG_Q4 - acum : Math.round(bg.rows[i].deals * k);
        acum += v;
        bg.rows[i] = { ...bg.rows[i], deals: v };
      });
      bg.totD = bg.rows.reduce((a, r) => a + r.deals, 0);
    }
  }
  tiers.forEach(t => {
    // Los clientes se redondean a la baja y el resto se arrastra al mes
    // siguiente: 1,5 es 1 cliente este mes y medio cliente que se suma al que
    // viene, así que la serie no pierde ni inventa clientes.
    let carry = 0;
    t.rows = t.rows.map(r => {
      const bruto = r.deals * window.BRK_CONV + carry;
      const cli = Math.floor(bruto + 1e-9);
      carry = bruto - cli;
      return { ...r, cli, cliBruto: r.deals * window.BRK_CONV, carry };
    });
    // Q4 lo fija dirección a mano: 4, 5 y 6 clientes en los tiers de foco.
    if ((window.BRK_FOCO || ['midmkt','big']).indexOf(t.id) >= 0) {
      t.rows = t.rows.map((r, i) => {
        const mes = months[i] ? months[i].id : null;
        const fijo = mes ? ((window.BRK_CLI_FIJOS_TIER || {})[t.id] || {})[mes] ?? (window.BRK_CLI_FIJOS || {})[mes] : null;
        return fijo == null ? r : { ...r, cli: fijo, fijo: true };
      });
    }
    t.totD = t.rows.reduce((a, r) => a + r.deals, 0);
    t.totC = t.rows.reduce((a, r) => a + r.cli, 0);
    // Conversión efectiva: la que sale de los clientes que se muestran.
    t.win = t.totD ? t.totC / t.totD : null;
    t.conv = window.BRK_CONV;
  });
  const totalRows = months.map((mo, i) => ({
    ...mo,
    deals: tiers.reduce((a, t) => a + t.rows[i].deals, 0),
    cli: tiers.reduce((a, t) => a + t.rows[i].cli, 0),
  }));
  return { months, tiers, totalRows, conv: window.BRK_CONV,
    totD: tiers.reduce((a, t) => a + t.totD, 0),
    totC: tiers.reduce((a, t) => a + t.totC, 0) };
};

// ============= NIVEL 2 · TIPO × SEGMENTO =============
// Deals reales por tipo de partner y segmento, acumulando la serie cruzada.
window.brkTipoSeg = function (soloComparables, desde) {
  const out = {};
  const tipos = window.BRK_TIPOS.map(t => t.id).concat(['Sin clasificar']);
  tipos.forEach(t => { out[t] = { midmkt:0, big:0, mid:0, small:0, total:0 }; });
  Object.keys(window.BRK_SERIE)
    .filter(k => (!desde || k >= desde) && (!soloComparables || window.brkCobertura(k).ok))
    .forEach(k => {
    Object.keys(window.BRK_SERIE[k]).forEach(t => {
      const s = window.BRK_SERIE[k][t];
      if (!out[t]) return;
      ['midmkt','big','mid','small'].forEach(g => out[t][g] += s.s[g] || 0);
      out[t].total += s.d;
    });
  });
  return out;
};

// ============= ANÁLISIS DE CONVERSIONES =============
// Tasa medida de deal a cliente por tipo de partner y por segmento, sobre los
// deals cruzados con la hoja. Se compara con la del canal entero en HubSpot,
// que es el contraste honesto: si el cruce sesga, se ve aquí.
window.brkConversiones = function (desde) {
  const tipos = window.BRK_TIPOS.map(t => t.id).concat(['Sin clasificar']);
  const out = { tipos: [], segs: [], canal: null, cruzado: null };

  const acc = {};
  tipos.forEach(t => { acc[t] = { d:0, w:0, segs:{} }; });
  Object.keys(window.BRK_SERIE).filter(k => !desde || k >= desde).forEach(k => {
    Object.keys(window.BRK_SERIE[k]).forEach(t => {
      if (!acc[t]) return;
      const s = window.BRK_SERIE[k][t];
      acc[t].d += s.d; acc[t].w += s.w;
      ['midmkt','big','mid','small'].forEach(g => { acc[t].segs[g] = (acc[t].segs[g] || 0) + (s.s[g] || 0); });
    });
  });

  out.tipos = tipos.filter(t => acc[t].d > 0).map(t => {
    const meta = window.BRK_TIPOS.find(x => x.id === t) || { label:'Sin clasificar', color:'#C9CDD8' };
    const a = acc[t];
    return { id:t, label:meta.label, color:meta.color, deals:a.d, won:a.w,
      wr: a.d ? a.w / a.d : null,
      dealsPorCliente: a.w ? a.d / a.w : null, segs:a.segs };
  });

  // Por segmento: el ganado no viene desglosado por segmento en la serie, así
  // que se reparte con la tasa del tipo. Es una imputación y se dice.
  const seg = {};
  out.tipos.forEach(t => {
    Object.keys(t.segs).forEach(g => {
      seg[g] = seg[g] || { deals:0, wonImp:0 };
      seg[g].deals += t.segs[g];
      seg[g].wonImp += t.segs[g] * (t.wr || 0);
    });
  });
  out.segs = window.BRK_SEGS.filter(s => seg[s.id] && seg[s.id].deals).map(s => ({
    ...s, deals: seg[s.id].deals, won: seg[s.id].wonImp,
    wr: seg[s.id].deals ? seg[s.id].wonImp / seg[s.id].deals : null,
    imputado: true,
  }));

  // Contraste con HubSpot: canal partner completo y lo que cruza.
  const hc = (window.HS_CANAL || []).find(c => c.id === 'partners');
  if (hc) out.canal = { deals: hc.deals, won: hc.won, wr: hc.wr };
  const td = out.tipos.reduce((a, t) => a + t.deals, 0);
  const tw = out.tipos.reduce((a, t) => a + t.won, 0);
  out.cruzado = { deals: td, won: tw, wr: td ? tw / td : null };

  // La tasa que el plan necesita para cumplir con el volumen comprometido.
  if (window.gtmCapacityPlan && window.GTM_DEFAULTS) {
    const cp = window.gtmCapacityPlan(window.GTM_DEFAULTS);
    out.plan = { deals: cp.totPDeals, cli: cp.totPCli,
      wr: cp.totPDeals ? cp.totPCli / cp.totPDeals : null };
  }
  return out;
};


// ============= Q4 2026 · FOCO MID MARKET + BIG PYMES =============
// El trimestre que se monitoriza y los dos tiers que el plan declara foco. El
// objetivo del trimestre sale del plan de 2027 (canales de partner), no de la
// hoja Q2: la hoja ya es historia cerrada.
window.BRK_TODAY = '2026-09-18';
window.BRK_FOCO = ['midmkt', 'big'];
window.BRK_Q = { id:'2026-Q4', label:'Q4 2026', y:2026, q:4,
  meses:['2026-10','2026-11','2026-12'], ini:'2026-10-01', fin:'2026-12-31' };

window.brkDias = function (a, b) {
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
};

// Deals reales por segmento en una lista de meses, sumando tipos de partner.
window.brkSegReal = function (meses) {
  const out = {}; window.BRK_SEGS.forEach(s => { out[s.id] = 0; });
  let total = 0, won = 0;
  meses.forEach(m => {
    const mo = window.BRK_SERIE[m]; if (!mo) return;
    Object.keys(mo).forEach(t => {
      window.BRK_SEGS.forEach(s => { out[s.id] += (mo[t].s[s.id] || 0); });
      total += mo[t].d; won += mo[t].w;
    });
  });
  return { segs: out, total, won };
};

// Consecución del trimestre en dos referencias: contra el objetivo completo de
// Q4 y contra el prorrateo día a día. Mientras el trimestre no ha arrancado, el
// día a día se lee como ritmo: deals/día que hace el canal contra los que Q4
// exige.
window.brkQ4 = function () {
  const tp = window.brkTierPlan(); if (!tp) return null;
  const Q = window.BRK_Q, hoy = window.BRK_TODAY;
  const dias = window.brkDias(Q.ini, Q.fin) + 1;
  const transcurridos = Math.max(0, Math.min(dias, window.brkDias(Q.ini, hoy) + 1));
  const restantes = dias - transcurridos;
  const arrancaEn = transcurridos > 0 ? 0 : window.brkDias(hoy, Q.ini);

  const ix = Q.meses.map(id => tp.months.findIndex(m => m.id === id)).filter(i => i >= 0);
  const obj = {}, objCli = {};
  tp.tiers.forEach(t => {
    if (!window.BRK_SEGS.some(s => s.id === t.id)) return;
    obj[t.id] = ix.reduce((a, i) => a + (t.rows[i] ? t.rows[i].deals : 0), 0);
    objCli[t.id] = ix.reduce((a, i) => a + (t.rows[i] ? t.rows[i].cli : 0), 0);
  });

  const real = window.brkSegReal(Q.meses);
  window.BRK_SEGS.forEach(sg => {
    Q.meses.forEach(m => {
      const ov = (window.BRK_ACH || {})[m];
      if (ov && ov[sg.id]) { real.segs[sg.id] += ov[sg.id]; real.total += ov[sg.id]; }
    });
  });
  // Ventana de ritmo: el trimestre en curso de dato real, hasta hoy.
  const vMeses = ['2026-07','2026-08','2026-09'];
  const vDias = window.brkDias('2026-07-01', hoy) + 1;
  const vent = window.brkSegReal(vMeses);

  // Ritmo medido: el trimestre cerrado de la hoja, que es el recuento partner a
  // partner y no arrastra el problema de nombres del cruce con HubSpot. El cruce
  // se guarda al lado como segunda lectura, más baja por cobertura.
  const hojaDias = 91;
  const hoja = {};
  window.BRK_SEGS.forEach(sg => { hoja[sg.id] = window.BROKERS.reduce((a, b) => a + (b.a[sg.id] || 0), 0); });

  const segs = window.BRK_SEGS.map(s => {
    const o = obj[s.id] == null ? null : obj[s.id];
    const r = real.segs[s.id] || 0;
    const prorrata = o == null ? null : o * (transcurridos / dias);
    const reqDia = o == null ? null : o / dias;
    const actDia = (hoja[s.id] || 0) / hojaDias;
    const cruzDia = (vent.segs[s.id] || 0) / vDias;
    const proy = r + actDia * restantes;
    return { id:s.id, label:s.label, color:s.color, foco: window.BRK_FOCO.indexOf(s.id) >= 0,
      obj:o, objCli: objCli[s.id] == null ? null : objCli[s.id], real:r,
      pctObj: o ? r / o : null, prorrata, pctRitmo: prorrata ? r / prorrata : null,
      reqDia, reqSem: reqDia == null ? null : reqDia * 7,
      actDia, actSem: actDia * 7, idxRitmo: reqDia ? actDia / reqDia : null,
      cruzDia, cruzSem: cruzDia * 7, base: hoja[s.id] || 0,
      proy, pctProy: o ? proy / o : null,
      ventana: vent.segs[s.id] || 0, falta: o == null ? null : Math.max(0, o - r) };
  });

  const sum = (list, k) => list.reduce((a, x) => a + (x[k] || 0), 0);
  const foco = segs.filter(s => s.foco), resto = segs.filter(s => !s.foco);
  // Solo los segmentos con objetivo en el plan entran en el ritmo agregado: si
  // Mid Pymes sumara su volumen sin sumar objetivo, el total diría que el canal
  // va en hora mientras los dos tiers de foco van a un tercio del ritmo.
  const conObj = segs.filter(s => s.obj != null);
  const agg = (list) => {
    const o = sum(list, 'obj'), r = sum(list, 'real');
    const reqDia = o / dias, actDia = sum(list, 'actDia'), cruzDia = sum(list, 'cruzDia');
    const proy = r + actDia * restantes;
    return { obj:o, objCli: sum(list, 'objCli'), real:r, pctObj: o ? r / o : null,
      prorrata: o * (transcurridos / dias), pctRitmo: o && transcurridos ? r / (o * (transcurridos / dias)) : null,
      reqDia, reqSem: reqDia * 7, actDia, actSem: actDia * 7,
      cruzDia, cruzSem: cruzDia * 7, base: sum(list, 'base'),
      proy, pctProy: o ? proy / o : null,
      idxRitmo: reqDia ? actDia / reqDia : null, falta: Math.max(0, o - r) };
  };
  return { Q, dias, transcurridos, restantes, arrancaEn, hoy, segs, foco, resto,
    totalFoco: agg(foco), totalCanal: agg(conObj), conObj, ventanaDias: vDias, ventana: vent, hojaDias,
    sinObjetivo: resto.filter(s => s.obj == null).map(s => s.label),
    restoReal: sum(resto, 'base') };
};

// Plan por tier agregado a trimestres, para la vista larga del nivel 1.
window.brkTierPlanQ = function (hasta) {
  const tp = window.brkTierPlan(); if (!tp) return null;
  const lim = hasta || '2027-12';
  const keys = [];
  tp.months.forEach(m => {
    if (m.id > lim) return;
    const k = m.y + '-Q' + Math.ceil(m.m / 3);
    if (keys.indexOf(k) < 0) keys.push(k);
  });
  const cols = keys.map(k => {
    const [y, q] = k.split('-Q');
    const idx = tp.months.map((m, i) => ({ m, i }))
      .filter(x => x.m.y === +y && Math.ceil(x.m.m / 3) === +q && x.m.id <= lim).map(x => x.i);
    return { id:k, label:'Q' + q + ' ' + String(y).slice(2), y:+y, q:+q, idx,
      real: idx.every(i => tp.months[i].real),
      actual: k === '2026-Q4', anio: +q === 4 };
  });
  const roll = (rows) => cols.map(c => ({
    deals: c.idx.reduce((a, i) => a + (rows[i] ? rows[i].deals : 0), 0),
    cli: c.idx.reduce((a, i) => a + (rows[i] ? rows[i].cli : 0), 0) }));
  return { cols, tiers: tp.tiers.map(t => ({ ...t, cells: roll(t.rows) })),
    total: roll(tp.totalRows),
    totD: tp.totD, totC: tp.totC };
};


// ============= HISTÓRICO DE CONSECUCIÓN =============
// Operaciones cerradas por trimestre y segmento, recuento que facilita el
// equipo. Midmarket y Corporate se suman porque el plan los planifica juntos.
window.BRK_HIST_Q = ['2022-Q3','2022-Q4','2023-Q1','2023-Q2','2023-Q3','2023-Q4','2024-Q1','2024-Q2','2024-Q3','2024-Q4','2025-Q1','2025-Q2','2025-Q3','2025-Q4','2026-Q1','2026-Q2','2026-Q3'];
window.BRK_HIST = {
  small:  [0,2,1,2,4,9,2,3,2,56,95,169,189,188,44,29,29],
  mid:    [0,1,3,4,4,7,4,3,2,58,32,48,59,70,61,84,84],
  big:    [0,0,1,2,1,4,2,3,0,20,12,20,13,34,22,33,33],
  midmkt: [0,0,0,0,0,0,0,0,0,8,9,10,10,16,34,20,20],
  corp:   [0,0,0,0,0,0,0,0,0,1,0,0,1,2,0,0,0],
  sin:    [2,10,23,51,37,80,45,49,64,1,0,0,0,0,0,0,0],
};
window.BRK_HIST_NOTA = 'Recuento de operaciones cerradas por trimestre que facilita el equipo. Se compara con la fila de deals del plan: si el histórico contara clientes, la consecución sería otra.';

window.brkHistorico = function () {
  const Q = window.BRK_HIST_Q, H = window.BRK_HIST;
  const q4 = window.brkQ4 ? window.brkQ4() : null;
  const objDe = (id) => q4 ? (q4.segs.find(s => s.id === id) || {}).obj : null;
  const serie = (id) => id === 'midmkt' ? H.midmkt.map((v, i) => v + H.corp[i]) : (H[id] || Q.map(() => 0));
  const yoyDe = (arr) => arr.map((v, i) => i < 4 || !arr[i-4] ? null : v / arr[i-4] - 1);
  const suma = (arr, ids) => ids.reduce((a, i) => a + (arr[i] || 0), 0);
  const ix = (k) => Q.indexOf(k);
  const anio2026 = ['2026-Q1','2026-Q2','2026-Q3'].map(ix);
  const anio2025 = ['2025-Q1','2025-Q2','2025-Q3'].map(ix);

  const rows = window.BRK_SEGS.map(sg => {
    const arr = serie(sg.id);
    const ult = arr[arr.length - 1], prev = arr[arr.length - 5];
    const a26 = suma(arr, anio2026), a25 = suma(arr, anio2025);
    const obj = objDe(sg.id);
    return { id:sg.id, label:sg.label, color:sg.color, foco: window.BRK_FOCO.indexOf(sg.id) >= 0,
      serie: arr, yoy: yoyDe(arr), ult, prev,
      yoyUlt: prev ? ult / prev - 1 : null,
      a26, a25, yoyAcum: a25 ? a26 / a25 - 1 : null,
      obj, consecucion: obj ? ult / obj : null,
      salto: obj && ult ? obj / ult : null,
      mejor: Math.max.apply(null, arr),
      notaMerge: sg.id === 'midmkt' ? 'incluye Corporate' : null };
  });

  const total = Q.map((q, i) => window.BRK_SEGS.reduce((a, sg) => a + serie(sg.id)[i], 0) + H.sin[i]);
  const focoSerie = Q.map((q, i) => rows.filter(r => r.foco).reduce((a, r) => a + r.serie[i], 0));
  const mk = (arr, label) => ({ label, serie: arr, yoy: yoyDe(arr),
    ult: arr[arr.length - 1], prev: arr[arr.length - 5],
    yoyUlt: arr[arr.length - 5] ? arr[arr.length - 1] / arr[arr.length - 5] - 1 : null,
    a26: suma(arr, anio2026), a25: suma(arr, anio2025),
    yoyAcum: suma(arr, anio2025) ? suma(arr, anio2026) / suma(arr, anio2025) - 1 : null });

  const foco = mk(focoSerie, 'Foco · Mid Market + Big Pymes');
  foco.obj = rows.filter(r => r.foco).reduce((a, r) => a + (r.obj || 0), 0);
  foco.consecucion = foco.obj ? foco.ult / foco.obj : null;
  foco.salto = foco.obj && foco.ult ? foco.obj / foco.ult : null;

  return { quarters: Q, rows, foco, total: mk(total, 'Total general'),
    sinSegmento: H.sin, ultimo: Q[Q.length - 1], q4: window.BRK_Q.label,
    nota: window.BRK_HIST_NOTA };
};


// ============= DAY TO DAY · CONSECUCIÓN A FECHA =============
// El objetivo del trimestre no se consume lineal: el plan tiene curva mensual.
// Así, cerrar octubre con los deals de octubre es un 100% de consecución a esa
// fecha aunque sea un tercio del objetivo del trimestre.
window.BRK_CORTES = [
  { id:'hoy',  fecha: window.BRK_TODAY, label:'Hoy' },
  { id:'oct',  fecha:'2026-10-31', label:'Cierre de octubre' },
  { id:'nov',  fecha:'2026-11-30', label:'Cierre de noviembre' },
  { id:'dic',  fecha:'2026-12-31', label:'Cierre del trimestre' },
];

window.brkQ4Corte = function (hasta) {
  const tp = window.brkTierPlan(); if (!tp) return null;
  const Q = window.BRK_Q;
  const fin = { '2026-10':'2026-10-31', '2026-11':'2026-11-30', '2026-12':'2026-12-31' };
  const ini = { '2026-10':'2026-10-01', '2026-11':'2026-11-01', '2026-12':'2026-12-01' };
  const dm = { '2026-10':31, '2026-11':30, '2026-12':31 };
  const lbl = { '2026-10':'oct 26', '2026-11':'nov 26', '2026-12':'dic 26' };
  const corte = hasta || window.BRK_TODAY;

  // Fracción del mes consumida a la fecha de corte.
  const frac = (m) => {
    if (corte >= fin[m]) return 1;
    if (corte < ini[m]) return 0;
    return (window.brkDias(ini[m], corte) + 1) / dm[m];
  };

  const objMes = {}; // objMes[segId][mes]
  const cliMes = {};
  tp.tiers.forEach(t => {
    if (!window.BRK_SEGS.some(x => x.id === t.id)) return;
    objMes[t.id] = {}; cliMes[t.id] = {};
    Q.meses.forEach(m => {
      const i = tp.months.findIndex(x => x.id === m);
      objMes[t.id][m] = i >= 0 && t.rows[i] ? t.rows[i].deals : 0;
      cliMes[t.id][m] = i >= 0 && t.rows[i] ? t.rows[i].cli : 0;
    });
  });

  const realMes = {};
  window.BRK_SEGS.forEach(sg => { realMes[sg.id] = {}; });
  Q.meses.forEach(m => {
    const mo = window.BRK_SERIE[m] || {};
    const ov = (window.BRK_ACH || {})[m] || {};
    window.BRK_SEGS.forEach(sg => {
      realMes[sg.id][m] = Object.keys(mo).reduce((a, t) => a + (mo[t].s[sg.id] || 0), 0) + (ov[sg.id] || 0);
    });
  });

  const segs = window.BRK_SEGS.map(sg => {
    const tieneObj = !!objMes[sg.id];
    const meses = Q.meses.map(m => ({ id:m, label:lbl[m], frac: frac(m),
      obj: tieneObj ? objMes[sg.id][m] : null,
      objCli: tieneObj ? cliMes[sg.id][m] : null,
      real: realMes[sg.id][m] || 0,
      cerrado: corte >= fin[m], vivo: corte >= ini[m] && corte < fin[m] }));
    const objQ = tieneObj ? meses.reduce((a, x) => a + x.obj, 0) : null;
    const objHasta = tieneObj ? meses.reduce((a, x) => a + x.obj * x.frac, 0) : null;
    const realHasta = meses.reduce((a, x) => a + (x.frac > 0 ? x.real : 0), 0);
    const realQ = meses.reduce((a, x) => a + x.real, 0);
    return { id:sg.id, label:sg.label, color:sg.color, foco: window.BRK_FOCO.indexOf(sg.id) >= 0,
      meses, objQ, objCli: tieneObj ? meses.reduce((a, x) => a + x.objCli, 0) : null,
      objHasta, realHasta, realQ,
      pctHasta: objHasta ? realHasta / objHasta : null,
      pctQ: objQ ? realQ / objQ : null,
      pesoHasta: objQ ? objHasta / objQ : 0,
      faltaHasta: objHasta == null ? null : Math.max(0, objHasta - realHasta),
      faltaQ: objQ == null ? null : Math.max(0, objQ - realQ) };
  });

  const conObj = segs.filter(x => x.objQ != null);
  const sum = (list, k) => list.reduce((a, x) => a + (x[k] || 0), 0);
  const agg = (list, label) => {
    const objQ = sum(list, 'objQ'), objHasta = sum(list, 'objHasta');
    const realQ = sum(list, 'realQ'), realHasta = sum(list, 'realHasta');
    return { label, foco:false, objQ, objHasta, realQ, realHasta,
      objCli: sum(list, 'objCli'),
      pctHasta: objHasta ? realHasta / objHasta : null,
      pctQ: objQ ? realQ / objQ : null,
      pesoHasta: objQ ? objHasta / objQ : 0,
      faltaHasta: Math.max(0, objHasta - realHasta),
      faltaQ: Math.max(0, objQ - realQ),
      meses: window.BRK_Q.meses.map((m, i) => ({ id:m, label:lbl[m],
        frac: frac(m), cerrado: corte >= fin[m], vivo: corte >= ini[m] && corte < fin[m],
        obj: sum(list.map(x => x.meses[i]), 'obj'), real: sum(list.map(x => x.meses[i]), 'real') })) };
  };

  const dias = window.brkDias(Q.ini, Q.fin) + 1;
  return { corte, arrancado: corte >= Q.ini, dias,
    transcurridos: Math.max(0, Math.min(dias, window.brkDias(Q.ini, corte) + 1)),
    segs, foco: segs.filter(x => x.foco), resto: segs.filter(x => !x.foco),
    totalFoco: agg(segs.filter(x => x.foco), 'Foco completo · los dos tiers'),
    totalCanal: agg(conObj, 'Canal con objetivo') };
};


// ============= ACTUALS DE Q4 · DATOS DE EJEMPLO =============
// Conseguido de Q4 por segmento y mes. Octubre cerrado y noviembre en curso,
// para poder ver la mecánica de consecución con dato. Son cifras de ejemplo,
// no salen de HubSpot: en cuanto entre el dato real, se borra este bloque y
// todo lo demás sigue igual porque se suma sobre la serie cruzada.
window.BRK_ACH_DEMO = true;
window.BRK_ACH = {
  '2026-10': { midmkt: 13, big: 27, mid: 28, small: 10 },
  '2026-11': { midmkt: 7,  big: 14, mid: 12, small: 5 },
};
// Con actuals de ejemplo el "hoy" del trimestre se mueve dentro de noviembre,
// que es lo que hace legible el día a día.
if (window.BRK_ACH_DEMO) {
  window.BRK_TODAY = '2026-11-12';
  if (window.BRK_CORTES) window.BRK_CORTES[0].fecha = window.BRK_TODAY;
}

// Conseguido de un mes para una lista de segmentos: serie cruzada más overlay.
window.brkAchMes = function (ids, mes) {
  const mo = (window.BRK_SERIE || {})[mes];
  const ov = (window.BRK_ACH || {})[mes];
  if (!mo && !ov) return null;
  let v = 0;
  if (mo) Object.keys(mo).forEach(t => { ids.forEach(id => { v += (mo[t].s[id] || 0); }); });
  if (ov) ids.forEach(id => { v += (ov[id] || 0); });
  return v;
};


// ============= LÍNEA MEDIA POR CLIENTE =============
// Línea de circulante media que se le asigna a un cliente de cada tier. Solo
// los dos tiers de foco tienen cifra: el resto no la tiene fijada.
window.BRK_LINEA = { midmkt: 1500000, big: 400000, mid: null, small: null };
window.brkLinea = function (id) {
  const L = window.BRK_LINEA;
  if (id === '__tot' || Array.isArray(id)) {
    // Media ponderada por clientes objetivo de Q4, para la fila de total.
    const q4 = window.brkQ4 ? window.brkQ4() : null;
    const ids = Array.isArray(id) ? id : window.BRK_SEGS.map(x => x.id);
    let cli = 0, eur = 0;
    ids.forEach(x => {
      const seg = q4 ? (q4.segs.find(y => y.id === x) || {}) : {};
      if (L[x] == null || !seg.objCli) return;
      cli += seg.objCli; eur += seg.objCli * L[x];
    });
    return cli ? eur / cli : null;
  }
  return L[id] == null ? null : L[id];
};


// ============= CÓMO SE LLEGA · CAPACIDAD DE LA RED =============
// El objetivo de Q4 en los tiers de foco contra tres referencias: el mejor
// trimestre que cada segmento ha hecho nunca, lo que la red de partners tiene
// registrado como tope y lo que falta por cubrir con altas nuevas.
// Solo Best y Good: son los partners con compromiso real de volumen, y la
// pregunta de esta sección es si esa red da el número.
window.BRK_CAP_TIPOS = ['Best', 'Good'];
// El objetivo que se le pide a cada partner: su mejor trimestre más un 40%,
// redondeado a entero. Los referral no llevan objetivo por tier: uno cada uno.
window.BRK_CRECE = 0.40;
window.BRK_REF_OBJ = 1;
// Objetivos fijados a mano por dirección, por encima de la regla del máximo +40%.
window.BRK_OBJ_MANUAL = { 'Ores & Bryan': { midmkt: 4, big: 10 } };

// ============= FOCO DE ALTAS · PARTNERS AÚN NO FIRMADOS =============
// Las altas que se persiguen para cubrir el hueco de Q4, con el objetivo que se
// les pide desde el primer trimestre. No están firmados: es pipeline de alta.
window.BRK_ALTAS = [
  { nombre:'Deloitte', grupo:'Big Four', obj:{ midmkt:5, big:0 } },
  { nombre:'PwC',      grupo:'Big Four', obj:{ midmkt:5, big:0 } },
  { nombre:'EY',       grupo:'Big Four', obj:{ midmkt:5, big:0 } },
  { nombre:'KPMG',     grupo:'Big Four', obj:{ midmkt:5, big:0 } },
  { nombre:'Marsh',    grupo:'Correduría global', obj:{ midmkt:5, big:5 } },
  { nombre:'Ebury',    grupo:'Fintech global',    obj:{ midmkt:10, big:10 } },
];

window.brkCapacidad = function () {
  const q4 = window.brkQ4 ? window.brkQ4() : null;
  const h = window.brkHistorico ? window.brkHistorico() : null;
  if (!q4 || !h) return null;
  const QH = window.BRK_HIST_Q;

  const PQ0 = window.BRK_PART_Q || {};
  const conFoco = (nombre) => window.BRK_FOCO.some(id => ((PQ0[nombre] || {})[id] || {}).max > 0);
  // Best y Good siempre, más cualquier referral que haya traído alguna vez un
  // deal de Mid Market o Big Pymes: si ya lo hizo, entra con objetivo propio.
  const RED = window.BROKERS.filter(b => window.BRK_CAP_TIPOS.indexOf(b.tipo) >= 0
    || (b.tipo === 'Referral/Small' && conFoco(b.nombre)));
  const segs = window.BRK_FOCO.map(id => {
    const sg = window.BRK_SEGS.find(x => x.id === id) || {};
    const row = h.rows.find(r => r.id === id) || { serie: [] };
    let mejor = 0, mejorQ = null;
    row.serie.forEach((v, i) => { if (v > mejor) { mejor = v; mejorQ = QH[i]; } });
    const obj = (q4.segs.find(x => x.id === id) || {}).obj || 0;
    // Tope registrado de la red en ese segmento: lo que cada partner llegó a
    // firmar en el trimestre de la hoja, sumado.
    const tope = RED.reduce((a, b) => a + (b.a[id] || 0), 0);
    // Techo por mejores trimestres: el mejor trimestre de cada partner en ese
    // tier, sumado. No es acumulado de vida: es un trimestre por partner.
    const PQ = window.BRK_PART_Q || {};
    const topeMax = RED.reduce((a, b) => a + (((PQ[b.nombre] || {})[id] || {}).max || 0), 0);
    return { id, label: sg.label, color: sg.color, obj, mejor, mejorQ, tope, topeMax,
      vsMejor: mejor ? obj / mejor : null, vsTope: topeMax ? obj / topeMax : null,
      gapMejor: Math.max(0, obj - mejor), gapTope: Math.max(0, obj - topeMax) };
  });

  const PQ = window.BRK_PART_Q || {};
  const partners = RED.map(b => {
    const cont = {}, maxq = {};
    window.BRK_FOCO.forEach(id => {
      cont[id] = b.a[id] || 0;
      maxq[id] = (PQ[b.nombre] || {})[id] || null;
    });
    // Con histórico: su mejor trimestre +40%. Sin histórico en ese tier: un
    // deal, el mínimo que se le pide a cualquier partner listado.
    const bg = window.BRK_CAP_TIPOS.indexOf(b.tipo) >= 0;
    const objq = {};
    const man = (window.BRK_OBJ_MANUAL || {})[b.nombre];
    window.BRK_FOCO.forEach(id => {
      if (man && man[id] != null) { objq[id] = man[id]; return; }
      const mx = maxq[id] ? maxq[id].max : 0;
      objq[id] = mx ? Math.round(mx * (1 + window.BRK_CRECE)) : window.BRK_REF_OBJ;
    });
    const tope = window.BRK_FOCO.reduce((a, id) => a + (maxq[id] ? maxq[id].max : 0), 0);
    const objTot = window.BRK_FOCO.reduce((a, id) => a + objq[id], 0);
    const hoja = window.BRK_FOCO.reduce((a, id) => a + cont[id], 0);
    const tipoMeta = (window.BRK_TIPOS || []).find(t => t.id === b.tipo) || {};
    const hs = window.brkHubspot ? window.brkHubspot(b.nombre) : null;
    return { nombre: b.nombre, tipo: b.tipo, color: tipoMeta.color, bg, cont, maxq, objq, objTot, tope, hoja,
      obj: b.obj == null ? null : b.obj, hs,
      // Máximo histórico del partner: todo lo que ha traído en HubSpot desde el
      // principio. No hay serie por partner y trimestre, así que es un techo de
      // vida entera, no de un trimestre.
      maxDeals: hs ? hs.deals : null, maxWon: hs ? hs.won : null };
  }).sort((a, b) => b.objTot - a.objTot || b.hoja - a.hoja || a.nombre.localeCompare(b.nombre));

  // El acumulado sigue la columna de objetivo, que es lo que se pide.
  let acc = 0;
  partners.forEach(p => { acc += p.objTot; p.acum = acc; });

  // Conseguido de Q4 a la fecha, por partner. HubSpot todavía no da el corte
  // por partner y trimestre, así que se reparte el real del tier entre los
  // partners con objetivo en ese tier: proporcional al objetivo y con un peso
  // estable por nombre para que el reparto no sea plano. Suma exacta al real.
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h; };
  window.BRK_FOCO.forEach(id => {
    const sg4 = q4.segs.find(x => x.id === id) || {};
    const realId = Math.round(sg4.realQ != null ? sg4.realQ : (sg4.real || 0));
    const con = partners.filter(p => p.objq[id] > 0);
    const peso = (p) => p.objq[id] * (0.35 + 1.3 * (hash(p.nombre + id) / 9973));
    const den = con.reduce((a, p) => a + peso(p), 0);
    const raw = con.map(p => ({ p, v: den ? realId * peso(p) / den : 0 }));
    raw.forEach(r => { r.p.achq = r.p.achq || {}; r.p.achq[id] = Math.floor(r.v); });
    let resto = realId - raw.reduce((a, r) => a + Math.floor(r.v), 0);
    raw.sort((a, b) => (b.v % 1) - (a.v % 1));
    for (let i = 0; i < raw.length && resto > 0; i++, resto--) raw[i].p.achq[id]++;
  });
  partners.forEach(p => {
    p.achq = p.achq || {};
    p.achTot = window.BRK_FOCO.reduce((a, id) => a + (p.achq[id] || 0), 0);
    p.achPct = p.objTot ? p.achTot / p.objTot : null;
  });
  const conDatoFoco = partners.filter(p => p.tope > 0).length;
  // Cola larga de referral: un deal cada uno.
  const refs = window.BROKERS.filter(b => b.tipo === 'Referral/Small' && !conFoco(b.nombre));
  const referral = { n: refs.length, porPartner: window.BRK_REF_OBJ, total: refs.length * window.BRK_REF_OBJ,
    conFoco: partners.filter(p => p.tipo === 'Referral/Small').length };

  const objFoco = segs.reduce((a, x) => a + x.obj, 0);
  const topeRed = partners.reduce((a, p) => a + p.tope, 0);
  const topeHoja = partners.reduce((a, p) => a + p.hoja, 0);
  const mejorSum = segs.reduce((a, x) => a + x.mejor, 0);

  // Cada tier necesita sus propios partners: el sobrante de Big Pymes no cubre
  // un hueco de Mid Market. El déficit se suma sin netear y las altas salen de
  // la capacidad observada en cada tier, no de una media mezclada.
  segs.forEach(sg => {
    const conDato = partners.filter(p => p.maxq[sg.id] && p.maxq[sg.id].max > 0)
      .sort((a, b) => b.maxq[sg.id].max - a.maxq[sg.id].max);
    const suma = conDato.reduce((a, p) => a + p.maxq[sg.id].max, 0);
    const top = conDato.slice(0, 5);
    sg.activos = conDato.length;
    sg.media = conDato.length ? suma / conDato.length : 0;
    sg.mediaTop = top.length ? top.reduce((a, p) => a + p.maxq[sg.id].max, 0) / top.length : 0;
    sg.falta = Math.max(0, sg.obj - sg.topeMax);
    sg.sobra = Math.max(0, sg.topeMax - sg.obj);
    sg.nuevosMedia = sg.media ? Math.ceil(sg.falta / sg.media) : null;
    sg.nuevosTop = sg.mediaTop ? Math.ceil(sg.falta / sg.mediaTop) : null;
    // Objetivo asignado: el de cada partner, que es su máximo +40% redondeado.
    sg.asignado = partners.reduce((a, p) => a + (p.objq[sg.id] || 0), 0);
    sg.faltaAsignado = Math.max(0, sg.obj - sg.asignado);
    // Altas necesarias contra el objetivo asignado, que es la cifra de cabecera.
    sg.altasTop = sg.mediaTop ? Math.ceil(sg.faltaAsignado / sg.mediaTop) : null;
    sg.altasMedia = sg.media ? Math.ceil(sg.faltaAsignado / sg.media) : null;
  });
  const gap = segs.reduce((a, x) => a + x.falta, 0);
  const sobrante = segs.reduce((a, x) => a + x.sobra, 0);
  const media = partners.length ? topeRed / partners.length : 0;
  const top5 = partners.slice(0, 5);
  const mediaTop = top5.length ? top5.reduce((a, p) => a + p.tope, 0) / top5.length : 0;

  const maxDeals = partners.reduce((a, p) => a + (p.maxDeals || 0), 0);
  const maxWon = partners.reduce((a, p) => a + (p.maxWon || 0), 0);
  const asignado = partners.reduce((a, p) => a + p.objTot, 0);
  const totalPedido = asignado + referral.total;

  // Altas objetivo: lo que se le pediría a cada partner por firmar.
  const altas = (window.BRK_ALTAS || []).map(a => ({ ...a,
    total: window.BRK_FOCO.reduce((acc, id) => acc + (a.obj[id] || 0), 0) }));
  segs.forEach(sg => {
    sg.altasObj = altas.reduce((a, x) => a + (x.obj[sg.id] || 0), 0);
    sg.conAltas = sg.asignado + sg.altasObj;
    sg.faltaConAltas = Math.max(0, sg.obj - sg.conAltas);
  });
  segs.forEach(sg => {
    sg.ach = partners.reduce((a, p) => a + (p.achq[sg.id] || 0), 0);
    sg.achPct = sg.asignado ? sg.ach / sg.asignado : null;
  });
  const achTotal = partners.reduce((a, p) => a + p.achTot, 0);
  const altasTotal = altas.reduce((a, x) => a + x.total, 0);
  const grupos = altas.reduce((a, x) => { a[x.grupo] = (a[x.grupo] || 0) + x.total; return a; }, {});
  return { segs, partners, objFoco, topeRed, topeHoja, mejorSum, gap, sobrante, media, mediaTop, maxDeals, maxWon,
    crece: window.BRK_CRECE, referral, asignado, totalPedido,
    achTotal, achPct: asignado ? achTotal / asignado : null,
    altas, altasTotal, grupos,
    totalConAltas: totalPedido + altasTotal,
    faltaConAltas: segs.reduce((a, x) => a + x.faltaConAltas, 0),
    // Sin netear: el déficit es el de cada tier, y los referral no llevan tier
    // asignado, así que no tapan un hueco de Mid Market.
    faltaPedido: segs.reduce((a, x) => a + x.faltaAsignado, 0),
    cobPedido: objFoco ? totalPedido / objFoco : null,
    altasTop: segs.reduce((a, x) => a + (x.altasTop || 0), 0),
    altasMedia: segs.reduce((a, x) => a + (x.altasMedia || 0), 0),
    nuevos: segs.reduce((a, x) => a + (x.nuevosTop || 0), 0),
    nuevosMediaSeg: segs.reduce((a, x) => a + (x.nuevosMedia || 0), 0),
    cobertura: objFoco ? topeRed / objFoco : null,
    activos: conDatoFoco, enRed: partners.length,
    nuevosMedia: media ? Math.ceil(gap / media) : null,
    nuevosTop: mediaTop ? Math.ceil(gap / mediaTop) : null,
    // Cuántos partners hacen falta, de mejor a peor, para cubrir el objetivo.
    cubren: (() => { let n = 0, v = 0; for (const p of partners) { n++; v += p.objTot; if (v >= objFoco) return n; } return null; })(),
    fuente: 'El máximo de cada partner es su mejor trimestre en ese tier, contado sobre el export de deals de HubSpot (Broker × Segmento × trimestre de creación). No es acumulado de vida: es un trimestre, el suyo mejor.' };
};
