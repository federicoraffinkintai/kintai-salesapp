// Mid Market · foco por sección CNAE. Una sección por letra con su dashboard
// de resumen y la tabla de empresas: ventas, aprovisionamientos, EBITDA, las
// tres partidas de circulante, NOF, crecimiento, deuda a corto, apalancamiento
// y peso del patrimonio. Todos los importes del fichero vienen en miles de €.
const mmN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
const mm1 = (v) => v == null || isNaN(v) || !isFinite(v) ? '—' : v.toFixed(1).replace('.', ',');
// El apalancamiento se lee como número a secas —4,2 es cuatro veces el
// EBITDA—, sin el aspa. Con dos decimales solo por debajo de 1, donde un
// decimal lo aplastaría a cero.
const mmX = (v) => v == null || isNaN(v) || !isFinite(v) ? '—'
  : (Math.abs(v) < 1 ? v.toFixed(2) : v.toFixed(1)).replace('.', ',');
const mmP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 0 : d).replace('.', ',') + '%';
const mmSig = (v) => v == null || isNaN(v) || !isFinite(v) ? '—' : (Math.round(v * 100) > 0 ? '+' : '') + mmP(v);
// El dato viene en miles de euros: 1.000 = 1M€.
const mmEur = (k) => k == null || isNaN(k) ? '—'
  : Math.abs(k) >= 1e9 ? (k / 1e9).toFixed(2).replace('.', ',') + 'T€'
  : Math.abs(k) >= 1e6 ? (k / 1e6).toFixed(Math.abs(k) >= 1e7 ? 0 : 2).replace('.', ',') + 'B€'
  : Math.abs(k) >= 1e3 ? (k / 1e3).toFixed(Math.abs(k) >= 1e4 ? 0 : 1).replace('.', ',') + 'M€'
  : mmN(k) + 'k€';

// Columnas de la tabla, en el orden en que se pintan. `get` las hace
// ordenables al clicar la cabecera; `dir` es la dirección natural de cada una.
const MM_COLS_T = [
  { id:'nom',     label:'Empresa',        get:e => e.nom,      dir:1,  txt:true },
  { id:'ven',     label:'Ventas',         get:e => e.ven },
  { id:'apr',     label:'Aprovisionamientos', get:e => e.apr },
  { id:'ebi',     label:'EBITDA',         get:e => e.ebi },
  { id:'bnf',     label:'Beneficio neto', get:e => e.bnf },
  { id:'deu',     label:'Deudores',       get:e => e.deu, grp:true },
  { id:'exi',     label:'Existencias',    get:e => e.exi },
  { id:'pro',     label:'Proveedores',    get:e => e.pro },
  { id:'nof',     label:'NOF',            get:e => e.nof },
  { id:'dcp',     label:'Deudas a corto', get:e => e.dcp },
  { id:'nofPct',  label:'NOF / Ventas',   get:e => e.nofPct, grp:true },
  { id:'crec',    label:'Crecimiento',    get:e => e.crec },
  { id:'dfEbitda',label:'Deuda / EBITDA', get:e => e.dfEbitda },
  { id:'pnPct',   label:'Patrimonio neto', get:e => e.pnPct },
];

const MM_ORDEN = [
  { id:'ven',  label:'Ventas',        get:e => e.ven },
  { id:'nof',  label:'NOF',           get:e => e.nof },
  { id:'nofNeta', label:'NOF neta', get:e => e.nofNeta },
  { id:'deu',  label:'Deudores',      get:e => e.deu },
  { id:'ebi',  label:'EBITDA',        get:e => e.ebi },
  { id:'crec', label:'Crecimiento',   get:e => e.crec },
  { id:'pmc',  label:'Periodo de cobro', get:e => e.pmc },
];

// Cobertura comercial de un grupo: cuántas de esas empresas hemos impactado,
// con cuántas hay deal y cuántas son clientes. La conversión es cliente sobre
// contacto, que es la que dice si el problema es de cobertura o de cierre.
// Fila de sección o de clase: a la izquierda el código y su NOF, a la derecha
// cuatro barras — empresas, prospectadas, contactos y clientes —, cada una
// escalada contra el máximo de SU métrica para que la comparación entre filas
// sea legible: con 12 clientes en todo el fichero, una escala común las
// dejaría invisibles.
const MM_PAGO = [
  { id:'transferencia', label:'Transf.', color:'#2E7D5B' },
  { id:'confirming',    label:'Confirming', color:'#4054A8' },
  { id:'pagare',        label:'Pagaré', color:'#8E6E2A' },
  { id:'tpv',           label:'TPV', color:'#C8553D' },
  { id:'giro',          label:'Giro', color:'#2E93A8' },
];
// Patrón de cobro de una letra: el propio del sector si existe y, si no, el de
// Mid Market como referencia declarada.
window.mmPago = function (letra) {
  const pat = (window.CAR_SECTORES || []).find(s => s.id === letra);
  if (pat) return { mix: pat.mix, nacional: pat.nacional, cedido: pat.cedido, propio: true };
  const fb = (window.CAR_MIX || {}).midmkt;
  if (!fb) return null;
  return { mix: { transferencia: fb.transferencia, confirming: fb.confirming, pagare: fb.pagare, tpv: fb.tpv, giro: fb.giro },
    nacional: fb.nacional, cedido: fb.cedido, propio: false };
};

