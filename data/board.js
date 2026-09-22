// Board septiembre 2026 · comparativa BP Serie A (Barlon) — Revisión mayo — Forecast septiembre (v10)
// Cifras literales de los tres modelos. Nada se recalcula salvo lo que se declara como derivado.
// Fuentes: BP_Kintai_comite_Barlon_v2.xlsx (P&L, P&L Mensual) · Excel for Review Meeting - may-26.xlsx (BP 2026)
//          Kintai_Forecast_2026_board_v10.xlsx (Resumen Ejecutivo)

window.BD_COLS = [
  { id: 'bp',  label: 'BP Serie A',     sub: 'Barlon · cierre de ronda', color: '#2A3349' },
  { id: 'may', label: 'Revisión mayo',  sub: '1er board post-ronda',     color: '#8E6E2A' },
  { id: 'fc',  label: 'Forecast sept',  sub: 'real ene-ago + fcst sep-dic', color: '#1F5C42' },
];

// Relato: tres hechos, tres consecuencias.
window.BD_STORY = [
  { n: '1', t: 'La ronda se retrasó cuatro meses',
    d: 'Cerrábamos en enero y el dinero no entró hasta mayo. El loanbook quedó plano en ~19M€ durante todo el primer semestre: ocho meses sin capital para originar.',
    m: 'Loanbook medio ene-ago: 19,2M€ contra 28,2M€ del BP' },
  { n: '2', t: 'En mayo subimos el objetivo a 65M€ para compensar',
    d: 'Con la deuda barata de Unicredit dentro, el segundo semestre recuperaba el retraso y cerrábamos por encima del BP inicial, lo que permitía llegar a la facturación comprometida del año.',
    m: 'Loanbook dic-26 revisado: 64,3M€ contra 50,0M€ del BP' },
  { n: '3', t: 'Unicredit se cayó y hemos cerrado otro proveedor',
    d: 'Rehacer la financiación ha consumido el verano. El nuevo proveedor entra en funcionamiento en octubre, así que la originación del segundo semestre arranca dos meses tarde respecto al plan de mayo.',
    m: 'Disposición de 22M€ en octubre en el modelo actual' },
];

// ── Comparativa. m = anual 2026, d = diciembre 2026. Todo en € ────────────────
// nota: texto al pie de la fila cuando el dato necesita una advertencia.
window.BD_ROWS = [
  { id: 'lbeop', g: 'Loanbook', label: 'Loanbook a cierre (EoP)', fmt: 'M',
    a: { bp: 49951000, may: 64250000, fc: 50000000 },
    d: { bp: 49951000, may: 64250000, fc: 50000000 } },
  { id: 'lbavg', g: 'Loanbook', label: 'Loanbook medio', fmt: 'M',
    a: { bp: 33980000, may: 33790000, fc: 23418109 },
    d: { bp: 48700000, may: 61325000, fc: 44000000 } },
  { id: 'rev', g: 'Resultado', label: 'Revenue', fmt: 'k', hero: true,
    a: { bp: 10020170, may: 10045528, fc: 7802018 },
    d: { bp: 1157000, may: 1465000, fc: 1216368 } },
  { id: 'coc', g: 'Resultado', label: 'Coste de capital', fmt: 'k', neg: true,
    a: { bp: -3738050, may: -3738054, fc: -4083153 },
    d: { bp: -446117, may: -446117, fc: -507542 },
    nota: 'El forecast paga más coste de capital sobre menos loanbook: la deuda nueva entra en octubre y el tramo antiguo sigue vivo todo el año.' },
  { id: 'mb', g: 'Resultado', label: 'Margen bruto', fmt: 'k',
    a: { bp: 6282110, may: 6307474, fc: 3718865 },
    d: { bp: 710883, may: 1018883, fc: 708826 } },
  { id: 'opex', g: 'Resultado', label: 'Coste operativo', fmt: 'k', neg: true,
    a: { bp: -5240200, may: -5658987, fc: -5452170 },
    d: { bp: -517800, may: -603823, fc: -686979 } },
  { id: 'oneoff', g: 'Resultado', label: '— del que one-off', fmt: 'k', neg: true, sub: true,
    a: { bp: -750000, may: null, fc: -713600 },
    d: { bp: -62500, may: null, fc: -225600 },
    nota: 'En el BP el one-off era el fee del broker de deuda. En el forecast son rescisiones y el coste de rehacer la financiación. El modelo de mayo no lo separaba.' },
  { id: 'cap', g: 'Resultado', label: 'Trabajos capitalizados', fmt: 'k',
    a: { bp: 600000, may: 985680, fc: 797052 },
    d: { bp: 50000, may: 108875, fc: 75000 } },
  { id: 'ebconso', g: 'EBITDA', label: 'EBITDA contable sin one-off', fmt: 'k', hero: true,
    a: { bp: 2391910, may: null, fc: -222652 },
    d: { bp: 305700, may: null, fc: 322447 },
    nota: 'El modelo de mayo no separaba one-off, así que no tiene línea equivalente.' },
  { id: 'ebcon', g: 'EBITDA', label: '— EBITDA contable con one-off', fmt: 'k', sub: true,
    a: { bp: 1641910, may: 1634166, fc: -936252 },
    d: { bp: 243200, may: 523934, fc: 96847 } },
  { id: 'def', g: 'EBITDA', label: 'Coste de default', fmt: 'k', neg: true,
    a: { bp: -1019470, may: -968538, fc: -750000 },
    d: { bp: -121750, may: -160624, fc: -40071 },
    est: { d: ['bp'] } },
  { id: 'ebpost', g: 'EBITDA', label: 'EBITDA contable post-default', fmt: 'k',
    a: { bp: 622440, may: 665628, fc: -1686252 },
    d: { bp: 121450, may: 363310, fc: 56777 } },
  { id: 'ebcso', g: 'EBITDA', label: 'EBITDA cash sin one-off', fmt: 'k', hero: true,
    a: { bp: 1791910, may: 648487, fc: -1019705 },
    d: { bp: 255700, may: 415060, fc: 247447 } },
  { id: 'ebc', g: 'EBITDA', label: '— EBITDA cash con one-off', fmt: 'k', sub: true,
    a: { bp: 1041910, may: 648487, fc: -1733305 },
    d: { bp: 193200, may: 415060, fc: 21847 } },
];

