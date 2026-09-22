// ============= MARKET INTELLIGENCE · FUENTES =============
// AEAT · Estadística de cuentas anuales no consolidadas del Impuesto sobre Sociedades
// Ejercicio 2022 (último publicado). Consultado el 12/09/2026.
//
// Tres tablas, todas con CCAA=Total y RC=Total, columna "Número de empresas":
//  A) Cifra de negocios  → 19 tramos + el bloque de cifra de negocios ≤ 0
//  B) Sectores           → 10 sectores de actividad
//  C) Tablas evolutivas  → nº de sociedades 2018-2022
// Total en las tres: 1.706.796 sociedades. Cuadran entre sí.
//
// Todo lo que hay en AEAT_* y AEAT_SECTORES es verbatim de la publicación.
// Todo lo derivado lleva marca de método y de si es exacto o aproximado.

window.MKT_META = {
  year: 2022,
  // La variable de clasificación importa: "Importe neto de la cifra de negocios"
  // (casilla del modelo 200), NO "ingresos totales". Otras publicaciones de la
  // AEAT clasifican por ingresos totales y sus recuentos salen algo más altos en
  // los tramos de arriba, porque suman ingresos ajenos a la actividad comercial.
  variable: 'Importe neto de la cifra de negocios (modelo 200)',
  name: 'AEAT · Cuentas anuales no consolidadas del IS',
  fetched: '12/09/2026',
  total: 1706796,
  urls: {
    cifra: 'https://sede.agenciatributaria.gob.es/AEAT/Contenidos_Comunes/La_Agencia_Tributaria/Estadisticas/Publicaciones/sites/sociedadest2/2022/jrubik1550f00b64d81f794dfb0b4ded009dabc0514834.html',
    sectores: 'https://sede.agenciatributaria.gob.es/AEAT/Contenidos_Comunes/La_Agencia_Tributaria/Estadisticas/Publicaciones/sites/sociedadest2/2022/jrubik7be066f7f9854f7e6370e0ef1cc526176b7a5e1a.html',
    evolutiva: 'https://sede.agenciatributaria.gob.es/AEAT/Contenidos_Comunes/La_Agencia_Tributaria/Estadisticas/Publicaciones/sites/sociedadest2/2022/jrubikcdb249755d85be006d2455181004fdca681dae1.html',
  },
  sabiName: 'SABI (Bureau van Dijk) · licencia Kintai',
  snapshot: 'Sep 2026',
};

// ---- A) Tramos de cifra de negocios. Verbatim. ----
// min/max en euros. El tramo 'neg' agrupa cifra de negocios cero o negativa.
window.AEAT_TRAMOS = [
  { id:'neg',      label:'≤ 0',             min:null,  max:0,        n:590724, market:false },
  { id:'a050',     label:'0 – 50k',         min:0,     max:50e3,     n:260473, market:true },
  { id:'a0510',    label:'50k – 100k',      min:50e3,  max:100e3,    n:147696, market:true },
  { id:'a12',      label:'100k – 200k',     min:100e3, max:200e3,    n:174510, market:true },
  { id:'a23',      label:'200k – 300k',     min:200e3, max:300e3,    n:102923, market:true },
  { id:'a36',      label:'300k – 600k',     min:300e3, max:600e3,    n:153666, market:true },
  { id:'a610',     label:'600k – 1M',       min:600e3, max:1e6,      n:87011,  market:true },
  { id:'b12',      label:'1M – 2M',         min:1e6,   max:2e6,      n:78829,  market:true },
  { id:'b23',      label:'2M – 3M',         min:2e6,   max:3e6,      n:31875,  market:true },
  { id:'b34',      label:'3M – 4M',         min:3e6,   max:4e6,      n:17315,  market:true },
  { id:'b45',      label:'4M – 5M',         min:4e6,   max:5e6,      n:11226,  market:true },
  { id:'b56',      label:'5M – 6M',         min:5e6,   max:6e6,      n:8817,   market:true },
  { id:'c610',     label:'6M – 10M',        min:6e6,   max:10e6,     n:14488,  market:true },
  { id:'c1020',    label:'10M – 20M',       min:10e6,  max:20e6,     n:12576,  market:true },
  { id:'d2060',    label:'20M – 60M',       min:20e6,  max:60e6,     n:9580,   market:true },
  { id:'d60100',   label:'60M – 100M',      min:60e6,  max:100e6,    n:2055,   market:true },
  { id:'d100500',  label:'100M – 500M',     min:100e6, max:500e6,    n:2454,   market:true },
  { id:'e5001000', label:'500M – 1.000M',   min:500e6, max:1e9,      n:311,    market:true },
  { id:'e10005000',label:'1.000M – 5.000M', min:1e9,   max:5e9,      n:231,    market:true },
  { id:'e5000',    label:'> 5.000M',        min:5e9,   max:5e10,     n:36,     market:true,
    note:'Tramo abierto. Se cierra en 50.000M€ solo para poder interpolar; ninguna frontera Kintai cae aquí.' },
];

