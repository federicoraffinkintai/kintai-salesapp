// Prospección: orden de llamada, resultados, guión de gatekeeper, sprint.

// ---------- Resultados de una llamada en frío ----------
window.OUTCOMES = [
  { id:'no_answer', label:'No contesta',        short:'No contesta', group:'sin contacto', tone:'flat',  key:'1' },
  { id:'gk_blocked', label:'Gatekeeper bloquea', short:'GK bloquea', group:'gatekeeper',  tone:'warn',  key:'2' },
  { id:'gk_info',   label:'Gatekeeper da info',  short:'GK da info', group:'gatekeeper',  tone:'warn',  key:'3', wins:['dato'] },
  { id:'gk_passed', label:'Gatekeeper me pasa',  short:'GK me pasa', group:'gatekeeper',  tone:'good',  key:'4', reachesDM:true },
  { id:'dm_no',     label:'DM: no le interesa',  short:'DM no',      group:'decisor',     tone:'bad',   key:'5', reachesDM:true },
  { id:'dm_callback', label:'DM: llámame luego', short:'Callback',   group:'decisor',     tone:'warn',  key:'6', reachesDM:true, schedules:true },
  { id:'dm_info',   label:'DM: mándame info',    short:'Pide info',  group:'decisor',     tone:'warn',  key:'7', reachesDM:true },
  { id:'dm_meeting', label:'Reunión con AE ✓',   short:'Reunión',    group:'decisor',     tone:'good',  key:'8', reachesDM:true, isDeal:true },
];
window.outcomeById = id => window.OUTCOMES.find(o => o.id === id) || null;

// ---------- Señales de email ----------
window.ENGAGEMENT = [
  { id:'none',     label:'Sin actividad',    w:0    },
  { id:'opened',   label:'Abrió 1-2 veces',  w:0.40 },
  { id:'opened_x', label:'Abrió 3+ veces',   w:0.70 },
  { id:'clicked',  label:'Hizo clic',        w:0.85 },
  { id:'pos',      label:'Respuesta positiva', w:1.00 },
  { id:'neg',      label:'Respuesta negativa', w:-1   },
];
window.engById = id => window.ENGAGEMENT.find(e => e.id === id) || window.ENGAGEMENT[0];

// ---------- Contactos multicanal ----------
// El email entrará automático desde el CRM; esto es el respaldo manual
// y el único sitio donde viven LinkedIn, inbound y las notas de organización.
window.CAMPAIGNS = [
  'Circulante Q3 · industria',
  'Circulante Q3 · construcción',
  'Circulante Q3 · distribución',
  'Sin CIRBE · genérica',
  'Crecimiento y NOF',
  'Reactivación 2025',
];

window.LINKEDIN = [
  { id:'unknown',   label:'Sin comprobar',      w:0    },
  { id:'notfound',  label:'No está en LinkedIn', w:0    },
  { id:'found',     label:'Perfil localizado',   w:0.20 },
  { id:'sent',      label:'Invitación enviada',  w:0.35 },
  { id:'connected', label:'Conectado',           w:0.60 },
  { id:'replied',   label:'Respondió por LinkedIn', w:1 },
];
window.liById = id => window.LINKEDIN.find(x => x.id === id) || window.LINKEDIN[0];

window.INBOUND = [
  { id:'web',      label:'Visitó la web' },
  { id:'content',  label:'Descargó contenido' },
  { id:'event',    label:'Evento o webinar' },
  { id:'referral', label:'Recomendación' },
  { id:'form',     label:'Rellenó formulario' },
];

window.emptyTouch = () => ({ campaign:'', emails:0, linkedin:'unknown', inbound:[], note:'', gk:'' });

// Cuándo toca el callback, dicho como lo diría una persona
window.cbWhen = function (iso) {
  if (!iso) return null;
  const d = new Date(iso); if (isNaN(d)) return null;
  const hoy = new Date(); const manana = new Date(Date.now() + 864e5);
  const hh = d.toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' });
  const mismoDia = (a, b) => a.toDateString() === b.toDateString();
  const vencido = d.getTime() <= Date.now();
  let cuando;
  if (mismoDia(d, hoy)) cuando = `hoy a las ${hh}`;
  else if (mismoDia(d, manana)) cuando = `mañana a las ${hh}`;
  else cuando = `${d.toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'short' })} a las ${hh}`;
  return { texto: cuando, vencido };
};

