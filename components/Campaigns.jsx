// Campaigns view: cohort list, Tier x Sector matrix, top per pillar
const { useState, useMemo } = React;

window.Campaigns = function Campaigns({ companies, statuses, onSelectLead, camps, onCamps }) {
  const [pillarTab, setPillarTab] = useState('need');
  const [matrixSel, setMatrixSel] = useState(null); // {tierId, sectorId}

  // Build matrix
  const matrix = useMemo(() => {
    const m = {};
    for (const t of window.TIERS) {
      m[t.id] = {};
      for (const s of window.SECTOR_GROUPS) m[t.id][s.id] = { count: 0, scoreSum: 0 };
    }
    for (const c of companies) {
      const tier = window.TIERS.find(t => c.ventas >= t.min && c.ventas < t.max);
      if (!tier) continue;
      const sec = window.classifySector(c.sector);
      m[tier.id][sec.id].count++;
      m[tier.id][sec.id].scoreSum += c.g || 0;
    }
    return m;
  }, [companies]);

  const maxCount = useMemo(() => {
    let max = 0;
    for (const t of window.TIERS) for (const s of window.SECTOR_GROUPS) max = Math.max(max, matrix[t.id][s.id].count);
    return max;
  }, [matrix]);

  // Top by pillar
  const topByPillar = useMemo(() => {
    const result = {};
    for (const p of window.PILLARS) {
      result[p.id] = [...companies].sort((a, b) => (b[p.key] || 0) - (a[p.key] || 0)).slice(0, 8);
    }
    return result;
  }, [companies]);

  // Cohort stats
  const cohortStats = useMemo(() => {
    return window.COHORTS.map(co => {
      const matches = companies.filter(co.filter);
      const contacted = matches.filter(c => statuses[c.nif]).length;
      const avg = matches.length ? matches.reduce((a, c) => a + (c.g || 0), 0) / matches.length : 0;
      return { ...co, count: matches.length, contacted, avg, matches };
    });
  }, [companies, statuses]);

  const matrixCellColor = (count) => {
    if (!maxCount || !count) return '#fff';
    const t = count / maxCount;
    // gold-tinted heat
    return `rgba(200, 162, 76, ${0.06 + t * 0.32})`;
  };

  return (
    <div className="camp">
      <div className="camp-head">
        <h1 className="camp-h1">Campañas outbound</h1>
        <div className="camp-sub">Cómo van las campañas confeccionadas en Market research: qué tal funciona la selección de empresas y qué tal la estrategia de aproximación. Abajo, las cohortes pre-cualificadas y el top por dimensión.</div>
      </div>

      <window.CampMonitor camps={camps} onCamps={onCamps} companies={companies} onSelectLead={onSelectLead}/>

      <div className="camp-grid">
        <div>
          <div className="toplist">
            <h2 className="toplist-title">Top 8 por dimensión</h2>
            <div className="toplist-tabs">
              {window.PILLARS.map(p => (
                <button
                  key={p.id}
                  className={`toplist-tab ${pillarTab === p.id ? 'active' : ''}`}
                  onClick={() => setPillarTab(p.id)}
                >
                  {p.title}
                </button>
              ))}
            </div>
            {topByPillar[pillarTab].map((c, i) => {
              const tier = window.classifyTier(c.ventas);
              const pillar = window.PILLARS.find(p => p.id === pillarTab);
              return (
                <div key={c.nif} className="toplist-row" onClick={() => onSelectLead(c.nif)}>
                  <div className="toplist-rank">{String(i+1).padStart(2,'0')}</div>
                  <div>
                    <div className="toplist-name">{c.empresa}</div>
                    <div style={{fontSize: 11, color: 'var(--muted)'}}>{c.localidad} · {(c.sector || '').slice(0, 38)}</div>
                  </div>
                  <div className="toplist-tier">{tier.id}</div>
                  <div className="toplist-score">{(c[pillar.key] || 0).toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cohort-list">
          {cohortStats.map(co => {
            const pillar = window.PILLARS.find(p => p.id === co.pillar);
            const cov = co.count ? Math.round((co.contacted / co.count) * 100) : 0;
            return (
              <div className="cohort" key={co.id}>
                <div className="cohort-head">
                  <div className="cohort-pillar" style={{background: `var(${pillar.color})`}}/>
                  <div style={{flex: 1}}>
                    <div className="cohort-name">{co.name}</div>
                    <div className="cohort-desc">{co.desc}</div>
                  </div>
                </div>
                <div className="cohort-stats">
                  <div className="cohort-stat">
                    <strong>{co.count}</strong>
                    <span>leads</span>
                  </div>
                  <div className="cohort-stat">
                    <strong>{window.fmt.score(co.avg)}</strong>
                    <span>score Ø</span>
                  </div>
                  <div className="cohort-stat">
                    <strong>{co.contacted}/{co.count}</strong>
                    <span>cobertura · <span className="cov-pill">{cov}%</span></span>
                  </div>
                </div>
                <div className="cohort-pitch">"{co.pitch}"</div>
                <div className="cohort-actions">
                  <button
                    className="btn"
                    onClick={() => co.matches[0] && onSelectLead(co.matches[0].nif)}
                    disabled={!co.matches.length}
                  >
                    Atacar cohorte ({co.count}) →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

window.ExportModal = function ExportModal({ companies, statuses, validations, feedback, notes, onClose }) {
  // Build CSV/JSON
  const stats = useMemo(() => {
    const leads = Object.keys(statuses).length;
    let validationCount = 0, feedbackCount = 0, notesCount = 0;
    for (const k in validations) for (const kk in (validations[k] || {})) if (validations[k][kk]) validationCount++;
    for (const k in feedback) for (const kk in (feedback[k] || {})) if (feedback[k][kk]?.vote) feedbackCount++;
    for (const k in notes) if (notes[k]) notesCount++;
    return { leads, validationCount, feedbackCount, notesCount };
  }, [statuses, validations, feedback, notes]);

  const buildPayload = () => {
    const rows = [];
    for (const c of companies) {
      const status = statuses[c.nif];
      const v = validations[c.nif] || {};
      const fb = feedback[c.nif] || {};
      const adj = window.computeAdjustment(c, v, fb);
      if (!status && !Object.keys(v).length && !Object.keys(fb).length && !notes[c.nif]) continue;

      const row = {
        nif: c.nif,
        empresa: c.empresa,
        sector: c.sector,
        cnae: c.cnae,
        ventas_eur: c.ventas,
        score_orig: +c.g.toFixed(3),
        score_adj: +adj.adjustedGlobal.toFixed(3),
        delta_pct: +(adj.weightedDelta * 100).toFixed(2),
        status: status || '',
        notas: notes[c.nif] || '',
      };
      // Add validations
      for (const p of window.PILLARS) {
        for (const bv of p.breakdown) {
          row[`val_${p.id}_${bv.id}`] = v[`${p.id}-${bv.id}`] || '';
        }
        p.script.questions.forEach((q, i) => {
          row[`vote_${p.id}_${i}`] = fb[`${p.id}-${i}`]?.vote || '';
          row[`note_${p.id}_${i}`] = (fb[`${p.id}-${i}`]?.note || '').replace(/\n/g, ' ');
        });
      }
      rows.push(row);
    }
    return rows;
  };

  const downloadCSV = () => {
    const rows = buildPayload();
    if (!rows.length) { alert('Sin datos para exportar'); return; }
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => {
        const v = r[h] ?? '';
        const s = String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      }).join(','))
    ].join('\n');
    const blob = new Blob(['\ufeff' + csv], {type: 'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `kintai-feedback-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const rows = buildPayload();
    const blob = new Blob([JSON.stringify(rows, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `kintai-feedback-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Exportar feedback SDR</h3>
        <div className="modal-sub">Lo que tu equipo de datos necesita para reentrenar el score.</div>
        <div className="modal-stats">
          <div className="modal-stat">
            <div className="modal-stat-label">Leads tocados</div>
            <div className="modal-stat-num">{stats.leads}</div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat-label">Validaciones</div>
            <div className="modal-stat-num">{stats.validationCount}</div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat-label">Votos guión</div>
            <div className="modal-stat-num">{stats.feedbackCount}</div>
          </div>
        </div>
        <div style={{fontSize: 12.5, color: 'var(--muted)', marginBottom: 10}}>
          Cada fila incluye: NIF, empresa, score original, score ajustado por SDR, delta %, status, validaciones por variable, votos por pregunta, notas literales.
        </div>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Cerrar</button>
          <button className="btn" onClick={downloadJSON}>Descargar JSON</button>
          <button className="btn primary" onClick={downloadCSV}>Descargar CSV</button>
        </div>
      </div>
    </div>
  );
};
