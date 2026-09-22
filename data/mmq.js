// Mid Market · matriz trimestral 2026: actual contra target, con la cascada completa
// Loanbook BoP → deals → conversión → clientes → ticket → utilización → new loanbook → EoP.
//
// Una advertencia que manda sobre todo lo demás: el BP arranca Mid Market en 7,9M€ y el report
// de cartera lo arranca en 14,0M€ porque no cortan el segmento igual. Para que la comparación
// sea legible, el TARGET se reexpresa sobre el punto de partida real: se toma el loanbook real
// de dic-25 y se le aplican los incrementos trimestrales del BP (activaciones + upselling − churn).
// Los ratios del target —conversión, ticket, utilización— son los del BP sin tocar.

window.MMQ_META = {
  fuente: 'Target: BP Barlon, P&L Mensual, filas de Mid Market. Actual: report de líneas vs outstanding a 10-jul-2026 y export de HubSpot a 12-sep-2026.',
  rebase: 'El target se reexpresa sobre el loanbook real de diciembre de 2025 (12,1M€) porque el BP partía de 7,9M€ en este segmento: se comparan trayectorias, no niveles de partida.',
  perimetro: 'Todas las cifras reales salen del mismo sitio que la tabla de clientes de más abajo —el report de líneas, cliente a cliente— y recogen la cartera completa, incluida la que lleva más de sesenta días de retraso. Por eso el outstanding de julio es de 9,5M€ y no de los 8,6M€ que usa la tabla por segmento, que sólo cuenta cartera sana.',
  q3: 'Q3 está en curso y cada fila tiene su propio corte: la cartera se cierra con el report del 10-jul y los deals con el export del 12-sep. El target de Q3 va prorrateado a esa misma fecha en cada fila, de modo que la desviación compara periodos iguales.',
  deals: 'HubSpot no expone creación de deals por segmento y mes: los deals de Mid Market se estiman con el 6,8% que el segmento pesa en el CRM (322 de 4.712 deals). Va marcado como estimado.',
};

window.MMQ_TOT = { label: '2026', sub: 'acumulado a la fecha' };
window.MMQ_COLS = [
  { id: 'q1', label: 'Q1', sub: 'ene–mar' },
  { id: 'q2', label: 'Q2', sub: 'abr–jun' },
  { id: 'q3', label: 'Q3', sub: 'parcial', parcial: true },
];