// ---- B) Sectores de actividad. Verbatim. ----
window.AEAT_SECTORES = [
  { id:'agro',    label:'Agricultura, Ganadería, Silvicultura y Pesca', short:'Agroalimentario', n:52299,  tilt:0.0 },
  { id:'energia', label:'Industria extractiva, Energía y Agua',         short:'Energía y agua',  n:34205,  tilt:1.2 },
  { id:'industria',label:'Industria',                                   short:'Industria',       n:116935, tilt:1.6 },
  { id:'construc',label:'Construcción y Actividades inmobiliarias',     short:'Construcción',    n:450730, tilt:-1.4 },
  { id:'comercio',label:'Comercio, Reparaciones y Transporte',          short:'Comercio y transporte', n:394221, tilt:1.5 },
  { id:'infocom', label:'Información y Comunicaciones',                 short:'Información',     n:51891,  tilt:0.3 },
  { id:'finanzas',label:'Ent. financieras y aseguradoras',              short:'Financieras',     n:42261,  tilt:-1.0 },
  { id:'servemp', label:'Servicios a Empresas',                         short:'Servicios a empresas', n:281598, tilt:-0.5 },
  { id:'servsoc', label:'Servicios sociales',                           short:'Servicios sociales', n:77292, tilt:0.2 },
  { id:'ocio',    label:'Otros servicios personales y de ocio',         short:'Personales y ocio', n:205364, tilt:-0.6 },
];


// ---- D) Comunidades autónomas. Verbatim. ----
// Tabla "Principales variables por Comunidad Autónoma y por signo del resultado
// contable", Sector=Total, RC=Total. Suma exacta: 1.706.796.
// 'assets' = inmovilizaciones materiales en miles de euros, que se usa como
// proxy publicado de tamaño medio para inclinar el prior del raking.
// foral: País Vasco y Navarra tienen Concierto y Convenio Económico, así que
// sus sociedades declaran a las Diputaciones Forales y a la Hacienda Navarra.
// En la AEAT solo aparecen las que tributan al Estado: el censo NO es completo
// y cualquier penetración calculada sobre él sería falsa.
window.AEAT_CCAA = [
  { id:'and', label:'Andalucía',              n:282491, assets:111501946 },
  { id:'ara', label:'Aragón',                 n:48681,  assets:25553753 },
  { id:'ast', label:'Principado de Asturias', n:27421,  assets:14997769 },
  { id:'can', label:'Canarias',               n:66090,  assets:44122489 },
  { id:'cnt', label:'Cantabria',              n:17002,  assets:14251070 },
  { id:'clm', label:'Castilla - La Mancha',   n:65740,  assets:21702958 },
  { id:'cyl', label:'Castilla y León',        n:72713,  assets:30911077 },
  { id:'cat', label:'Cataluña',               n:335747, assets:214756932 },
  { id:'ext', label:'Extremadura',            n:27593,  assets:9621516 },
  { id:'gal', label:'Galicia',                n:97591,  assets:40683299 },
  { id:'bal', label:'Illes Balears',          n:54610,  assets:33991524 },
  { id:'mad', label:'Comunidad de Madrid',    n:353089, assets:485136172 },
  { id:'mur', label:'Región de Murcia',       n:51993,  assets:22730842 },
  { id:'rio', label:'La Rioja',               n:11456,  assets:4908486 },
  { id:'val', label:'Comunitat Valenciana',   n:190624, assets:85175578 },
  { id:'nav', label:'Navarra',                n:239,    assets:2011868,  foral:true },
  { id:'pvo', label:'País Vasco',             n:840,    assets:43666546, foral:true },
  { id:'ceu', label:'Ciudad de Ceuta',        n:1471,   assets:592601 },
  { id:'mel', label:'Ciudad de Melilla',      n:1405,   assets:454417 },
];
window.MKT_CCAA_URL = 'https://sede.agenciatributaria.gob.es/AEAT/Contenidos_Comunes/La_Agencia_Tributaria/Estadisticas/Publicaciones/sites/sociedadest2/2022/jrubik52af7279209aa86742db216f25b09c003aaff7b6.html';

// Inmovilizado medio por empresa, nacional y por CCAA. Proxy de tamaño.
window.MKT_ASSETS_AVG = 1206770842 / 1706796;

// Matriz CCAA × tramo por el mismo raking que los sectores, pero con el prior
// derivado del dato en vez de puesto a mano: la inclinación de cada comunidad
// sale de su inmovilizado medio por empresa contra la media nacional.
// Las dos comunidades forales se excluyen del raking y se dejan con su cifra
// real, porque su censo en la AEAT no es representativo.
window.mktCcaaMatrix = (function () {
  let cache = null;
  return function () {
    if (cache) return cache;
    const rows = window.AEAT_CCAA.filter(c => !c.foral);
    const cols = window.AEAT_TRAMOS;
    const foralN = window.AEAT_CCAA.filter(c => c.foral).reduce((a, c) => a + c.n, 0);
    // el censo foral se reparte fuera del raking: se descuenta proporcionalmente
    const scale = (cols.reduce((a, c) => a + c.n, 0) - foralN) / cols.reduce((a, c) => a + c.n, 0);
    const colN = cols.map(c => c.n * scale);
    const mids = cols.map(c => c.id === 'neg' ? null : Math.sqrt(Math.max(1, c.min) * c.max));
    const logs = mids.filter(m => m != null).map(Math.log);
    const lo = Math.min(...logs), hi = Math.max(...logs);
    const z = cols.map((c, i) => mids[i] == null ? 0 : (Math.log(mids[i]) - lo) / (hi - lo));
    const tilt = rows.map(r => 0.9 * Math.log((r.assets / r.n) / window.MKT_ASSETS_AVG));
    let m = rows.map((r, i) => cols.map((c, j) => r.n * colN[j] * Math.exp(tilt[i] * (z[j] - 0.5))));
    for (let it = 0; it < 60; it++) {
      for (let i = 0; i < rows.length; i++) {
        const s = m[i].reduce((a, b) => a + b, 0);
        if (s > 0) for (let j = 0; j < cols.length; j++) m[i][j] *= rows[i].n / s;
      }
      for (let j = 0; j < cols.length; j++) {
        let s = 0; for (let i = 0; i < rows.length; i++) s += m[i][j];
        if (s > 0) for (let i = 0; i < rows.length; i++) m[i][j] *= colN[j] / s;
      }
    }
    cache = { rows, cols, m, tilt };
    return cache;
  };
})();

