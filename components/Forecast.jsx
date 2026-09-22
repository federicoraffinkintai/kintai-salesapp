// Forecast oct-nov-dic 2026 sobre el pipeline de new business de Àlex Mitjavila.
// Dos capas: lo que HubSpot declara y lo que el ciclo real de cada etapa permite firmar;
// y sobre la firma, la disposición, que es lo único que entra en loanbook.
const fcM = (v) => (v / 1e6).toFixed(2).replace('.', ',') + 'M€';
const fcM1 = (v) => (v / 1e6).toFixed(1).replace('.', ',') + 'M€';
const fcK = (v) => Math.round(v / 1e3) + 'k€';
const fcP = (v) => Math.round(v * 100) + '%';
const fcN1 = (v) => v.toFixed(1).replace('.', ',');

const FC_ST = {
  'CONTRACT NEGOCIATION': { cy: 0.5, wr: 0.85, lab: 'Contrato', c: '#2E7D5B' },
  'DATA GATHERING': { cy: 1.0, wr: 0.60, lab: 'Activación', c: '#4F9E78' },
  'RISK ANALYSIS': { cy: 1.5, wr: 0.40, lab: 'Riesgo', c: '#8E6E2A' },
  'NEGOCIATION': { cy: 2.0, wr: 0.30, lab: 'Negociación', c: '#C8A24C' },
  'PRIMARY INFORMATION': { cy: 3.5, wr: 0.16, lab: 'Info primaria', c: '#4054A8' },
  'DISCOVERY': { cy: 4.5, wr: 0.10, lab: 'Discovery', c: '#6E7A9E' },
  'NEW DEAL': { cy: 6.0, wr: 0.05, lab: 'New deal', c: '#9AA3B5' },
};
const FC_ORD = ['CONTRACT NEGOCIATION', 'DATA GATHERING', 'RISK ANALYSIS', 'NEGOCIATION', 'PRIMARY INFORMATION', 'DISCOVERY', 'NEW DEAL'];
const FC_SC = {
  prudente: { wr: 0.7, draw: 0.18, d: 'Win rate de etapa un 30% por debajo y primera disposición del 18% de la línea' },
  base: { wr: 1, draw: 0.25, d: 'Win rate por etapa calibrado con el 35,7% histórico de cierre y primera disposición del 25%' },
  optimista: { wr: 1.25, draw: 0.35, d: 'Win rate un 25% por encima (techo 95%) y primera disposición del 35%' },
};
const FC_MES = [{ m: 1, k: 'Octubre' }, { m: 2, k: 'Noviembre' }, { m: 3, k: 'Diciembre' }];

// sep-26 = 0. Fecha sin año: mes >= 9 es 2026, mes < 9 es 2027 (ya pasó).
function fcMidx(d) {
  if (!d) return 99;
  const p = d.split('/'), mm = +p[1];
  const yy = p[2] ? (+p[2] < 100 ? 2000 + +p[2] : +p[2]) : (mm >= 9 ? 2026 : 2027);
  return (yy - 2026) * 12 + (mm - 9);
}

