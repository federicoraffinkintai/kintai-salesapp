// ============= TRES DASHBOARDS DEL AE =============
// Todo lo que se pinta aquí es ACTUAL: sale del export de HubSpot agrupado por
// trimestre de creación del deal (data/aereal.js). Donde no hay medición se
// dice «pendiente de instrumentar» en lugar de rellenar con el objetivo.
//  · CALIDAD   → cohorte por fecha de creación. Un deal creado en Q2 puede
//                cerrar en Q3: la conversión pertenece al trimestre en que se
//                creó, no al de cierre.
//  · ACTIVIDAD → deals creados y por dónde entraron, más el trabajo vivo.
//  · RIGOR     → conducta de ejecución, hoy sin instrumentar.
window.AEDASH_META = {
  fuente: 'HubSpot · export de deals 12-sep-2026',
  cohorte: 'El trimestre agrupa por fecha de creación del deal: es la cohorte correcta para juzgar conversión.',
  aviso: 'Solo tres de los seis AE de Q4 tienen deals a su nombre en el export (Paula, Àlex y Silvia). Los otros tres se incorporan sin histórico: sus celdas van vacías hasta que creen su primer deal.',
};

// Periodos con deals creados por alguno de los seis AE de Q4, en la
// granularidad pedida: semana ISO, mes natural o trimestre.
window.aeDashPeriodos = function (gran) {
  const ows = (window.AEQ4 || []).map(a => a.ow).filter(Boolean);
  return window.aeRealPeriodos(gran || 'trimestre', ows);
};
window.aeDashUltimo = function (gran) {
  const p = window.aeDashPeriodos(gran);
  return p.length ? p[p.length - 1].id : null;
};
// Compatibilidad con el selector de trimestres del dashboard de calidad.
window.aeDashQuarters = function () { return window.aeDashPeriodos('trimestre'); };

// Precio del deal expresado en TAE, que es como se cotiza de verdad. La hoja de
// outbound pone 25% en los cuatro segmentos, así que hoy sale plana: se moverá
// cuando el CRM traiga la TAE de cada operación.
window.AEDASH_TAE_SEG = { midmkt:0.25, big:0.25, mid:0.25, small:0.25 };

// Métricas de calidad, con su estado de instrumentación. `estado` manda sobre
// todo lo demás: lo que no está medido se declara, no se pinta.
window.AEDASH_CALIDAD = [
  { id:'creados',  label:'Deals creados', tipo:'n', estado:'medido',
    desc:'Deals abiertos en el trimestre. Es el denominador de todo lo demás: cuanto más volumen, más difícil sostener la conversión.' },
  { id:'cerrados', label:'Clientes cerrados', tipo:'n', estado:'medido',
    desc:'Clientes ganados de esa cohorte, con la línea firmada.' },
  { id:'conv',     label:'Conversión de cohorte', tipo:'pct', estado:'medido',
    desc:'Clientes ganados sobre los deals CREADOS en el trimestre. Es la conversión punta a punta del AE.' },
  { id:'wr',       label:'Cierre sobre cerrados', tipo:'pct', estado:'medido',
    desc:'Ganados sobre ganados más perdidos. Es el win rate clásico: sube cuando el AE descarta pronto, y por eso no sustituye a la conversión de cohorte.' },
  { id:'cierreGC', label:'Cierre en gestión de cobro', tipo:'pct', estado:'pendiente',
    desc:'Cierre sobre las operaciones cuya única operativa viable es gestión de cobro: son las difíciles, y ahí se ve al AE.',
    instrumentar:'Necesita la operativa aprobada por deal (anticipo / gestión de cobro) como campo del CRM.' },
  { id:'ticket',   label:'Ticket medio', tipo:'eur', estado:'medido',
    desc:'Línea media de los clientes ganados de la cohorte.' },
  { id:'tae',      label:'Precio · TAE', tipo:'pct', estado:'imputado',
    desc:'Precio de la operación expresado en TAE. Se imputa por mezcla de segmentos con la tabla de la hoja de outbound, que hoy pone la misma TAE en los cuatro segmentos.' },
];