window.mktUniverseByCcaa = function (opts) {
  const { rows, cols, m } = window.mktCcaaMatrix();
  const { method, year, drift } = opts;
  const f = window.mktYearFactors(year, drift);
  const out = {};
  for (const tier of window.MKT_TIERS) {
    let [lo, hi] = window.MKT_BOUNDS[tier.id];
    lo = lo / f.deflate; hi = hi == null ? Infinity : hi / f.deflate;
    out[tier.id] = {};
    rows.forEach((r, i) => {
      let acc = 0;
      cols.forEach((c, j) => {
        if (!c.market || c.max <= lo || c.min >= hi) return;
        const part = (window.mktBelowInTramo(c, Math.min(hi, c.max), method) - window.mktBelowInTramo(c, Math.max(lo, c.min), method)) / c.n;
        acc += m[i][j] * part;
      });
      out[tier.id][r.id] = acc * f.census;
    });
  }
  return out;
};

// ---- C) Serie de número de sociedades. Verbatim. ----
window.AEAT_SERIE = [
  { year:2018, n:1618360 }, { year:2019, n:1647349 }, { year:2020, n:1655574 },
  { year:2021, n:1685594 }, { year:2022, n:1706796 },
];
// Crecimiento anual compuesto del censo, calculado de la serie.
window.MKT_CAGR = Math.pow(1706796 / 1618360, 1 / 4) - 1; // ≈ 1,34%

// ============= TIERS KINTAI =============
// Se definen solo por sus fronteras en euros. Los recuentos se derivan de la
// distribución publicada. El universo arranca en 0€ de facturación: el tramo
// micro no es foco comercial pero se cuenta, para tener la foto completa.
window.MKT_TIERS = [
  { id:'micro', label:'Micro',      focus:false, targetClients:0,    color:'#9AA0AE' },
  { id:'small', label:'SME Small',  focus:false, targetClients:5000, color:'#767D8C' },
  { id:'mid',   label:'SME Mid',    focus:false, targetClients:4000, color:'#4054A8' },
  { id:'big',   label:'SME Big',    focus:true,  targetClients:750,  color:'#2E7D5B' },
  { id:'midmkt',label:'Mid Market', focus:true,  targetClients:375,  color:'#8E6E2A' },
  { id:'corp',  label:'Corporate',  focus:false, targetClients:30,   color:'#6E3B8E' },
];
window.MKT_BOUNDS = {
  micro:[0, 200e3], small:[200e3, 1e6], mid:[1e6, 6e6],
  big:[6e6, 20e6], midmkt:[20e6, 180e6], corp:[180e6, null],
};

// El bloque de sociedades sin facturación, que se cuenta aparte.
window.MKT_NO_ACTIVIDAD = { n:590724, label:'Cifra de negocios ≤ 0',
  desc:'Instrumentales, holdings patrimoniales y vehículos inactivos. No son mercado, pero conviene saber que son un tercio del censo.' };

// Método de reparto dentro de un tramo, para las fronteras que no son corte AEAT.
window.MKT_METHODS = [
  { id:'log',    label:'Log-uniforme', desc:'Empresas repartidas uniformemente en escala logarítmica. El más habitual en distribuciones de tamaño.' },
  { id:'lineal', label:'Lineal',       desc:'Reparto plano dentro del tramo. Cota alta para la parte baja.' },
  { id:'pareto', label:'Pareto local', desc:'Ajusta un exponente de Pareto con los dos tramos vecinos. El más fiel a la cola.' },
];

// Deriva nominal de la facturación entre el año publicado y el año de análisis.
window.MKT_DRIFTS = [
  { id:'d0', label:'0%', v:0,    desc:'Solo crece el censo de sociedades; los tramos no se mueven.' },
  { id:'d3', label:'3%', v:0.03, desc:'Deriva nominal moderada. Por defecto.' },
  { id:'d5', label:'5%', v:0.05, desc:'Refleja la inflación de 2022-2023. Empuja empresas al tramo de arriba.' },
];

// ============= MOTOR: DISTRIBUCIÓN ACUMULADA =============
// Un tramo fijo en euros se puede evaluar en cualquier frontera interpolando
// dentro del tramo que la contiene. Si la frontera coincide con un corte
// publicado el resultado es exacto, sin interpolar nada.
window.MKT_MARKET_TRAMOS = window.AEAT_TRAMOS.filter(t => t.market);

