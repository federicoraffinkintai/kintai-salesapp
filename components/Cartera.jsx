// Cartera recurrente: forecast de disposición sep-dic 2026 de los clientes ya firmados
// que gestionan Mid Market y Big Pymes. Lo que importa no es la línea sino el saldo dispuesto.
const crM = v => (v / 1e6).toFixed(2).replace('.', ',') + ' M€';
const crM1 = v => (v / 1e6).toFixed(1).replace('.', ',') + ' M€';
const crK = v => Math.round(v / 1000).toLocaleString('es-ES') + ' k€';
const crP = v => (v * 100).toFixed(1).replace('.', ',') + '%';
const crP0 = v => Math.round(v * 100) + '%';

window.Cartera = function Cartera() {
  const [seg, setSeg] = React.useState('todos');
  const [ord, setOrd] = React.useState('delta');

  const D = React.useMemo(() => {
    const rows = window.CR_ROWS.map(r => {
      const cur = r.line * (r.act || 0);
      const dic = r.m[3];
      return { ...r, cur, dic, delta: dic - cur, uDic: dic / r.line, zero: !r.act, flat: dic === 0 };
    });
    const tot = (sel, f) => sel.reduce((a, r) => a + f(r), 0);
    const mk = sel => ({
      n: sel.length, line: tot(sel, r => r.line), cur: tot(sel, r => r.cur),
      m: [0, 1, 2, 3].map(i => tot(sel, r => r.m[i])),
    });
    const all = mk(rows), mm = mk(rows.filter(r => r.seg === 'Mid Market')), bp = mk(rows.filter(r => r.seg === 'Big Pymes'));
    return {
      rows, all, mm, bp,
      zero: rows.filter(r => !r.act && r.dic > 0),
      muertos: rows.filter(r => r.dic === 0),
      over: rows.filter(r => r.uDic > 1),
      baja: rows.filter(r => r.delta < 0),
    };
  }, []);

  const vis = React.useMemo(() => {
    let v = D.rows.filter(r => seg === 'todos' || r.seg === seg);
    const f = { delta: r => -r.delta, dic: r => -r.dic, line: r => -r.line, uso: r => -r.uDic, co: r => r.co };
    return v.slice().sort((a, b) => { const x = f[ord](a), y = f[ord](b); return typeof x === 'string' ? x.localeCompare(y) : x - y; });
  }, [D, seg, ord]);

  const segs = [['todos', D.all], ['Mid Market', D.mm], ['Big Pymes', D.bp]];
  const maxBar = Math.max.apply(null, D.all.m.concat([D.all.cur]));

  return (
    <div className="fc">
      <div className="bk-lvl-h">Cartera recurrente — disposición prevista sep · oct · nov · dic 2026</div>
      <div className="bdr-note">
        {D.all.n} clientes ya firmados que gestionan Mid Market y Big Pymes, con {crM1(D.all.line)} de línea concedida. Hoy tienen dispuestos {crM(D.all.cur)},
        un {crP(D.all.cur / D.all.line)} de uso. El forecast de los AE los lleva a <b>{crM(D.all.m[3])} en diciembre</b> ({crP(D.all.m[3] / D.all.line)} de uso):
        +{crM(D.all.m[3] - D.all.cur)} de saldo sin firmar una sola línea nueva. Es el motor principal del cierre de año, por delante del pipeline de new business.
      </div>

      <div className="cv">
        <div className="cv-chain">
          <div className="cv-ch"><b>{crM1(D.all.line)}</b><span>Línea concedida · {D.all.n} clientes</span></div>
          <div className="cv-op">→</div>
          <div className="cv-ch bad"><b>{crM(D.all.cur)}</b><span>Dispuesto hoy · {crP0(D.all.cur / D.all.line)} de uso</span></div>
          <div className="cv-op alt">→</div>
          <div className="cv-ch accent"><b>{crM(D.all.m[3])}</b><span>Dispuesto dic · {crP0(D.all.m[3] / D.all.line)} de uso</span></div>
        </div>
        <div className="cv-note">
          La recuperación no viene de más línea: la línea es la misma. Viene de <b>uso</b>. El salto grande está en octubre
          (+{crM(D.all.m[1] - D.all.m[0])} sobre septiembre) y lo explican {D.zero.length} clientes que hoy están a cero y arrancan disposición,
          más {D.over.length} que se van por encima de su línea actual y necesitarán ampliación formal antes de diciembre.
        </div>
      </div>

      <div className="bk-lvl-h sub">Mes a mes</div>
      <div className="cv">
        <table className="bk-table fc-mm">
          <thead>
            <tr>
              <th>Mes</th>
              <th className="num grp">Dispuesto total</th><th className="num">% uso sobre línea</th><th className="num">Δ vs mes anterior</th>
              <th className="num grp">Mid Market</th><th className="num">Big Pymes</th>
              <th className="grp">Peso del mes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Hoy</b></td>
              <td className="num mono grp"><b>{crM(D.all.cur)}</b></td>
              <td className="num mono">{crP(D.all.cur / D.all.line)}</td>
              <td className="num mono muted">—</td>
              <td className="num mono grp">{crM(D.mm.cur)}</td>
              <td className="num mono">{crM(D.bp.cur)}</td>
              <td className="grp"><div className="fc-bar"><i style={{ width: (D.all.cur / maxBar * 100) + '%', background: '#9AA3B2' }}/></div></td>
            </tr>
            {window.CR_MES.map(({ k, i }) => {
              const prev = i === 0 ? D.all.cur : D.all.m[i - 1], d = D.all.m[i] - prev;
              return (
                <tr key={k}>
                  <td><b>{k}</b></td>
                  <td className="num mono grp"><b>{crM(D.all.m[i])}</b></td>
                  <td className="num mono">{crP(D.all.m[i] / D.all.line)}</td>
                  <td className={'num mono ' + (d >= 0 ? 'pos' : 'neg')}>{(d >= 0 ? '+' : '−') + crM(Math.abs(d))}</td>
                  <td className="num mono grp">{crM(D.mm.m[i])}</td>
                  <td className="num mono">{crM(D.bp.m[i])}</td>
                  <td className="grp"><div className="fc-bar"><i style={{ width: (D.all.m[i] / maxBar * 100) + '%' }}/></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="cv-note">
          Septiembre es un mes de caída aparente ({crM(D.all.m[0])} contra {crM(D.all.cur)} de hoy) porque varios clientes con saldo vivo no renuevan operación dentro del mes.
          El forecast recupera en octubre y se estabiliza: entre noviembre y diciembre el movimiento neto es de {crM(Math.abs(D.all.m[3] - D.all.m[2]))}.
          Noviembre y diciembre son ya cartera madura, no activación.
          <b> Nota sobre el origen:</b> la fila de totales del Excel da {crM(23640000)} y {crP(0.757)} de uso en diciembre porque su fórmula no cubre los seis últimos clientes del fichero
          (Julià Travel, Autocares Julià, Geisa, Comas, Sit&amp;B y Bitprom, {crM(3535000)} entre los seis). Esta pestaña suma los {D.all.n} clientes completos: {crM(D.all.m[3])} y {crP(D.all.m[3] / D.all.line)} de uso.
        </div>
      </div>

      <div className="bk-lvl-h sub">Dónde está el movimiento</div>
      <div className="fc-park">
        <div className="fc-pk">
          <div className="fc-pk-n mono">{D.zero.length}</div>
          <div className="fc-pk-k">clientes hoy a cero que disponen en Q4</div>
          <div className="fc-pk-d">{crM(D.zero.reduce((a, r) => a + r.dic, 0))} de saldo en diciembre que hoy no existe. Es la misma patología de 2026: línea firmada sin uso. Aquí se revierte.</div>
        </div>
        <div className="fc-pk">
          <div className="fc-pk-n mono">{D.over.length}</div>
          <div className="fc-pk-k">clientes por encima de su línea</div>
          <div className="fc-pk-d">El forecast les asigna {crM(D.over.reduce((a, r) => a + r.dic, 0))} sobre {crM(D.over.reduce((a, r) => a + r.line, 0))} concedidos: hay que aprobar la ampliación antes de que dispongan.</div>
        </div>
        <div className="fc-pk">
          <div className="fc-pk-n mono">{D.muertos.length}</div>
          <div className="fc-pk-k">clientes a cero en diciembre</div>
          <div className="fc-pk-d">{crM(D.muertos.reduce((a, r) => a + r.line, 0))} de línea concedida que no produce nada. Son candidatos a cancelar o a reactivar con campaña específica.</div>
        </div>
      </div>

      <div className="bk-lvl-h sub">Cliente a cliente</div>
      <div className="fc-sc">
        <div className="bdr-seg">
          {segs.map(([k, t]) => (
            <button key={k} className={seg === k ? 'on' : ''} onClick={() => setSeg(k)}>{k === 'todos' ? 'Todos' : k} · {t.n}</button>
          ))}
        </div>
        <em>{vis.length} clientes · {crM(vis.reduce((a, r) => a + r.dic, 0))} de disposición en diciembre · ordena por las columnas subrayadas</em>
      </div>
      <div className="cv">
        <table className="bk-table fc-cli">
          <thead>
            <tr>
              <th className="srt" onClick={() => setOrd('co')}>Cliente</th>
              <th>Segmento</th>
              <th className="num srt" onClick={() => setOrd('line')}>Línea</th>
              <th className="num">Uso hoy</th>
              <th className="num">Sep</th><th className="num">Oct</th><th className="num">Nov</th>
              <th className="num srt" onClick={() => setOrd('dic')}>Dic</th>
              <th className="num srt" onClick={() => setOrd('uso')}>% uso dic</th>
              <th className="num srt" onClick={() => setOrd('delta')}>Δ dic vs hoy</th>
            </tr>
          </thead>
          <tbody>
            {vis.map(r => (
              <tr key={r.co} className={r.dic === 0 ? 'fc-off' : ''}>
                <td><b>{r.co}</b>{r.nif ? <em className="fc-nif">{r.nif}</em> : null}</td>
                <td><span className={'fc-pill ' + (r.seg === 'Mid Market' ? 'mm' : 'bp')}>{r.seg}</span></td>
                <td className="num mono">{crK(r.line)}</td>
                <td className="num mono muted">{r.act == null ? 's/d' : crP0(r.act)}</td>
                <td className="num mono muted">{r.m[0] ? crK(r.m[0]) : '—'}</td>
                <td className="num mono muted">{r.m[1] ? crK(r.m[1]) : '—'}</td>
                <td className="num mono muted">{r.m[2] ? crK(r.m[2]) : '—'}</td>
                <td className="num mono"><b>{r.dic ? crK(r.dic) : '—'}</b></td>
                <td className={'num mono ' + (r.uDic > 1 ? 'warn' : '')}>{crP0(r.uDic)}</td>
                <td className={'num mono ' + (r.delta > 0 ? 'pos' : r.delta < 0 ? 'neg' : 'muted')}>
                  {r.delta === 0 ? '—' : (r.delta > 0 ? '+' : '−') + crK(Math.abs(r.delta))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="fc-read">
        <div className="fc-rd">
          <div className="fc-rd-k">Lo que esto significa para el cierre</div>
          <p>La cartera recurrente aporta <b>+{crM(D.all.m[3] - D.all.cur)}</b> de saldo nuevo sin vender nada. Es más de lo que aporta todo el pipeline
          de new business de Àlex en el mismo trimestre. El puente a 50M€ depende antes de los AE de cuenta que del equipo de captación.</p>
        </div>
        <div className="fc-rd">
          <div className="fc-rd-k">Lo que hay que aprobar ya</div>
          <p>{D.over.length} clientes disponen por encima de línea y {D.zero.length} arrancan desde cero. Ninguna de las dos cosas pasa sola:
          la primera necesita comité de riesgos, la segunda una primera operación con KYC y verificación de deudores cerrada en octubre.</p>
        </div>
      </div>
    </div>
  );
};