// Depósitos de generación de deals. El origen del deal sí viene en el export
// (Source Type), así que los deals por depósito son actuals; la actividad de
// contacto que los levanta no está registrada por propietario.
window.AEDASH_ACT_CANALES = [
  { id:'partners',  label:'Partners',  color:'#C8A24C', srcs:['partners'],
    desc:'Deals que trae la cartera de partners. El esfuerzo es de relación: la llamada semanal es lo que mantiene el flujo.' },
  { id:'outbound',  label:'Prospects · outbound', color:'#2E7D5B', srcs:['outbound'],
    desc:'Empresas de la lista sin relación previa. Caro por deal, pero el único depósito que escala sin depender de nadie.' },
  { id:'contactos', label:'Contactos', color:'#2E93A8', srcs:['contactos'],
    desc:'Contactos ya conocidos de la base propia. El depósito más barato y el primero que se deja enfriar.' },
  { id:'otros',     label:'Otros orígenes', color:'#767D8C', srcs:['inbound','referral','otros'],
    desc:'Inbound, referral y deals sin origen registrado en el CRM.' },
];

// Actividad de contacto por depósito. Ninguna medida: el export no trae
// llamadas ni emails con propietario.
window.AEDASH_ACT_TOQUES = [
  { id:'llamadas', label:'Llamadas', fuente:'Registro de llamada en HubSpot con propietario y sello de tiempo.' },
  { id:'emails',   label:'Emails',   fuente:'Email registrado en el deal o en el contacto, con propietario.' },
  { id:'cuentas',  label:'Cuentas tocadas', fuente:'Empresas distintas con al menos una actividad del AE en el trimestre, que es lo que distingue cobertura de insistencia.' },
];

// Tramos del time to money: cuánto tarda un deal en llegar a cada etapa desde
// que se crea. Solo el total está medido (creación → cierre de los ganados);
// los tramos intermedios necesitan el histórico de cambios de etapa.
window.AEDASH_TTM = [
  { id:'data', label:'Time to data gathering', obj:'7 días', estado:'demo', frac:0.25,
    desc:'De la creación del deal a tener la documentación completa. Es el tramo que más se alarga cuando el AE no empuja.' },
  { id:'risk', label:'Time to risk analysis', obj:'12 días', estado:'demo', frac:0.45,
    desc:'De la documentación al comité de riesgos.' },
  { id:'nego', label:'Time to negociación', obj:'18 días', estado:'demo', frac:0.70,
    desc:'Del comité a la propuesta con límite y precio sobre la mesa.' },
  { id:'act',  label:'Time to activación', obj:'25 días', estado:'demo', frac:0.90,
    desc:'De la propuesta a la línea firmada y de alta.' },
  { id:'money',label:'Time to money', obj:'30 días', estado:'medido', demo:[18, 75],
    desc:'De la creación del deal al cierre ganado. Mediana de los deals ganados desde 2025, con p25 y p75 alrededor.' },
];

// Los tramos son fracciones del time to money, no valores suelos: la serie
// tiene que ser creciente y acabar en el total, que es el cierre real cuando
// existe. Con jitter determinista por AE para que las fichas no salgan
// clonadas, y forzando la monotonía.
// Los tres tramos de respuesta son la misma población partida, así que se
// generan encadenados: el de 4 h es un subconjunto del mismo día, y el de más
// de 48 h sale de lo que queda fuera.
window.aeRespSerie = function (key) {
  const dia = window.aeDemoVal(key, 'resp-dia', 0.55, 0.96);
  return { dia,
    h4: dia * window.aeDemoVal(key, 'resp-h4', 0.55, 0.92),
    d48: (1 - dia) * window.aeDemoVal(key, 'resp-48', 0.25, 0.8) };
};