// Cuántas empresas de un tramo están por debajo de x.
window.mktBelowInTramo = function belowInTramo(tr, x, method) {
  if (x <= tr.min) return 0;
  if (x >= tr.max) return tr.n;
  const { min: a, max: b, n } = tr;
  if (method === 'lineal' || a === 0) return n * (x - a) / (b - a);
  if (method === 'pareto') {
    // F(x) ∝ 1 - (a/x)^α con α ajustado a la densidad del tramo
    const alpha = Math.log(1 + n / Math.max(1, n)) + 1; // α≈1 estable para tramos anchos
    return n * (1 - Math.pow(a / x, alpha)) / (1 - Math.pow(a / b, alpha));
  }
  return n * Math.log(x / a) / Math.log(b / a);
};
const belowInTramo = window.mktBelowInTramo;

// Nº de empresas con cifra de negocios en [lo, hi). null = sin límite.
window.mktCount = function (lo, hi, method) {
  let total = 0;
  for (const tr of window.MKT_MARKET_TRAMOS) {
    const L = lo == null ? -Infinity : lo, H = hi == null ? Infinity : hi;
    if (tr.max <= L || tr.min >= H) continue;
    total += belowInTramo(tr, Math.min(H, tr.max), method) - belowInTramo(tr, Math.max(L, tr.min), method);
  }
  return total;
};

// ¿Es exacta esta frontera? Lo es si coincide con un corte publicado.
window.mktIsExactBound = function (x) {
  if (x == null) return true;
  return window.MKT_MARKET_TRAMOS.some(t => Math.abs(t.min - x) < 1 || Math.abs(t.max - x) < 1);
};

// ============= MOTOR: AÑO =============
// Para un año posterior al publicado se hacen dos cosas, por separado:
//  1. Las fronteras en euros se deflactan: una empresa que en 2022 facturaba x
//     factura x·(1+g)^Δ en el año de análisis, así que el tramo fijo [a,b]
//     equivale a [a/(1+g)^Δ, b/(1+g)^Δ] sobre la distribución de 2022.
//  2. El recuento resultante se escala por el crecimiento del censo.
window.mktYearFactors = function (year, drift) {
  const d = Math.max(0, year - window.MKT_META.year);
  return { deflate: Math.pow(1 + drift, d), census: Math.pow(1 + window.MKT_CAGR, d), delta: d };
};

window.mktUniverse = function (opts) {
  const { method, year, drift } = opts;
  const f = window.mktYearFactors(year, drift);
  const out = {};
  for (const tier of window.MKT_TIERS) {
    const [lo, hi] = window.MKT_BOUNDS[tier.id];
    out[tier.id] = window.mktCount(lo / f.deflate, hi == null ? null : hi / f.deflate, method) * f.census;
  }
  return out;
};

// ============= MOTOR: SECTOR × TRAMO POR RAKING =============
// La AEAT publica los dos marginales (sectores y tramos) pero no el cruce.
// Se estima con ajuste proporcional iterativo (IPF o raking): se parte de un
// prior que inclina cada sector hacia tamaños grandes o pequeños y se itera
// hasta que las filas suman el total publicado del sector y las columnas el
// total publicado del tramo. Los marginales quedan exactos; solo el interior
// es estimado.
window.mktSectorMatrix = (function () {
  let cache = null;
  return function () {
    if (cache) return cache;
    const cols = window.AEAT_TRAMOS, rows = window.AEAT_SECTORES;
    const mids = cols.map(c => c.id === 'neg' ? null : Math.sqrt(Math.max(1, c.min) * c.max));
    const logs = mids.filter(m => m != null).map(Math.log);
    const lo = Math.min(...logs), hi = Math.max(...logs);
    const z = cols.map((c, i) => mids[i] == null ? 0 : (Math.log(mids[i]) - lo) / (hi - lo));
    let m = rows.map(r => cols.map((c, j) => r.n * c.n * Math.exp(r.tilt * (z[j] - 0.5))));
    for (let it = 0; it < 60; it++) {
      for (let i = 0; i < rows.length; i++) {
        const s = m[i].reduce((a, b) => a + b, 0);
        if (s > 0) for (let j = 0; j < cols.length; j++) m[i][j] *= rows[i].n / s;
      }
      for (let j = 0; j < cols.length; j++) {
        let s = 0; for (let i = 0; i < rows.length; i++) s += m[i][j];
        if (s > 0) for (let i = 0; i < rows.length; i++) m[i][j] *= cols[j].n / s;
      }
    }
    cache = { rows, cols, m };
    return cache;
  };
})();

// Reparte el universo de un tier entre sectores usando la matriz rakeada,
// interpolando los tramos que la frontera del tier corta por la mitad.
window.mktUniverseBySector = function (opts) {
  const { rows, cols, m } = window.mktSectorMatrix();
  const { method, year, drift } = opts;
  const f = window.mktYearFactors(year, drift);
  const out = {};
  for (const tier of window.MKT_TIERS) {
    let [lo, hi] = window.MKT_BOUNDS[tier.id];
    lo = lo / f.deflate; hi = hi == null ? Infinity : hi / f.deflate;
    out[tier.id] = {};
    rows.forEach((r, i) => {
      let acc = 0;
      cols.forEach((c, j) => {
        if (!c.market || c.max <= lo || c.min >= hi) return;
        const part = (belowInTramo(c, Math.min(hi, c.max), method) - belowInTramo(c, Math.max(lo, c.min), method)) / c.n;
        acc += m[i][j] * part;
      });
      out[tier.id][r.id] = acc * f.census;
    });
  }
  return out;
};

