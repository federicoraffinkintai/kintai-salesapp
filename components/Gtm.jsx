// Unicorn: master plan de largo plazo. Solo clientes, línea media, utilización
// y cuota de mercado — lo táctico vive en las pestañas de canal y funnel.
const { useState, useMemo } = React;

const gN = (v) => window.pfFmt.n(v);
const gP = (v, d) => v == null || isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 2 : d).replace('.', ',') + '%';
const gK = (v) => v >= 1e6 ? (v / 1e6).toFixed(2).replace('.', ',') + 'M' : v >= 1e4 ? gN(v / 1e3) + 'k' : gN(v);

window.GtmPlan = function GtmPlan() {
  const [p, setP] = useState(window.GTM_DEFAULTS);

  const set = (k, v) => setP(prev => ({ ...prev, [k]: v }));

  const g1 = (v) => {
  if (v == null || isNaN(v) || !isFinite(v)) return '—';
  // A partir de mil el decimal no informa y el agrupador sí: se imprime entero.
  if (Math.abs(v) >= 1000) return window.pfFmt.n(v);
  return v.toFixed(1).replace('.', ',');
};

  // Unidad fija en miles, para columnas donde mezclar M€ y k€ impide comparar.
  const gKeur = (v) => window.pfFmt.keur(v);

  // Misma unidad que la tabla: millones enteros, sin rama de B€ ni decimales.
  const gEur = (v) => window.pfFmt.plan(v);
  // Un decimal en millones, para las magnitudes donde el entero borra el dígito
  // que hace comprobable un porcentaje.
  const gCart = (v) => window.pfFmt.cartera(v);
  // Rango de facturación del tramo, con la unidad que toca en cada extremo.
  const rango = (b) => {
    if (!b) return '—';
    const u = (v) => v == null || !isFinite(v) ? null
      : v >= 1e6 ? (v / 1e6 % 1 ? (v / 1e6).toFixed(1).replace('.', ',') : window.pfFmt.n(v / 1e6)) + 'M€'
      : window.pfFmt.n(v / 1e3) + 'k€';
    const lo = u(b[0]), hi = u(b[1]);
    if (b[0] === 0) return 'hasta ' + hi;
    return hi ? lo + ' – ' + hi : lo + ' en adelante';
  };


  // El objetivo y la línea media son las dos únicas cifras que se ajustan en el
  // largo plazo. Viven en p, así que el cambio no se filtra a otras pestañas y
  // los memos de este componente y del hijo se invalidan a la vez.
  // Los objetivos ambiciosos y la línea media viven en p: son la tesis del
  // equipo, no el compromiso con inversores, que está en BP Serie A.
  const setObj = (id, d) => setP(prev => ({ ...prev,
    objByTier: { ...prev.objByTier, [id]: Math.max(0, (prev.objByTier[id] || 0) + d) } }));
  const setShare = (id, d) => setP(prev => ({ ...prev,
    shareByTier: { ...prev.shareByTier, [id]: Math.max(0.0005, +((prev.shareByTier[id] || 0) + d).toFixed(4)) } }));
  const setTicket = (id, d) => setP(prev => {
    const eur = Math.max(25000, (prev.ticketByTier[id] || 0) + d);
    const t = { ...prev.ticketByTier, [id]: eur };
    if (id === 'midmkt') t.corp = eur;
    return { ...prev, ticketByTier: t };
  });
  const mp = useMemo(() => window.gtmMaster(p), [p]);
  // Contraste con el compromiso de la Serie A sobre los mismos segmentos.
  const bpRef = useMemo(() => {
    const b = window.gtmMasterBp(p, { scope: 'todos' });
    const porTier = {};
    b.tiers.forEach(t => { porTier[t.id] = { cli: t.fin.cli, eur: t.fin.eur }; });
    return { porTier, total: b.fin,
      comun: { cli: b.fin.cli, eur: b.fin.eur } };
  }, [p]);
  const Lever = ({ label, hint, children }) => (
    <div className="gt-lever"><label>{label}</label>{children}{hint && <span className="gt-hint">{hint}</span>}</div>
  );

  return (
    <div className="gt" data-screen-label="07 Plan GTM">
      <div className="gt-head">
        <div>
          <h1 className="gt-h1">Unicorn 2029 · plan ambicioso</h1>
          <div className="gt-sub">La tesis del equipo: difícil pero posible, pensada para <b>fallar cerca de la mitad de las veces</b>. Si se cumpliera siempre no sería ambiciosa. No se comparte con inversores — el compromiso de la Serie A es otro plan, más conservador, en la pestaña <b>BP Serie A</b>.
          Se mueve con cuatro dimensiones: clientes, línea media, utilización y cuota.</div>
        </div>
        <div className="gt-goal">
          <div className="gt-goal-t">
            <span className="gt-goal-l">Objetivo a dic 2029</span>
            <span className="gt-goal-n mono">{gN(mp.objCli)}<em>clientes</em></span>
            <span className="gt-goal-n mono">{gEur(mp.fin.eur)}<em>loanbook</em></span>
            <span className="gt-goal-n mono">{gKeur(mp.fin.linea)}<em>línea media</em></span>
            <span className="gt-goal-n mono">{gP(mp.fin.util, 0)}<em>utilización</em></span>
            <span className="gt-goal-n mono">{gP(mp.tiers.reduce((a, t) => Math.max(a, t.ticket), 0) / mp.fin.eur, 2)}<em>concentración máx.</em></span>
          </div>
        </div>
      </div>

      {/* ===== DASHBOARD POR TIER ===== */}
      <div className="gt-cards">
        {mp.tiers.map(t => (
          <div className={'gt-card ' + (t.foco ? 'foco' : '')} key={t.id} style={{'--c': t.color}}>
            <div className="gt-card-h">
              <b>{t.label}</b>
              {t.foco ? <span className="gt-card-f">foco</span> : null}
              {t.late ? <span className="gt-card-late">28-29</span> : null}
            </div>
            <div className="gt-card-range">
              <span className="mono">{rango(t.bounds)}</span>
              <em className="mono">{gK(t.universo)} empresas</em>
            </div>
            <div className="gt-card-cli mono">{gN(t.objetivo)}<em>clientes en dic 29 · hoy {gN(t.base)}</em></div>
            <div className="gt-card-eur mono">{gEur(t.fin.eur)}<em>loanbook · {gP(t.fin.eur / mp.fin.eur, 0)} del libro</em></div>
            <dl className="gt-card-dl">
              <div><dt>Línea media</dt><dd className="mono">{gKeur(t.ticket0)} → <b>{gKeur(t.ticket)}</b></dd></div>
              <div><dt>Total líneas</dt><dd className="mono">{gEur(t.fin.lineas)}</dd></div>
              <div><dt>Utilización</dt><dd className="mono">{gP(t.fin.util, 0)}</dd></div>
              <div><dt>Cuota de mercado</dt><dd className="mono">{gP(t.fin.share, 2)}{t.objShare != null && <em className="gt-card-obj"> objetivo</em>}</dd></div>
              <div className="gt-card-sep"><dt>Facturación media<em>AEAT 2022</em></dt><dd className="mono">{gCart(t.factMedia)}</dd></div>
              <div className="gt-card-hl"><dt>Línea / facturación</dt><dd className="mono"><b>{gP(t.ratioFact, 1)}</b><em> hoy {gP(t.ratioFact0, 1)}</em></dd></div>
              <div><dt>Línea / loanbook total</dt><dd className="mono"><b>{gP(mp.fin.eur ? t.ticket / mp.fin.eur : null, 2)}</b></dd></div>
            </dl>
            {t.sobreTecho && (
              <div className="gt-card-sub">
                <div className="gt-card-sub-h">Se parte en dos</div>
                <div className="gt-card-sub-r">
                  <span>{rango([t.bounds[0], t.sobreTecho.cap])}</span>
                  <b className="mono">{gN(t.universo - t.sobreTecho.n)}</b>
                  <em className="mono">media {gCart(t.factMedia)}</em>
                </div>
                <div className="gt-card-sub-r out">
                  <span>más de {gEur(t.sobreTecho.cap)}</span>
                  <b className="mono">{gN(t.sobreTecho.n)}</b>
                  <em className="mono">media {gEur(t.sobreTecho.media)}</em>
                </div>
                <div className="gt-card-sub-n">
                  Las {gN(t.sobreTecho.n)} de arriba quedan fuera de la media y del ratio: {t.sobreTecho.tramos.map(x => x.label + ' ' + gN(x.n)).join(' · ')}.
                  Con ellas dentro la media sería {gEur((t.factMedia * (t.universo - t.sobreTecho.n) + t.sobreTecho.media * t.sobreTecho.n) / t.universo)} y el ratio {gP(t.ticket / ((t.factMedia * (t.universo - t.sobreTecho.n) + t.sobreTecho.media * t.sobreTecho.n) / t.universo), 1)}.
                </div>
              </div>
            )}
            <div className="gt-card-bar">
              <i style={{width: Math.min(100, (t.ratioFact || 0) / 0.2 * 100) + '%'}}/>
              <span>{gP(t.ratioFact, 1)} de su facturación</span>
            </div>
          </div>
        ))}
      </div>
      <div className="gt-disc">
        <b>Sobre el ratio línea / facturación.</b> La facturación media de cada tier sale de los tramos de la {window.MKT_FACT_META.fuente}: {window.MKT_FACT_META.metodo}.
        {' '}{window.MKT_FACT_META.aviso}
        {' '}Se excluyen las sociedades de más de {gEur(window.MKT_FACT_CAP)}: son un puñado y arrastraban la media de Corporate de 830M€ a {gCart(mp.fact ? mp.fact.corp : 0)}.
        {' '}La frontera de <b>micro</b> está en 200k€ de facturación: por debajo es otro segmento y no entra en SME Small, cuyo universo baja a {gK(mp.tiers.find(t => t.id === 'small') ? mp.tiers.find(t => t.id === 'small').universo : 0)} empresas.
        {' '}Sirve para juzgar si el límite objetivo es plausible para el tamaño de empresa, no como cifra de negocio.

      </div>

      {/* ===== MASTER PLAN ===== */}
      <section className="gt-sec gt-mp">
        <div className="gt-sec-head">
          <h2 className="gt-sec-title">Master plan a 2029</h2>
          <span className="gt-sec-hint">Los cinco segmentos, del objetivo hacia atrás desde los {gN(mp.baseCli)} clientes de hoy: {gN(mp.objCli)} clientes y {gEur(mp.fin.eur)} a cierre de 2029. Es la tesis del equipo; el compromiso con la Serie A está en su propia pestaña.</span>
          <div className="gt-qt-lv">
            <label>Utilización</label>
            <div className="gt-num">
              <button onClick={() => set('utilizacion', Math.max(0.05, +(p.utilizacion - 0.05).toFixed(2)))}>−</button>
              <span className="mono">{gP(p.utilizacion, 0)}</span>
              <button onClick={() => set('utilizacion', Math.min(1, +(p.utilizacion + 0.05).toFixed(2)))}>+</button>
            </div>
          </div>
        </div>
        <window.MasterPlan p={p} model="unicorn"/>
      </section>
      {/* ===== PRICING ===== */}
      <window.PricingBlock
        tiers={mp.tiers.map(t => ({ id: t.id, label: t.label, color: t.color, eur: t.fin.eur, cli: t.objetivo }))}
        titulo="Facturación y pricing a 2029"
        nota="Sobre el loanbook del plan ambicioso."/>

      {/* ===== PALANCAS ===== */}
      <div className="gt-levers gt-levers-mp">
        {mp.tiers.map(t => (
          <React.Fragment key={t.id}>
            <Lever label={(t.objShare != null ? 'Cuota en ' : 'Clientes en ') + t.label}
              hint={t.objShare != null
                ? gN(t.objetivo) + ' clientes sobre ' + gK(t.universo) + (t.late ? ' · fuerte en 28-29' : '')
                : t.objFuente + ' · BP pide ' + gN((bpRef.porTier[t.id] || {}).cli)}>
              <div className="gt-num">
                {t.objShare != null ? <>
                  <button onClick={() => setShare(t.id, -0.001)}>−</button>
                  <span className="mono">{gP(t.objShare, 1)}</span>
                  <button onClick={() => setShare(t.id, 0.001)}>+</button>
                </> : <>
                  <button onClick={() => setObj(t.id, -25)}>−</button>
                  <span className="mono">{gN(t.objetivo)}</span>
                  <button onClick={() => setObj(t.id, 25)}>+</button>
                </>}
              </div>
            </Lever>
            <Lever label={'Línea media en ' + t.label} hint={'hoy ' + gKeur(t.ticket0) + ' · objetivo a dic 29'}>
              <div className="gt-num">
                <button onClick={() => setTicket(t.id, -(t.ticket >= 1e6 ? 250000 : 25000))}>−</button>
                <span className="mono">{gKeur(t.ticket)}</span>
                <button onClick={() => setTicket(t.id, t.ticket >= 1e6 ? 250000 : 25000)}>+</button>
              </div>
            </Lever>
          </React.Fragment>
        ))}
        <Lever label="Utilización" hint={'la cartera real va al ' + gP(window.pfReal(window.PF_META.realHasta).util, 0)}>
          <div className="gt-num">
            <button onClick={() => set('utilizacion', Math.max(0.05, +(p.utilizacion - 0.05).toFixed(2)))}>−</button>
            <span className="mono">{gP(p.utilizacion, 0)}</span>
            <button onClick={() => set('utilizacion', Math.min(1, +(p.utilizacion + 0.05).toFixed(2)))}>+</button>
          </div>
        </Lever>
        <Lever label="Forma · normal" hint={'Corporate, Mid Market y SME Big · acumulado al cierre de año'}>
          <div className="gt-ramp">
            {window.GTM_BP_SHAPE.map(s => (
              <span key={s.year} className="mono">{s.year} <b>{gP(s.cum, 0)}</b></span>
            ))}
          </div>
        </Lever>
        <Lever label="Forma · tardía" hint={mp.tiers.filter(t => t.late).map(t => t.label).join(' y ') + ' · el grueso en 28-29'}>
          <div className="gt-ramp late">
            {window.GTM_LATE_SHAPE.map(s => (
              <span key={s.year} className="mono">{s.year} <b>{gP(s.cum, 0)}</b></span>
            ))}
          </div>
        </Lever>
      </div>

      {/* ===== CONTRA EL COMPROMISO ===== */}
      {(() => {
        const cliX = bpRef.comun.cli ? mp.objCli / bpRef.comun.cli : null;
        const eurX = bpRef.comun.eur ? mp.fin.eur / bpRef.comun.eur : null;
        const flojo = cliX != null && cliX <= 1;
        return (
          <div className={'gt-amb ' + (flojo ? 'bad' : 'ok')}>
            <div className="gt-amb-h">{flojo ? 'Este plan no es ambicioso' : 'Ambición sobre el compromiso'}</div>
            <div className="gt-amb-n mono">×{g1(cliX)}<em>clientes</em></div>
            <div className="gt-amb-n mono">×{g1(eurX)}<em>loanbook</em></div>
            <div className="gt-amb-d">
              Sobre los mismos segmentos, el BP Serie A pide {gN(bpRef.comun.cli)} clientes y {gEur(bpRef.comun.eur)} de loanbook, y este plan {gN(mp.objCli)} y {gEur(mp.fin.eur)}.
              {flojo
                ? <> Un objetivo de equipo por debajo de lo firmado con inversores no cumple su función: el BP es el suelo, no la meta. Sube los objetivos hasta que el plan dé miedo.</>
                : <> La regla de ambición: si el plan se cumple siempre, estaba mal puesto. Debe fallar cerca de la mitad de las veces.</>}
            </div>
          </div>
        );
      })()}
      {/* ===== LECTURAS ===== */}
      <section className="gt-sec">
        <div className="gt-sec-head"><h2 className="gt-sec-title">Lo que dice el plan</h2></div>
        <div className="gt-reads">
          <div className="gt-read sev-info">
            <h3>El crecimiento que pide el objetivo</h3>
            <p>De {gN(mp.baseCli)} clientes en cartera a {mp.realHasta} —la misma cifra que Portfolio— a <b>{gN(mp.objCli)}</b> en dic 2029 son {gN(mp.objCli - mp.baseCli)} clientes nuevos,
            {' '}una media de {g1((mp.objCli - mp.baseCli) / mp.months.length)} al mes. La forma del BP no los reparte por igual: {mp.years.map(y => gN(y.nuevos) + ' en ' + y.y).join(', ')}.
            {' '}El último año pide {g1(mp.years[3].nuevos / Math.max(1, mp.years[1].nuevos))}× lo de 2027, así que el plan descansa en la segunda mitad.</p>
          </div>
          <div className="gt-read sev-ok">
            <h3>Dónde está el dinero: la línea, no el número de clientes</h3>
            <p>{mp.tiers.map(t => t.label + ' ' + gP(t.fin.eur / mp.fin.eur, 0) + ' del loanbook con ' + gP(t.fin.cli / mp.fin.cli, 0) + ' de los clientes').join('; ')}.
            {' '}La diferencia es la línea media, que además tiene recorrido: {mp.tiers.map(t => t.label + ' ' + gKeur(t.ticket0) + '→' + gKeur(t.ticket)).join(', ')}.
            {' '}Subir la línea media un 10% vale lo mismo que {gN(Math.round(mp.objCli * 0.1))} clientes más, y no consume plantilla.</p>
          </div>
          <div className="gt-read sev-info">
            <h3>La utilización es la palanca silenciosa</h3>
            <p>Al {gP(mp.util, 0)} de utilización, {gEur(mp.fin.lineas)} de líneas dan {gEur(mp.fin.eur)} en balance. Hoy la cartera real va al {gP(window.pfReal(window.PF_META.realHasta).util, 0)}.
            {' '}Cada cinco puntos son {gEur(mp.fin.lineas * 0.05)} de loanbook sin un cliente más ni un euro más de límite aprobado.
            {' '}Es la única de las cuatro dimensiones que no depende de vender: depende de operativa y de producto.</p>
          </div>
          <div className="gt-read sev-info">
            <h3>Cuota de mercado: en dos segmentos es el objetivo</h3>
            <p>En SME Mid y SME Small el objetivo se fija <b>en cuota</b>, no en número: {mp.tiers.filter(t => t.objShare != null).map(t => gP(t.objShare, 1) + ' en ' + t.label).join(' y ')}, que son {mp.tiers.filter(t => t.objShare != null).map(t => gN(t.objetivo)).join(' y ')} clientes sobre universos de {mp.tiers.filter(t => t.objShare != null).map(t => gK(t.universo)).join(' y ')} empresas. El conjunto queda en {gP(mp.fin.share, 2)} de cuota.
            {' '}{mp.tiers.filter(t => t.fin.share != null).map(t => t.label + ' ' + gP(t.fin.share, 2)).join(', ')}.
            {' '}El objetivo no está limitado por tamaño de mercado, así que lo que decide es la capacidad de ejecución — y eso se mide en las pestañas de canal.</p>
          </div>
        </div>
      </section>

      <div className="gt-foot">
        Este plan es la referencia de largo plazo y solo se ajusta por sus cuatro dimensiones: el objetivo de clientes por tier, la línea media, la utilización y la forma del recorrido.
        El universo de cuota viene del motor AEAT de la pestaña Mercado. Cómo se consigue cada cliente —deals, conversión, precio, encaje, plantilla— se trabaja en Outbound, Brokers, Follow ups y Funnel, donde las variables se pueden mover sin mover el objetivo.
      </div>
    </div>
  );
};
