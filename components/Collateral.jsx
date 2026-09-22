// Constructor de cartera: segmentos y deudores → línea propuesta.
const { useState, useMemo } = React;

const clEur = v => window.fmt.eur(v);

function ClCampo({ l, children, w }) {
  return <label className="cf-in" style={w ? { maxWidth: w } : null}><span>{l}</span>{children}</label>;
}

function ClFila({ s, onChange, onDel, modo }) {
  const c = window.calcSegmento(s);
  const set = (k, v) => onChange({ ...s, [k]: v });
  const tipo = window.TIPO_DEUDOR.find(t => t.id === s.tipoDeudor);

  return (
    <div className={`cl-row ${c.concentrado ? 'warn' : ''}`}>
      <div className="cl-in">
        <ClCampo l="Origen">
          <select value={s.origen} onChange={e => set('origen', e.target.value)}>
            {window.ORIGEN_CREDITO.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </ClCampo>
        {modo === 'segmento' ? (
          <>
            <ClCampo l="Tipo de deudor">
              <select value={s.tipoDeudor} onChange={e => {
                const t = window.TIPO_DEUDOR.find(x => x.id === e.target.value);
                onChange({ ...s, tipoDeudor: e.target.value, anticipable: t ? t.anticipable : s.anticipable });
              }}>
                {window.TIPO_DEUDOR.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </ClCampo>
            <ClCampo l="Nº deudores" w={86}>
              <input type="number" min="0" value={s.nDeudores} onChange={e => set('nDeudores', e.target.value)} placeholder="0"/>
            </ClCampo>
          </>
        ) : (
          <>
            <ClCampo l="CIF" w={108}>
              <input value={s.cif} onChange={e => set('cif', e.target.value)} placeholder="B12345678"/>
            </ClCampo>
            <ClCampo l="Nombre del cliente">
              <input value={s.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Razón social"/>
            </ClCampo>
          </>
        )}
        <ClCampo l="Periodicidad">
          <select value={s.periodicidad} onChange={e => set('periodicidad', e.target.value)}>
            {window.PERIODICIDAD.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </ClCampo>
        <ClCampo l="Importe medio / periodo" w={132}>
          <input type="number" min="0" value={s.importe} onChange={e => set('importe', e.target.value)} placeholder="€"/>
        </ClCampo>
        <ClCampo l="Pago estipulado" w={104}>
          <input type="number" min="0" value={s.pagoEstipulado} onChange={e => set('pagoEstipulado', e.target.value)} placeholder="días"/>
        </ClCampo>
        <ClCampo l="Pago esperado" w={104}>
          <input type="number" min="0" value={s.pagoEsperado} onChange={e => set('pagoEsperado', e.target.value)} placeholder="días"/>
        </ClCampo>
        <ClCampo l="Método de pago">
          <select value={s.metodo} onChange={e => set('metodo', e.target.value)}>
            {window.METODO_PAGO.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </ClCampo>
        {modo === 'segmento' && (
          <ClCampo l="IBAN de cobro" w={150}>
            <input value={s.iban} onChange={e => set('iban', e.target.value)} placeholder="ES.."/>
          </ClCampo>
        )}
      </div>

      <div className="cl-out">
        <div className="cl-prop">
          <ClCampo l="Operativa">
            <select value={s.operativa} onChange={e => set('operativa', e.target.value)}>
              {window.OPERATIVA.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </ClCampo>
          <ClCampo l="% anticipable" w={92}>
            <input type="number" min="0" max="100" value={s.anticipable} onChange={e => set('anticipable', e.target.value)}/>
          </ClCampo>
          <ClCampo l="Máx. por deudor %" w={104}>
            <input type="number" min="0" max="100" value={s.maxDeudor} onChange={e => set('maxDeudor', e.target.value)}/>
          </ClCampo>
        </div>
        <div className="cl-res">
          <div className="clr">
            <span>Colateral vivo medio</span>
            <b className="tabular">{clEur(c.vivo)}</b>
            {c.ciclos > 0 && <em>{c.ciclos.toFixed(1).replace('.', ',')} ciclos sin cobrar</em>}
          </div>
          <div className="clr hi">
            <span>Anticipable esperado</span>
            <b className="tabular">{clEur(c.anticipable)}</b>
            {c.retraso > 0 && <em className="late">cobra {Math.round(c.retraso)} d más tarde de lo pactado</em>}
          </div>
        </div>
        <button className="cl-del" onClick={onDel} title="Quitar">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      {c.concentrado && (
        <div className="cl-flag">
          Con {s.nDeudores} deudores, cada uno aporta más del {s.maxDeudor}% de lo anticipable. Riesgos lo va a mirar: o suben los deudores o baja el porcentaje.
        </div>
      )}
    </div>
  );
}

window.Collateral = function Collateral({ state, onState }) {
  const segs = state.segmentos || [];
  const deus = state.deudores || [];
  const prod = state.producto || { linea:'Línea de factoring', amortizacion:'A vencimiento', recurso:'Sin recurso', garantias:'Ninguna' };

  const set = (k, v) => onState({ ...state, [k]: v });
  const upd = (key, i, v) => { const a = [...(state[key] || [])]; a[i] = v; set(key, a); };
  const del = (key, i) => { const a = [...(state[key] || [])]; a.splice(i, 1); set(key, a); };

  const total = useMemo(() => {
    const all = [...segs, ...deus].map(window.calcSegmento);
    return {
      vivo: all.reduce((a, c) => a + c.vivo, 0),
      anticipable: all.reduce((a, c) => a + c.anticipable, 0),
      lineas: all.length,
      alertas: all.filter(c => c.concentrado).length,
    };
  }, [segs, deus]);

  const nDeudoresTotal = segs.reduce((a, s) => a + (+s.nDeudores || 0), 0) + deus.length;

  return (
    <div className="cl">
      <div className="cl-head">
        <div className="cl-prodbox">
          <span className="cl-k">Producto solicitado</span>
          <div className="cl-prodf">
            {Object.entries(window.PRODUCTO).map(([k, opts]) => (
              <ClCampo key={k} l={k === 'amortizacion' ? 'Amortización' : k === 'linea' ? 'Tipo de línea' : k === 'recurso' ? 'Recurso' : 'Garantías'}>
                <select value={prod[k]} onChange={e => set('producto', { ...prod, [k]: e.target.value })}>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </ClCampo>
            ))}
          </div>
        </div>
        <div className="cl-total">
          <span className="cl-k">Propuesta que sale de la cartera</span>
          <div className="cl-tnums">
            <div><em>Colateral vivo</em><b className="tabular">{clEur(total.vivo)}</b></div>
            <div className="hi"><em>Línea anticipable</em><b className="tabular">{clEur(total.anticipable)}</b></div>
          </div>
          <div className="cl-tmeta">
            {total.lineas} {total.lineas === 1 ? 'tramo' : 'tramos'} · {nDeudoresTotal} deudores
            {total.alertas > 0 && <span className="cl-warn"> · {total.alertas} con concentración alta</span>}
            {nDeudoresTotal > 0 && nDeudoresTotal < 5 && <span className="cl-warn"> · pocos deudores para diversificar</span>}
          </div>
        </div>
      </div>

      <div className="cl-sec">
        <div className="cl-sech">
          <div>
            <span className="cl-k">Tipos de cartera</span>
            <p>Agrupa por origen y tipo de deudor cuando son muchos y parecidos.</p>
          </div>
          <button className="btn" onClick={() => set('segmentos', [...segs, window.emptySegmento()])}>+ Tramo de cartera</button>
        </div>
        {segs.length === 0 && <div className="cl-empty">Sin tramos. Añade uno para empezar a estructurar la línea.</div>}
        {segs.map((s, i) => (
          <ClFila key={s.id} s={s} modo="segmento" onChange={v => upd('segmentos', i, v)} onDel={() => del('segmentos', i)}/>
        ))}
      </div>

      <div className="cl-sec">
        <div className="cl-sech">
          <div>
            <span className="cl-k">Deudores a analizar</span>
            <p>Uno a uno, para los grandes o los que Riesgos va a querer ver con nombre.</p>
          </div>
          <button className="btn" onClick={() => set('deudores', [...deus, window.emptyDeudor()])}>+ Deudor</button>
        </div>
        {deus.length === 0 && <div className="cl-empty">Sin deudores individuales.</div>}
        {deus.map((s, i) => (
          <ClFila key={s.id} s={s} modo="deudor" onChange={v => upd('deudores', i, v)} onDel={() => del('deudores', i)}/>
        ))}
      </div>
    </div>
  );
};