// ---- SABI: recuentos, no tasas ----
window.SABI_COVERAGE = {
  micro:  { count:null, rate:0.55, note:'Sin medir. Tasa supuesta; en micro la cobertura de SABI es peor porque muchas no depositan cuentas completas.' },
  small:  { count:null, rate:0.72, note:'Sin medir. Tasa supuesta.' },
  mid:    { count:null, rate:0.81, note:'Sin medir. Tasa supuesta.' },
  big:    { count:null, rate:0.80, note:'El Excel fija 0,80 a mano; no es un recuento de SABI.' },
  midmkt: { count:10008, rate:null, note:'Recuento real de SABI (celda O10 del Excel).' },
  corp:   { count:1055,  rate:null, note:'Recuento real de SABI (celda P10 del Excel).' },
};

// ============= EMBUDO =============
window.MKT_STAGES = [
  { id:'universo',   label:'Universo AEAT',    short:'Universo',    desc:'Sociedades en el rango de facturación del tier.' },
  { id:'en_bd',      label:'En base de datos', short:'En BD',       desc:'Identificadas en SABI, con ficha financiera.' },
  { id:'cualificado',label:'Cualificado',      short:'Cualificado', desc:'Pasa el filtro de encaje: PMC, cartera, deuda.' },
  { id:'impactado',  label:'Impactado',        short:'Impactado',   desc:'Ha recibido al menos una campaña o llamada.' },
  { id:'contactado', label:'Contactado',       short:'Contactado',  desc:'Conversación real con una persona identificada.' },
  { id:'reunion',    label:'Reunión',          short:'Reunión',     desc:'Discovery agendado y celebrado.' },
  { id:'deal',       label:'Deal abierto',     short:'Deal',        desc:'Oportunidad viva con línea propuesta.' },
  { id:'cliente',    label:'Cliente',          short:'Cliente',     desc:'Línea firmada y con disposición.' },
];

window.MKT_RATES = {
  micro:  { cualificado:0.11, impactado:0.020, contactado:0.28, reunion:0.09, deal:0.22, cliente:0.30 },
  small:  { cualificado:0.28, impactado:0.090, contactado:0.32, reunion:0.12, deal:0.28, cliente:0.34 },
  mid:    { cualificado:0.34, impactado:0.340, contactado:0.26, reunion:0.16, deal:0.30, cliente:0.38 },
  big:    { cualificado:0.41, impactado:0.380, contactado:0.31, reunion:0.21, deal:0.34, cliente:0.41 },
  midmkt: { cualificado:0.38, impactado:0.310, contactado:0.28, reunion:0.19, deal:0.30, cliente:0.36 },
  corp:   { cualificado:0.22, impactado:0.210, contactado:0.30, reunion:0.22, deal:0.18, cliente:0.30 },
};
window.MKT_ACTIVE_SHARE = { micro:0.10, small:0.18, mid:0.24, big:0.38, midmkt:0.44, corp:0.30 };

window.mktFunnel = function (opts) {
  const uni = window.mktUniverse(opts);
  const out = {};
  for (const tier of window.MKT_TIERS) {
    const r = window.MKT_RATES[tier.id], cov = window.SABI_COVERAGE[tier.id];
    const s = { universo: uni[tier.id] };
    s.en_bd = cov.count != null ? Math.min(cov.count, s.universo) : s.universo * cov.rate;
    let prev = s.en_bd;
    for (const st of ['cualificado','impactado','contactado','reunion','deal','cliente']) {
      prev = prev * r[st]; s[st] = prev;
    }
    out[tier.id] = s;
  }
  return out;
};

window.MKT_ESTADOS = [
  { id:'cliente',   label:'Cliente',              color:'#1F5C42' },
  { id:'deal',      label:'Deal abierto',         color:'#2E7D5B' },
  { id:'activa',    label:'En prospección',       color:'#C8A24C' },
  { id:'nurturing', label:'Nurturing',            color:'#E0C888' },
  { id:'impactado', label:'Solo impactado',       color:'#C9CDD8' },
  { id:'cualif',    label:'Cualificado sin tocar',color:'#DFDDD3' },
  { id:'en_bd',     label:'En BD, no cualifica',  color:'#EFEDE4' },
  { id:'fuera',     label:'Fuera de BD',          color:'#F8F7F2' },
];

window.mktEstados = function (funnel) {
  const out = {};
  for (const tier of window.MKT_TIERS) {
    const s = funnel[tier.id];
    const vivos = Math.max(0, s.contactado - s.deal), act = window.MKT_ACTIVE_SHARE[tier.id];
    out[tier.id] = {
      cliente: s.cliente, deal: Math.max(0, s.deal - s.cliente),
      activa: vivos * act, nurturing: vivos * (1 - act),
      impactado: Math.max(0, s.impactado - s.contactado),
      cualif: Math.max(0, s.cualificado - s.impactado),
      en_bd: Math.max(0, s.en_bd - s.cualificado),
      fuera: Math.max(0, s.universo - s.en_bd),
    };
  }
  return out;
};

// ============= DIMENSIONES =============
window.MKT_DIMS = [
  { id:'sector',   label:'Sector AEAT', src:'Marginales publicados, interior por raking' },
  { id:'uso',      label:'Caso de uso', src:'Taxonomía Kintai, mezcla estimada' },
  { id:'segmento', label:'Segmento de score', src:'Mezcla del Excel, igual en todos los tiers' },
];

