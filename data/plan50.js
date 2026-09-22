// Puente operativo a los 50M€ de diciembre: de dónde viene el desajuste y qué hay que hacer.
// Identidad que ordena todo: Loanbook = clientes × línea media × utilización.
// Fuentes: Report_líneas_vs_outstanding_v6 (10-jul-2026) · HubSpot export 12-sep-2026 · BP Barlon P&L Mensual.

window.P50_META = {
  cartera: 'Report de líneas vs outstanding, 10-jul-2026',
  hubspot: 'HubSpot · export de deals, 12-sep-2026',
  aviso: 'El report de cartera cubre 14,3M€ de outstanding sobre 52 clientes; el modelo financiero trabaja con 19,1M€ de loanbook medio en agosto. La diferencia (4,8M€) son operaciones fuera del perímetro del report y se mantiene plana en el puente, sin atribuirle mejora.',
};

// ── Los cuatro drivers, en los dos segmentos que hacen la diferencia ─────────
window.P50_DRIVERS = [
  { id: 'midmkt', label: 'Mid Market', color: '#8E6E2A',
    bp:  { cli: 27, linea: 1077560, util: 0.718, lb: 20900000 },
    real:{ cli: 16, linea: 1175221, util: 0.459, lb: 8632979 },
    obj: { cli: 32, linea: 1292743, util: 0.75,  lb: 31025835 },
    // cliOut: clientes que además tienen disposición viva
    cliOut: 11 },
  { id: 'big', label: 'SME Big', color: '#2E7D5B',
    bp:  { cli: 42, linea: 205550, util: 0.707, lb: 6100000 },
    real:{ cli: 27, linea: 319753, util: 0.416, lb: 3594209 },
    obj: { cli: 44, linea: 358996, util: 0.75,  lb: 11846851 },
    cliOut: 19 },
];

// ── Descomposición del desajuste a jul-26 (real contra BP en el mismo mes) ───
// Efecto = Δdriver × los otros dos drivers, en el orden clientes → línea → utilización.
window.P50_GAP = (function () {
  return window.P50_DRIVERS.map(s => {
    const b = s.bp, r = s.real;
    const cli = (r.cli - b.cli) * b.linea * b.util;
    const lin = r.cli * (r.linea - b.linea) * b.util;
    const uti = r.cli * r.linea * (r.util - b.util);
    return { id: s.id, label: s.label, color: s.color, cli, lin, uti, total: cli + lin + uti, bp: b.lb, real: r.lb };
  });
})();

// ── Lo que dice HubSpot sobre la máquina comercial ───────────────────────────
window.P50_HS = [
  { k: 'Conversión de deal a cliente', bp: '10% supuesto en el plan', real: '36,1% en Mid Market · 35,3% en SME Big', v: 'ok',
    d: 'Sobre 183 y 232 deals cerrados. La conversión no es el problema: bate al plan por tres veces.' },
  { k: 'Línea media firmada', bp: '1.078k€ Mid Market · 206k€ SME Big', real: '1.175k€ · 320k€', v: 'ok',
    d: 'El ticket real supera al del BP en los dos segmentos, un 9% y un 56%.' },
  { k: 'Utilización de la línea', bp: '80% en régimen a dic-26 · 71% implícito a jul-26', real: '45,9% · 41,6% · 45% los dos juntos, sobre cartera sana', v: 'bad',
    d: '15,2M€ concedidos y no dispuestos en los dos segmentos de foco. Aquí está la mitad del desajuste, y no requiere vender nada. Sobre cartera completa, incluida la de más de sesenta días, Mid Market sale al 50,6%: es la cifra que usa la matriz trimestral.' },
  { k: 'Generación de deals', bp: '—', real: '240/mes de marzo a julio · 127 en agosto · 54 en septiembre', v: 'bad',
    d: 'El motor de entrada se ha frenado justo cuando hace falta llenar el trimestre de cierre.' },
  { k: 'Clientes con línea sin disposición', bp: '—', real: '5 de 16 en Mid Market · 8 de 27 en SME Big', v: 'warn',
    d: 'Trece clientes firmados que no han dispuesto un euro. Son los primeros de la lista de activación.' },
  { k: 'Mezcla de canal', bp: 'Outbound como motor', real: 'Outbound 2,1% de cierre · partners 18,1% · referral 53,4%', v: 'bad',
    d: 'El outbound se llevó el 40% de los deals creados en 2026 y aportó el 2% de los ganados.' },
];

