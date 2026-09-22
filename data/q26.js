// Evolución trimestral 2026 de los cuatro drivers comerciales en los dos segmentos de
// foco (Mid Market + SME Big), objetivo del BP contra real, y cobertura de pipeline para Q4.
// Fuentes: BP Barlon P&L Mensual (objetivo) · Report líneas vs outstanding 10-jul-2026 (real)
//          HubSpot export 12-sep-2026 (deals, conversión, etapas).

window.Q26_META = {
  aviso: 'El objetivo es el BP de la Serie A mes a mes, agregado a la misma fecha que el dato real de cada fila. Q3 está en curso y cada driver tiene su propio corte —el report de cartera llega al 10-jul y los deals al 12-sep—, así que el objetivo de Q3 se toma o se prorratea a esa fecha: la desviación compara periodos iguales.',
  focoShare: 0.143,
  focoShareNota: 'La generación de deals se mide en compañía y se lleva a foco con la cuota del 14,3% que los dos segmentos representan en HubSpot (675 deals de 4.712). Es una estimación declarada —HubSpot no expone creación por segmento y mes— pero está acotada por los totales por segmento: 322 deals de Mid Market y 353 de SME Big en toda la historia.',
};

window.Q26_QS = [
  { id: 'q1', label: 'Q1 2026', sub: 'ene–mar' },
  { id: 'q2', label: 'Q2 2026', sub: 'abr–jun' },
  { id: 'q3', label: 'Q3 2026', sub: 'parcial · cada fila con su corte', parcial: true },
];

// fmt: n = número, k = miles de euros, pct = porcentaje, M = millones
// mejor: 'alto' si un valor mayor es mejor
window.Q26_ROWS = [
  { id: 'deals', label: 'Deals generados en foco', fmt: 'n', est: true,
    sub: 'Compañía: 801 · 826 · 421 deals creados',
    corte: '1 jul – 12 sep',
    obj: [150, 150, 120], real: [115, 118, 60],
    lee: 'La compañía creó 2.048 deals en 2026, más del doble de los 990 que el BP necesitaba. El problema no es el volumen: es la mezcla. Sólo el 14% de los deals aterriza en Mid Market o SME Big, así que la originación en los segmentos que mueven el loanbook va por debajo del plan los tres trimestres.' },
  { id: 'nuevos', label: 'Clientes netos ganados', fmt: 'n',
    corte: 'sólo julio',
    obj: [18, 14, 4], real: [6, 6, -2],
    lee: 'Aquí está el fallo comercial. Con el doble de deals que pedía el plan, se firma un tercio de los clientes, y en julio la cartera de foco pierde dos.' },
  { id: 'conv', label: 'Conversión neta de deal a cliente', fmt: 'pct1',
    sub: 'Win rate histórico de foco: 35,7%',
    corte: 'sólo julio',
    obj: [0.12, 0.093, 0.08], real: [0.052, 0.051, -0.059],
    lee: 'La conversión sobre deals cerrados es del 35,7%, tres veces y media el supuesto del plan. La conversión neta del periodo —clientes ganados sobre deals creados— se queda en el 5%, porque el pipeline no cierra: 260 deals de foco siguen abiertos, el 39% de todos los que se han creado en estos segmentos.' },
  { id: 'cli', label: 'Clientes con línea a cierre', fmt: 'n',
    corte: 'a 10-jul',
    obj: [51, 65, 69], real: [39, 45, 43],
    lee: 'El stock arranca 2026 en 33 clientes y se queda en 43 a julio. El plan pedía 69 en esa misma fecha y 77 a cierre de septiembre.' },
  { id: 'linea', label: 'Línea media firmada', fmt: 'k',
    corte: 'a 10-jul',
    obj: [530400, 540900, 546800], real: [587176, 670819, 638067],
    lee: 'El único driver que bate al plan en los tres trimestres. Cuando se firma, se firma más grande de lo previsto.' },
  { id: 'util', label: 'Utilización de la línea', fmt: 'pct',
    sub: 'Punto de partida dic-25: 80,1%',
    corte: 'a 10-jul',
    obj: [0.595, 0.691, 0.716], real: [0.651, 0.530, 0.446],
    lee: 'El driver que se rompe. Cerramos 2025 al 80,1% —exactamente lo que el BP asumía— y caemos trimestre a trimestre hasta el 44,6%. No es un supuesto optimista del plan: es una capacidad que teníamos y perdimos al quedarnos sin capital.' },
  { id: 'lb', label: 'Loanbook de foco a cierre', fmt: 'M', hero: true,
    corte: 'a 10-jul',
    obj: [16100000, 24300000, 27000000], real: [14919022, 16013183, 12227187],
    lee: 'El resultado de los cuatro drivers: de estar al 93% del plan en marzo a estar al 45% en julio.' },
];

window.Q26_LECTURA = 'Lo que ha fallado no es la capacidad de convertir ni el tamaño de la operación: es dónde se originan los deals, el paso de deal a cliente y, sobre todo, la utilización. Los tres comparten causa. Sin capital comprometido no se cierran operaciones —el deal se queda en negociación— y no se fondean las disposiciones de quien ya es cliente. Por eso la curva de utilización baja en línea recta desde el mes en que la ronda se retrasa.';

// ── Q4: cobertura del pipeline ───────────────────────────────────────────────
window.Q26_Q4 = {
  necesarios: 33,
  filas: [
    { k: 'Pipeline en etapa tardía', deals: 91, wr: 0.357, cierre: 0.80,
      d: 'Negociación, riesgos y activación: 164 de los 471 deals de 2026 que siguen vivos a nivel compañía, el 35%, aplicado a los 260 abiertos en foco. Con un ciclo mediano de 0,8 meses cabrían de sobra en el trimestre; el supuesto es que cierra el 80%.' },
    { k: 'Pipeline en etapa temprana', deals: 169, wr: 0.357, cierre: 0.30,
      d: 'El resto de los 260 deals abiertos en foco. Sólo entra en 2026 la parte que madura a tiempo.' },
    { k: 'Deals nuevos de Q4', deals: 103, wr: 0.357, cierre: 0.20,
      d: 'Volver a 240 deals de compañía al mes durante el trimestre, de los que el 14% cae en foco. Aportan poco al año por desfase de ciclo, pero son los que dejan 2027 con pipeline.' },
  ],
};

window.Q26_Q4_NOTA = 'La conversión aplicada es el win rate real de HubSpot sobre deals cerrados en los dos segmentos —36,1% en Mid Market y 35,3% en SME Big—, no una mejora. Lo que sí es un supuesto es el porcentaje que cierra dentro del trimestre, y va explícito en cada fila para que el board pueda discutirlo.';