window.aeTtmSerie = function (key, total) {
  if (total == null) return null;
  let prev = 0;
  return window.AEDASH_TTM.filter(t => t.frac).map(t => {
    const j = window.aeDemoVal(key, 'ttm-' + t.id, -0.05, 0.05);
    let v = total * Math.min(0.95, Math.max(0.12, t.frac + j));
    if (v <= prev) v = prev + Math.max(1, total * 0.04);
    prev = v;
    return { id: t.id, v: Math.min(v, total * 0.96) };
  });
};

// Precisión del forecast: si lo que el AE promete cerrar se cierra cuando dice
// y por el importe que dice. Hoy solo hay un proxy.
window.AEDASH_FORECAST = [
  { id:'mensual', label:'Forecast mensual revenue', estado:'demo', head:true, demo:[-0.32, 0.18], signo:true, asim:true,
    cadencia:'Se congela tres veces al mes: día 1, día 15 y día 21.',
    desc:'La cifra de cabecera: cuánto se desvía lo facturado de lo que el AE dijo que facturaría. Con signo y con asimetría: quedarse corto es mucho peor que pasarse, porque sobre un forecast inflado no se puede reaccionar a tiempo.',
    formula:'Facturado del mes ÷ forecast del corte − 1, en los tres cortes, promediado por meses y no acumulado. En negativo el AE prometió más de lo que trajo y la desviación cuenta doble; en positivo fue conservador y solo penaliza a partir de +20%, cuando dejar volumen fuera del forecast también rompe la planificación.',
    fuente:'Foto del forecast de facturación por AE los días 1, 15 y 21 de cada mes.' },
  { id:'consecucion', label:'Consecución de objetivo revenue', estado:'demo', demo:[0.48, 1.22],
    cadencia:'Se cierra con el mes y con el trimestre, contra el objetivo de dirección.',
    desc:'Lo facturado contra el objetivo comprometido, que es la otra mitad de la conversación: un forecast clavado sobre un objetivo que no se alcanza sigue siendo un problema, solo que anunciado con tiempo.',
    formula:'Facturado del periodo ÷ objetivo del periodo. Se lee al lado del forecast: clavar el forecast y no llegar al objetivo obliga a cambiar el plan; fallar el forecast y llegar al objetivo obliga a arreglar la previsión.',
    fuente:'Objetivo por AE y periodo, que ya está fijado, cruzado con el cerrado real del CRM.' },
  { id:'trimestral', label:'Forecast del trimestre', estado:'demo', demo:[-0.38, 0.16], signo:true, asim:true,
    cadencia:'Se recalcula el día 1 de cada mes del trimestre: tres fotos por trimestre.',
    desc:'Lo mismo a escala de trimestre. Comparar las tres fotos enseña si el AE ajusta pronto o sostiene una cifra imposible hasta el último mes.',
    formula:'Cerrado del trimestre ÷ forecast de la foto − 1, en cada una de las tres fotos, con la misma asimetría. Se guardan las tres: la del mes 1 mide ambición realista y la del mes 3, honestidad — llegar al mes 3 con la cifra intacta y fallarla es el peor caso posible.',
    fuente:'Foto del forecast del trimestre por AE el día 1 de cada mes del trimestre.' },
  { id:'fecha', label:'Fechas cumplidas', estado:'demo', demo:[0.35, 0.85],
    desc:'Deals que cierran en el mes que tenían prometido. No se puede derivar del proxy de atasco sin contar el mismo dato dos veces.',
    formula:'Deals ganados cuyo mes de cierre real coincide con el mes de la fecha esperada que llevaban al entrar en negociación, entre todos los ganados del periodo.',
    fuente:'Snapshot de la fecha esperada de cierre en el momento del forecast, para compararla con la fecha real.' },
  { id:'desliz', label:'Deslizamiento medio', estado:'demo', demo:[6, 45], unidad:'d',
    desc:'Días entre la fecha prometida y la real en los deals que cierran tarde.',
    formula:'Mediana de (fecha real − fecha prometida) sobre los ganados que cierran tarde. Mediana y no media, porque un deal de 500 días de retraso no puede definir al AE.',
    fuente:'Histórico de la fecha esperada de cierre por deal.' },
  { id:'importe', label:'Sesgo de importe', estado:'demo', demo:[-0.22, 0.28], signo:true,
    desc:'Línea activada contra línea propuesta. Un AE que infla el importe en negociación rompe el forecast aunque cierre.',
    formula:'Suma de línea activada ÷ suma de línea propuesta − 1. Con signo: por encima de cero infla la propuesta, por debajo se queda corto y el forecast pierde volumen.',
    fuente:'Importe propuesto y importe activado como campos distintos del deal.' },
  { id:'pond', label:'Acierto del ponderado', estado:'demo', demo:[0.55, 1.35],
    desc:'Lo cerrado de verdad contra el forecast ponderado con el que arrancó el trimestre.',
    formula:'Cerrado del trimestre ÷ forecast ponderado del día 1 (Σ importe × probabilidad de fase). Mide la probabilidad por fase tanto como al AE: si todos los AE salen por encima, la curva de probabilidad está mal calibrada.',
    fuente:'Foto del pipeline ponderado al inicio de cada trimestre, para cerrar el bucle contra lo real.' },
];