function MmFila({ id, code, nombre, r, max, on, onClick, sub, pago }) {
  const barras = [
    { k:'Empresas',     v:r.n,          m:max.n,          c:'#A8ADBA' },
    { k:'Prospectadas', v:r.prospected, m:max.prospected, c:'#C8A24C' },
    { k:'Contactos',    v:r.contactos,  m:max.contactos,  c:'#4054A8' },
    { k:'Clientes',     v:r.clientes,   m:max.clientes,   c:'#1F5C42' },
    { k:'Encaje A',     v:r.encajeA,    m:max.encajeA,    c:'#B8731F' },
  ];
  return (
    <div className={'mm-sec' + (on ? ' on' : '')} onClick={onClick}>
      <div className="mm-sec-id">
        <span className={'mm-sec-l' + (sub ? ' mm-sec-c' : '')}>{code}</span>
        <em className="mono">{mmEur(r.nof)}<u>NOF</u></em>
      </div>
      <div className="mm-sec-b">
        <span className="mm-sec-n">{nombre}</span>
        <div className="mm-sec-bl">
          {barras.map(b => (
            <div className="mm-bar" key={b.k} title={b.k + ' · ' + mmN(b.v)}>
              <span>{b.k}</span>
              <div><i style={{width: (b.m ? Math.min(100, b.v / b.m * 100) : 0) + '%', background: b.c}}/></div>
              <b className="mono">{mmN(b.v)}</b>
            </div>
          ))}
        </div>
        {pago && (
          <div className="mm-pago">
            <div className="mm-pago-t">Métodos de cobro de su cartera · muestra de nuestro pipeline{pago.propio ? '' : ' · patrón Mid Market'}</div>
            <div className="mm-sec-bl">
              {MM_PAGO.map(p => (
                <div className="mm-bar" key={p.id} title={p.label + ' · ' + mmP(pago.mix[p.id]) + ' · ' + mmEur(r.deu * pago.mix[p.id]) + ' de deudores'}>
                  <span>{p.label}</span>
                  <div><i style={{width: Math.max(0, pago.mix[p.id] * 100) + '%', background: p.color}}/></div>
                  <b className="mono">{mmP(pago.mix[p.id])}</b>
                </div>
              ))}
              <div className="mm-bar mm-bar-ced" title="Parte de la cartera ya cedida a un tercero: esa financiación ya la da otro.">
                <span>Ya cedido</span>
                <div><i style={{width: ((pago.cedido || 0) * 100) + '%', background:'#767D8C'}}/></div>
                <b className="mono">{mmP(pago.cedido)}</b>
              </div>
            </div>
            <div className="mm-perf">
              <span title="Cartera que no se cobra por TPV: el TPV es cobro a consumidor final y no hay factura que ceder.">B2B<b className="mono">{mmP(1 - (pago.mix.tpv || 0))}</b></span>
              <span title="Deudores dentro de España.">Nacional<b className="mono">{mmP(pago.nacional)}</b></span>
              <span title="Deudores fuera de España, mayoritariamente UE.">UE y resto<b className="mono">{mmP(pago.nacional == null ? null : 1 - pago.nacional)}</b></span>
              <span title="Parte de la cartera que factura al mismo deudor mes a mes. Muestreo de deals.">Recurrente<b className="mono">{mmP(window.mmRecurrente(code).v)}</b></span>
              <span title="Facturación de un mes en la mediana de la agrupación: la unidad con la que se dimensiona la línea.">Ticket mensual<b className="mono">{mmEur(r.tkMesMed)}</b></span>
            </div>
          </div>
        )}
        <div className="mm-sec-f">
          <span className="mm-sec-a" title={window.MM_ENCAJE_DEF}>Encaje A<b className="mono">{mmN(r.encajeA)}</b><i>{mmP(r.encajeApct)}</i></span>
          <span>Market share<b className="mono">{mmP(r.cuota, 2)}</b></span>
          <span>Discovery → won<b className="mono">{r.discovery ? mmP(r.convDW) : '—'}</b></span>
          <span>Churn<b className="mono" style={{color: r.churn ? '#B23A3A' : undefined}}>{r.clientes ? mmP(r.churnRate) : '—'}</b></span>
          <span className="mm-sec-f-n">{r.clientes ? mmN(r.activos) + ' activos · ' + mmN(r.churn) + ' en churn' : 'sin clientes'}</span>
        </div>
      </div>
    </div>
  );
}

function MmCobertura({ r, n }) {
  const virgen = n - r.prospected;
  const seg = [
    { k:'cliente', v:r.activos, label:'Clientes activos', color:'#1F5C42' },
    { k:'churn', v:r.churn, label:'Clientes en churn', color:'#B23A3A' },
    { k:'contacto', v:r.contactos - r.clientes, label:'Con deal, sin ganar', color:'#4054A8' },
    { k:'prosp', v:r.prospected - r.contactos, label:'Impactadas, sin deal', color:'#C8A24C' },
    { k:'virgen', v:virgen, label:'Sin tocar', color:'#DDE0E6' },
  ];
  return (
    <div className="mm-cob">
      <div className="mm-cob-k">
        <div><b className="mono">{mmN(r.activos)}</b><span>clientes activos</span></div>
        <div><b className="mono" style={{color: r.churn ? '#B23A3A' : undefined}}>{mmN(r.churn)}</b><span>en churn · {mmP(r.churnRate)}</span></div>
        <div><b className="mono">{mmN(r.contactos)}</b><span>con deal, clientes incluidos</span></div>
        <div><b className="mono">{mmN(r.prospected)}</b><span>impactadas en total</span></div>
        <div><b className="mono">{mmP(r.cobertura, 1)}</b><span>cobertura del universo</span></div>
        <div><b className="mono">{mmP(r.cuota, 2)}</b><span>market share sobre el universo</span></div>
        <div><b className="mono">{r.discovery ? mmP(r.convDW) : '—'}</b><span>conversión discovery → won</span></div>
      </div>
      <div className="mm-cob-b">
        {seg.filter(s => s.v > 0).map(s => (
          <i key={s.k} style={{width: (s.v / n * 100) + '%', background: s.color}}
            title={s.label + ' · ' + mmN(s.v) + ' (' + mmP(s.v / n, 1) + ')'}/>
        ))}
      </div>
      <div className="mm-cob-l">
        {seg.map(s => <span key={s.k}><u style={{background: s.color}}/>{s.label}<b className="mono">{mmN(s.v)}</b></span>)}
        <span className="mm-cob-nota">Los KPI de contacto e impacto son acumulados —un cliente cuenta también como contacto y como impactada—; la barra reparte sin solaparse. <b>Churn</b>: {window.MM_CHURN_DEF}</span>
      </div>
    </div>
  );
}

