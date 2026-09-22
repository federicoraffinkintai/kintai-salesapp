// Performance de campañas: tabla resumen de todas (habrá decenas) y despliegue
// de una con su embudo y su cadena de mensajes paso a paso. La confección de
// listas vive en Market research; aquí solo se mide selección y aproximación.
const { useState, useMemo } = React;

const cN = (v) => (v == null ? '—' : Math.round(v).toLocaleString('es-ES'));
const cP = (num, den) => (!den || num == null ? '—' : Math.round((num / den) * 100) + '%');
const cEur = (v) => (!v ? '—' : v >= 1e6 ? (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + 'M€' : Math.round(v / 1e3) + 'k€');

const COLS = [
  { k:'code',  label:'Código' },
  { k:'name',  label:'Campaña' },
  { k:'seq',   label:'Cadena' },
  { k:'pool',  label:'Empresas', num:true },
  { k:'leads', label:'Leads', num:true },
  { k:'open',  label:'Open', num:true },
  { k:'reply', label:'Resp.', num:true },
  { k:'enviados', label:'Cont.', num:true },
  { k:'cualificados', label:'Cual.', num:true },
  { k:'deals', label:'Deals', num:true },
  { k:'auto',  label:'% auto', num:true },
  { k:'clientes', label:'Clientes', num:true },
  { k:'convDeal', label:'Conv. deal', num:true },
  { k:'conv',  label:'Conv. cliente', num:true },
];

window.CampMonitor = function CampMonitor({ camps, onCamps, companies, onSelectLead }) {
  const [open, setOpen] = useState(null);
  const [sort, setSort] = useState('conv');
  const [q, setQ] = useState('');
  const [st, setSt] = useState('');
  const [msg, setMsg] = useState(null);   // {campId, i} mensaje en revisión

  const patch = (id, fn) => onCamps(camps.map(c => (c.id === id ? fn(c) : c)));
  const setM = (id, k, v) => patch(id, c => ({ ...c, metrics: { ...c.metrics, [k]: Math.max(0, +v || 0) } }));
  const setStep = (id, sid, k, v) => patch(id, c => ({
    ...c, seq: window.campSeqOf(c).map(s => (s.id === sid ? { ...s, [k]: Math.max(0, +v || 0) } : s)),
  }));
  const remove = (id) => { onCamps(camps.filter(c => c.id !== id)); setOpen(null); };

  const rows = useMemo(() => camps.map(c => {
    const m = c.metrics || {}, pool = (c.nifs || []).length, seq = window.campSeqOf(c);
    const mail = seq.filter(s => s.ch === 'email');
    const sent = mail.reduce((a, s) => a + (s.enviados || 0), 0);
    const opens = mail.reduce((a, s) => a + (s.aperturas || 0), 0);
    const reps = seq.reduce((a, s) => a + (s.respuestas || 0), 0);
    const seqSent = seq.reduce((a, s) => a + (s.enviados || 0), 0);
    const deals = window.campDeals(m);
    return {
      c, seq, pool, sig: window.campSeqSig(seq),
      enviados: m.enviados || 0, leads: m.leads || 0, cualificados: m.cualificados || 0,
      deals, deals_auto: m.deals_auto || 0, deals_call: m.deals_call || 0, clientes: m.clientes || 0,
      sent, opens, reps, seqSent,
      open: sent ? opens / sent : 0,
      reply: seqSent ? reps / seqSent : 0,
      auto: deals ? (m.deals_auto || 0) / deals : 0,
      convDeal: pool ? deals / pool : 0,
      conv: pool ? (m.clientes || 0) / pool : 0,
    };
  }).filter(r =>
    (!st || r.c.status === st) &&
    (!q.trim() || (r.c.name + ' ' + r.c.code).toLowerCase().includes(q.trim().toLowerCase()))
  ).sort((a, b) => {
    if (sort === 'name') return a.c.name.localeCompare(b.c.name);
    if (sort === 'code') return a.c.code.localeCompare(b.c.code);
    if (sort === 'seq') return a.sig.localeCompare(b.sig);
    return (b[sort] || 0) - (a[sort] || 0);
  }), [camps, sort, q, st]);

  const tot = useMemo(() => rows.reduce((t, r) => {
    for (const k of ['pool','enviados','leads','cualificados','deals','deals_auto','deals_call','clientes','sent','opens','reps','seqSent']) t[k] += r[k] || 0;
    return t;
  }, { pool:0, enviados:0, leads:0, cualificados:0, deals:0, deals_auto:0, deals_call:0, clientes:0, sent:0, opens:0, reps:0, seqSent:0 }), [rows]);

  const detail = open && rows.find(r => r.c.id === open);

  if (!camps.length) {
    return (
      <div className="cm">
        <div className="cm-head">
          <div className="cm-h">Performance de campañas</div>
          <div className="cm-hint">Aún no hay campañas. Las listas se confeccionan en <b>Market research</b>: filtras el universo por CNAE, marcas las empresas y les pones nombre. Aquí se monitoriza qué tal funciona cada selección y cada estrategia de aproximación.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cm">
      <div className="cm-head">
        <div className="cm-h">Performance de campañas</div>
        <div className="cm-hint">La cadena es solo mensajes: el objetivo es que el prospecto agende discovery sin llamada. Los deals levantados llamando se miden aparte para ver cuánto sostiene la cadena por sí sola.</div>
      </div>

      <div className="cm-tot">
        {[['En lista','pool'],['Contactados','enviados'],['Leads','leads'],['Cualificados','cualificados'],['Deals','deals'],['Clientes','clientes']].map(([lab, k]) => (
          <div className="cm-totk" key={k}><b className="mono">{cN(tot[k])}</b><span>{lab}</span></div>
        ))}
        <div className="cm-totk"><b className="mono">{cP(tot.opens, tot.sent)}</b><span>open rate</span></div>
        <div className="cm-totk"><b className="mono">{cP(tot.reps, tot.seqSent)}</b><span>respuestas</span></div>
        <div className="cm-totk strong"><b className="mono">{(tot.deals_auto + tot.deals_call) > 0 ? cP(tot.deals_auto, tot.deals) : '—'}</b><span>deals auto-agendados</span></div>
        <div className="cm-totk strong"><b className="mono">{cP(tot.deals, tot.pool)}</b><span>conversión a deal</span></div>
        <div className="cm-totk strong"><b className="mono">{cP(tot.clientes, tot.pool)}</b><span>conversión a cliente</span></div>
      </div>

      <div className="cm-bar">
        <input className="cm-q" placeholder="Buscar campaña o código" value={q} onChange={e => setQ(e.target.value)}/>
        <select className="cm-st" value={st} onChange={e => setSt(e.target.value)}>
          <option value="">Todos los estados</option>
          {window.CAMP_STATUS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <span className="cm-count">{cN(rows.length)} de {cN(camps.length)} campañas</span>
      </div>

      <div className="cm-tablewrap">
        <table className="cm-table">
          <thead><tr>
            <th className="cm-cw"/>
            {COLS.map(c => <th key={c.k} className={c.num ? 'num' : ''} onClick={() => setSort(c.k)}>{c.label}</th>)}
            <th>Estado</th>
          </tr></thead>
          <tbody>
            {rows.map(r => {
              const isOpen = open === r.c.id;
              return (
                <tr key={r.c.id} className={isOpen ? 'on' : ''} onClick={() => setOpen(isOpen ? null : r.c.id)}>
                  <td className="cm-cw"><span className={`cm-caret ${isOpen ? 'on' : ''}`}>›</span></td>
                  <td className="mono cm-codec">{r.c.code}</td>
                  <td className="cm-namec"><b>{r.c.name}</b><em>{(r.c.nodes || []).map(n => n.label).join(', ') || 'Multisector'}</em></td>
                  <td className="cm-seqc">
                    <span className="cm-dots">
                      {r.seq.map(s => <i key={s.id} style={{'--c': window.CAMP_CH[s.ch].color}} title={`d+${s.day} · ${s.label}`}/>)}
                    </span>
                    <em>{r.sig}</em>
                  </td>
                  <td className="num mono">{cN(r.pool)}</td>
                  <td className="num mono">{cN(r.leads)}</td>
                  <td className="num mono">{cP(r.opens, r.sent)}</td>
                  <td className="num mono">{cP(r.reps, r.seqSent)}</td>
                  <td className="num mono">{cN(r.enviados)}</td>
                  <td className="num mono">{cN(r.cualificados)}</td>
                  <td className="num mono">{cN(r.deals)}{(r.deals_auto + r.deals_call) > 0 && <em className="cm-split">{cN(r.deals_auto)}a/{cN(r.deals_call)}ll</em>}</td>
                  <td className="num mono">{(r.deals_auto + r.deals_call) > 0 ? cP(r.deals_auto, r.deals) : '—'}</td>
                  <td className="num mono">{cN(r.clientes)}</td>
                  <td className="num mono"><b>{cP(r.deals, r.pool)}</b></td>
                  <td className="num mono"><b>{cP(r.clientes, r.pool)}</b></td>
                  <td><span className={`cm-pill st-${r.c.status}`}>{(window.CAMP_STATUS.find(s => s.id === r.c.status) || {}).label}</span></td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={16} className="cm-emptyrow">Ninguna campaña cumple el filtro.</td></tr>}
          </tbody>
        </table>
      </div>

      {detail && (() => {
        const { c, seq, pool } = detail;
        const m = c.metrics || {};
        const funnel = [
          { label:'Leads', v: detail.leads },
          { label:'Cualificados', v: detail.cualificados },
          { label:'Deals', v: detail.deals },
          { label:'Clientes', v: detail.clientes },
        ];
        const max = Math.max(1, ...funnel.map(f => f.v || 0));
        const stepMax = Math.max(1, ...seq.map(s => s.enviados || 0));
        return (
          <section className={`cm-camp st-${c.status}`}>
            <header className="cm-top">
              <div className="cm-code mono">{c.code}</div>
              <div className="cm-title">
                <b>{c.name}</b>
                <em>{cN(pool)} empresas · encaje de nicho {Math.round(c.fit || 0)} · {detail.sig}</em>
              </div>
              <select className="cm-st" value={c.status} onChange={e => patch(c.id, x => ({ ...x, status: e.target.value }))}>
                {window.CAMP_STATUS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <button className="cm-x" onClick={() => remove(c.id)} title="Borrar campaña">×</button>
            </header>

            {c.tesis && <div className="cm-tesis">“{c.tesis}”</div>}

            <div className="cm-rates">
              <div className="cm-rate"><b>{cP(detail.opens, detail.sent)}</b><span>open rate</span></div>
              <div className="cm-rate"><b>{cP(detail.reps, detail.seqSent)}</b><span>respuestas</span></div>
              {window.CAMP_CONV.map(x => (
                <div className="cm-rate" key={x.label}><b>{cP(x.num === 'deals' ? detail.deals : m[x.num], x.den === 'deals' ? detail.deals : m[x.den])}</b><span>{x.label}</span></div>
              ))}
              <div className="cm-rate strong"><b>{(detail.deals_auto + detail.deals_call) > 0 ? cP(detail.deals_auto, detail.deals) : '—'}</b><span>deals sin llamar</span></div>
            </div>

            <div className="cm-cols">
              <div>
                <div className="cm-subh">Embudo · leads → cualificados → deals</div>
                <div className="cm-funnel">
                  {funnel.map(f => (
                    <div className="cm-fstep" key={f.label}>
                      <div className="cm-fbar"><i style={{height: Math.max(3, ((f.v || 0) / max) * 100) + '%'}}/></div>
                      <b className="mono">{cN(f.v || 0)}</b>
                      <span>{f.label}</span>
                    </div>
                  ))}
                </div>
                <div className="cm-inputs">
                  {window.CAMP_METRICS.map(x => (
                    <label className="cm-input" key={x.k} title={x.hint}>
                      <span>{x.label}</span>
                      <input type="number" min="0" className="mono" value={m[x.k] ?? 0} onChange={e => setM(c.id, x.k, e.target.value)}/>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="cm-subh">Cadena de mensajes · {seq.length} pasos <button className="cm-rev" onClick={() => setMsg({ campId: c.id, i: 0 })}>revisar contenido →</button></div>
                <div className="cm-seq">
                  <div className="cm-step cm-stephead">
                    <span/><span/><span/><span/>
                    <span className="cm-colh">env.</span><span className="cm-colh">abiertos</span><span className="cm-colh">resp.</span>
                    <span className="cm-colh">open</span><span className="cm-colh">resp</span>
                  </div>
                  {seq.map(s => {
                    const ch = window.CAMP_CH[s.ch];
                    return (
                      <div className="cm-step" key={s.id} style={{'--c': ch.color}}>
                        <span className="cm-day mono">d+{s.day}</span>
                        <span className="cm-ch">{ch.label}</span>
                        <span className="cm-sl"><button className="cm-sllink" onClick={() => setMsg({ campId: c.id, i: seq.indexOf(s) })} title="Ver el contenido de este mensaje">{s.label}</button></span>
                        <span className="cm-stepbar"><i style={{width: Math.max(2, ((s.enviados || 0) / stepMax) * 100) + '%'}}/></span>
                        <input type="number" min="0" className="mono cm-stepin" value={s.enviados ?? 0} title="Enviados en este paso"
                          onChange={e => setStep(c.id, s.id, 'enviados', e.target.value)}/>
                        <input type="number" min="0" className="mono cm-stepin" value={s.aperturas ?? 0} disabled={s.ch !== 'email'} title={s.ch === 'email' ? 'Aperturas de este email' : 'LinkedIn no tiene apertura medible'}
                          onChange={e => setStep(c.id, s.id, 'aperturas', e.target.value)}/>
                        <input type="number" min="0" className="mono cm-stepin" value={s.respuestas ?? 0} title="Respuestas de este paso"
                          onChange={e => setStep(c.id, s.id, 'respuestas', e.target.value)}/>
                        <b className="mono cm-steprate">{s.ch === 'email' ? cP(s.aperturas, s.enviados) : '—'}</b>
                        <b className="mono cm-steprate">{cP(s.respuestas, s.enviados)}</b>
                      </div>
                    );
                  })}
                  <div className="cm-seqlegend">Open rate y respuestas por paso: así se ve qué email de la cadena tira y cuál sobra.</div>
                </div>
              </div>
            </div>

            <div className="cm-subh">Empresas de la lista</div>
            <div className="cm-list">
              {(c.nifs || []).slice(0, 24).map(nif => {
                const co = companies.find(x => x.nif === nif);
                if (!co) return null;
                return (
                  <button key={nif} className="cm-lead" onClick={() => onSelectLead(nif)}>
                    <span>{co.empresa}</span><em className="mono">{cN(co.g)}</em>
                  </button>
                );
              })}
              {(c.nifs || []).length > 24 && <div className="cm-morelead">+{cN(c.nifs.length - 24)} más</div>}
            </div>
          </section>
        );
      })()}

      {msg && (() => {
        const r = rows.find(x => x.c.id === msg.campId);
        if (!r) return null;
        const s = r.seq[msg.i];
        if (!s) return null;
        const ch = window.CAMP_CH[s.ch];
        return (
          <div className="modal-bg" onClick={() => setMsg(null)}>
            <div className="modal cm-msg" onClick={e => e.stopPropagation()}>
              <div className="cm-msgtabs">
                {(() => { const n = {}; return r.seq.map((x, i) => {
                  n[x.ch] = (n[x.ch] || 0) + 1;
                  return (
                    <button key={x.id} className={`cm-msgtab ${i === msg.i ? 'on' : ''}`} style={{'--c': window.CAMP_CH[x.ch].color}}
                      onClick={() => setMsg({ ...msg, i })}>{window.CAMP_CH[x.ch].label} {n[x.ch]} <em>d+{x.day}</em></button>
                  );
                }); })()}
              </div>
              <div className="cm-msghead">
                <span className="cm-msgch" style={{'--c': ch.color}}>{ch.label}</span>
                <b>{s.label}</b>
                <em>{r.c.code} · d+{s.day} · {cN(s.enviados)} enviados · {s.ch === 'email' ? `open ${cP(s.aperturas, s.enviados)} · ` : ''}resp {cP(s.respuestas, s.enviados)}</em>
              </div>
              {s.ch === 'email' && <div className="cm-msgsubj"><span>Asunto</span><b>{s.asunto || '—'}</b></div>}
              <div className="cm-msgbody">{s.cuerpo || 'Sin contenido guardado para este paso.'}</div>
              <div className="cm-msgvars">Se personaliza al enviar: {'{{empresa}}'} · {'{{decisor}}'} · {'{{pmc}}'} · {'{{sector}}'} · {'{{linea}}'}</div>
              <div className="modal-actions">
                <button className="btn ghost" onClick={() => setMsg({ ...msg, i: Math.max(0, msg.i - 1) })} disabled={!msg.i}>← Anterior</button>
                <button className="btn ghost" onClick={() => setMsg({ ...msg, i: Math.min(r.seq.length - 1, msg.i + 1) })} disabled={msg.i >= r.seq.length - 1}>Siguiente →</button>
                <button className="btn primary" onClick={() => setMsg(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
