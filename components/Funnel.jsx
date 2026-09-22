// Bloque de embudo por etapas, compartido por las pestañas de performance y canal
const { useState } = React;

window.FunnelBlock = function FunnelBlock({ canal, fases, titulo, nota, tone }) {
  const [fino, setFino] = useState(false);
  const fN = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
  const fP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 1 : d).replace('.', ',') + '%';

  const emb = window.fnEmbudo(canal, fases);
  const etapas = window.fnEtapas(canal);
  const rows = fino ? etapas : emb.rows;
  const top = rows.length ? rows[0].alc : 0;

  return (
    <section className="bk-block fn" style={{'--c': tone || '#4054A8'}}>
      <div className="bk-bh">
        <span className="bk-chip">{titulo}</span>
        <span className="bk-bh-d">{nota}</span>
        <div className="bk-fg fn-tg">
          <button className={!fino ? 'on' : ''} onClick={() => setFino(false)}>Por fase</button>
          <button className={fino ? 'on' : ''} onClick={() => setFino(true)}>Etapa a etapa</button>
        </div>
        <span className="bk-bh-k mono">{fN(emb.won)} won de {fN(emb.n)} deals</span>
      </div>
      <table className="bk-table fn-table">
        <thead><tr>
          <th>{fino ? 'Etapa' : 'Fase'}</th>
          <th className="num">Alcanzados</th><th className="num">Paso</th>
          <th className="num">Caída</th><th>Embudo</th><th className="num">Aquí hoy</th>
        </tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td className="fn-et">
                <span className="fn-i mono">{i + 1}</span>
                <span><b>{r.label}</b>{r.desc && <em>{r.desc}</em>}
                  {fino && r.id === 'WON' && <em>etapa final</em>}</span>
              </td>
              <td className="num mono"><b>{fN(r.alc)}</b></td>
              <td className="num mono">{r.paso == null
                ? <span className="bk-none">—</span>
                : <span className="k-ach" style={{'--c': r.paso >= 0.9 ? '#1F5C42' : r.paso >= 0.7 ? '#B8731F' : '#B23A3A'}}>{fP(r.paso, 0)}</span>}</td>
              <td className="num mono">{r.caida ? <span className="fn-caida">−{fN(r.caida)}</span> : <span className="bk-none">—</span>}</td>
              <td className="fn-bar">
                <i style={{width: top ? Math.max(1, r.alc / top * 100) + '%' : '1%'}}/>
                <em className="mono">{fP(top ? r.alc / top : null, 0)}</em>
              </td>
              <td className="num mono">{r.aqui ? fN(r.aqui) : <span className="bk-none">0</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bk-bn">
        <span className="bk-use">{fP(emb.e2e, 1)} de punta a punta</span>
        <span className={'bk-use ' + (emb.lost > emb.won * 3 ? 'low' : '')}>{fN(emb.lost)} perdidos</span>
        <b>El export solo trae la etapa actual de cada deal</b>, así que «alcanzados» son los que hoy están en esa etapa o más adelante, más los ganados.
        Los {fN(emb.lost)} perdidos de este canal no registran en qué etapa se cayeron: el embudo mide el paso de los deals vivos, no la mortalidad por etapa.
        Cuando el CRM exponga el histórico de etapas, estas mismas filas pasan a medir caída real sin cambiar la estructura.
      </div>
    </section>
  );
};