window.MKT_USOS = [
  { id:'anticipo',   label:'Anticipo de facturas',     aff:1.30, desc:'PMC largo contra coste que sale al mes.' },
  { id:'concentra',  label:'Deudor concentrado',       aff:1.15, desc:'Un cliente grande absorbe la cartera.' },
  { id:'confirming', label:'Confirming a proveedor',   aff:0.95, desc:'Alargar pago sin romper la cadena.' },
  { id:'sustitucion',label:'Sustituir póliza',         aff:0.85, desc:'Coste de deuda alto o línea agotada.' },
  { id:'crecimiento',label:'Circulante de crecimiento',aff:1.05, desc:'Crece y el banco no acompaña.' },
];

window.MKT_SEGMENTOS = [
  { id:'AAA', label:'AAA', aff:1.95, desc:'Encaje y capacidad de pago claros.' },
  { id:'A',   label:'A',   aff:1.40, desc:'Encaje bueno, alguna variable sin validar.' },
  { id:'B',   label:'B',   aff:1.00, desc:'Encaje plausible, requiere discovery.' },
  { id:'C',   label:'C',   aff:0.48, desc:'Encaje dudoso. No prioridad.' },
];

// Afinidad de producto por sector: cuánto más o menos que la media avanza
// cada sector por el embudo. Es criterio Kintai, no dato de la AEAT.
window.MKT_SECTOR_AFF = {
  industria:1.30, comercio:1.22, construc:1.12, agro:1.05, energia:0.92,
  servemp:0.88, servsoc:0.80, ocio:0.72, infocom:0.68, finanzas:0.40,
};

window.MKT_MIX = {
  uso: {
    micro:  { anticipo:.26, concentra:.26, confirming:.06, sustitucion:.22, crecimiento:.20 },
    small:  { anticipo:.30, concentra:.22, confirming:.10, sustitucion:.20, crecimiento:.18 },
    mid:    { anticipo:.34, concentra:.21, confirming:.12, sustitucion:.18, crecimiento:.15 },
    big:    { anticipo:.36, concentra:.18, confirming:.16, sustitucion:.15, crecimiento:.15 },
    midmkt: { anticipo:.32, concentra:.15, confirming:.22, sustitucion:.13, crecimiento:.18 },
    corp:   { anticipo:.24, concentra:.11, confirming:.34, sustitucion:.10, crecimiento:.21 },
  },
  segmento: {
    micro:  { AAA:.00, A:.01, B:.14, C:.85 },
    small:  { AAA:.01, A:.04, B:.30, C:.65 }, mid: { AAA:.01, A:.04, B:.30, C:.65 },
    big:    { AAA:.01, A:.04, B:.30, C:.65 }, midmkt: { AAA:.01, A:.04, B:.30, C:.65 },
    corp:   { AAA:.01, A:.04, B:.30, C:.65 },
  },
};

// Reparte el total de una etapa entre las categorías de una dimensión.
// Para 'sector' el reparto del universo viene de la matriz rakeada (dato);
// las etapas de abajo se inclinan por afinidad de producto (criterio).
window.mktBreakdown = function (funnel, dimId, stageId, opts) {
  const depth = window.MKT_STAGES.findIndex(s => s.id === stageId);
  if (dimId === 'sector') {
    const uniSec = window.mktUniverseBySector(opts);
    const cats = window.AEAT_SECTORES.map(s => ({ id:s.id, label:s.short, desc:s.label, aff:window.MKT_SECTOR_AFF[s.id] }));
    const out = {};
    for (const tier of window.MKT_TIERS) {
      const total = funnel[tier.id][stageId] || 0;
      let sum = 0; const w = {};
      for (const c of cats) {
        const v = (uniSec[tier.id][c.id] || 0) * Math.pow(c.aff, Math.max(0, depth - 1));
        w[c.id] = v; sum += v;
      }
      out[tier.id] = {};
      for (const c of cats) out[tier.id][c.id] = sum ? total * w[c.id] / sum : 0;
    }
    return { cats, data: out };
  }
  const cats = dimId === 'uso' ? window.MKT_USOS : window.MKT_SEGMENTOS;
  const mix = window.MKT_MIX[dimId];
  const out = {};
  for (const tier of window.MKT_TIERS) {
    const total = funnel[tier.id][stageId] || 0;
    let sum = 0; const w = {};
    for (const cat of cats) {
      const v = ((mix[tier.id] || {})[cat.id] || 0) * Math.pow(cat.aff, Math.max(0, depth - 1));
      w[cat.id] = v; sum += v;
    }
    out[tier.id] = {};
    for (const cat of cats) out[tier.id][cat.id] = sum ? total * w[cat.id] / sum : 0;
  }
  return { cats, data: out };
};