window.MidMarket = function MidMarket() {
  const secciones = React.useMemo(() => window.mmSecciones(), []);
  const [letra, setLetra] = React.useState(secciones[0] ? secciones[0].id : 'C');
  const [orden, setOrden] = React.useState('ven');
  const [dir, setDir] = React.useState(-1);
  // Clicar la cabecera ordena; volver a clicarla invierte.
  const porCol = (id) => {
    const col = MM_COLS_T.find(x => x.id === id);
    if (orden === id) setDir(d => -d);
    else { setOrden(id); setDir(col && col.dir ? col.dir : -1); }
  };
  // Multiselección de rangos: un array vacío es «todas».
  const [tramos, setTramos] = React.useState([]);
  const toggleTramo = (id) => setTramos(t => t.indexOf(id) >= 0 ? t.filter(x => x !== id) : t.concat([id]));
  const [cnae, setCnae] = React.useState(null);
  const [verTodos, setVerTodos] = React.useState(false);
  const [n, setN] = React.useState(40);
  // 'todas' desfiltra: el resumen y la tabla pasan al fichero entero.
  const secSel = secciones.find(s => s.id === letra);
  const sec = secSel || { id:'todas', label:'todas las secciones', color:'var(--kin)', ...window.mmResumen('todas') };
  const tot = React.useMemo(() => window.mmResumen('todas'), []);
  const totA = React.useMemo(() => window.mmResumen('todas', true), []);
  const nBig = React.useMemo(() => window.mmDe('todas').filter(e => e.tramo === 't2000').length, []);
  const ord = MM_ORDEN.find(o => o.id === orden) || MM_COLS_T.find(o => o.id === orden) || MM_ORDEN[0];
  const deSec = React.useMemo(() => window.mmDe(letra), [letra]);
  const porTramo = React.useMemo(() => {
    // Contar sobre la clase elegida, no sobre la sección entera: si no, el
    // rótulo del botón contradice lo que sale en la tabla.
    const base = cnae != null ? deSec.filter(e => e.cnae === cnae) : deSec;
    const o = { todos: base.length };
    window.MM_TRAMOS.forEach(t => { o[t.id] = base.filter(e => e.tramo === t.id).length; });
    return o;
  }, [deSec, cnae]);
  const tramoL = tramos.length
    ? window.MM_TRAMOS.filter(t => tramos.indexOf(t.id) >= 0).map(t => t.label).join(' + ')
    : null;
  const subs = React.useMemo(() => window.mmSubsecciones(letra), [letra]);
  const subSel = cnae != null ? subs.find(s => s.cnae === cnae) : null;
  const lista = React.useMemo(() => {
    let l = tramos.length ? deSec.filter(e => tramos.indexOf(e.tramo) >= 0) : deSec;
    if (cnae != null) l = l.filter(e => e.cnae === cnae);
    l = l.slice();
    l.sort((a, b) => {
      const x = ord.get(a), y = ord.get(b);
      if (x == null) return 1; if (y == null) return -1;
      if (typeof x === 'string') return dir * x.localeCompare(y, 'es');
      // dir −1 es descendente en las dos ramas: la flecha significa lo mismo
      // en la columna de texto y en las numéricas.
      return dir * (x - y);
    });
    return l;
  }, [deSec, orden, dir, tramos, cnae]);
  React.useEffect(() => { setN(40); }, [letra, orden, dir, tramos, cnae]);
  React.useEffect(() => { setCnae(null); setVerTodos(false); }, [letra]);
  const maxSec = {
    n: Math.max(...secciones.map(s => s.n), 1),
    prospected: Math.max(...secciones.map(s => s.prospected), 1),
    contactos: Math.max(...secciones.map(s => s.contactos), 1),
    clientes: Math.max(...secciones.map(s => s.clientes), 1),
    encajeA: Math.max(...secciones.map(s => s.encajeA), 1),
  };

  return (
    <div className="mm bk" data-screen-label="02 Mid Market">
      <div className="bk-head">
        <div>
          <h1 className="bk-h1">Mid Market · foco por sección CNAE</h1>
          <div className="bk-sub">De las <b>{mmN(tot.n)} sociedades</b> de Mid Market que cobran a más de 30 días, <b>{mmN(tot.encajeA)}</b> son de <b>encaje A</b> —{window.MM_ENCAJE_DEF}—: {mmP(tot.encajeApct)} del fichero, {mmEur(tot.encajeAdeu)} de deudores y {mmEur(tot.encajeAnof)} de NOF. De esas tenemos {mmN(tot.encajeAcli)} como clientes, un {mmP(tot.cuotaA, 2)} de cuota sobre el mercado que de verdad encaja. {window.MM_META.aviso} Se mira por sección de la CNAE porque el circulante no se comporta igual en industria que en comercio: la misma venta necesita el doble de financiación según de qué letra hablemos.</div>
        </div>
        <div className="mm-tot">
          {[{ t:'Universo del fichero', r:tot, cli:tot.clientes, cuota:tot.cuota, cls:'' },
            { t:'Solo encaje A', r:totA, cli:tot.encajeAcli, cuota:tot.cuotaA, cls:' mm-tot-a' }].map(g => (
            <div className={'mm-tot-g' + g.cls} key={g.t}>
              <div className="mm-tot-t">{g.t}<em>{mmN(g.r.n)} sociedades · {mmP(g.r.n / tot.n)} del fichero</em></div>
              <div className="mm-tot-k">
                <div><b className="mono">{mmN(g.r.n)}</b><span>empresas</span></div>
                <div><b className="mono">{mmEur(g.r.ven)}</b><span>ventas</span></div>
                <div><b className="mono">{mmEur(g.r.deu)}</b><span>deudores</span></div>
                <div><b className="mono">{mmEur(g.r.nof)}</b><span>NOF</span></div>
                <div><b className="mono">{mmP(g.r.nofPctMed)}</b><span>NOF / ventas</span></div>
                <div><b className="mono">{mmN(g.r.pmcMed)} d</b><span>periodo de cobro</span></div>
                <div><b className="mono">{mmSig(g.r.crecMed)}</b><span>crecimiento</span></div>
                <div><b className="mono">{mmP(g.r.margenMed)}</b><span>margen EBITDA</span></div>
                <div><b className="mono">{mmX(g.r.dfEbitdaMed)}</b><span>deuda / EBITDA</span></div>
                <div><b className="mono">{mmP(g.r.pnPctMed)}</b><span>patrimonio neto</span></div>
                <div><b className="mono">{mmN(g.cli)}</b><span>clientes</span></div>
                <div><b className="mono">{mmP(g.cuota, 2)}</b><span>market share</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== COMPARATIVO DE SECCIONES ===== */}
      <section className="bk-block">
        <div className="bk-bh">
          <span className="bk-chip">Dónde está el mercado y dónde está el circulante</span>
          <span className="bk-bh-d">Las {secciones.length} secciones con empresas en el fichero, ordenadas por número de sociedades. Cada fila lleva su NOF bajo la letra y cinco barras: empresas, prospectadas, contactos con deal, clientes y <b>encaje A</b> — {window.MM_ENCAJE_DEF}. Donde el NOF es grande y las tres barras comerciales están planas, hay mercado sin trabajar — que es lo que este bloque busca enseñar.</span>
          <span className="bk-bh-k mono">{mmEur(tot.nof)} de NOF</span>
        </div>
        <div className="ob-lv mm-lv">
          <label>Sección</label>
          <div className="bk-fg">
            <button className={letra === 'todas' ? 'on' : ''} onClick={() => setLetra('todas')}>Todas las secciones · {mmN(tot.n)}</button>
            {secSel && <button className="on" onClick={() => setLetra('todas')}>{secSel.id} · {secSel.label} ✕</button>}
          </div>
          <span className="ob-lv-n">Clicar una fila filtra el resto de la pestaña por esa sección; volver a clicarla —o pulsar «todas»— desfiltra y la tabla vuelve a las {mmN(tot.n)} sociedades.</span>
        </div>
        <div className="mm-secs">
          {secciones.map(s => (
            <MmFila key={s.id} code={s.id} nombre={s.label} r={s} max={maxSec} pago={window.mmPago(s.id)}
              on={letra === s.id} onClick={() => setLetra(letra === s.id ? 'todas' : s.id)}/>
          ))}
        </div>
        <div className="bk-bn">
Bajo las barras comerciales, los <b>métodos de cobro de la cartera</b> de esa sección —transferencia, confirming, pagaré, TPV y giro—, cada uno sobre el 100% de su cartera, más la parte ya cedida a un tercero: sale de la muestra de carteras de nuestro propio pipeline agrupada por sector —no de este fichero— y decide qué parte del deudor es cedible. Debajo, el perfil de la cartera: <b>% B2B</b> —todo lo que no se cobra por TPV, porque el TPV es consumidor final y ahí no hay factura que ceder—, <b>% nacional</b>, <b>% UE y resto</b>, el <b>% recurrente</b> —cartera que factura al mismo deudor mes a mes, del mismo muestreo de deals— y el <b>ticket mensual</b>, que es la facturación de un mes en la mediana de la fila y la unidad con la que se dimensiona la línea. Cada barra se escala contra el máximo de su propia métrica, no entre ellas: con {mmN(tot.clientes)} clientes en todo el fichero, una escala común los dejaría invisibles. En el conjunto son {mmN(tot.clientes)} clientes y {mmN(tot.contactos)} contactos sobre {mmN(tot.n)} sociedades — <b>{mmP(tot.cobertura, 1)}</b> de cobertura—, así que el cuello está en llamar, no en cerrar.
        </div>
      </section>

      {/* ===== SECCIÓN ELEGIDA ===== */}
      <div className="bk-lvl-h">{secSel ? 'Sección ' + sec.id + ' · ' + sec.label : 'Todas las secciones · el fichero entero'}</div>
      <section className="bk-block" style={{'--c': sec.color}}>
        <div className="bk-bh">
          <span className="bk-chip">{secSel ? 'Resumen de la sección' : 'Resumen del fichero entero'}</span>
          <span className="bk-bh-d">{mmN(sec.n)} sociedades {secSel ? 'en la sección' : 'en el fichero'} con {mmEur(sec.ven)} de ventas y {mmEur(sec.nof)} de NOF, de las que <b>{mmN(sec.encajeA)}</b> son de encaje A —{window.MM_ENCAJE_DEF}—: {mmP(sec.encajeApct)} {secSel ? 'de la sección' : 'del fichero'}, {mmEur(sec.encajeAdeu)} en deudores y solo {mmN(sec.encajeAtoc)} impactadas alguna vez. Todo lo que va en <b>mediana</b> sale del fichero; lo que va marcado como <b>muestreo de deals</b> sale de lo que el equipo ve en su propio pipeline y describe a quién vemos, no al universo.</span>
          <span className="bk-bh-k mono">{mmN(sec.encajeA)} de encaje A</span>
        </div>
        <div className="mm-res">
          <div className="mm-res-p">
            <div className="mm-res-t">Encaje y cobertura<em>del fichero</em></div>
            <div className="mm-res-k">
              <div><b className="mono">{mmN(sec.encajeA)}</b><span>encaje A · {mmP(sec.encajeApct)}</span></div>
              <div><b className="mono">{mmEur(sec.encajeAnof)}</b><span>NOF de las A</span></div>
              <div><b className="mono">{mmP(sec.cuotaA, 2)}</b><span>cuota sobre las A</span></div>
              <div><b className="mono">{mmN(sec.activos)}</b><span>clientes activos</span></div>
              <div><b className="mono">{mmN(sec.contactos)}</b><span>con deal</span></div>
              <div><b className="mono">{mmP(sec.cobertura, 1)}</b><span>cobertura</span></div>
              <div><b className="mono">{sec.discovery ? mmP(sec.convDW) : '—'}</b><span>discovery → won</span></div>
              <div><b className="mono">{mmP(sec.churnRate)}</b><span>churn</span></div>
            </div>
          </div>
          <div className="mm-res-p">
            <div className="mm-res-t">Medianas de la tabla de empresas<em>del fichero · mediana, no media</em></div>
            <div className="mm-res-k">
              <div><b className="mono">{mmEur(sec.venMed)}</b><span>ventas</span></div>
              <div><b className="mono">{mmEur(sec.tkMesMed)}</b><span>ticket mensual</span></div>
              <div><b className="mono">{mmEur(sec.aprMed)}</b><span>aprovisionamientos</span></div>
              <div><b className="mono">{mmEur(sec.ebiMed)}</b><span>EBITDA</span></div>
              <div><b className="mono">{mmP(sec.margenMed)}</b><span>margen EBITDA</span></div>
              <div><b className="mono">{mmEur(sec.bnfMed)}</b><span>beneficio neto</span></div>
              <div><b className="mono">{mmP(sec.mgnMed, 1)}</b><span>margen neto</span></div>
              <div><b className="mono">{mmEur(sec.deuMed)}</b><span>deudores</span></div>
              <div><b className="mono">{mmEur(sec.exiMed)}</b><span>existencias</span></div>
              <div><b className="mono">{mmEur(sec.proMed)}</b><span>proveedores</span></div>
              <div><b className="mono">{mmEur(sec.nofMed)}</b><span>NOF</span></div>
              <div><b className="mono">{mmP(sec.nofPctMed)}</b><span>NOF / ventas</span></div>
              <div><b className="mono">{mmN(sec.pmcMed)} d</b><span>periodo de cobro</span></div>
              <div><b className="mono">{mmSig(sec.crecMed)}</b><span>crecimiento</span></div>
              <div><b className="mono">{mmEur(sec.dcpMed)}</b><span>deudas a corto</span></div>
              <div><b className="mono">{mmX(sec.dfEbitdaMed)}</b><span>deuda / EBITDA</span></div>
              <div><b className="mono">{mmP(sec.pnPctMed)}</b><span>patrimonio neto</span></div>
            </div>
          </div>
          {(() => {
            const p = window.mmPago(sec.id);
            if (!p) return null;
            return (
              <div className="mm-res-p">
                <div className="mm-res-t">Métodos de cobro de la cartera<em>muestreo de deals{p.propio ? '' : ' · patrón Mid Market'}</em></div>
                <div className="mm-sec-bl">
                  {MM_PAGO.map(x => (
                    <div className="mm-bar" key={x.id} title={x.label + ' · ' + mmEur(sec.deu * p.mix[x.id]) + ' de deudores'}>
                      <span>{x.label}</span>
                      <div><i style={{width: (p.mix[x.id] * 100) + '%', background: x.color}}/></div>
                      <b className="mono">{mmP(p.mix[x.id])}</b>
                    </div>
                  ))}
                  <div className="mm-bar"><span>Ya cedido</span>
                    <div><i style={{width: ((p.cedido || 0) * 100) + '%', background:'#767D8C'}}/></div>
                    <b className="mono">{mmP(p.cedido)}</b></div>
                </div>
                <div className="mm-res-k mm-res-k2">
                  <div><b className="mono">{mmP(1 - (p.mix.tpv || 0))}</b><span>B2B</span></div>
                  <div><b className="mono">{mmP(p.nacional)}</b><span>nacional</span></div>
                  <div><b className="mono">{mmP(p.nacional == null ? null : 1 - p.nacional)}</b><span>UE y resto</span></div>
                  <div><b className="mono">{mmP(window.mmRecurrente(sec.id).v)}</b><span>cartera recurrente</span></div>
                  <div><b className="mono">{mmEur(sec.deu * (1 - (p.cedido || 0)))}</b><span>deudores sin ceder</span></div>
                </div>
              </div>
            );
          })()}
          {(() => {
            const ci = window.mmCirbe(sec.id);
            return (
              <div className="mm-res-p">
                <div className="mm-res-t">Productos en CIRBE<em>muestreo de deals · cifras de ejemplo{ci.propio ? '' : ' · reparto global'}</em></div>
                <div className="mm-sec-bl">
                  {window.MM_CIRBE_PROD.map(x => (
                    <div className="mm-bar" key={x.id} title={x.desc}>
                      <span>{x.label}</span>
                      <div><i style={{width: (ci[x.id] * 100) + '%', background: x.color}}/></div>
                      <b className="mono">{mmP(ci[x.id])}</b>
                    </div>
                  ))}
                </div>
                <div className="mm-res-k mm-res-k2">
                  <div><b className="mono" style={{color:'#8E6E2A'}}>{mmP(ci.alt)}</b><span>alternativo</span></div>
                  <div><b className="mono" style={{color:'#8E6E2A'}}>{mmP(ci.altFactoring)}</b><span>factoring del alternativo</span></div>
                  <div><b className="mono">{mmP(ci.factoring + ci.anticipo)}</b><span>ya en circulante cedible</span></div>
                </div>
              </div>
            );
          })()}
        </div>
        <div className="bk-bn">
          <b>Qué es medición y qué no.</b> Las medianas, el encaje A y la cobertura salen del fichero y del cruce con el CRM. Los <b>métodos de cobro</b> y los <b>productos en CIRBE</b> van marcados como muestreo de deals: los primeros salen de las carteras que el equipo ve en documentación, agrupadas por sector; los segundos son cifras de ejemplo declaradas: {window.MM_CIRBE_META.aviso}. El factoring alternativo está <b>dentro</b> de la barra de factoring, no se suma. La <b>NOF neta</b> {secSel ? 'de la sección' : 'del fichero'} es {mmEur(sec.nof)} − {mmEur(sec.dcp)} = <b>{mmEur(sec.nofNeta)}</b>, con la salvedad de que la línea de corto incluye deuda no bancaria.
        </div>
      </section>

      {/* ===== SUB-CNAE DE LA SECCIÓN ===== */}
      {(() => {
        const vis = verTodos ? subs : subs.slice(0, 12);
        const maxSub = {
          n: Math.max(...subs.map(s => s.n), 1),
          prospected: Math.max(...subs.map(s => s.prospected), 1),
          contactos: Math.max(...subs.map(s => s.contactos), 1),
          clientes: Math.max(...subs.map(s => s.clientes), 1),
          encajeA: Math.max(...subs.map(s => s.encajeA), 1),
        };
        return (
          <section className="bk-block" style={{'--c': sec.color}}>
            <div className="bk-bh">
              <span className="bk-chip">{secSel ? 'Dentro de ' + sec.id : 'Todas las secciones'} · clases CNAE</span>
              <span className="bk-bh-d">Las {mmN(subs.length)} clases CNAE {secSel ? 'de la sección' : 'del fichero'}, con la misma lectura: NOF bajo el código y cinco barras — empresas, prospectadas, contactos, clientes y encaje A. Es el nivel al que se decide a quién llamar: dentro de una misma letra hay actividades que financian tres veces más circulante por euro vendido que sus vecinas. Clica una clase para filtrar la tabla.</span>
              <span className="bk-bh-k mono">{mmN(subs.length)} clases</span>
            </div>
            {(() => {
              const p = window.mmPago(letra);
              if (!p) return null;
              return (
                <div className="mm-pago mm-pago-h">
                  <div className="mm-pago-t">Mezcla de cobro {secSel ? 'de la sección ' + sec.id : 'del fichero'} · muestra de nuestro pipeline · la misma para todas sus clases{p.propio ? '' : ' · patrón Mid Market, la letra no tiene el suyo'}</div>
                  <div className="mm-sec-bl mm-pago-g">
                    {MM_PAGO.map(x => (
                      <div className="mm-bar" key={x.id} title={x.label + ' · ' + mmP(p.mix[x.id]) + ' · ' + mmEur(sec.deu * p.mix[x.id]) + ' de deudores'}>
                        <span>{x.label}</span>
                        <div><i style={{width: (p.mix[x.id] * 100) + '%', background: x.color}}/></div>
                        <b className="mono">{mmP(p.mix[x.id])}</b>
                      </div>
                    ))}
                    <div className="mm-bar">
                      <span>Ya cedido</span>
                      <div><i style={{width: ((p.cedido || 0) * 100) + '%', background:'#767D8C'}}/></div>
                      <b className="mono">{mmP(p.cedido)}</b>
                    </div>
                  </div>
                </div>
              );
            })()}
            <div className="mm-secs sub">
              {vis.map(s => (
                <MmFila key={s.cnae} sub code={s.cnae || '—'} nombre={s.lit} r={s} max={maxSub}
                  on={cnae === s.cnae} onClick={() => setCnae(cnae === s.cnae ? null : s.cnae)}/>
              ))}
            </div>
            <div className="bk-bn">
Las barras se escalan contra el máximo {secSel ? 'de la sección' : 'del conjunto'}, cada métrica con la suya. La mezcla de cobro va una sola vez arriba y no por fila: el patrón está declarado a nivel de sección, así que dentro de la letra sería el mismo dato repetido. Donde hay NOF y la barra de prospectadas está vacía, el problema no es de conversión: es que nadie ha llamado.
            </div>
            {subs.length > 12 && (
              <div className="mm-mas"><button onClick={() => setVerTodos(!verTodos)}>
                {verTodos ? 'Ver solo las 12 primeras' : 'Ver las ' + mmN(subs.length - 12) + ' clases restantes'}
              </button></div>
            )}
            {subSel && (
              <div className="bk-bn">
                <b>{subSel.cnae} · {subSel.lit}.</b> {mmN(subSel.n)} sociedades, {mmEur(subSel.ven)} de ventas y {mmEur(subSel.nof)} de NOF — {mmP(subSel.nofPctMed)} de las ventas en mediana, con cobro a {mmN(subSel.pmcMed)} días, margen EBITDA de {mmP(subSel.margenMed)} y crecimiento de {mmSig(subSel.crecMed)}. La tabla de abajo está filtrada por esta clase.
              </div>
            )}
          </section>
        );
      })()}

      {/* ===== TABLA DE EMPRESAS ===== */}
      <div className="ob-lv">
        <label>Facturación</label>
        <div className="bk-fg wrap">
          <button className={!tramos.length ? 'on' : ''} onClick={() => setTramos([])}>Todas · {mmN(porTramo.todos)}</button>
          {window.MM_TRAMOS.map(t => (
            <button key={t.id} className={tramos.indexOf(t.id) >= 0 ? 'on' : ''} onClick={() => toggleTramo(t.id)} disabled={!porTramo[t.id]}
              title={t.seg + ' · ' + t.label + ' · se pueden marcar varios'}>{t.label} · {mmN(porTramo[t.id])}</button>
          ))}
        </div>
        <span className="ob-lv-n">Se pueden marcar varios rangos a la vez; sin ninguno marcado entran todas. Los rangos no son de amplitud constante: siguen la distribución del fichero, que se amontona abajo — un tercio de las sociedades factura entre 20M€ y 30M€ y solo {mmN(nBig)} en todo el fichero pasan de 2B€. Los cinco primeros tramos son Mid Market, los tres siguientes Corporate y el último Big Corporate. Filtran la tabla; el resumen de arriba sigue siendo {secSel ? 'de la sección entera' : 'del fichero entero'}.</span>
      </div>
      <div className="ob-lv">
        <label>Ordenar por</label>
        <div className="bk-fg">
          {MM_ORDEN.map(o => (
            <button key={o.id} className={orden === o.id ? 'on' : ''} onClick={() => { setOrden(o.id); setDir(-1); }}>{o.label}</button>
          ))}
        </div>
        <span className="ob-lv-n">También se ordena clicando la cabecera de cualquier columna, y volviendo a clicarla se invierte. {mmN(lista.length)} sociedades{tramoL ? ' de ' + tramoL + ' de ventas' : ''} en {subSel ? 'la clase ' + subSel.cnae : secSel ? 'la sección ' + sec.id : 'el fichero entero'}. Se muestran las {Math.min(n, lista.length)} primeras por {ord.label.toLowerCase()}.</span>
      </div>
      <div className="bk-lvl2">
        <div className="bk-scroll">
          <table className="bk-table mm-t">
            <thead><tr>
              {MM_COLS_T.map(col => (
                <th key={col.id} className={(col.txt ? '' : 'num ') + (col.grp ? 'grp ' : '') + 'mm-th' + (orden === col.id ? ' on' : '')}
                  onClick={() => porCol(col.id)} title={'Ordenar por ' + col.label.toLowerCase()}>
                  {col.label}{orden === col.id && <i className="mm-th-a">{dir === -1 ? '▼' : '▲'}</i>}
                  {col.sub && <em className="cap-th-e">{col.sub}</em>}
                </th>
              ))}
            </tr></thead>
            <tbody>
              {lista.slice(0, n).map(e => (
                <tr key={e.nif}>
                  <td className="bk-nom"><b>{e.nom}</b><em>{[secSel ? null : e.letra, e.loc, e.lit].filter(Boolean).join(' · ')}</em></td>
                  <td className="num mono"><b>{mmEur(e.ven)}</b>
                    <em className="mm-sub" style={{color: e.crec == null ? undefined : e.crec >= 0 ? '#1F5C42' : '#B23A3A'}}>{mmSig(e.crec)}</em></td>
                  <td className="num mono">{e.apr ? mmEur(e.apr) : <span className="bk-none">—</span>}
                    <em className="mm-sub">{e.apr && e.ven ? mmP(e.apr / e.ven) + ' ventas' : ''}</em></td>
                  <td className="num mono">{e.ebi > 0 ? mmEur(e.ebi)
                    : <span className="k-ach" style={{'--c':'#B23A3A'}}>{mmEur(e.ebi)}</span>}
                    <em className="mm-sub">{e.ven ? mmP(e.margen, 1) + ' margen' : ''}</em></td>
                  <td className="num mono">{e.bnf == null ? <span className="bk-none">—</span>
                    : e.bnf >= 0 ? mmEur(e.bnf)
                    : <span className="k-ach" style={{'--c':'#B23A3A'}}>{mmEur(e.bnf)}</span>}
                    <em className="mm-sub">{e.mgn == null ? '' : mmP(e.mgn, 1) + ' s/ ventas'}</em></td>
                  <td className="num mono grp">{mmEur(e.deu)}<em className="mm-sub">{e.pmc != null ? mmN(e.pmc) + ' d' : ''}</em></td>
                  <td className="num mono">{mmEur(e.exi)}</td>
                  <td className="num mono">{mmEur(e.pro)}</td>
                  <td className="num mono"><b>{mmEur(e.nof)}</b></td>
                  <td className="num mono">{mmEur(e.dcp)}</td>
                  <td className="num mono grp">{e.nofPct == null ? <span className="bk-none">—</span>
                    : <span className="k-ach" style={{'--c': e.nofPct >= 0.35 ? '#1F5C42' : e.nofPct >= 0.15 ? '#B8731F' : '#B23A3A'}}>{mmP(e.nofPct)}</span>}</td>
                  <td className="num mono">{e.crec == null ? <span className="bk-none">—</span>
                    : <span className="k-ach" style={{'--c': e.crec >= 0.1 ? '#1F5C42' : e.crec >= 0 ? '#B8731F' : '#B23A3A'}}>{mmSig(e.crec)}</span>}</td>
                  <td className="num mono">{e.dfEbitda == null ? <span className="bk-none">sin EBITDA</span>
                    : e.sinDeuda ? <span className="k-ach" style={{'--c':'#1F5C42'}}>sin deuda</span>
                    : e.dfEbitda < 0.01 ? <span className="k-ach" style={{'--c':'#1F5C42'}}>&lt;0,01</span>
                    : <span className="k-ach" style={{'--c': e.dfEbitda <= 2 ? '#1F5C42' : e.dfEbitda <= 4 ? '#B8731F' : '#B23A3A'}}>{mmX(e.dfEbitda)}</span>}</td>
                  <td className="num mono">{e.pnPct == null ? <span className="bk-none">—</span>
                    : <span className="k-ach" style={{'--c': e.pnPct >= 0.35 ? '#1F5C42' : e.pnPct >= 0.2 ? '#B8731F' : '#B23A3A'}}>{mmP(e.pnPct)}</span>}</td>
                </tr>
              ))}
              {(() => {
                const sum = (f) => lista.reduce((a, e) => a + (f(e) || 0), 0);
                const med = (f) => window.mmMediana(lista.map(f));
                return (
                  <tr className="bk-row-tot">
                    <td>{subSel ? 'Clase ' + subSel.cnae : tramoL ? 'Ventas ' + tramoL : secSel ? 'Sección ' + sec.id : 'Todas las secciones'}
                      <em className="ap-pop">{mmN(lista.length)} sociedades</em></td>
                    <td className="num mono">{mmEur(sum(e => e.ven))}<em className="mm-sub">{mmSig(med(e => e.crec))}</em></td>
                    <td className="num mono">{mmEur(sum(e => e.apr))}<em className="mm-sub">{mmP(sum(e => e.ven) ? sum(e => e.apr) / sum(e => e.ven) : null)} ventas</em></td>
                    <td className="num mono">{mmEur(sum(e => e.ebi))}<em className="mm-sub">{mmP(med(e => e.margen), 1)} margen</em></td>
                    <td className="num mono">{mmEur(sum(e => e.bnf))}<em className="mm-sub">{mmP(med(e => e.mgn), 1)} s/ ventas</em></td>
                    <td className="num mono grp">{mmEur(sum(e => e.deu))}</td>
                    <td className="num mono">{mmEur(sum(e => e.exi))}</td>
                    <td className="num mono">{mmEur(sum(e => e.pro))}</td>
                    <td className="num mono">{mmEur(sum(e => e.nof))}</td>
                    <td className="num mono">{mmEur(sum(e => e.dcp))}</td>
                    <td className="num mono grp">{mmP(med(e => e.nofPct))}</td>
                    <td className="num mono">{mmSig(med(e => e.crec))}</td>
                    <td className="num mono">{mmX(med(e => e.dfEbitda))}</td>
                    <td className="num mono">{mmP(med(e => e.pnPct))}</td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
        {n < lista.length && (
          <div className="mm-mas"><button onClick={() => setN(n + 60)}>Ver {Math.min(60, lista.length - n)} más de {mmN(lista.length - n)} restantes</button></div>
        )}
        <div className="bk-lvl2-n">
          <b>NOF</b> = deudores + existencias − proveedores, el circulante que la empresa tiene que financiar sí o sí. <b>Deudas a corto</b> es la línea de balance del fichero, que incluye deuda no bancaria. <b>Deuda / EBITDA</b> suma deuda a corto y a largo del último ejercicio —esa suma es la que cuadra con el balance, no la columna de deudas financieras del fichero—; por encima de 4× la operación no pasa riesgos salvo con garantía adicional, y sin EBITDA positivo no hay ratio que calcular. El <b>patrimonio neto</b> va en porcentaje sobre el activo total: por debajo del 20% la estructura está tensionada y la línea tendrá que ser más corta. La tabla va en tres bloques: <b>resultado</b> —ventas con su crecimiento, aprovisionamientos y EBITDA con su margen—, <b>circulante</b> —las tres partidas, la NOF y las deudas a corto— y <b>encaje</b> —NOF sobre ventas, crecimiento, apalancamiento y patrimonio—, que son las cuatro que deciden si la operación entra. El crecimiento se repite a propósito: bajo las ventas explica la cifra y en el bloque de encaje es criterio de selección.
        </div>
      </div>
      <div className="bk-foot">
        {window.MM_META.fuente}. {window.MM_META.avisoDeuda} Importes en {window.MM_META.unidad}, tal como vienen del fichero, con el último ejercicio disponible de cada sociedad — que no es el mismo año para todas. Los aprovisionamientos vienen con signo negativo en origen y aquí se muestran en valor absoluto. La sección CNAE se deriva de la división del código primario, así que una empresa con actividad mixta cuenta entera en la letra de su CNAE principal.
      </div>
    </div>
  );
};