window.Forecast = function Forecast() {
  const [sc, setSc] = React.useState('base');
  const [openM, setOpenM] = React.useState(1);
  const S = FC_SC[sc];

  const D = React.useMemo(() => {
    const rows = window.FC_PIPE.map(r => {
      const st = FC_ST[r.stage];
      const m = fcMidx(r.date);
      const wr = Math.min(0.95, st.wr * S.wr);
      // el mes realista de firma no puede ser antes de que el ciclo de la etapa termine
      const mReal = Math.max(m === 99 ? 6 : m, Math.round(0.3 + st.cy));
      const first = r.act || r.amt * S.draw;
      return { ...r, st, m, mReal, wr, pond: r.amt * r.prob, firma: r.amt * wr, first, slip: m <= 3 && m !== 99 && mReal > 3 };
    });
    const mes = FC_MES.map(({ m, k }) => {
      const hs = rows.filter(r => r.m === m), cal = rows.filter(r => r.mReal === m);
      return {
        m, k,
        hsN: hs.length, hsBruto: hs.reduce((a, r) => a + r.amt, 0), hsPond: hs.reduce((a, r) => a + r.pond, 0),
        calN: cal.length, calBruto: cal.reduce((a, r) => a + r.amt, 0), firma: cal.reduce((a, r) => a + r.firma, 0),
        cli: cal.reduce((a, r) => a + r.wr, 0), deals: cal.slice().sort((a, b) => b.firma - a.firma),
      };
    });
    // disposición: primera operación el mes siguiente a la firma, 15% extra de línea al segundo mes
    const draw = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rows.forEach(r => {
      if (draw[r.mReal + 1] != null) draw[r.mReal + 1] += r.first * r.wr;
      if (draw[r.mReal + 2] != null) draw[r.mReal + 2] += r.amt * 0.15 * r.wr;
    });
    mes.forEach(x => x.disp = draw[x.m]);
    const q4 = rows.filter(r => r.mReal >= 1 && r.mReal <= 3);
    const etapas = FC_ORD.map(k => {
      const all = rows.filter(r => r.stage === k), inQ4 = q4.filter(r => r.stage === k);
      return { k, lab: FC_ST[k].lab, c: FC_ST[k].c, cy: FC_ST[k].cy, wr: Math.min(0.95, FC_ST[k].wr * S.wr),
        prob: all.reduce((a, r) => a + r.prob, 0) / all.length, n: all.length, bruto: all.reduce((a, r) => a + r.amt, 0),
        nQ4: inQ4.length, firmaQ4: inQ4.reduce((a, r) => a + r.firma, 0) };
    });
    const act = rows.filter(r => r.act > 0 && r.mReal <= 3).sort((a, b) => b.act - a.act);
    return {
      rows, mes, etapas, act,
      total: rows.reduce((a, r) => a + r.amt, 0), n: rows.length,
      y27: rows.filter(r => r.m > 3 && r.m !== 99),
      q4Firma: q4.reduce((a, r) => a + r.firma, 0), q4Cli: q4.reduce((a, r) => a + r.wr, 0), q4N: q4.length,
      q4Disp: draw[1] + draw[2] + draw[3], cola27: draw[4] + draw[5],
      slip: rows.filter(r => r.slip),
      park: rows.filter(r => r.date === '31/12'),
      hsPond: mes.reduce((a, x) => a + x.hsPond, 0), hsN: mes.reduce((a, x) => a + x.hsN, 0),
    };
  }, [sc]);

  const maxBar = Math.max.apply(null, D.mes.map(x => x.hsBruto));
  const openMes = D.mes.find(x => x.m === openM);

  return (
    <div className="fc">
      <div className="bk-lvl-h">Forecast oct · nov · dic 2026 — pipeline Àlex Mitjavila</div>
      <div className="bdr-note">
        {D.n} deals abiertos de Àlex Mitjavila, {fcM1(D.total)} de importe solicitado. El forecast se construye en dos capas, porque para el loanbook
        no cuenta lo que se firma sino lo que se dispone: <b>línea firmada</b> (el deal cierra) y <b>disposición</b> (el cliente saca dinero).
        Es exactamente la brecha que explicó el desvío de 2026: 35 líneas nuevas firmadas y cero disposición.
      </div>

      <div className="fc-sc">
        <div className="bk-fg">
          {Object.keys(FC_SC).map(k => (
            <button key={k} className={sc === k ? 'on' : ''} onClick={() => setSc(k)}>{k[0].toUpperCase() + k.slice(1)}</button>
          ))}
        </div>
        <em>{S.d}</em>
      </div>

      <div className="cv">
        <div className="cv-chain">
          <div className="cv-ch"><b>{fcM1(D.total)}</b><span>Pipeline total abierto · {D.n} deals</span></div>
          <div className="cv-op">→</div>
          <div className="cv-ch bad"><b>{fcM(D.hsPond)}</b><span>Q4 ponderado HubSpot · {D.hsN} deals</span></div>
          <div className="cv-op alt">→</div>
          <div className="cv-ch"><b>{fcM(D.q4Firma)}</b><span>Línea firmada Q4 · {D.q4Cli.toFixed(0)} clientes</span></div>
          <div className="cv-op">→</div>
          <div className="cv-ch accent"><b>{fcM(D.q4Disp)}</b><span>Disposición dentro de 2026</span></div>
        </div>
        <div className="cv-note">
          El embudo pierde dos veces. Primero por <b>calendario</b>: {D.slip.length} deals con cierre declarado en Q4 están en una etapa cuyo ciclo
          no llega a diciembre, y salen del trimestre. Después por <b>disposición</b>: de {fcM(D.q4Firma)} de línea firmada sólo {fcM(D.q4Disp)} se
          convierte en saldo antes de cerrar el año, y quedan {fcM(D.cola27)} de cola para enero-febrero.
        </div>
      </div>

      <div className="bk-lvl-h sub">Mes a mes</div>
      <div className="fc-leg">
        <div><b>Pipeline del mes</b> — todos los deals cuya fecha de cierre en HubSpot cae en ese mes, con su importe solicitado y el ponderado por la probabilidad oficial. Es la foto declarada, sin filtrar.</div>
        <div><b>Clientes cerrados</b> e <b>importe esperado</b> — los clientes que firman ese mes y la línea que traen, según el ciclo que le falta a cada etapa y su tasa de cierre. Un deal declarado en diciembre pero todavía en Info primaria no firma en diciembre: aparece más adelante.</div>
        <div><b>Disposición</b> — de las líneas firmadas, cuánto dinero sale de verdad ese mes. Es lo único que entra en loanbook.</div>
      </div>
      <div className="cv">
        <table className="bk-table fc-mm">
          <thead>
            <tr className="fc-h1">
              <th rowSpan="2">Mes</th>
              <th className="num grp">Pipeline del mes<em className="bdr-th-sub">lo que declara HubSpot</em></th>
              <th className="num grp" colSpan="2">Forecast calibrado por ciclo de etapa</th>
              <th className="num grp">Loanbook</th>
            </tr>
            <tr>
              <th className="num grp">Importe<em className="bdr-th-sub">deals · ponderado</em></th>
              <th className="num grp">Clientes cerrados</th><th className="num">Importe esperado</th>
              <th className="num grp">Disposición</th>
            </tr>
          </thead>
          <tbody>
            {D.mes.map(x => (
              <tr key={x.m} className={openM === x.m ? 'fc-on' : ''} onClick={() => setOpenM(x.m)}>
                <td><b>{x.k}</b></td>
                <td className="num mono muted grp"><span className="cv-two"><b>{fcM1(x.hsBruto)}</b><em>{x.hsN} deals · pond. {fcM(x.hsPond)}</em></span></td>
                <td className="num mono grp">{fcN1(x.cli)}</td>
                <td className="num mono"><b>{fcM(x.firma)}</b></td>
                <td className="num mono grp fc-disp">{x.disp ? fcM(x.disp) : '—'}</td>
              </tr>
            ))}
            <tr className="fc-tot">
              <td><b>Q4 2026</b></td>
              <td className="num mono grp"><span className="cv-two"><b>{fcM1(D.mes.reduce((a, x) => a + x.hsBruto, 0))}</b><em>{D.hsN} deals · pond. {fcM(D.hsPond)}</em></span></td>
              <td className="num mono grp"><b>{fcN1(D.q4Cli)}</b></td>
              <td className="num mono"><b>{fcM(D.q4Firma)}</b></td>
              <td className="num mono grp fc-disp"><b>{fcM(D.q4Disp)}</b></td>
            </tr>
          </tbody>
        </table>
        <div className="cv-note">
          Octubre es casi todo <b>activación</b>: la cartera de deals en DATA GATHERING más Pangealand, el único contrato en negociación.
          Noviembre y diciembre viven de <b>negociación</b>, que es la etapa con más volumen y sólo {fcP(D.etapas.find(e => e.k === 'NEGOCIATION').wr)} de cierre.
          La disposición arranca en noviembre porque la primera operación nunca sale el mismo mes de la firma: KYC, cesión y verificación de deudores comen entre tres y seis semanas.
Los deals declarados y los que cierran no son los mismos: a la izquierda un deal cuenta en el mes que dice HubSpot; a la derecha, en el mes en que su etapa permite firmarlo.
        </div>
      </div>

      <div className="bk-lvl-h sub">Por qué el declarado no sirve: el 31/12 es un aparcadero</div>
      <div className="fc-park">
        <div className="fc-pk">
          <div className="fc-pk-n mono">{D.park.length}</div>
          <div className="fc-pk-k">deals con cierre 31/12</div>
          <div className="fc-pk-d">{fcM1(D.park.reduce((a, r) => a + r.amt, 0))} de importe, el {Math.round(D.park.length / D.n * 100)}% del pipeline entero con la misma fecha</div>
        </div>
        <div className="fc-pk">
          <div className="fc-pk-n mono">{D.park.filter(r => ['PRIMARY INFORMATION', 'DISCOVERY', 'NEW DEAL'].includes(r.stage)).length}</div>
          <div className="fc-pk-k">de ellos sin contacto comercial real</div>
          <div className="fc-pk-d">En New deal, Discovery o Info primaria: no hay análisis de riesgo ni propuesta, así que no cierran en 10 semanas</div>
        </div>
        <div className="fc-pk">
          <div className="fc-pk-n mono">{D.y27.length}</div>
          <div className="fc-pk-k">deals ya declarados en 2027</div>
          <div className="fc-pk-d">El {Math.round(D.y27.length / D.n * 100)}% del pipeline; {fcM1(D.y27.reduce((a, r) => a + r.amt, 0))} que no tocan el cierre de este año</div>
        </div>
      </div>

      <div className="bk-lvl-h sub">Supuestos por etapa</div>
      <div className="cv">
        <table className="bk-table">
          <thead><tr>
            <th>Etapa</th><th className="num">Deals</th><th className="num">Importe</th>
            <th className="num grp">Prob. HS</th><th className="num">Win rate</th><th className="num">Ciclo</th>
            <th className="num grp">En Q4</th><th className="num">Línea firmada Q4</th>
          </tr></thead>
          <tbody>
            {D.etapas.map(e => (
              <tr key={e.k}>
                <td><span className="bk-dot" style={{ background: e.c }}/><b>{e.lab}</b></td>
                <td className="num mono">{e.n}</td>
                <td className="num mono">{fcM1(e.bruto)}</td>
                <td className="num mono muted grp">{fcP(e.prob)}</td>
                <td className="num mono">{fcP(e.wr)}</td>
                <td className="num mono muted">{fcN1(e.cy)} m</td>
                <td className="num mono grp">{e.nQ4 || '—'}</td>
                <td className="num mono">{e.firmaQ4 ? fcM(e.firmaQ4) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cv-note">
          Las probabilidades de HubSpot no son el problema: en agregado se parecen al win rate real por etapa. El problema es que están asignadas
          a una <b>fecha</b> que ignora el ciclo. Por eso el modelo no toca la probabilidad de etapa y sí reubica el mes: cada deal firma, como muy pronto,
          cuando su etapa da de sí. Nada en Info primaria, Discovery o New deal firma dentro de 2026.
        </div>
      </div>

      <div className="bk-lvl-h sub">Lo único que mueve octubre: {D.act.length} activaciones con primera operación acordada</div>
      <div className="cv">
        <table className="bk-table">
          <thead><tr><th>Cliente</th><th>Segmento</th><th>Etapa</th><th className="num">Línea</th><th className="num">Primera op.</th><th>Bloqueo</th></tr></thead>
          <tbody>
            {D.act.map(r => (
              <tr key={r.co}>
                <td><b>{r.co}</b></td>
                <td className="muted">{r.seg}</td>
                <td><span className="fc-tag" style={{ '--c': r.st.c }}>{r.st.lab}</span> <em className="fc-date">{r.date}</em></td>
                <td className="num mono">{fcK(r.amt)}</td>
                <td className="num mono"><b>{fcK(r.act)}</b></td>
                <td className="fc-com">{r.com || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cv-note">
          {fcK(D.act.reduce((a, r) => a + r.act, 0))} de primeras operaciones comprometidas, y casi todas paradas por lo mismo:
          <b> facturas pendientes de aportar, Sefide sin abrir y deudores sin validar</b>. No es un problema de venta, es de onboarding.
          Es el bloque con mejor relación esfuerzo-resultado del trimestre y el que decide si noviembre trae disposición o no.
        </div>
      </div>

      <div className="bk-lvl-h sub">Detalle del mes</div>
      <div className="fc-tabs">
        {D.mes.map(x => (
          <button key={x.m} className={openM === x.m ? 'on' : ''} onClick={() => setOpenM(x.m)}>
            {x.k}<em>{x.calN} deals · {fcM(x.firma)}</em>
          </button>
        ))}
      </div>
      <div className="cv">
        <table className="bk-table">
          <thead><tr>
            <th>Cliente</th><th>Segmento</th><th>Etapa</th><th className="num">Fecha</th>
            <th className="num grp">Línea</th><th className="num">WR</th><th className="num">Ponderada</th><th className="num grp">1ª op.</th>
          </tr></thead>
          <tbody>
            {openMes.deals.map(r => (
              <tr key={r.co}>
                <td><b>{r.co}</b>{r.com ? <em className="fc-sub">{r.com}</em> : null}</td>
                <td className="muted">{r.seg}</td>
                <td><span className="fc-tag" style={{ '--c': r.st.c }}>{r.st.lab}</span></td>
                <td className="num mono muted">{r.date || '—'}</td>
                <td className="num mono grp">{fcK(r.amt)}</td>
                <td className="num mono muted">{fcP(r.wr)}</td>
                <td className="num mono"><b>{fcK(r.firma)}</b></td>
                <td className="num mono grp">{r.act ? fcK(r.act) : <span className="muted">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cv-note">
          {openMes.k}: {openMes.calN} deals llegan al mes, {fcM(openMes.firma)} de línea ponderada, {fcN1(openMes.cli)} clientes nuevos esperados.
          Los deals sin primera operación acordada son los que más riesgo de resbalón tienen: firma sin operación identificada es línea dormida.
        </div>
      </div>

      <div className="bk-lvl-h sub">Lectura para el cierre de año</div>
      <div className="fc-read">
        <div className="fc-rd">
          <div className="fc-rd-k">El pipeline no cierra el hueco de loanbook</div>
          <p>El puente a 50M€ cargaba <b>+18,2M€</b> en clientes nuevos. Este pipeline, con su propio ciclo, da {fcM(D.q4Firma)} de línea
          firmada y <b>{fcM(D.q4Disp)}</b> de saldo dentro de 2026. La diferencia no se recupera vendiendo más en octubre: el ciclo no da tiempo.</p>
        </div>
        <div className="fc-rd">
          <div className="fc-rd-k">Diciembre depende de la cartera, no del pipeline</div>
          <p>Si el cierre de año tiene que apoyarse en algo, es en <b>utilización de líneas ya firmadas</b> y ampliación de las vivas.
          Las {D.act.length} activaciones de este pipeline valen {fcK(D.act.reduce((a, r) => a + r.act, 0))}: mueven, pero no deciden.</p>
        </div>
        <div className="fc-rd">
          <div className="fc-rd-k">Lo que hay que limpiar en HubSpot</div>
          <p><b>{D.park.length} deals con fecha 31/12</b> y {D.slip.length} con cierre declarado en Q4 pero etapa que no llega.
          Mientras el forecast declarado diga {fcM(D.hsPond)} y el calibrado {fcM(D.q4Firma)}, el pipeline no sirve para decidir capital.</p>
        </div>
      </div>
    </div>
  );
};