// Cuánto calienta al lead todo lo que no es el email
window.touchWeight = function (t, engId) {
  if (!t) return { w:0, burned:false };
  const li = window.liById(t.linkedin).w;
  const inb = (t.inbound || []).length ? 0.5 : 0;
  // Muchos emails sin una sola apertura: el contacto o el mensaje están mal
  const burned = (t.emails || 0) >= 5 && (!engId || engId === 'none');
  return { w: Math.min(1, li + inb), burned };
};

// ---------- Orden de llamada ----------
// El score mide potencial. Esto mide a quién llamar AHORA.
window.SPRINT_GOAL = { deals: 3, calls: 100, minutes: 120 };
window.MAX_ATTEMPTS = 4;

window.callPriority = function (c, log, eng, callbacks, touches) {
  const hist = (log && log[c.nif]) || [];
  const attempts = hist.length;
  const last = hist[hist.length - 1] || null;
  const cb = callbacks && callbacks[c.nif];
  const engId = (eng && eng[c.nif]) || 'none';
  const e = window.engById(engId);
  const t = touches && touches[c.nif];
  const tw = window.touchWeight(t, engId);

  // Fuera de cola: cerrado, descartado o agotado
  if (last && (last.outcome === 'dm_meeting' || last.outcome === 'dm_no')) {
    return { p:-1, out:true, why: last.outcome === 'dm_meeting' ? 'Reunión cerrada' : 'Dijo que no' };
  }
  if (e.id === 'neg') return { p:-1, out:true, why:'Respondió que no al email' };
  if (attempts >= window.MAX_ATTEMPTS) return { p:-1, out:true, why:`${attempts} intentos sin contacto` };

  // Callback vencido manda sobre todo lo demás
  if (cb && cb.when) {
    const due = new Date(cb.when).getTime();
    if (!isNaN(due) && due <= Date.now()) return { p:1000, out:false, why:'Callback pendiente', urgent:true };
  }

  const fit = Math.max(0, Math.min(1, (c.g || 0) / 1400));
  const reach = c.tel ? (c.tel_ok ? 1 : 0.75) : 0;
  const named = c.dm_saludo ? 1 : (c.dm_cargo ? 0.4 : 0);
  const engW = Math.max(0, e.w);
  const fatigue = attempts === 0 ? 1 : Math.max(0, 1 - attempts * 0.3);

  // Un gatekeeper que dio información vale más que un número virgen
  const gkBonus = hist.some(h => h.outcome === 'gk_info') ? 0.5 : 0;

  const p = fit * 34 + reach * 26 + named * 14 + engW * 18 + fatigue * 8 + gkBonus * 8
          + tw.w * 8 - (tw.burned ? 6 : 0);
  return { p, out:false, fit, reach, named, engW, attempts, touch: tw.w, burned: tw.burned };
};

window.callReadiness = function (c) {
  if (!c.tel) return { id:'no_phone', label:'Sin teléfono', tone:'bad' };
  if (!c.dm_saludo) return { id:'gk', label:'Vía gatekeeper', tone:'warn' };
  return { id:'direct', label:'Nombre y teléfono', tone:'good' };
};

