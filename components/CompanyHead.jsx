// Company header + financial dashboard
window.CompanyHead = function CompanyHead({ c, status, onStatus, onCall, adjustment }) {
  const tier = window.classifyTier(c.ventas);
  const prio = window.classifyPriority(c.g);
  const f = window.fmt;
  const antiguedad = c.v_edad || (c.const_year ? new Date().getFullYear() - c.const_year : null);

  const pct = Math.min(100, Math.max(0, (c.g / window.SCORE_MAX) * 100));
  const r = 32, circ = 2 * Math.PI * r;
  const moved = adjustment && Math.abs(adjustment.adjustedGlobal - c.g) > 1;

  return (
    <header className="company-head">
      <div>
        <div className="crumbs">
          <span>{c.ccaa || 'España'}</span><span className="sep">›</span>
          <span>{c.localidad || '—'}</span><span className="sep">›</span>
          <span className="mono">{c.nif}</span>
        </div>
        <h1 className="company-name">{c.empresa}</h1>
        <div className="company-tags">
          <span className="tier-pill">{tier.id}</span>
          <span className="tag tier">{tier.label}</span>
          <span className="tag">{c.sector}</span>
          <span className="tag cnae">CNAE {c.cnae}</span>
          {c.empleados != null && <span className="tag">{c.empleados} empleados</span>}
          {antiguedad != null && <span className="tag">{Math.round(antiguedad)} años</span>}
        </div>

        <div className="contact-row">
          {c.dm_nombre && (
            <div className="contact-item">
              <span className="contact-k">Contacto</span>
              <span className="contact-v">{c.dm_nombre}{c.dm_cargo ? ` · ${c.dm_cargo}` : ''}</span>
            </div>
          )}
          {c.tel && (
            <div className="contact-item">
              <span className="contact-k">Teléfono</span>
              <a className="contact-v mono" href={`tel:${c.tel.replace(/[^+\d]/g, '')}`}>{c.tel}</a>
              {c.tel_ok && <span className="contact-ok">marketable</span>}
            </div>
          )}
          {c.web && (
            <div className="contact-item">
              <span className="contact-k">Web</span>
              <a className="contact-v" href={c.web.startsWith('http') ? c.web : `https://${c.web}`} target="_blank" rel="noopener">{c.web}</a>
            </div>
          )}
          {!c.dm_nombre && !c.tel && <div className="contact-item empty">Sin datos de contacto en SABI · buscar en LinkedIn</div>}
        </div>
      </div>

      <div className="head-actions">
        <div className="score-block">
          <div>
            <div className="score-label">Score Global</div>
            <div className="score-tier">{prio.label}</div>
            {moved && (
              <div className={`score-moved tabular ${adjustment.adjustedGlobal > c.g ? 'up' : 'down'}`}>
                {adjustment.adjustedGlobal > c.g ? '↑' : '↓'} {f.score(adjustment.adjustedGlobal)} validado
              </div>
            )}
          </div>
          <div className="score-orbit">
            <svg width="76" height="76" viewBox="0 0 76 76">
              <circle cx="38" cy="38" r={r} fill="none" stroke="var(--line)" strokeWidth="5"/>
              <circle cx="38" cy="38" r={r} fill="none" stroke="var(--kin)" strokeWidth="5"
                strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round"/>
            </svg>
            <div className="score-orbit-num">{f.score(c.g)}</div>
          </div>
        </div>

        <div className="deal-size">
          <div className="deal-cell">
            <span className="deal-k">Línea potencial</span>
            <span className="deal-v tabular">{f.eur(c.linea)}</span>
          </div>
          <div className="deal-cell">
            <span className="deal-k">Revenue esperado</span>
            <span className="deal-v tabular gold">{f.eur(c.revenue)}</span>
          </div>
        </div>

        <div className="head-cta">
          <button className={`btn ${status === 'contacted' ? 'primary' : ''}`}
            onClick={() => onStatus(status === 'contacted' ? null : 'contacted')}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            {status === 'contacted' ? 'Contactado' : 'Marcar contacto'}
          </button>
          <button className="btn gold" onClick={onCall}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/></svg>
            Iniciar llamada
          </button>
        </div>
      </div>
    </header>
  );
};

