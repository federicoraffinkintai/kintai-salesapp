// Cartera de clientes compartida y su contraste con 347/SII, Informa y la
// contabilidad del emisor.
const CarteraCompartida = () => {
  const [tier, setTier] = React.useState(null);
  const a = window.carAnalisis(tier);
  const pt = window.carPorTier(tier);
  const [metodo, setMetodo] = React.useState(null);
  const [geo, setGeo] = React.useState(null);
  const [ced, setCed] = React.useState(null);
  const [estado, setEstado] = React.useState(null);
  const [verTodas, setVerTodas] = React.useState(false);
  const [sector, setSector] = React.useState(null);
  const emp = window.carEmpresas({ tier, metodo, geo, ced, estado, sector });
  const lista = verTodas ? emp.rows : emp.rows.slice(0, 25);
  const nF = (v) => v == null || isNaN(v) ? '—' : Math.round(v).toLocaleString('es-ES');
  const pF = (v, d) => v == null || isNaN(v) ? '—' : (v * 100).toFixed(d || 0).replace('.', ',') + '%';
  const eF = (v) => v == null || isNaN(v) ? '—'
    : Math.abs(v) >= 1e9 ? (v / 1e9).toFixed(2).replace('.', ',') + ' mil M€'
    : Math.abs(v) >= 1e6 ? (Math.abs(v) < 1e8 ? (v / 1e6).toFixed(1).replace('.', ',') : Math.round(v / 1e6).toLocaleString('es-ES')) + 'M€'
    : Math.round(v / 1000) + 'k€';
  const w = (v) => Math.max(0, Math.min(100, (v || 0) * 100)) + '%';
  const maxF = Math.max(...a.fuentes.map(f => f.eur), 1);
  return (
    <>
      <div className="bk-lvl-h">Cartera compartida y contraste con fuentes</div>
      <div className="zo-ctrl">
        <div className="zo-cg">
          <label>Tier</label>
          <div className="bk-fg">
            <button className={!tier ? 'on' : ''} onClick={() => setTier(null)}>Todos</button>
            {window.CAR_TIERS.map(t => { const s = window.OPT_SEGS.find(x => x.id === t.id) || {};
              return <button key={t.id} className={tier === t.id ? 'on' : ''} onClick={() => setTier(t.id)}>{s.label || t.id}</button>; })}
          </div>
        </div>
        <span className="zo-ctrl-n">Cartera compartida es el mayor de clientes o el listado de facturas que entrega el emisor. Se contrasta con lo que declara a Hacienda, con los deudores que se pueden identificar en Informa y con su propia contabilidad.</span>
      </div>

      <div className="cv">
        <div className="car-top">
          <div className="car-c accent"><b className="mono">{eF(a.carTotal)}</b><span>cartera compartida</span><em>{nF(a.comparten)} de {nF(a.n)} emisores · {pF(a.pctComparte)}</em></div>
          <div className="car-c"><b className="mono">{pF(a.sobreVentas)}</b><span>sobre su facturación</span><em>{eF(a.media)} de media por emisor</em></div>
          <div className="car-c"><b className="mono">{eF(Math.abs(a.hueco))}</b><span>hueco contra el mayor</span><em>en los {nF(a.huecoN)} emisores con contabilidad, sobre {eF(a.huecoCar)} compartidos</em></div>
        </div>

        <table className="bk-table car-t">
          <thead><tr>
            <th>Fuente</th><th className="num">Importe</th><th className="num">Emisores</th>
            <th className="num">Deudores</th><th className="num">vs lo compartido</th><th>Volumen</th>
          </tr></thead>
          <tbody>
            {a.fuentes.map(f => (
              <tr key={f.id}>
                <td><b className="car-dot" style={{'--c': f.color}}>{f.label}</b><em className="zo-sub">{f.desc}</em></td>
                <td className="num mono">{eF(f.eur)}</td>
                <td className="num mono">{nF(f.n)}<em className="zo-sub">{pF(f.pctEmisores)}</em></td>
                <td className="num mono">{nF(f.deudores)}</td>
                <td className="num mono"><b>{pF(f.cob)}</b></td>
                <td className="car-bar"><i style={{width: w(f.eur / maxF), background: f.color}}/></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="car-tt">
          <div className="rsk-card car-wide">
            <b>Cartera por tier: deudores y composición</b>
            <span>Facturación media del tier, deudores que ve cada fuente y de qué está hecha la cartera compartida. Informa cierra a balance de diciembre y el 347/SII es la foto más reciente, así que difieren por crecimiento y estacionalidad; la calculadora siempre ve menos, porque el cliente comparte solo la parte que quiere que analicemos. El saldo de Informa es el {pF(pt.pctInforma)} de la facturación —6M€ sobre 40M€ en Mid Market—, el 347/SII se mueve ±20% sobre esa foto y la calculadora ve el 60%.</span>
            <div className="bk-scroll">
              <table className="bk-table car-t2">
                <thead>
                  <tr>
                    <th rowSpan={2}>Tier</th><th className="num" rowSpan={2}>Facturación<em className="zo-th-e">media · total de los que comparten</em></th>
                    <th className="num" colSpan={3}>Saldo de deudores · medio por empresa<em className="zo-th-e">Informa = {pF(pt.pctInforma)} de la facturación · total y deudores debajo</em></th>
                    <th className="num" colSpan={5}>Medio de cobro</th>
                    <th className="num" colSpan={2}>Geografía</th>
                    <th className="num" rowSpan={2}>Cedido</th>
                  </tr>
                  <tr>
                    <th className="num">Informa</th><th className="num">347 / SII</th><th className="num">Calculadora</th>
                    <th className="num">Transf.</th><th className="num">Confirming</th><th className="num">Pagaré</th><th className="num">TPV</th><th className="num">Giro</th>
                    <th className="num">Nacional</th><th className="num">UE</th>
                  </tr>
                </thead>
                <tbody>
                  {[...pt.tiers, pt.total].map((t, i) => (
                    <tr key={t.id || 'tot'} className={t.id ? '' : 'bk-row-tot'}>
                      <td>{t.id ? <b className="car-dot" style={{'--c': t.color}}>{t.label}</b> : <b>{t.label}</b>}<em className="zo-sub">{nF(t.comp)} de {nF(t.n)} comparten</em></td>
                      <td className="num mono"><b>{eF(t.factMedia)}</b><em className="zo-sub">{eF(t.factComp)} de los que comparten</em></td>
                      <td className="num mono">{eF(t.comp ? t.eInforma / t.comp : null)}<em className="zo-sub">{eF(t.eInforma)} · {nF(t.dInforma)} deudores</em></td>
                      <td className="num mono">{eF(t.comp ? t.e347 / t.comp : null)}<em className="zo-sub">{eF(t.e347)} · {nF(t.d347)} deudores</em></td>
                      <td className="num mono"><b>{eF(t.comp ? t.eCalc / t.comp : null)}</b><em className="zo-sub">{eF(t.eCalc)} · {nF(t.dCalc)} deudores</em></td>
                      {window.CAR_COLS.map(col => (
                        <td key={col.id} className={'num mono' + (col.id === 'cedido' ? ' car-ced' : '')}>{pF(t.mix[col.id])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="car-emp">
          <div className="rsk-card car-wide">
            <b>Empresas · {nF(emp.n)} de {nF(emp.total)}</b>
            <span>Mismas columnas, una fila por emisor, ordenado por facturación. El tier se hereda del selector de arriba. El filtro de cobro selecciona las empresas cuyo peso en ese medio supera vez y media el habitual de su tier, no solo aquellas donde domina.</span>
            <div className="zo-ctrl car-filtros">
              <div className="zo-cg"><label>Estado</label><div className="bk-fg">
                <button className={!estado ? 'on' : ''} onClick={() => setEstado(null)}>Todos</button>
                {window.CAR_ESTADOS.map(e => <button key={e.id} className={estado === e.id ? 'on' : ''} onClick={() => setEstado(e.id)}>{e.label}</button>)}
              </div></div>
              <div className="zo-cg"><label>Cobro</label><div className="bk-fg">
                <button className={!metodo ? 'on' : ''} onClick={() => setMetodo(null)}>Todos</button>
                {['transferencia','confirming','pagare','tpv','giro'].map(p => (
                  <button key={p} className={metodo === p ? 'on' : ''} onClick={() => setMetodo(p)}>{(window.CAR_COLS.find(x => x.id === p) || {}).label}</button>
                ))}
              </div></div>
              <div className="zo-cg"><label>Geografía</label><div className="bk-fg">
                <button className={!geo ? 'on' : ''} onClick={() => setGeo(null)}>Todas</button>
                <button className={geo === 'nacional' ? 'on' : ''} onClick={() => setGeo('nacional')}>Nacional</button>
                <button className={geo === 'eu' ? 'on' : ''} onClick={() => setGeo('eu')}>Con UE</button>
              </div></div>
              <div className="zo-cg"><label>CNAE</label><div className="bk-fg">
                <button className={!sector ? 'on' : ''} onClick={() => setSector(null)}>Todos</button>
                {window.CAR_SECTORES.map(s => <button key={s.id} className={sector === s.id ? 'on' : ''} onClick={() => setSector(s.id)} title={s.label}>{s.id}</button>)}
              </div></div>
              <div className="zo-cg"><label>Cedido</label><div className="bk-fg">
                <button className={!ced ? 'on' : ''} onClick={() => setCed(null)}>Todos</button>
                {window.CAR_CED_TRAMOS.map(t => <button key={t.id} className={ced === t.id ? 'on' : ''} onClick={() => setCed(t.id)}>{t.label}</button>)}
              </div></div>
            </div>
            {emp.n > 0 && <div className="car-res">
              <div className="car-res-k"><b className="mono">{nF(emp.n)}</b><span>empresas</span></div>
              <div className="car-res-k"><b className="mono">{eF(emp.eCalc)}</b><span>cartera compartida</span></div>
              <div className="car-res-m">
                {['transferencia','confirming','pagare','tpv','giro'].map(p => (
                  <span key={p}>{(window.CAR_COLS.find(x => x.id === p) || {}).label}<u className="mono">{pF(emp.medios[p])}</u></span>
                ))}
                <span>Nacional<u className="mono">{pF(emp.medios.nacional)}</u></span>
                <span>UE<u className="mono">{pF(emp.medios.eu)}</u></span>
                <span>Cedido<u className="mono">{pF(emp.medios.cedido)}</u></span>
              </div>
              <div className="car-res-s">
                {emp.porSector.slice(0, 5).map(s => <span key={s.id} title={s.label}>{s.label.split(' · ')[1]}<u className="mono">{nF(s.n)}</u></span>)}
              </div>
            </div>}
            <div className="bk-scroll">
              <table className="bk-table car-t2">
                <thead><tr>
                  <th>Empresa</th><th>CNAE</th><th>Estado</th><th className="num">Facturación</th>
                  <th className="num">Informa</th><th className="num">347 / SII</th><th className="num">Calculadora</th>
                  <th className="num">Transf.</th><th className="num">Confirming</th><th className="num">Pagaré</th><th className="num">TPV</th><th className="num">Giro</th>
                  <th className="num">Nacional</th><th className="num">UE</th><th className="num">Cedido</th>
                </tr></thead>
                <tbody>
                  {!emp.n && <tr><td colSpan={15} className="car-vacio">Ninguna empresa con ese cruce. El filtro de cobro pide superar el {pF(emp.umbral)} de la cartera en ese medio, vez y media lo normal en su tier.</td></tr>}
                  {lista.map(r => (
                    <tr key={r.nif || r.nombre}>
                      <td className="bk-nom"><b>{r.nombre}</b><em className="zo-sub" style={{color: r.color}}>{r.tierLabel}</em></td>
                      <td><span className="car-cnae" title={r.sectorLabel}>{r.sector}</span></td>
                      <td><span className="bk-tchip" style={{'--c': r.estadoColor}}>{r.estadoLabel}</span></td>
                      <td className="num mono">{eF(r.fact)}</td>
                      <td className="num mono">{eF(r.eInforma)}</td>
                      <td className="num mono">{eF(r.e347)}</td>
                      <td className="num mono"><b>{eF(r.eCalc)}</b></td>
                      {['transferencia','confirming','pagare','tpv','giro'].map(p => (
                        <td key={p} className={'num mono' + (r.dom === p ? ' car-dom' : '')}>{pF(r.mix[p])}</td>
                      ))}
                      <td className="num mono">{pF(r.mix.nacional)}</td>
                      <td className="num mono">{pF(r.mix.eu)}</td>
                      <td className="num mono car-ced">{pF(r.cedPct)}</td>
                    </tr>
                  ))}
                  {emp.n > 0 && <tr className="bk-row-tot">
                    <td>Selección</td><td/><td/>
                    <td className="num mono">{eF(emp.fact)}</td>
                    <td className="num mono">{eF(emp.eInforma)}</td>
                    <td className="num mono">{eF(emp.e347)}</td>
                    <td className="num mono"><b>{eF(emp.eCalc)}</b></td>
                    <td colSpan={8}/>
                  </tr>}
                </tbody>
              </table>
            </div>
            {emp.n > 25 && <button className="car-mas" onClick={() => setVerTodas(!verTodas)}>{verTodas ? 'Ver solo las 25 mayores' : 'Ver las ' + nF(emp.n) + ' empresas'}</button>}
          </div>
        </div>

        <div className="rsk-b">
          <div className="rsk-card">
            <b>Qué información trae la cartera</b>
            <span>Campos presentes en lo que comparten los {nF(a.comparten)} emisores.</span>
            <div className="car-campos">
              {a.campos.map(k => (
                <div key={k.id} className="car-campo">
                  <span>{k.label}</span>
                  <u className="mono">{pF(k.pct)}</u>
                  <i><s style={{width: w(k.pct)}}/></i>
                  <em className="mono">{nF(k.n)} emisores · {eF(k.eur)}</em>
                </div>
              ))}
            </div>
          </div>
          <div className="rsk-card">
            <b>Calidad de lo compartido</b>
            <span>Si con lo entregado se puede analizar la cartera o hay que volver a pedir.</span>
            <div className="car-cal">
              {a.calTramos.map(t => (
                <div key={t.id} className="car-cl" style={{'--c': t.color}}>
                  <u className="mono">{pF(t.pct)}</u>
                  <span>{t.label}</span>
                  <i><s style={{width: w(t.pct)}}/></i>
                  <em className="mono">{nF(t.n)} emisores · {eF(t.eur)}</em>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="cv-note">
          {a.meta.fuente} La comparación importa por dos motivos: el <b>347/SII</b> pone el techo fiscal de lo que puede haber facturado y detecta carteras recortadas, e <b>Informa</b> dice qué parte de esos deudores se puede puntuar sin pedir nada al cliente. El libro diario y mayor es la única fuente que enseña la cartera entera, y por eso la diferencia contra lo compartido —{eF(Math.abs(a.hueco))} en los {nF(a.huecoN)} emisores que lo aportan— es la cartera que existe y no se está mirando. Cada fila mide solo a los emisores que aportan esa fuente, así que los importes no son comparables entre filas sin mirar antes su número de emisores. Los emisores grandes comparten con menos detalle —entregan agregados—, y por eso el tramo de peor calidad concentra mucho importe con pocos nombres.
        </div>
      </div>
    </>
  );
};
Object.assign(window, { CarteraCompartida });