window.BD_GRUPOS = ['Loanbook', 'Resultado', 'EBITDA'];

// ── Series mensuales 2026 ────────────────────────────────────────────────────
window.BD_MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
window.BD_REAL_HASTA = 8; // ene-ago son reales; sep-dic, forecast

window.BD_SERIES = {
  // Loanbook medio mensual, €M
  lb: {
    bp:  [20.3, 22.0, 24.1, 26.8, 29.7, 32.5, 35.3, 38.1, 40.8, 43.5, 46.1, 48.7],
    may: [19.67, 20.59, 22.71, 24.41, 25.20, 27.88, 31.76, 33.27, 36.77, 46.43, 55.50, 61.33],
    fc:  [20.28, 18.90, 18.73, 19.15, 19.02, 18.68, 19.65, 19.07, 22.04, 27.50, 34.00, 44.00],
  },
  // Revenue mensual, k€
  rev: {
    bp:  [504.7, 555.3, 616.6, 688.5, 750.3, 811.2, 871.1, 930.1, 988.2, 1045.3, 1101.6, 1157.0],
    may: [471.0, 523.0, 587.0, 601.8, 618.8, 724.0, 788.0, 780.0, 939.0, 1210.0, 1338.0, 1465.0],
    fc:  [445.0, 459.6, 510.7, 656.6, 522.5, 556.2, 510.6, 501.3, 680.4, 775.3, 967.2, 1216.4],
  },
};

// Tabla anexa: detalle mes a mes del forecast (€)
window.BD_MENSUAL = [
  { k: 'Loanbook medio', fmt: 'M', v: [20281071, 18902609, 18726603, 19150401, 19018685, 18681114, 19649887, 19071295, 22035648, 27500000, 34000000, 44000000], tot: 23418109, totLabel: 'medio' },
  { k: 'Loanbook EoP', fmt: 'M', v: [null, null, null, null, null, null, null, null, 25000000, 30000000, 38000000, 50000000], tot: 50000000, totLabel: 'dic' },
  { k: 'Revenue', fmt: 'k', v: [444991, 459623, 510739, 656608, 522546, 556184, 510648, 501347, 680417, 775297, 967249, 1216368], tot: 7802018 },
  { k: 'Coste de capital', fmt: 'k', neg: true, v: [-278816, -246259, -274143, -259203, -287564, -281073, -295861, -297060, -312258, -612442, -430932, -507542], tot: -4083153 },
  { k: 'Margen bruto', fmt: 'k', v: [166175, 213364, 236596, 397405, 234982, 275111, 214787, 204287, 368160, 162855, 536317, 708826], tot: 3718865 },
  { k: 'Coste operativo', fmt: 'k', neg: true, v: [-335195, -307006, -355007, -501357, -353740, -393332, -350422, -386754, -427536, -674464, -680379, -686979], tot: -5452170 },
  { k: 'EBITDA contable', fmt: 'k', v: [-117906, -30056, -50202, -35806, -44746, -45046, -70303, -128989, 624, -441609, -69061, 96847], tot: -936252 },
  { k: 'EBITDA contable sin one-off', fmt: 'k', v: [-117906, -30056, -50202, -35806, -44746, -45046, -70303, -128989, 20624, -207609, 164939, 322447], tot: -222652 },
  { k: 'EBITDA cash', fmt: 'k', v: [-169020, -93642, -118411, -103952, -118757, -118221, -135635, -182467, -59376, -511609, -144061, 21847], tot: -1733305 },
  { k: 'EBITDA cash sin one-off', fmt: 'k', v: [-169020, -93642, -118411, -103952, -118757, -118221, -135635, -182467, -39376, -277609, 89939, 247447], tot: -1019705 },
  { k: 'Coste de default', fmt: 'k', neg: true, v: [0, 0, 0, 0, 0, 0, 0, -633854, -20068, -25044, -30964, -40071], tot: -750000 },
  { k: 'EBITDA contable post-default', fmt: 'k', v: [-117906, -30056, -50202, -35806, -44746, -45046, -70303, -762843, -19444, -466653, -100025, 56777], tot: -1686252 },
  { k: 'Caja acumulada', fmt: 'k', v: [null, null, null, null, null, null, null, null, 2920556, 1183903, 688878, 190655], tot: 190655, totLabel: 'dic' },
];