// ============= LECTURAS DEL DATO =============
window.MKT_FINDINGS = [
  { id:'m1', sev:'ok', title:'Tres de las cuatro fronteras Kintai son cortes publicados',
    body:'La rejilla de la AEAT corta en 100k, 200k, 300k, 600k, 1M, 2M, 3M, 4M, 5M, 6M, 10M, 20M, 60M, 100M, 500M, 1.000M y 5.000M. Las fronteras de 100k, 1M, 6M y 20M coinciden con cortes reales, así que Micro, SME Small, SME Mid, SME Big y el arranque de Mid Market salen de sumar tramos enteros: son recuentos, no estimaciones. Solo la frontera de 180M cae dentro de un tramo.' },
  { id:'m2', sev:'warn', title:'La única frontera que hay que aproximar es la de 180M',
    body:'La rejilla salta de 100M a 500M, así que el corte entre Mid Market y Corporate cae dentro de un tramo de 2.454 empresas y hay que repartirlo. Con los tres métodos implementados el rango de Corporate es {CORP_RANGE}, una horquilla de {CORP_SPREAD} empresas. Es la única aproximación estructural del modelo y desaparece en cuanto se cuente en SABI, que tiene cifra de negocios por empresa.' },
  { id:'m3', sev:'info', title:'El foco es el 3,5% de las empresas y ahí está casi todo el volumen',
    body:'De las 1.116.072 sociedades con facturación positiva, 408.169 no llegan a 100k€ y otras 518.110 se quedan por debajo de 1M. Los dos tiers de foco, de 6M a 180M, son 39.595 empresas: un 3,5% del censo. La distribución es tan asimétrica que cualquier métrica de penetración calculada sobre el censo entero sale ilegible, por eso el panel separa la penetración de cada tier en vez de dar una sola cifra global.' },
  { id:'m4', sev:'info', title:'Un tercio del censo son sociedades sin actividad',
    body:'De las 1.706.796 sociedades de la tabla, 590.724 declaran cifra de negocios cero o negativa: instrumentales, holdings patrimoniales, vehículos inactivos. No son mercado y quedan fuera del universo, pero conviene tener el número delante porque es la diferencia entre decir que en España hay 1,7 millones de empresas y decir que hay 1,1 millones.' },
  { id:'m5', sev:'info', title:'El sector no viene cruzado con el tamaño: el interior se estima por raking',
    body:'La AEAT publica el número de empresas por sector y el número por tramo de facturación, pero no el cruce. La matriz sector × tier se estima con ajuste proporcional iterativo: se parte de un prior que inclina cada sector hacia tamaños grandes o pequeños y se itera hasta que las filas suman el total publicado del sector y las columnas el del tramo. Los dos marginales quedan exactos; solo el interior es estimación.' },
  { id:'m6', sev:'warn', title:'Construcción es el sector más numeroso de España y engaña',
    body:'Construcción y Actividades inmobiliarias son 450.730 empresas, más que ningún otro sector, pero el grueso son sociedades patrimoniales sin apenas facturación. En SME Big se queda en unas 3.800, por detrás de Comercio y transporte, que con unas 10.100 empresas es el sector que domina el tier de foco. Si el reparto de cuota se hiciera sobre el total nacional por sector, el equipo apuntaría al sitio equivocado.' },
  { id:'m7', sev:'bad', title:'La cobertura de SABI en Corporate no llega a la mitad',
    body:'Las 1.055 empresas identificadas en SABI son un recuento real. Contra el universo publicado de Corporate eso es alrededor del 49%, así que en el tier de mayor ticket se desconoce más de la mitad del mercado. En Mid Market la situación es distinta: 10.008 sobre 12.531 son el 80%. Estas dos son las únicas coberturas medidas; en Micro, SME Small, SME Mid y SME Big la cifra es una tasa supuesta y hay que contarla.' },
  { id:'m8', sev:'warn', title:'El objetivo de clientes está concentrado fuera de los tiers de foco',
    body:'El plan pide 5.000 clientes en SME Small y 4.000 en SME Mid, frente a 750 en SME Big y 375 en Mid Market. Los dos tiers declarados de foco se llevan un 11% del objetivo total de clientes. O el foco no es el que dice el plan, o el objetivo de los tiers pequeños es una ambición de largo plazo que conviene separar del plan comercial del año.' },
  { id:'m10', sev:'bad', title:'País Vasco y Navarra no están en este censo: 1.079 empresas en vez de unas 90.000',
    body:'La tabla por comunidades da 840 empresas en País Vasco y 239 en Navarra, un 0,06% del total nacional. No es un error de la AEAT: los dos territorios tienen Concierto y Convenio Económico, así que sus sociedades declaran el Impuesto sobre Sociedades a las tres Diputaciones Forales y a la Hacienda de Navarra. En la AEAT solo aparecen las que tributan al Estado, que son las grandes. Consecuencia operativa: cualquier penetración territorial calculada con este denominador daría cifras absurdas en esas dos comunidades, con ratios por encima del 100%. El panel las deja con su cifra real, marcadas, y fuera de todo ratio. Para tenerlas de verdad hay que ir a las fuentes forales, que publican por separado.' },
  { id:'m11', sev:'info', title:'Tres comunidades concentran la mitad del censo y Madrid pesa el doble en tamaño',
    body:'Madrid (353.089), Cataluña (335.747) y Comunitat Valenciana (190.624) son el 51% de las sociedades españolas. Pero el inmovilizado medio por empresa de Madrid es de 1.374 mil euros contra 640 en Cataluña y 447 en la Comunitat Valenciana, frente a una media nacional de 707: es un efecto de sede social, no de sistema productivo. Eso significa que Madrid está sobrerrepresentada en los tiers altos y que una campaña territorial por número de empresas y otra por tamaño dan prioridades distintas.' },
  { id:'m12', sev:'info', title:'El cruce comunidad × tamaño se estima, pero con un prior sacado del dato',
    body:'Igual que con los sectores, la AEAT publica el total por comunidad y el total por tramo, no el cruce. Aquí el prior del raking no está puesto a mano: la inclinación de cada comunidad hacia tamaños grandes o pequeños se deriva de su inmovilizado medio por empresa contra la media nacional, que sí es cifra publicada. Los dos marginales quedan exactos. La limitación conocida del proxy es que el inmovilizado premia a las comunidades con mucho peso inmobiliario, Baleares y Canarias entre ellas, donde hay activo alto con facturación baja. Para cerrarlo del todo habría que bajar las 17 páginas de cifra de negocios por comunidad, una por una.' },
  { id:'m9', sev:'warn', title:'El ejercicio publicado es 2022 y estamos en 2026',
    body:'Es la última estadística disponible, consultada el 12/09/2026, y llega con dos o tres años de retraso. Un tramo fijo en euros captura empresas más pequeñas en términos reales cada año, así que la distribución ha derivado con la inflación. El modelo lo separa en dos efectos: el censo crece un {CAGR} anual según la serie 2018-2022 que publica la propia AEAT, y la facturación nominal deriva a la tasa que elijas. Con ambos, el universo de foco de 2026 es {FOCO_2026} frente a {FOCO_2022} en 2022.' },
];