// ── Puente a 50M€ de loanbook a cierre de diciembre ─────────────────────────
window.P50_PUENTE = [
  { k: 'Cartera dispuesta hoy', v: 14283005, t: 'base',
    d: 'Los 52 clientes del report a 10-jul: 8,6M€ en Mid Market, 3,6M€ en SME Big y 2,1M€ en el resto.' },
  { k: 'Disponer lo ya firmado', v: 8350466, t: 'pos',
    d: 'Llevar la utilización de los dos segmentos de foco del 45% al 75% sobre las líneas ya concedidas. No exige un cliente nuevo: exige que la deuda esté disponible para fondear las disposiciones.' },
  { k: 'Ampliar línea a los actuales', v: 4115531, t: 'pos',
    d: '+20% de línea media sobre los 43 clientes que ya tienen línea, al 75% de utilización. Es el upselling por cohortes que el BP ya modelaba.' },
  { k: 'Clientes nuevos de foco', v: 18179503, t: 'pos',
    d: '33 clientes nuevos —16 en Mid Market y 17 en SME Big— a la línea media real y 75% de utilización.' },
  { k: 'Otras operaciones', v: 4788290, t: 'flat',
    d: 'La parte del loanbook del modelo financiero fuera del perímetro del report de cartera. Se mantiene plana, sin atribuirle crecimiento.' },
  { k: 'Loanbook a dic-26', v: 49716795, t: 'base',
    d: 'Objetivo del BP: 50,0M€. El puente lo alcanza sin ningún supuesto por encima de lo que la cartera y HubSpot ya demuestran.' },
];

// ── Prueba de que los 32 clientes nuevos caben ───────────────────────────────
window.P50_PRUEBA = [
  { k: 'Deals abiertos hoy en foco', v: '260', d: '139 en Mid Market y 121 en SME Big, sobre el export de HubSpot.' },
  { k: 'Clientes esperados al win rate real', v: '93', d: '139 × 36,1% más 121 × 35,3%. No hace falta mejorar la conversión.' },
  { k: 'Clientes necesarios', v: '33', d: 'El 35% de lo que el pipeline abierto ya promete.' },
  { k: 'Ritmo mensual necesario', v: '8/mes', d: 'El BP pedía 5 al mes en estos dos segmentos. Hay que hacer 1,6 veces el plan durante cuatro meses.' },
  { k: 'Ciclo mediano de deal a cliente', v: '0,8 meses', d: 'Sobre 597 deals ganados; p75 en 2,0 meses. El pipeline abierto cabe en el trimestre.' },
];

// ── Plan de acción ───────────────────────────────────────────────────────────
window.P50_PLAN = [
  { n: '1', t: 'Activación de líneas concedidas', dueno: 'CS + Riesgos', cuando: 'Desde la disposición de octubre', pi: 1,
    d: 'Barrido cliente a cliente de los 15,2M€ concedidos y no dispuestos, empezando por los trece que están a cero. Métrica semanal en el comité: utilización de los dos segmentos de foco, del 45% al 75%.',
    riesgo: 'Depende de que el nuevo proveedor de deuda esté operativo en octubre. Es el único punto del plan que no controla el equipo comercial.' },
  { n: '2', t: 'Ampliación de línea a la cartera viva', dueno: 'AE de cuenta', cuando: 'Octubre y noviembre', pi: 2,
    d: 'Revisión de límite de los 43 clientes con línea. El ticket real ya supera al del BP, así que la ampliación se apoya en comportamiento observado, no en una hipótesis.',
    riesgo: 'Consume capacidad de riesgos en el mismo trimestre en que hay que aprobar los clientes nuevos.' },
  { n: '3', t: 'Cierre del pipeline abierto de foco', dueno: 'Ventas', cuando: 'Octubre a diciembre', pi: 3,
    d: '33 clientes nuevos entre Mid Market y SME Big, el 35% de los 93 que el pipeline abierto promete al win rate ya demostrado. Prioridad a los 132 deals en negociación y a los 59 en riesgos.',
    riesgo: 'Es el tramo más exigente: 8 clientes al mes contra los 5 del BP, y con el equipo de riesgos como cuello de botella.' },
  { n: '4', t: 'Reponer la generación de deals', dueno: 'Ventas + Partners', cuando: 'Inmediato',
    q: 'Sostiene 2027',
    d: 'Volver a 240 deals al mes y mover el esfuerzo de outbound a partners y referral: el outbound se llevó el 40% de los deals de 2026 y produjo el 2% de los ganados, mientras partners cierra al 18,1% y referral al 53,4%.',
    riesgo: 'No aporta loanbook en 2026 por el desfase de ciclo. Es la palanca que decide si enero arranca con pipeline o vacío.' },
];