// Rigor en la ejecución. Ninguna está instrumentada hoy: esta tabla es la
// especificación de lo que hay que registrar, con el objetivo que se le pide a
// cada conducta y el proxy que se puede mirar mientras tanto.
window.AEDASH_RIGOR = [
  { id:'resp4h', label:'Respuesta en 4 h', obj:'70% de los mensajes', estado:'demo', resp:'h4',
    desc:'Mensajes de cliente contestados en menos de cuatro horas laborables. Es el tramo que marca la diferencia en una operación viva.',
    fuente:'Conversaciones de HubSpot con propietario y sello de tiempo de primera respuesta.' },
  { id:'respDia', label:'Respuesta el mismo día', obj:'90% de los mensajes', estado:'demo', resp:'dia',
    desc:'Mensajes contestados antes de cerrar la jornada. Por debajo de aquí el cliente ya ha llamado a otro.',
    fuente:'Conversaciones de HubSpot con propietario y sello de tiempo de primera respuesta.' },
  { id:'resp48', label:'Más de 48 h sin responder', obj:'menos del 5%', estado:'demo', resp:'d48', malo:true,
    desc:'Mensajes que pasan dos días sin contestar. Uno solo puede costar la operación, así que se mira en absoluto, no en media.',
    fuente:'Conversaciones de HubSpot con propietario y sello de tiempo de primera respuesta.' },
  { id:'prepDisc', label:'Prep. discovery', obj:'100% con ficha previa', estado:'demo', demo:[0.4, 1],
    desc:'Discoveries con la ficha montada antes de la reunión: scores Kintai, deudores, encaje de producto y estados financieros leídos.',
    fuente:'Checklist de preparación como campo obligatorio para marcar el discovery como celebrado.' },
  { id:'prepNego', label:'Prep. negociación', obj:'100% con escenarios', estado:'demo', demo:[0.35, 1],
    desc:'Propuestas con escenarios de precio y límite preparados antes de la llamada, no improvisadas en la mesa.',
    fuente:'Adjunto de escenarios en el deal antes de pasar a negociación.' },
  { id:'calc', label:'Calculadora', obj:'100% de las propuestas', estado:'demo', demo:[0.3, 1],
    desc:'Calculadora de coste y ahorro montada con los números del cliente. Es lo que convierte el precio en una conversación de valor.',
    fuente:'Registro de calculadora generada, asociada al deal.' },
  { id:'sinAct', label:'Deals sin actividad', obj:'menos del 10% a 14 días', estado:'demo', demo:[0.05, 0.38], malo:true,
    desc:'Deals abiertos sin ninguna actividad registrada en dos semanas. Es cartera muerta que infla el pipeline.',
    fuente:'Última actividad por deal, que el export no trae.' },
  { id:'atasco', label:'Deals atascados', obj:'menos del 15% a 30 días', estado:'proxy', demo:[0.1, 0.45], malo:true,
    desc:'Deals que llevan más de un mes en la misma etapa. Mientras no haya histórico de etapas, el proxy es el deal abierto cuya fecha de cierre pasó hace más de 30 días.',
    fuente:'Snapshot semanal de etapa por deal. Proxy de hoy: fecha de cierre vencida hace más de 30 días en el pipeline vivo.' },
  { id:'tiempo', label:'Tiempo en cada estado', obj:'data 10 d · risk 7 d · negociación 7 d', estado:'pendiente',
    desc:'Mediana de días que el AE mantiene un deal en cada etapa, contra el estándar que fija dirección.',
    fuente:'Histórico de cambios de etapa, que hay que empezar a guardar.' },
  { id:'planAct', label:'Plan de activación', obj:'100% de los activados', estado:'demo', demo:[0.3, 1],
    desc:'Cliente activado con plan de ejecución escrito y compartido: qué deudores, qué volumen y en qué semanas.',
    fuente:'Documento de plan asociado al deal en la activación.' },
  { id:'email', label:'Email resumen', obj:'95% en 24 h', estado:'demo', demo:[0.4, 0.98],
    desc:'Cada reunión cerrada con un email de resumen y siguientes pasos. Es lo que deja la conversación por escrito y mueve al resto de departamentos.',
    fuente:'Email registrado en el deal dentro de las 24 h posteriores a la reunión.' },
];

