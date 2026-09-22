// ============= CALIFICACIÓN DE CARTERA =============
// El score de encaje de los datos financieros solo conoce el periodo medio de
// cobro: es lo único que SABI deja inferir sobre la cartera. Todo lo demás —a
// cuántos clientes factura, de qué tamaño, si repiten, si son empresas, si son
// españoles y cómo cobra— se descubre hablando, y cada respuesta estrecha el
// encaje. Esta es la estructura de esa conversación.

window.CAL_META = {
  base: 'El encaje de partida usa PMC, ventas y estructura de balance de SABI.',
  aviso: 'Cada campo que se confirma sustituye una estimación por un hecho. El score no se recalcula desde cero: se ajusta y se declara cuánto se mueve y por qué.',
};

// Cada campo lleva el peso que tiene sobre el encaje y la razón. El signo se
// decide por la respuesta, no por el campo.
window.CAL_CAMPOS = [
  {
    id: 'nClientes', label: 'Número de clientes en cartera', tipo: 'rango',
    pregunta: '¿A cuántos clientes distintos facturáis en un año normal?',
    porque: 'Es el numerador de la concentración. Con menos de cinco clientes el riesgo es el deudor, no la empresa.',
    peso: 22,
    opciones: [
      { id: 'muy_pocos', label: '1 a 3', delta: -18, nota: 'Concentración extrema: el comité mira al deudor.' },
      { id: 'pocos', label: '4 a 10', delta: -6, nota: 'Anticipable, pero con sublímite por deudor.' },
      { id: 'medio', label: '11 a 40', delta: 10, nota: 'Cartera diversificable, el caso cómodo.' },
      { id: 'muchos', label: 'más de 40', delta: 22, nota: 'Diversificación alta: el riesgo se reparte.' },
    ],
  },
  {
    id: 'ticket', label: 'Ticket medio por factura', tipo: 'rango',
    pregunta: '¿De cuánto es una factura típica?',
    porque: 'Decide el coste operativo de cada anticipo. Facturas pequeñas obligan a operativa automática.',
    peso: 14,
    opciones: [
      { id: 'micro', label: 'menos de 1k€', delta: -14, nota: 'Coste por operación mayor que el margen: solo con automatización total.' },
      { id: 'baja', label: '1k€ a 10k€', delta: -2, nota: 'Viable con subida masiva de facturas.' },
      { id: 'media', label: '10k€ a 50k€', delta: 10, nota: 'Tamaño cómodo para anticipo individual.' },
      { id: 'alta', label: 'más de 50k€', delta: 14, nota: 'Pocas operaciones grandes: operativa barata.' },
    ],
  },
  {
    id: 'recurrente', label: 'Parte de cartera recurrente', tipo: 'pct',
    pregunta: '¿Qué parte de esos clientes te compra todos los meses?',
    porque: 'La recurrencia es lo que convierte un anticipo puntual en una línea que rota. Sin ella no hay saldo medio.',
    peso: 26,
    tramos: [
      { max: 0.2, delta: -20, nota: 'Cartera de proyecto: la línea no rota, se dispone y se apaga.' },
      { max: 0.5, delta: -4, nota: 'Mezcla: hay base recurrente pero no sostiene el saldo.' },
      { max: 0.8, delta: 14, nota: 'Base recurrente sólida, la línea rota sola.' },
      { max: 1.01, delta: 26, nota: 'Cartera casi toda recurrente: el mejor caso para saldo medio.' },
    ],
  },
  {
    id: 'b2b', label: 'Parte de facturación B2B', tipo: 'pct',
    pregunta: '¿Cuánto de tu facturación es a empresas y cuánto a particulares?',
    porque: 'Solo el crédito contra empresa es cedible con seguridad jurídica razonable. El particular no es colateral.',
    peso: 30,
    tramos: [
      { max: 0.3, delta: -30, nota: 'Mayoría a particular: no hay cartera anticipable.' },
      { max: 0.6, delta: -10, nota: 'Parte importante no cedible: el límite se calcula solo sobre el tramo B2B.' },
      { max: 0.9, delta: 16, nota: 'Cartera mayoritariamente B2B, anticipable.' },
      { max: 1.01, delta: 30, nota: 'B2B puro: todo el colateral cuenta.' },
    ],
  },
  {
    id: 'nacional', label: 'Parte nacional', tipo: 'pct',
    pregunta: '¿Qué parte de la cartera es de clientes españoles?',
    porque: 'El reclamo en España es más barato y más rápido. Fuera sube el coste de recobro y la mora esperada.',
    peso: 12,
    tramos: [
      { max: 0.4, delta: -8, nota: 'Mayoría fuera: hay que mirar país por país.' },
      { max: 0.8, delta: 4, nota: 'Base nacional con parte exterior: manejable.' },
      { max: 1.01, delta: 12, nota: 'Cartera nacional: recobro sencillo.' },
    ],
  },
  {
    id: 'eu', label: 'Parte del exterior que es UE', tipo: 'pct',
    pregunta: 'De lo que facturas fuera, ¿cuánto es Unión Europea?',
    porque: 'Dentro de la UE el marco de cobro es homogéneo. Fuera entra riesgo país y de divisa.',
    peso: 10,
    soloSi: (v) => v.nacional != null && v.nacional < 0.8,
    tramos: [
      { max: 0.5, delta: -10, nota: 'Exposición extracomunitaria: riesgo país y divisa.' },
      { max: 0.9, delta: 4, nota: 'Mayoría UE, con cola fuera.' },
      { max: 1.01, delta: 10, nota: 'Exterior todo UE: marco homogéneo.' },
    ],
  },
  {
    id: 'cobro', label: 'Método de cobro', tipo: 'multi',
    pregunta: '¿Cómo te pagan tus clientes?',
    porque: 'El método decide si el cobro es verificable y si se puede desviar a una cuenta de control. Es lo que hace operable el anticipo.',
    peso: 26,
    opciones: [
      { id: 'transferencia', label: 'Transferencia', delta: 14, nota: 'Verificable y desviable: el caso ideal.' },
      { id: 'recibo', label: 'Recibo domiciliado', delta: 10, nota: 'Trazable, con riesgo de devolución.' },
      { id: 'confirming', label: 'Confirming del cliente', delta: 12, nota: 'El pagador es un banco: riesgo mejor.' },
      { id: 'pagare', label: 'Pagaré', delta: 4, nota: 'Título físico: operativa más lenta.' },
      { id: 'plataforma', label: 'Liquidación de plataforma', delta: 2, nota: 'Depende del calendario del marketplace.' },
      { id: 'efectivo', label: 'Efectivo o TPV', delta: -22, nota: 'No hay cobro que ceder ni rastro que verificar.' },
    ],
  },
];