// ---------- Guión de gatekeeper ----------
// Es el resultado más frecuente. Tres vías según lo que tengas.
window.GATEKEEPER = {
  intro: 'El gatekeeper no es un obstáculo, es una fuente. Si no te pasa, sal con un nombre, un email o una hora.',
  paths: [
    {
      id:'con_nombre',
      when: c => !!c.dm_saludo,
      label: 'Tienes nombre',
      say: c => `Hola, buenos días. ¿Me pasas con ${c.dm_nombre || c.dm_saludo}, por favor?`,
      core: c => `¿me pasas con ${c.dm_nombre || c.dm_saludo}, por favor?`,
      tip: 'Sin explicar nada más. Pedir por su nombre con naturalidad es lo que más pasa el filtro: suenas a alguien que ya habla con él.',
    },
    {
      id:'sin_nombre',
      when: c => !c.dm_saludo,
      label: 'No tienes nombre',
      say: () => 'Hola, buenos días. ¿Quién lleva la tesorería o las relaciones con los bancos en la empresa? Es para hablar de circulante.',
      core: () => '¿quién lleva la tesorería o las relaciones con los bancos en la empresa? Es para hablar de circulante.',
      tip: 'Pregunta por la función, no por un cargo exacto. Y si te da el nombre, apúntalo aunque no te pase: la próxima llamada ya es directa.',
    },
  ],
  objections: [
    { o: '¿De parte de quién?',
      r: 'De Kintai, soy [tu nombre]. Es sobre la financiación de circulante de la empresa.',
      why: 'Nombre y motivo en una frase. Si dudas o te alargas, no pasas.' },
    { o: '¿Le puedo decir de qué se trata?',
      r: 'Sí, claro: le llamo porque trabajamos con empresas de vuestro sector en financiación de circulante y quería comentarle una cosa concreta.',
      why: 'Responde con seguridad y sin pedir permiso. "Una cosa concreta" abre más que un discurso.' },
    { o: 'No está / está reunido',
      r: '¿A qué hora suele estar mejor, por la mañana o al final del día? Para no molestarle a destiempo.',
      why: 'Sal con una hora. Convierte un "no está" en una cita.', wins:'horario' },
    { o: 'Mándanos un email',
      r: 'Perfecto, ¿a qué dirección se lo mando? Y para que le llegue bien dirigido, ¿a nombre de quién lo pongo?',
      why: 'El email es la vía para conseguir el nombre. Acepta y pregunta dos veces.', wins:'nombre + email' },
    { o: 'No pasamos llamadas comerciales',
      r: 'Lo entiendo perfectamente. No es una llamada de venta, es sobre las condiciones de financiación que tenéis. ¿Con quién debería hablarlo entonces?',
      why: 'No discutas la política. Reconduce a quién, no a si te pasa.' },
    { o: 'Ya trabajamos con nuestro banco',
      r: 'Claro, casi todos. Justo por eso llamo, es complementario. ¿Me dices quién lo lleva y lo comento con él?',
      why: 'El gatekeeper no decide esto. No le vendas: pídele el nombre.' },
    { o: 'Déjame tu teléfono y te llamamos',
      r: 'Te lo doy, pero por experiencia es más fácil que yo llame yo. ¿A qué hora suele estar?',
      why: 'Nunca cedas el control de la siguiente llamada.', wins:'horario' },
  ],
  exits: [
    'Un nombre del decisor',
    'Un email directo',
    'Una hora buena para llamar',
  ],
};

window.gkPath = function (c) {
  return window.GATEKEEPER.paths.find(p => p.when(c)) || window.GATEKEEPER.paths[1];
};

// Con el nombre de quien coge el teléfono, la petición pasa a subordinada
window.gkSay = function (c, gkName) {
  const path = window.gkPath(c);
  const n = (gkName || '').trim().split(/\s+/)[0];
  return n && path.core ? `Hola ${n}, ${path.core(c)}` : path.say(c);
};

// ---------- Un gancho de una línea para la cola ----------
// Toda cifra de aquí se dice en voz alta, así que cada rama lleva techo:
// por encima del techo el dato de SABI deja de describir el negocio real.
window.callHook = function (c) {
  const f = window.fmt;
  const pmc = c.pmc, crec = c.v_crec, de = c.v_deuda_ebitda;
  if (pmc != null && pmc > 75 && pmc <= 180) return `Cobra a ${Math.round(pmc)} días`;
  if (crec != null && crec > 0.3 && crec <= 1.5) return `Crece ${Math.round(crec * 100)}%`;
  if ((c.ebitda || 0) < 0) return 'EBITDA negativo, banca cerrada';
  if (de != null && de > 7 && de <= 40) return `Deuda ${f.x(de)} EBITDA`;
  if (c.v_solv != null && c.v_solv > -1 && c.v_solv < 0.15) return `Solvencia ${f.pct(c.v_solv)}`;
  if (c.v_nof_fact != null && c.v_nof_fact > 0.4 && c.v_nof_fact <= 3 && c.nof_est) return `NOF ${f.eur(c.nof_est)}`;
  if (pmc != null && pmc > 180) return 'Cobro muy largo, confirmar plazo';
  if (crec != null && crec > 1.5) return 'Crecimiento fuerte, confirmar cifra';
  return window.getIndustry(c.cnae).label;
};