// ---------- Datos de ejemplo para validar la UX ----------
// Mientras no haya registro en el CRM, el dashboard de rigor se rellena con
// valores de ejemplo DETERMINISTAS por AE, para poder juzgar la pantalla. Van
// marcados uno a uno y desaparecen en cuanto entre el dato real.
window.AEDASH_DEMO = true;
const _hash = (s) => { let x = 7; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return x; };
window.aeDemoVal = function (key, metric, min, max) {
  const r = (_hash(key + '·' + metric) % 1000) / 999;
  return min + r * (max - min);
};

// ---------- Cohorte de calidad por trimestre ----------
window.aeDashCohorte = function (qId, gran, canal) {
  const act = window.aeActividad();
  const g = gran || 'trimestre';
  const can = canal || 'todos';

  const list = act.list.map(a => {
    const x = window.aeRealDe(a.ow, g, qId, can);
    const medido = !!(x && x.d);
    const hist = a.ow ? (window.AE_DATA || {})[a.ow] : null;
    const tae = (() => {
      const segs = hist && hist.wsegs ? hist.wsegs : null;
      if (segs) {
        let n = 0, acc = 0;
        Object.keys(segs).forEach(k => { const t = window.AEDASH_TAE_SEG[k]; if (t == null) return; n += segs[k]; acc += segs[k] * t; });
        return n ? acc / n : null;
      }
      const mz = (a.mezcla || []).filter(m => window.AEDASH_TAE_SEG[m.id] != null && m.n);
      const n = mz.reduce((y, m) => y + m.n, 0);
      return n ? mz.reduce((y, m) => y + m.n * window.AEDASH_TAE_SEG[m.id], 0) / n : null;
    })();

    return { key:a.key, nombre:a.nombre, unidad:a.unidad, unidadLabel:a.unidadLabel, color:a.color,
      medido, raw: x || null,
      // Conversiones de etapa REALES de la cohorte, con los hitos alcanzados.
      conv: window.AE_REAL_CONV.map(c => ({ ...c,
        v: c.a && x && x.alc[c.de] ? x.alc[c.a] / x.alc[c.de] : null,
        de_n: x ? x.alc[c.de] : null, a_n: c.a && x ? x.alc[c.a] : null })),
      v: {
        creados: medido ? x.d : null,
        cerrados: medido ? x.w : null,
        conv:    medido ? x.w / x.d : null,
        wr:      medido && (x.w + x.l) ? x.w / (x.w + x.l) : null,
        cierreGC:null,
        ticket:  medido && x.w ? x.eurW / x.w : null,
        tae:     medido ? tae : null,
      },
      abiertos: medido ? x.o : null,
      w: x ? x.w : 0, l: x ? x.l : 0, eur: x ? x.eurW : 0 };
  });

  // Totales siempre ponderados por su denominador, nunca promediando ratios.
  const sum = (f) => list.reduce((y, x) => y + (f(x) || 0), 0);
  const creados = sum(x => x.v.creados), w = sum(x => x.w), l = sum(x => x.l), eur = sum(x => x.eur);
  const tot = {
    creados, cerrados: w, aprob: null, cierreGC: null,
    conv: creados ? w / creados : null,
    wr: (w + l) ? w / (w + l) : null,
    ticket: w ? eur / w : null,
    tae: (() => {
      const p = sum(x => x.v.tae != null ? x.w : 0);
      return p ? sum(x => x.v.tae != null ? x.v.tae * x.w : 0) / p : null;
    })(),
  };
  const convTot = window.AE_REAL_CONV.map(c => {
    const de = sum(x => x.raw ? x.raw.alc[c.de] : 0);
    const a = c.a ? sum(x => x.raw ? x.raw.alc[c.a] : 0) : null;
    return { ...c, v: c.a && de ? a / de : null, de_n: de, a_n: a };
  });

  return { q: qId, gran: g, canal: can, label: window.aeRealLabel(g, qId), list, tot, convTot, act,
    conMedida: list.filter(x => x.medido).length };
};