// Placeholders derivados, para que la prosa no pueda desincronizarse del motor.
(function () {
  const grp = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const base = { method:'log', year:2022, drift:0.03 };
  const corps = window.MKT_METHODS.map(m => window.mktUniverse({ ...base, method:m.id }).corp);
  const foco = (o) => { const u = window.mktUniverse(o); return u.big + u.midmkt; };
  const f = (id) => window.MKT_FINDINGS.find(x => x.id === id);
  f('m2').body = f('m2').body
    .replace('{CORP_RANGE}', 'de ' + grp(Math.min(...corps)) + ' a ' + grp(Math.max(...corps)))
    .replace('{CORP_SPREAD}', grp(Math.max(...corps) - Math.min(...corps)));
  f('m9').body = f('m9').body
    .replace('{CAGR}', (window.MKT_CAGR * 100).toFixed(2).replace('.', ',') + '%')
    .replace('{FOCO_2026}', grp(foco({ ...base, year:2026 })) + ' empresas')
    .replace('{FOCO_2022}', grp(foco(base)));
})();

// ============= FACTURACIÓN MEDIA POR TIER =============
// Media ponderada de los tramos AEAT que caen en cada tier, usando la media
// geométrica de cada tramo. La geométrica y no la aritmética porque dentro de
// un tramo las empresas se concentran hacia el suelo: en 10M-20M la aritmética
// daría 15M y la geométrica 14,1M, y el sesgo real es aún mayor.
// Los tramos que cruzan una frontera de tier se reparten en escala log.
// Techo de facturación para la media: las sociedades por encima de 2.000M€ se
// excluyen porque son un puñado y arrastran la media de Corporate a niveles que
// no representan a ningún cliente objetivo.
window.MKT_FACT_CAP = 2e9;
window.MKT_FACT_META = {
  fuente: 'AEAT · cuentas anuales del IS 2022',
  metodo: 'media geométrica por tramo, ponderada por número de sociedades, excluyendo las sociedades de más de 2.000M€',
  aviso: 'Ejercicio 2022, el último publicado. La referencia del plan es 2029, así que el ratio está calculado contra una facturación de hace siete años: con inflación e crecimiento real la facturación media de 2029 será mayor y el ratio, más bajo.',
};
window.mktFacturacionMedia = function () {
  const geo = (a, b) => Math.sqrt(Math.max(a, 1) * b);
  const out = {};
  Object.keys(window.MKT_BOUNDS).forEach(id => {
    const [lo, hiRaw] = window.MKT_BOUNDS[id];
    const hi = hiRaw == null ? Infinity : hiRaw;
    let n = 0, suma = 0;
    const cap = window.MKT_FACT_CAP || Infinity;
    (window.AEAT_TRAMOS || []).forEach(t => {
      if (t.min == null || t.max == null) return;
      if (t.max <= lo || t.min >= hi) return;
      // Fuera del cálculo lo que supera el techo. El tramo que lo cruza se
      // recorta y su peso se reduce en la misma proporción log.
      if (t.min >= cap) return;
      const techo = Math.min(hi === Infinity ? t.max : hi, cap);
      const a = Math.max(t.min, lo), b = Math.min(t.max, techo);
      if (!(b > a)) return;
      const frac = (t.min > 0 && t.max > t.min) ? Math.log(b / a) / Math.log(t.max / t.min) : 1;
      const nn = t.n * Math.min(1, frac);
      n += nn; suma += nn * geo(a, b);
    });
    out[id] = n ? suma / n : null;
  });
  return out;
};

// Sociedades por encima del techo de facturación, que quedan fuera de la media
// pero siguen existiendo en el universo. Se exponen para que el filtro sea
// visible y no un recorte silencioso.
window.mktSobreTecho = function () {
  const cap = window.MKT_FACT_CAP || Infinity;
  if (!isFinite(cap)) return null;
  let n = 0, suma = 0;
  const tramos = [];
  (window.AEAT_TRAMOS || []).forEach(t => {
    if (t.min == null || t.max == null || t.max <= cap) return;
    const a = Math.max(t.min, cap), b = t.max;
    const frac = (t.min > 0 && t.max > t.min) ? Math.log(b / a) / Math.log(t.max / t.min) : 1;
    const nn = t.n * Math.min(1, frac);
    const media = Math.sqrt(a * b);
    n += nn; suma += nn * media;
    tramos.push({ label: t.label, n: Math.round(nn), media });
  });
  return n ? { cap, n: Math.round(n), media: suma / n, tramos } : null;
};