// Ajuste del encaje: suma de deltas de lo respondido, normalizada por el peso
// de lo que se ha llegado a contestar. Así responder un campo no diluye el
// score y dejar campos sin responder no lo penaliza.
window.calAjuste = function (respuestas) {
  const R = respuestas || {};
  let delta = 0, pesoResp = 0, pesoTotal = 0;
  const detalle = [];
  window.CAL_CAMPOS.forEach(campo => {
    if (campo.soloSi && !campo.soloSi(R)) return;
    pesoTotal += campo.peso;
    const v = R[campo.id];
    if (v == null || (Array.isArray(v) && !v.length)) return;
    pesoResp += campo.peso;
    let d = 0, nota = null;
    if (campo.tipo === 'multi') {
      const sel = campo.opciones.filter(o => v.indexOf(o.id) >= 0);
      if (!sel.length) return;
      // El método que peor está valorado manda: si cobra algo en efectivo, ese
      // tramo no es anticipable aunque el resto sí lo sea.
      const peor = sel.reduce((a, x) => x.delta < a.delta ? x : a, sel[0]);
      const mejor = sel.reduce((a, x) => x.delta > a.delta ? x : a, sel[0]);
      d = sel.length === 1 ? peor.delta : peor.delta * 0.6 + mejor.delta * 0.4;
      nota = peor.nota;
    } else if (campo.tipo === 'rango') {
      const o = campo.opciones.find(x => x.id === v);
      if (!o) return;
      d = o.delta; nota = o.nota;
    } else {
      const t = (campo.tramos || []).find(x => v < x.max);
      if (!t) return;
      d = t.delta; nota = t.nota;
    }
    delta += d;
    detalle.push({ id: campo.id, label: campo.label, peso: campo.peso, delta: d, nota,
      valor: v, tipo: campo.tipo });
  });
  return { delta, detalle, pesoResp, pesoTotal,
    cobertura: pesoTotal ? pesoResp / pesoTotal : 0,
    respondidos: detalle.length,
    campos: window.CAL_CAMPOS.filter(c => !c.soloSi || c.soloSi(R)).length };
};

// Encaje ajustado. El delta se aplica sobre el encaje de partida y se capa en el
// rango del score para que no salga del eje.
window.calEncaje = function (encBase, respuestas) {
  const a = window.calAjuste(respuestas);
  const base = encBase || 0;
  // El pilar de encaje tiene eje declarado en PILLARS: el ajuste se capa ahí
  // para no pintar un 418 sobre un eje que acaba en 300.
  const pilar = (window.PILLARS || []).find(p => p.id === 'fit');
  const rango = pilar && pilar.range ? pilar.range : [0, 300];
  const crudo = base + a.delta;
  const ajustado = Math.min(rango[1], Math.max(rango[0], crudo));
  return { base, ajustado, crudo, rango, topado: crudo !== ajustado,
    ...a, delta: ajustado - base, deltaCrudo: a.delta,
    // Con poca cobertura el ajuste es provisional y hay que decirlo.
    fiable: a.cobertura >= 0.6 };
};

// Qué preguntar a continuación: el campo sin responder de más peso.
window.calSiguiente = function (respuestas) {
  const R = respuestas || {};
  const pend = window.CAL_CAMPOS
    .filter(c => (!c.soloSi || c.soloSi(R)) && (R[c.id] == null || (Array.isArray(R[c.id]) && !R[c.id].length)))
    .sort((a, b) => b.peso - a.peso);
  return pend[0] || null;
};

window.CAL_STORE = 'kintai-calificacion';
window.calGet = function () {
  try { return JSON.parse(localStorage.getItem(window.CAL_STORE) || '{}'); } catch (e) { return {}; }
};
window.calSet = function (nif, campo, valor) {
  const all = window.calGet();
  all[nif] = { ...(all[nif] || {}), [campo]: valor };
  try { localStorage.setItem(window.CAL_STORE, JSON.stringify(all)); } catch (e) {}
  return all;
};