// ---------- Generación de deals por trimestre ----------
window.aeDashGeneracion = function (qId, gran) {
  const act = window.aeActividad();
  const g = gran || 'trimestre';
  const list = act.list.map(a => {
    const x = window.aeRealDe(a.ow, g, qId);
    const medido = !!(x && x.d);
    // Los cuatro depósitos agotan los orígenes del export, así que las
    // columnas siempre reconcilian con el total de deals creados.
    const canal = window.AEDASH_ACT_CANALES.map(ch => ({ ...ch,
      deals: medido ? ch.srcs.reduce((y, s) => y + (x.src[s] || 0), 0) : null,
      // Llamadas y emails por depósito: sin registro por propietario.
      llamadas: null, emails: null }));
    return { key:a.key, nombre:a.nombre, color:a.color, unidadLabel:a.unidadLabel,
      medido, creados: medido ? x.d : null, abiertos: medido ? x.o : null,
      // Won de la cohorte del trimestre elegido, que es el último avance del
      // embudo: el deal ya no está en pipeline porque se cerró.
      won: medido ? x.w : null, eurW: medido ? x.eurW : null,
      // Avances de la cohorte: deals que alcanzaron cada hito y su importe.
      alc: medido ? x.alc : null, alcEur: medido ? x.alcEur : null,
      canal, pipe: a.pipe };
  });
  const canalTot = window.AEDASH_ACT_CANALES.map(ch => ({ ...ch,
    deals: list.reduce((y, a) => y + ((a.canal.find(c => c.id === ch.id) || {}).deals || 0), 0),
    ae: list.filter(a => (a.canal.find(c => c.id === ch.id) || {}).deals).length }));
  const hitosTot = window.AE_REAL_HITOS.map(h => ({ ...h,
    n: list.reduce((y, a) => y + (a.alc ? a.alc[h.id] : 0), 0),
    eur: list.reduce((y, a) => y + (a.alcEur ? a.alcEur[h.id] : 0), 0) }));
  return { q: qId, gran: g, label: window.aeRealLabel(g, qId), list, canalTot, hitosTot, act,
    creados: list.reduce((y, a) => y + (a.creados || 0), 0) };
};