window.FinancialStrip = function FinancialStrip({ c }) {
  const f = window.fmt;
  const yoyVentas = f.delta(c.ventas, c.ventas_1);
  const yoyEbitda = f.delta(c.ebitda, c.ebitda_1);
  const margen = c.ventas ? (c.ebitda / c.ventas) * 100 : null;
  const solvencia = c.v_solv != null ? c.v_solv * 100 : null;
  const deudores = c.deudores_est != null ? c.deudores_est : c.clientes;
  const provs    = c.prov_est != null ? c.prov_est : c.proveedores;
  const dEst = c.deudores_est != null && c.clientes == null;
  const pEst = c.prov_est != null && c.proveedores == null;
  const nofRatio = c.v_nof_fact;
  const ciclo = c.ciclo;
  const deudaEbitda = c.v_deuda_ebitda;
  const margenBruto = c.margen_bruto;
  const costeDeuda = c.coste_deuda;
  const rend = c.v_rend != null ? c.v_rend * 100 : null;

  const Delta = ({ d }) => {
    if (d == null) return null;
    const cls = d > 0.005 ? 'up' : d < -0.005 ? 'down' : 'flat';
    const sym = d > 0.005 ? '↑' : d < -0.005 ? '↓' : '→';
    return <span className={`fin-delta ${cls}`}>{sym} {(Math.abs(d) * 100).toFixed(1).replace('.', ',')}% yoy</span>;
  };

  return (
    <div className="fin-groups">
      <div className="fin-group">
        <div className="fin-group-label">Resultados y estructura</div>
        <div className="fin-strip cols-5">
          <div className="fin-cell">
            <div className="fin-label">Facturación</div>
            <div className="fin-value tabular">{f.eur(c.ventas)}</div>
            <Delta d={yoyVentas}/>
          </div>
          <div className="fin-cell">
            <div className="fin-label">EBITDA</div>
            <div className="fin-value tabular">{f.eur(c.ebitda)}</div>
            <Delta d={yoyEbitda}/>
          </div>
          <div className="fin-cell">
            <div className="fin-label">Solvencia</div>
            <div className="fin-value tabular">{solvencia != null ? solvencia.toFixed(0) + '%' : '—'}</div>
            <span className={`fin-delta ${solvencia < 30 ? 'down' : 'up'}`}>PN / Activo</span>
          </div>
          <div className="fin-cell">
            <div className="fin-label">Deuda financiera</div>
            <div className="fin-value tabular">{f.eur(c.deuda_total)}</div>
            <span className="fin-delta flat">
              {c.deuda_total ? `C/P ${f.eur(c.deuda_cp)} · L/P ${f.eur(c.deuda_lp)}` : 'Sin deuda en balance'}
            </span>
          </div>
          <div className="fin-cell">
            <div className="fin-label">Deuda / EBITDA</div>
            <div className="fin-value tabular">{deudaEbitda == null ? 'n/a' : Math.abs(deudaEbitda) < 0.05 ? '≈0x' : f.x(deudaEbitda)}</div>
            <span className={`fin-delta ${(deudaEbitda != null && deudaEbitda > 7) || c.ebitda < 0 ? 'down' : 'flat'}`}>
              {c.ebitda < 0 ? 'EBITDA negativo' : deudaEbitda > 7 ? 'Fuera criterio banca' : 'Dentro de rango'}
            </span>
          </div>
        </div>
      </div>

      <div className="fin-group budget">
        <div className="fin-group-label">Margen y capacidad de pago</div>
        <div className="fin-strip cols-5">
          <div className="fin-cell">
            <div className="fin-label">Margen bruto</div>
            <div className="fin-value tabular">{margenBruto != null ? margenBruto.toFixed(1).replace('.', ',') + '%' : '—'}</div>
            <span className="fin-delta flat">{margenBruto == null ? 'Sin dato fiable' : '(Ventas − Aprov.) / Ventas'}</span>
          </div>
          <div className="fin-cell">
            <div className="fin-label">Margen EBITDA</div>
            <div className="fin-value tabular">{margen != null ? margen.toFixed(1).replace('.', ',') + '%' : '—'}</div>
            <span className={`fin-delta ${margen != null && margen < 5 ? 'down' : 'flat'}`}>
              {margen == null ? 'EBITDA / Ventas' : margen < 5 ? 'Margen fino' : 'EBITDA / Ventas'}
            </span>
          </div>
          <div className="fin-cell">
            <div className="fin-label">Rinde el circulante</div>
            <div className="fin-value tabular">{rend != null ? rend.toFixed(2).replace('.', ',') + '%' : '—'}</div>
            <span className={`fin-delta ${rend > 0.8 ? 'up' : rend != null ? 'down' : 'flat'}`}>
              {rend == null ? 'EBITDA / circulante' : rend > 0.8 ? 'Le compensa pagar' : 'Justo para el pricing'}
            </span>
          </div>
          <div className="fin-cell">
            <div className="fin-label">Gastos financieros</div>
            <div className="fin-value tabular">{f.eur(c.gastos_fin != null ? Math.abs(c.gastos_fin) : null)}</div>
            <span className="fin-delta flat">Lo que ya paga al año</span>
          </div>
          <div className="fin-cell">
            <div className="fin-label">Coste de su deuda</div>
            <div className="fin-value tabular">{costeDeuda != null ? costeDeuda.toFixed(1).replace('.', ',') + '%' : '—'}</div>
            <span className={`fin-delta ${costeDeuda > 8 ? 'down' : 'flat'}`}>
              {costeDeuda == null ? 'Sin dato fiable' : costeDeuda > 8 ? 'Ya paga caro' : 'Contra esto compites'}
            </span>
          </div>
        </div>
      </div>

      <div className="fin-group">
        <div className="fin-group-label">Circulante</div>
        <div className="fin-strip cols-5">
          <div className="fin-cell">
            <div className="fin-label">NOF</div>
            <div className="fin-value tabular">{f.eur(c.nof_est)}</div>
            <span className={`fin-delta ${nofRatio > 0.25 ? 'up' : 'flat'}`}>
              {nofRatio == null ? 'Deud.+Exist.−Prov.−Tes.'
                : nofRatio > 1.5 ? f.ratio(nofRatio) + '× la facturación anual'
                : Math.round(nofRatio * 365) + ' días de venta'}
            </span>
          </div>
          <div className="fin-cell">
            <div className="fin-label">Deudores</div>
            <div className="fin-value tabular">{f.eur(deudores)}{dEst && <sup className="vp-est" title="Estimado: SABI no publica el dato">e</sup>}</div>
            <span className="fin-delta flat">Pendiente de cobro</span>
          </div>
          <div className="fin-cell">
            <div className="fin-label">Existencias</div>
            <div className="fin-value tabular">{f.eur(c.existencias)}</div>
            <span className="fin-delta flat">Inventario en balance</span>
          </div>
          <div className="fin-cell">
            <div className="fin-label">Proveedores</div>
            <div className="fin-value tabular">{f.eur(provs)}{pEst && <sup className="vp-est" title="Estimado: SABI no publica el dato">e</sup>}</div>
            <span className="fin-delta flat">Financiación de proveedor</span>
          </div>
          <div className="fin-cell">
            <div className="fin-label">Tesorería</div>
            <div className="fin-value tabular">{f.eur(c.tesoreria)}</div>
            <span className={`fin-delta ${(c.tesoreria || 0) < (c.ventas || 0) * 0.02 ? 'down' : 'flat'}`}>
              {(c.tesoreria || 0) < (c.ventas || 0) * 0.02 ? 'Caja muy justa' : 'Colchón disponible'}
            </span>
          </div>
        </div>
      </div>

      <div className="fin-group days">
        <div className="fin-group-label">Días — ciclo de caja</div>
        <div className="fin-strip cols-4">
          <div className="fin-cell">
            <div className="fin-label">PMC · cobro</div>
            <div className="fin-value tabular">{c.pmc_ok ? f.days(c.pmc) : '—'}</div>
            <span className={`fin-delta ${c.pmc_ok && c.pmc > 60 ? 'up' : 'flat'}`}>
              {!c.pmc_ok ? 'Dato no fiable' : c.pmc > 60 ? 'Encaja anticipo' : 'Cobro rápido'}
            </span>
          </div>
          <div className="fin-cell">
            <div className="fin-label">PMP · pago</div>
            <div className="fin-value tabular">{c.pmp_ok ? f.days(c.pmp) : '—'}</div>
            <span className={`fin-delta ${c.pmp_ok && c.pmp > 90 ? 'down' : 'flat'}`}>
              {!c.pmp_ok ? 'Sin dato fiable' : c.pmp > 90 ? 'Estirando proveedor' : 'Pago en plazo'}
            </span>
          </div>
          <div className="fin-cell">
            <div className="fin-label">Rotación inventario</div>
            <div className="fin-value tabular">{c.rot != null ? f.days(c.rot) : '—'}</div>
            <span className={`fin-delta ${c.rot > 90 ? 'up' : 'flat'}`}>
              {c.rot == null ? 'Sin dato fiable' : c.rot > 90 ? 'Stock lento' : 'Rotación normal'}
            </span>
          </div>
          <div className="fin-cell">
            <div className="fin-label">Ciclo de caja</div>
            <div className="fin-value tabular">{ciclo != null ? f.days(ciclo) : '—'}</div>
            <span className={`fin-delta ${ciclo > 90 ? 'up' : 'flat'}`}>
              {ciclo == null ? 'Faltan datos fiables' : ciclo > 730 ? 'Ciclo plurianual' : ciclo > 90 ? 'Gap largo a financiar' : 'Gap contenido'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