// fmt: M millones · k miles · n número · pct porcentaje
// dir: 'alto' un valor mayor es mejor · null sin semáforo
window.MMQ_ROWS = [
  { id: 'bop', label: 'Loanbook BoP', fmt: 'k', tipo: 'saldo', agg: 'first',
    real: [12116000, 11718000, 11887000], target: [12116000, 16466000, 23066000] },
  { id: 'deals', label: 'Deals generados', fmt: 'n', dir: 'alto', est: true, agg: 'sum',
    real: [55, 56, 29], target: [60, 60, 48], corte: 'deals a 12-sep' },
  { id: 'altas', label: 'Altas brutas', fmt: 'n', dir: 'alto', dabs: true, agg: 'sum',
    real: [0, 4, 1], target: [6, 6, 0.6], corte: 'cartera a 10-jul' },
  { id: 'bajas', label: 'Bajas', fmt: 'n', dir: 'bajo', dabs: true, agg: 'sum',
    real: [0, 2, 1], target: [0, 0, 0], corte: 'cartera a 10-jul' },
  { id: 'cli', label: 'Clientes nuevos netos', fmt: 'n', dir: 'alto', dabs: true, agg: 'sum',
    real: [0, 2, 0], target: [6, 6, 0.6], corte: 'cartera a 10-jul' },
  { id: 'conv', label: 'Conversión a cliente', fmt: 'pct', dir: 'alto', agg: 'conv',
    real: [0, 0.036, 0], target: [0.10, 0.10, 0.10] },
  { id: 'ticket', label: 'Ticket medio', fmt: 'k', dir: 'alto', agg: 'last',
    real: [1150253, 1193971, 1175221], target: [1077560, 1077560, 1077560] },
  { id: 'util', label: 'Utilización media', fmt: 'pct', dir: 'alto', agg: 'last',
    real: [0.728, 0.622, 0.506], target: [0.596, 0.698, 0.718], corte: 'cartera a 10-jul' },
  { id: 'new', label: 'New loanbook', fmt: 'k', dir: 'alto', dabs: true, formula: 'clientes netos × ticket medio × utilización', agg: 'sum',
    real: [0, 1486000, 0], target: [3853000, 4513000, 503000], corte: 'cartera a 10-jul' },
  { id: 'exist', label: 'Variación de la cartera existente', fmt: 'k', dir: 'alto', dabs: true, agg: 'sum',
    real: [-398000, -1317000, -2376000], target: [497000, 2087000, 174000], corte: 'cartera a 10-jul' },
  { id: 'eop', label: 'Loanbook EoP', fmt: 'k', tipo: 'saldo', hero: true, dir: 'alto', agg: 'last',
    real: [11718000, 11887000, 9511000], target: [16466000, 23066000, 23743000], corte: 'cartera a 10-jul' },
];
window.MMQ_NOTAS = {
  conv: 'Clientes netos sobre deals creados. El objetivo es el ratio del plan, el mismo en los tres trimestres y en el año; el real acumulado sí es un cociente, dos clientes netos entre 140 deals, con la cartera cortada al 10-jul y los deals al 12-sep.',
  altas: 'Clientes de Mid Market que firman su primera línea en el trimestre. Son los que la tabla de cartera de abajo etiqueta como nuevos de 2026.',
  cli: 'Altas menos bajas: cinco altas y tres bajas en el año dejan dos clientes netos. Es la cifra que multiplica en la fila de new loanbook, y por eso va separada del bruto.',
  util: 'El target de Q1 es bajo porque el BP arranca con las cohortes sin madurar y sube hasta el 80% en régimen a diciembre. Por eso Q1 sale en verde: el deterioro se lee en la secuencia de desviaciones de esta misma fila.',
  exist: 'Se calcula como residuo —loanbook de cierre menos el de apertura menos el nuevo— para que la cascada cuadre al millar en las cuatro columnas. Recoge lo que pasa con los clientes que ya estaban: amortización, churn y, sobre todo, el cambio de utilización. En el BP es positiva porque el plan sube la línea de las cohortes existentes; en el real es el agujero.',
  q3real: 'Cartera a 10-jul · deals a 12-sep',
};

window.MMQ_VEREDICTO = [
  { k: 'Deals', v: 'mix', t: '−17%',
    d: 'Acumulado del año: 140 deals contra los 168 que pide el plan prorrateado a 12-sep. Q1 y Q2 van casi en línea (−8% y −7%) y el hueco se abre en Q3, a −40%. No es el cuello de botella principal, pero se está frenando.' },
  { k: 'Conversión', v: 'bad', t: '1,4% neto',
    d: 'Cinco altas y tres bajas dejan dos clientes netos en el año sobre 140 deals creados, contra el 10% del plan. Incluso contando sólo altas brutas la conversión se queda en el 3,6%. Sobre deals cerrados la conversión real es del 36,1%, así que la capacidad existe: lo que no ocurre es el cierre. 139 de los 322 deals de Mid Market siguen abiertos.' },
  { k: 'Ticket medio', v: 'ok', t: '+9%',
    d: 'Por encima del plan en los tres trimestres, y subiendo un 25% en el año: de 940k€ en diciembre de 2025 a 1.175k€ en julio.' },
  { k: 'Utilización', v: 'bad', t: '−21,2 pp',
    d: 'Contra el 71,8% que el BP implica a la misma fecha; contra el 80% de régimen de diciembre serían −29 pp. De 92,1% en diciembre de 2025 a 50,6% en julio: es la caída que convierte un año plano en un año negativo.' },
];

window.MMQ_CIERRE = 'La matriz deja el diagnóstico en dos filas. La de arriba —deals y ticket— dice que la máquina comercial funciona. La de abajo —conversión y utilización— dice que ni se cierran las operaciones ni se disponen las líneas firmadas, y las dos cosas tienen la misma causa: sin capital comprometido, el deal espera y la línea no se fondea. El resultado es la última fila: el BP pedía 23,7M€ de loanbook en Mid Market al 10 de julio, reexpresado sobre nuestro propio punto de partida, y la cartera está en 9,5M€.';
