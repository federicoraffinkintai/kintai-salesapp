// Cohortes del embudo broker: trimestre de creación × segmento.
const BkCohorts = () => {
  const [qs, setQs] = React.useState(window.COH_Q.slice(-6));
  const [segs, setSegs] = React.useState(['midmkt', 'big']);
  const n = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
  const pct = (v, d) => v == null || isNaN(v) ? '—' : (v * 100).toFixed(d || 0).replace('.', ',') + '%';
  const eur = (v) => v == null || isNaN(v) ? '—' : (Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(1).replace('.', ',') + 'M€' : Math.round(v / 1000) + 'k€');
  const w = (v) => Math.max(0, Math.min(100, (v || 0) * 100)) + '%';
  const tog = (arr, set, v) => set(arr.indexOf(v) >= 0 ? arr.filter(x => x !== v) : arr.concat([v]));
  const c = window.cohorts({ qs, segs });
  const cp = window.cohortsPartner({ qs, segs });
  const maxC = Math.max(...c.filas.map(f => f.creados), 1);
  return (
    <section className="bk-block coh">
      <div className="bk-bh">
        <span className="bk-chip">Cohortes · trimestre de creación</span>
        <span className="bk-bh-d">Cada cohorte son los deals creados en ese trimestre, seguidos hasta hoy: cuántos se han ganado, cuántos se han perdido y cuántos siguen abiertos. La conversión de una cohorte joven siempre sale baja porque todavía no ha madurado, por eso va al lado la curva de maduración.</span>
        <span className="bk-bh-k mono">{n(c.creados)} deals · {pct(c.wr, 1)} ganados · {eur(c.eur)} de línea</span>
      </div>

      <div className="coh-f">
        <div className="coh-fg"><span>Trimestres</span><div className="bk-fg">
          {window.COH_Q.map(q => <button key={q} className={qs.indexOf(q) >= 0 ? 'on' : ''} onClick={() => tog(qs, setQs, q)}>{q.replace('-Q', ' Q')}</button>)}
        </div></div>
        <div className="coh-fg"><span>Segmentos</span><div className="bk-fg">
          {window.BRK_SEGS.map(s => <button key={s.id} className={segs.indexOf(s.id) >= 0 ? 'on' : ''} onClick={() => tog(segs, setSegs, s.id)}>{s.label}</button>)}
        </div></div>
      </div>

      <div className="coh-top">
        <div className="coh-c"><b className="mono">{n(c.creados)}</b><span>deals creados</span><em>{c.qs.length} trimestres · {c.segs.length} segmentos</em></div>
        <div className="coh-c accent"><b className="mono">{pct(c.wr, 1)}</b><span>conversión a ganado</span><em>{n(c.ganados)} ganados · {n(c.perdidos)} perdidos</em></div>
        <div className="coh-c"><b className="mono">{n(c.abiertos)}</b><span>aún abiertos</span><em>{eur(c.eurPipe)} de línea viva</em></div>
        <div className="coh-c"><b className="mono">{n(c.ciclo)}<u> d</u></b><span>ciclo medio de los ganados</span><em>{eur(c.eur)} de línea ganada</em></div>
      </div>

      <div className="bk-scroll">
        <table className="bk-table coh-t">
          <thead><tr>
            <th>Cohorte</th><th className="num">Creados</th><th className="num">Ganados</th><th className="num">Perdidos</th><th className="num">Abiertos</th>
            <th className="num">Conversión</th><th className="num">Ciclo</th><th className="num">Línea ganada</th><th>Desenlace</th>
          </tr></thead>
          <tbody>
            {c.filas.map(f => (
              <tr key={f.q}>
                <td className="bk-nom"><b>{f.q.replace('-Q', ' Q')}</b><em className="bk-hs">{f.edad === 0 ? 'trimestre en curso' : f.edad + (f.edad === 1 ? ' trimestre' : ' trimestres') + ' de recorrido · ' + pct(f.maduro) + ' madurada'}</em></td>
                <td className="num mono">{n(f.creados)}</td>
                <td className="num mono coh-w">{n(f.ganados)}</td>
                <td className="num mono coh-l">{n(f.perdidos)}</td>
                <td className="num mono">{n(f.abiertos)}</td>
                <td className="num mono"><b>{pct(f.wr, 1)}</b></td>
                <td className="num mono">{n(f.ciclo)} d</td>
                <td className="num mono">{eur(f.eur)}</td>
                <td className="coh-mix">
                  <span className="coh-bar" style={{width: w(f.creados / maxC)}}>
                    <i className="w" style={{width: w(f.creados ? f.ganados / f.creados : 0)}}/>
                    <i className="l" style={{width: w(f.creados ? f.perdidos / f.creados : 0)}}/>
                    <i className="o" style={{width: w(f.creados ? f.abiertos / f.creados : 0)}}/>
                  </span>
                </td>
              </tr>
            ))}
            <tr className="bk-row-tot">
              <td>Selección</td>
              <td className="num mono">{n(c.creados)}</td>
              <td className="num mono coh-w">{n(c.ganados)}</td>
              <td className="num mono coh-l">{n(c.perdidos)}</td>
              <td className="num mono">{n(c.abiertos)}</td>
              <td className="num mono"><b>{pct(c.wr, 1)}</b></td>
              <td className="num mono">{n(c.ciclo)} d</td>
              <td className="num mono">{eur(c.eur)}</td>
              <td/>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="coh-cv">
        <div className="coh-cv-h"><b>Curva de maduración</b><span>Qué parte de los deals que acaba ganando una cohorte ya ha cerrado a los N meses de crearse. Es lo que permite comparar trimestres jóvenes con maduros.</span></div>
        <div className="coh-cv-g">
          {c.curva.map(p => (
            <div key={p.mes} className="coh-cv-m">
              <i><u style={{height: w(p.v)}}/></i>
              <b className="mono">{pct(p.v)}</b>
              <span>m{p.mes}</span>
            </div>
          ))}
        </div>
        <div className="coh-seg">
          {c.porSeg.map(s => (
            <div key={s.id} className="coh-seg-r" style={{'--c': s.color}}>
              <span className="coh-seg-l">{s.label}</span>
              <b className="mono">{pct(s.wr, 1)}</b>
              <em className="mono">{n(s.ganados)} de {n(s.creados)} · {n(s.ciclo)} d · {eur(s.eur)}</em>
              <i className="coh-seg-b"><u style={{width: w(s.wr)}}/></i>
            </div>
          ))}
        </div>
      </div>
      <div className="coh-p">
        <div className="coh-cv-h"><b>Conversión por partner</b><span>Misma selección de trimestres y segmentos. La conversión es la <b>medida en HubSpot</b> a lo largo de toda la vida del partner (ganados/deals, entre paréntesis) y los ganados esperados salen de aplicarla a los creados de la selección. Ordenado por volumen ganado; con menos de 10 deals no se publica porcentaje.</span></div>
        <div className="bk-scroll">
          <table className="bk-table coh-t">
            <thead><tr>
              <th>Partner</th><th>Tipo</th><th className="num">AEs</th><th className="num">Creados</th><th className="num">Ganados</th>
              <th className="num">Ciclo</th><th className="num">Línea ganada</th><th>Conversión</th>
            </tr></thead>
            <tbody>
              {cp.filas.map(f => (
                <tr key={f.nombre}>
                  <td className="bk-nom"><b>{f.nombre}</b></td>
                  <td><span className="bk-tchip" style={{'--c': (window.BRK_TIPOS.find(t => t.id === f.tipo) || {}).color}}>{f.tipo === 'Referral/Small' ? 'Referral' : f.tipo}</span></td>
                  <td className="num mono">{n(f.aes)}</td>
                  <td className="num mono">{n(f.creados)}</td>
                  <td className="num mono coh-w">{f.ganados ? n(f.ganados) : <span className="bk-none">—</span>}</td>
                  <td className="num mono">{n(f.ciclo)} d</td>
                  <td className="num mono">{f.eur ? eur(f.eur) : <span className="bk-none">—</span>}</td>
                  <td className="cap-acum">
                    {f.fiable ? <>
                      <b className="mono cap-acum-v">{pct(f.wr, 1)}</b>
                      <span className="cap-acum-b"><i className={f.wr >= (cp.wr || 0) ? 'ok' : (f.wr < (cp.wr || 0) * 0.6 ? 'low' : '')} style={{width: w(f.wr / Math.max((cp.wr || 0.01) * 2, 0.01))}}/></span>
                      <em className="mono">{n(f.hsWon)}/{n(f.hsDeals)}</em>
                    </> : <span className="bk-none">{f.hsDeals ? f.hsDeals + ' deals, pocos para un %' : 'sin histórico'}</span>}
                  </td>
                </tr>
              ))}
              <tr className="bk-row-tot">
                <td>Partners con detalle de AE</td><td/>
                <td className="num mono">{n(cp.filas.reduce((a, f) => a + f.aes, 0))}</td>
                <td className="num mono">{n(cp.creados)}</td>
                <td className="num mono coh-w">{n(cp.ganados)}</td>
                <td className="num mono">{n(cp.ciclo)} d</td>
                <td className="num mono">{eur(cp.eur)}</td>
                <td className="cap-acum"><b className="mono cap-acum-v">{pct(cp.wr, 1)}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="bk-bn">{c.meta.fuente} La conversión de la cohorte es sobre deals creados, no sobre los cerrados: una cohorte de este trimestre enseña poco porque solo ha madurado un {pct(c.filas[c.filas.length - 1] ? c.filas[c.filas.length - 1].maduro : 0)} de su recorrido. El ciclo es la media de días de los deals ganados de cada segmento, y la línea ganada sale de multiplicar los ganados por la línea media del tier. En la tabla de partners los creados salen del detalle de AEs y la conversión es la real de HubSpot, la misma que alimenta el bloque de conversiones; {cp.sinDato} partners no llegan a 10 deals y por eso no muestran porcentaje. El ciclo y la línea siguen siendo modelo.</div>
    </section>
  );
};
Object.assign(window, { BkCohorts });