window.BD_MENSUAL_NOTA = 'El modelo sólo arrastra caja desde septiembre, cuando entra la financiación: los meses anteriores van en blanco, no en cero. El salto de default de agosto (−633,9k€) es el impairment de la cartera antigua reconocido en el mes, no una tasa corriente.';

// ── Puente de revenue anual: de dónde salen los −2,35M€ ──────────────────────
window.BD_BRIDGE = (function () {
  // Misma base de BP que la tabla comparativa: el P&L del BP Barlon, no la columna
  // "BP 2026" del forecast, que arrastra una restatement de 130k€ y descuadraría el puente.
  const revBp = 10020170;
  const lbBp = 33980000, lbFc = 23418109; // loanbook medio
  const revFc = 7802018;
  const taeBp = revBp / lbBp, taeFc = revFc / lbFc;
  const volumen = (lbFc - lbBp) * taeBp;
  const precio = lbFc * (taeFc - taeBp);
  return { revBp, revFc, lbBp, lbFc, taeBp, taeFc, volumen, precio, total: revFc - revBp };
})();

// ── Salida a 2027 ────────────────────────────────────────────────────────────
window.BD_2027 = [
  { k: 'Loanbook a cierre dic-27', fmt: 'M', bp: 171180000, fc: 100000000 },
  { k: 'Revenue 2027', fmt: 'k', bp: 27419870, fc: 20315470 },
  { k: 'EBITDA contable 2027', fmt: 'k', bp: 9373080, fc: 6378981 },
  { k: 'EBITDA post-default 2027', fmt: 'k', bp: 6055270, fc: 4101481 },
];

// ── Caja ─────────────────────────────────────────────────────────────────────
window.BD_CAJA = {
  dic26: 190655,
  min27: -532294, min27Mes: 'mar-27',
  vuelta: 'may-27',
  serie: [2920556, 1183903, 688878, 190655, 83604, -321604, -532294, -511395, 542034],
  serieMeses: ['sep-26', 'oct-26', 'nov-26', 'dic-26', 'ene-27', 'feb-27', 'mar-27', 'abr-27', 'may-27'],
};

window.BD_DA_NOTA = 'El forecast no modela amortizaciones, así que el EBIT del forecast se calcula con la dotación del modelo de mayo (340,2k€ al año, 32,5k€ en diciembre): es la base de activos más parecida disponible y va marcada como estimada. El BP tampoco publica default ni amortización mensuales: diciembre se deriva de sus tasas anuales. Los EBIT anuales del BP (402,4k€) y de mayo (325,4k€) sí son literales de sus P&L y cuadran al céntimo con esta cascada.';
window.BD_FUENTES = 'BP Serie A: BP_Kintai_comite_Barlon_v2.xlsx, pestañas P&L y P&L Mensual. Revisión mayo: Excel for Review Meeting - may-26.xlsx, pestaña BP 2026. Forecast septiembre: Kintai_Forecast_2026_board_v10.xlsx, pestaña Resumen Ejecutivo (la pestaña Comparativa del mismo fichero arroja un revenue 2026 de 8,01M€ por arrastrar una columna distinta; aquí manda Resumen Ejecutivo). El beneficio neto queda fuera de la comparativa por decisión de dirección: el forecast no modela D&A, financieros ni impuestos y la línea no sería comparable entre los tres.';
