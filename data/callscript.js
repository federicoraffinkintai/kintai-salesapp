// Flujo de llamada en 3 bloques.
// B1 apertura (sin producto, sin vender) → B2 necesidad (espejo + experto + cierre)
// → B3 alternativas (solo si no cierra o hay objeción de banca).

// ===== PRESENTACIÓN DE KINTAI =====
// El mismo contenido, dos momentos posibles. No es la misma frase: si te
// presentas nada más recibir los dos minutos no puedes decir «disculpa que aún
// no te haya dicho qué hacemos», y si te presentas después del «exacto» sí.
window.CALL_MODES = [
  { id: 'pronto', label: 'Nada más darme los dos minutos', corto: 'Pronto',
    why: 'Baja la guardia antes de preguntar: sabe con quién habla y deja de buscar la trampa. A cambio, sus respuestas ya vienen teñidas de que sabe qué le vendes.',
    coste: 'Menos profundidad en el diagnóstico.' },
  { id: 'tarde', label: 'Después del «exacto»', corto: 'Después',
    why: 'Preguntas sin que sepa qué vendes, así que lo que cuenta es limpio. Llegas a la presentación y a las objeciones con munición suya.',
    coste: 'Más riesgo de que corte antes: dos minutos hablando sin saber quién eres.' },
];

window.CALL_PRESENT = {
  id: 'presentacion',
  title: 'Presentación de Kintai',
  goal: 'Que sepa con quién habla, en treinta segundos y sin entrar en producto.',
  rule: 'Es una presentación, no una demo. Dos frases y devuelves la palabra. Si te alargas aquí, la llamada se convierte en monólogo.',
  build: (slot) => slot === 'pronto'
    ? `Te cuento en treinta segundos quiénes somos y luego te hago un par de preguntas, porque todavía no sé si os encajamos.\n\nSomos Kintai, una fintech especializada en financiación de circulante. Hemos desarrollado un nuevo instrumento que nos permite hacer trajes a medida, y como es muy novedoso creemos que os interesaría conocerlo.\n\nDicho esto, cuéntame tú: ¿cómo tenéis montado hoy el circulante?`
    : `Disculpa que aún no te haya dicho qué hacemos: somos Kintai, una fintech especializada en financiación de circulante. Hemos desarrollado un nuevo instrumento que nos permite hacer trajes a medida, y como es un producto muy novedoso pensamos que sería interesante que nos conocierais.\n\nDe forma muy ágil os podemos dar hasta 3M€, sin CIRBE. Y en cuestión de tesorería siempre está bien saber que lo tienes a tu disposición.`,
  // Solo si pregunta. No se sueltan de entrada.
  facts: [
    { k: 'Techo', v: 'hasta 3M€ — es el máximo, no el mínimo' },
    { k: 'CIRBE', v: 'no consume capacidad de endeudamiento' },
    { k: 'Encaje', v: 'lo que marca la línea es su cartera de clientes' },
    { k: 'Banco', v: 'no lo sustituimos, cubrimos lo que no llega' },
  ],
  evitar: 'Precio, plazos de alta y condiciones. Y con una empresa pequeña, el «hasta 3M€» solo si pregunta: la cifra grande abre puertas pero también descoloca.',
};

window.CALL_FLOW = [
  {
    id: 'apertura',
    n: '01',
    title: 'Apertura',
    goal: 'Que te dé dos minutos.',
    rule: 'No digas qué vendes. Si mencionas producto, te puede decir "no me interesa" antes de saber de qué hablas.',
    tone: 'Tono de alguien que ya tenía algo pendiente con él, no de comercial que llama a puerta fría.',
    build: (c, sdr) => {
      const n = c.dm_saludo;
      if (!n) return `Hola, buenos días, soy ${sdr} de Kintai. ¿Con quién puedo hablar sobre la tesorería de la empresa? Os escribí el martes comentando que estamos contactando a empresas intensivas en circulante como vosotros. Trabajamos ya con otras empresas de vuestro sector y pensé que sería interesante que nos conociéramos. ¿Tenéis dos minutos ahora o os cojo mal?`;
      return `¿${n}? Hola ${n}, soy ${sdr} de Kintai. Te llamaba en relación al email que te envié el martes, donde te comentaba que estamos contactando a empresas intensivas en circulante como vosotros. Trabajamos ya con otras empresas de vuestro sector y he pensado que sería interesante que nos conociéramos. ¿Tienes dos minutos ahora o te cojo mal? Si no, te puedo llamar por la tarde.`;
    },
    objections: [
      { o: 'No tengo tiempo ahora',
        r: 'Sin problema, por eso te preguntaba. ¿Te va mejor esta tarde sobre las cinco, o mañana a primera hora?',
        why: 'Cierra hora concreta con dos opciones. Nunca "cuándo te viene bien".' },
      { o: '¿De qué se trata?',
        r: 'De cómo estáis financiando el circulante. Dame dos minutos, te hago un par de preguntas y si no te encaja lo dejamos aquí.',
        why: 'Responde por el tema, no por el producto. Producto aún no.' },
      { o: 'No me llegó ningún email',
        r: 'Puede que se colara en spam, te lo reenvío al salir. Ya que te tengo, ¿tienes dos minutos y te lo cuento en corto?',
        why: 'No lo investigues. Reconduce al permiso.' },
      { o: 'No me interesa',
        r: 'Lo entiendo, si ni siquiera te he dicho de qué va. Dame treinta segundos y si sigue sin interesarte cuelgo yo.',
        why: 'Es un reflejo, no una decisión. Pide menos tiempo, no más.' },
      { o: '¿Esto es para venderme algo?',
        r: 'Hoy no te vengo a vender nada, de hecho no sé si os encajamos. Por eso te llamo, para entender cómo lo tenéis montado.',
        why: 'Desarmar. Si suenas a comercial aquí, has perdido la llamada.' },
      { o: 'Eso lo lleva otra persona',
        r: '¿Quién lo lleva? ¿Me pasas con él o prefieres que le escriba de tu parte?',
        why: 'Nombre o vía. No cuelgues sin uno de los dos.' },
    ],
  },

  {
    id: 'necesidad',
    n: '02',
    title: 'Necesidad',
    goal: 'Que diga "exacto". Ahí te has ganado el derecho a proponer la reunión.',
    rule: 'Describe su mundo mejor de lo que lo haría él. No preguntes si tiene el problema: cuéntaselo y deja que te corrija.',
    tone: 'Never Split the Difference: buscas un "exacto", no un "sí". El "sí" es cortesía; el "exacto" es reconocimiento.',
    parts: [
      {
        k: 'espejo',
        label: 'Resumen espejo',
        hint: 'Los huecos los rellenas tú con los pain points de abajo. Si responde "exacto", la tienes.',
        build: (c, sdr, ind, pains) => {
          const f = window.fmt;
          const partidas = [];
          if (window.sayEur(c.existencias, f)) partidas.push('existencias');
          if (window.sayEur(c.deudores_est, f)) partidas.push('deudores');
          const part = partidas.length === 2 ? 'existencias y deudores' : partidas.length === 1 ? partidas[0] : 'circulante';
          const n = Math.min(3, Math.max(1, (pains && pains.length) || 3));
          const slots = Array.from({ length: n }, (_, i) => `[pain point ${i + 1}]`);
          const enun = slots.length > 1 ? `${slots.slice(0, -1).join(', ')} o ${slots[slots.length - 1]}` : slots[0];
          return `Genial, gracias. Como te decía, hemos visto que sois una empresa con buenas partidas de ${part}. Con otros clientes de vuestro sector con los que trabajamos, esto suele venir por ${enun}. Y me imagino que al final el dinero acaba saliendo de vosotros: adelantáis vosotros y cobráis mucho después. ¿Es parecido a lo que os pasa?`;
        },
      },
      {
        k: 'producto',
        label: 'Quién eres · solo después del "exacto"',
        hint: 'Hasta aquí no has dicho qué vendes. Ahora sí, y en corto.',
        build: () => `Disculpa que aún no te haya dicho qué hacemos: somos Kintai, una fintech especializada en financiación de circulante. Hemos desarrollado un nuevo instrumento que nos permite hacer trajes a medida, y como es un producto muy novedoso pensamos que sería interesante que nos conocierais. De forma muy ágil os podemos dar hasta 3M€, sin CIRBE. Y en cuestión de tesorería siempre está bien saber que lo tienes a tu disposición.`,
      },
      {
        k: 'cierre',
        label: 'Cierre · reunión con AE',
        hint: 'Si ha habido "exacto", cierra aquí. No sigas preguntando.',
        build: () => `Te propongo una cosa: quince minutos con un compañero que lleva vuestro sector y te explica todos los detalles, sin compromiso. ¿Te va bien el jueves por la mañana o prefieres a primera hora del viernes?`,
      },
    ],
    objections: [
      { o: '"Exacto, es justo eso"',
        r: 'Perfecto, entonces me alegro de haber llamado. Te propongo quince minutos con un compañero que lleva vuestro sector, que te enseña cómo lo hemos resuelto con empresas parecidas. ¿Jueves por la mañana?',
        why: 'Es la señal que buscabas. Cierra inmediatamente, no sigas cualificando.', good: true },
      { o: 'Ahora mismo no necesitamos financiación',
        r: 'Mejor así, las conversaciones buenas son las que no son urgentes. Justo por eso te llamo, para que lo tengas mapeado antes de necesitarlo. ¿Cómo estáis cubriendo hoy el desfase entre cobro y pago?',
        why: 'No discutas la necesidad. Reencuádralo como previsión y devuelve pregunta abierta.' },
      { o: '¿Qué coste tiene?',
        r: 'Depende del perfil de cobro y del plazo, por eso no te suelto un número al aire. Lo que sí te digo es contra qué compararlo: lo que ya pagas hoy entre póliza, descuento y comisiones. ¿Lo tienes calculado?',
        why: 'Nunca precio en la primera llamada. Ancla contra su coste actual, no contra cero.' },
      { o: '¿Qué es eso de sin CIRBE?',
        r: 'Que no consume tu capacidad de endeudamiento ni aparece en tu pool bancario. Sigues teniendo tus líneas intactas para lo que las necesites.',
        why: 'Es el argumento más fuerte. Dilo y calla.' },
      { o: 'Mándame información por email',
        r: 'Te la mando hoy mismo. Para que no sea un PDF genérico, dime una cosa: ¿a cuántos días estáis cobrando de media?',
        why: 'Acepta y cobra una pregunta. Con la respuesta ya tienes seguimiento.' },
      { o: 'Somos muy pequeños para 3M€',
        r: 'Los tres millones son el techo, no el mínimo. Trabajamos con operaciones mucho más pequeñas; lo que marca la línea es vuestra cartera de clientes.',
        why: 'La cifra grande abre puertas pero asusta a algunos. Reencuadra a la baja rápido.' },
      { o: '¿Quiénes sois? No os conozco',
        r: (c, ind) => {
          const refs = (ind && ind.refs) || [];
          if (refs.length >= 2) {
            const l = refs.slice(0, 3);
            return `Normal, somos nuevos en el mercado y por eso llamo yo en vez de esperar a que nos busquéis. En vuestro sector ya trabajamos con ${l.slice(0, -1).join(', ')} y ${l[l.length - 1]}. ¿Te suena alguna?`;
          }
          if (refs.length === 1) return `Normal, somos nuevos y por eso llamo yo. En vuestro sector trabajamos ya con ${refs[0]}, y en total con más de 140 pymes españolas. ¿Te cuento en treinta segundos cómo funciona?`;
          return 'Normal, somos nuevos en el mercado y por eso llamo yo en vez de esperar a que nos busquéis. Trabajamos ya con más de 140 pymes españolas, sobre todo industria, distribución y construcción. ¿Te cuento en treinta segundos cómo funciona?';
        },
        why: 'Referencias reales de vuestros clientes ganados en su sector.' },
    ],
  },

  {
    id: 'alternativas',
    n: '03',
    title: 'Alternativas · bloque de rescate',
    optional: true,
    goal: 'Desmontar "ya lo tengo cubierto con el banco" y sacar info de su relación bancaria.',
    rule: 'No entres aquí si ya has cerrado en el bloque 2. Esto es para cuando no cierra o quiere más información antes de aceptar la reunión.',
    tone: 'Curiosidad, no confrontación. Cada respuesta sobre su banco es munición para el AE.',
    build: (c) => {
      const f = window.fmt;
      const d = (c.deuda_lp || 0) + (c.deuda_cp || 0);
      if (!window.sayEur(d, f)) return `Entiendo. Y cuéntame una cosa, por curiosidad: ¿cómo tenéis montado hoy el circulante con los bancos? Porque veo que apenas tenéis deuda financiera, y eso normalmente significa que lo estáis financiando con caja propia o estirando proveedores.`;
      const eb = c.v_deuda_ebitda;
      const extra = (eb != null && eb > 7) ? ` Veo que estáis en ${f.x(eb)} de deuda sobre EBITDA, que es la zona donde los bancos empiezan a decir que no a línea nueva.` : '';
      return `Entiendo, y me parece bien, casi todos nuestros clientes siguen con su banco. Nosotros no venimos a sustituirlo sino a cubrir lo que el banco no llega a cubrir.${extra} Cuéntame: ¿cómo os fue la última vez que pedisteis ampliar línea?`;
    },
    objections: [
      { o: 'Lo tengo solucionado con la banca',
        r: 'Me parece perfecto, y no vengo a que cambiéis de banco. La pregunta es otra: cuando entra un pedido grande de golpe y necesitáis caja en una semana, ¿el banco os responde en esa semana?',
        why: 'No ataques al banco. Ataca el tiempo de respuesta, que es donde siempre pierden.' },
      { o: 'Tenemos línea de sobra',
        r: 'Genial. ¿Y esa línea la tenéis libre o está dispuesta? Porque una cosa es tenerla concedida y otra tenerla disponible el día que hace falta.',
        why: 'Concedida ≠ disponible. Casi siempre la tienen dispuesta.' },
      { o: 'El banco nos da mejor precio',
        r: 'Seguramente sí en tipo. Nosotros no competimos en precio sino en que no consumimos CIRBE y en la velocidad. ¿Qué valor tiene para vosotros no gastar capacidad de endeudamiento?',
        why: 'No entres en guerra de precio. Cambia el eje a CIRBE y agilidad.' },
      { o: 'Ya usamos factoring / confirming',
        r: 'Perfecto, entonces el concepto te lo sé ahorrar. ¿Qué es lo que más te chirría de lo que tenéis hoy: el plazo de alta, que consuma CIRBE, o qué clientes os aceptan?',
        why: 'Que ya use el producto es señal de compra. Busca la fricción concreta.' },
      { o: 'Nos lo financian los proveedores',
        r: 'Es la vía más barata mientras aguante. ¿Y hasta dónde podéis estirar antes de que se resienta la relación o os suban el precio?',
        why: 'Todos saben que esa vía tiene techo. Que lo diga él.' },
    ],
    close: 'Por lo que me cuentas creo que merece la pena que lo veas con detalle. Quince minutos con un compañero que lleva vuestro sector, sin compromiso. ¿Jueves por la mañana?',
  },
];

// ===== ESCALERA DE ALTERNATIVAS =====
// El bloque 03 no es solo rebatir: es la única ventana para mapear su pool y su
// experiencia con producto alternativo. Cada respuesta va al AE tal cual.
window.ALT_ASK = [
  {
    id: 'pool',
    q: '¿Cómo os habéis venido financiando a nivel de pool?',
    // Con cifras en la ficha, la pregunta se abre reconociendo su apoyo bancario:
    // no interroga, constata y pide la foto de hoy.
    build: (c) => {
      const f = window.fmt;
      const tot = c.deuda_total != null ? c.deuda_total : (c.deuda_lp || 0) + (c.deuda_cp || 0);
      if (!window.sayEur(tot, f)) return '¿Cómo os habéis venido financiando a nivel de pool?';
      const y = c.cierre_year || '';
      const cp = window.sayEur(c.deuda_cp, f) ? `, ${f.eur(c.deuda_cp)} en corto` : '';
      return `He visto que estáis muy bien apoyados con la banca: en ${y} teníais ${f.eur(tot)} de deuda${cp}. ¿Cómo lo tenéis ahora?`;
    },
    why: 'Abrir reconociendo su pool baja la guardia: no es un interrogatorio, es que ya te has mirado sus números. Cuántos bancos y con qué producto es lo primero que el AE necesita para dimensionar la operación y saber contra quién compite.',
    escucha: 'Si la cifra de hoy es menor, han amortizado y tienen hueco; si es mayor, están tirando de línea. Si nombra un solo banco, hay dependencia. Si nombra cuatro, está al límite de pool y le cuesta abrir el quinto.',
    picks: ['Igual que en la foto', 'Han bajado deuda', 'Han subido deuda', 'Un solo banco', '2 o 3 bancos', '4 o más', 'Póliza de crédito', 'Descuento comercial', 'Préstamo ICO', 'Leasing / renting', 'Solo caja propia'],
  },
  {
    id: 'cirbe',
    q: 'Entiendo que optimizar CIRBE siempre está bien, ¿no?',
    why: 'Cierre retórico. Nadie contesta que no le interesa tener más capacidad libre, y con el sí ya tienes el marco para la reunión: no venimos a sustituir a nadie, venimos a no gastar su pool.',
    escucha: 'Si dice «no sé qué es», explícalo en una frase y para. Si dice que se lo ha pedido el banco, ahí tienes urgencia real.',
    retorica: true,
    picks: ['Sí, claro', 'Nos da igual', 'No sé qué es', 'Nos lo ha pedido el banco', 'Estamos cerca del límite'],
  },
  {
    id: 'recorrido',
    // Trabaja la objeción «ya lo tengo solucionado con la banca» sin contradecirle:
    // el límite lo pone su propio ratio, no tú.
    q: 'Con vuestro nivel de endeudamiento no creo que tengáis mucho más recorrido con la banca, ¿no?',
    build: (c) => {
      const f = window.fmt, eb = c.v_deuda_ebitda;
      if (eb == null) return 'Con vuestro nivel de endeudamiento no creo que tengáis mucho más recorrido con la banca, ¿no? La CIRBE acaba llenándose.';
      return `Estáis en ${f.x(eb)} de deuda sobre EBITDA. Con ese nivel no creo que tengáis mucho más recorrido con la banca, ¿no? La CIRBE acaba llenándose.`;
    },
    why: 'No discutes su «ya lo tengo resuelto»: se lo concedes y mueves la conversación al techo. Una CIRBE llena no se arregla con otro banco, se arregla con producto que no consume CIRBE — que es exactamente lo nuestro.',
    escucha: 'Si dice que le queda margen, pregunta cuánto y a qué precio. Si reconoce el techo, ya no hay que vender: solo poner fecha.',
    picks: ['Reconoce el techo', 'Dice que le queda margen', 'Ya le han denegado línea', 'Está renegociando', 'No sabe su CIRBE'],
  },
  {
    id: 'dependencia',
    q: '¿Estás tranquilo dependiendo 100% de la banca? Todas funcionan igual: abren y cierran el grifo a la vez.',
    why: 'Introduce riesgo de concentración donde él ve estabilidad. No atacas a su banco, atacas al hecho de tener una sola clase de proveedor — y eso lo entiende cualquiera que haya vivido un 2008 o un 2020.',
    escucha: 'La frase que buscas es «bueno, si se complicara…». Ahí ya está imaginando el escenario y la segunda fuente deja de ser un gasto para ser un seguro.',
    picks: ['Tranquilo, buena relación', 'Le preocupa la concentración', 'Ya le cerraron el grifo alguna vez', 'Quiere una segunda fuente', 'No se lo había planteado'],
  },
  {
    id: 'cruzada',
    q: 'En lo que sí se diferencian es en la venta cruzada: ahora nóminas, ahora seguros, ahora el TPV. ¿Os la han hecho? ¿En cada renovación?',
    why: 'Es el pinchazo emocional del bloque. Todo director financiero ha pasado por ahí y le molesta. Convierte el coste real de su financiación en algo mayor que el tipo de interés — y nosotros no vendemos nada cruzado.',
    escucha: 'Si se ríe o resopla, has conectado: deja que se explaye y no interrumpas. Anota qué productos le colocaron, el AE lo usa para calcular el coste real.',
    picks: ['Sí, en cada renovación', 'Nóminas', 'Seguros', 'TPV', 'Planes de pensiones', 'Alguna vez', 'No, nos respetan'],
  },
  {
    id: 'renovacion',
    q: 'Hablando de renovaciones, ¿estás confiado en las próximas? ¿Depende de comité central o las atribuciones de tu gestor bastan?',
    why: 'Pregunta de calendario y de poder. Si depende de comité central, ni su gestor manda ni él controla el plazo: ahí nace la urgencia de tener alternativa montada ANTES de la renovación, no después.',
    escucha: 'Apúntale la fecha de renovación: es el mejor motivo de seguimiento que vas a conseguir en toda la llamada.',
    picks: ['Confiado', 'Tiene dudas', 'Depende de comité central', 'Su gestor tiene atribuciones', 'Le cambiaron de gestor', 'Renovación próxima'],
  },
  {
    id: 'alt',
    q: '¿Y financiación alternativa? ¿Habéis probado algo fuera de la banca?',
    why: 'Si ya probó alternativa, el concepto está vendido y la conversación pasa a ser de condiciones, no de educación. Si dijo no a otro, pregunta por qué: ese «por qué» es tu objeción futura.',
    escucha: 'Un «nos lo ofrecieron y dijimos no» vale más que un «nunca»: ya tiene criterio formado.',
    picks: ['Nunca', 'Lo estamos mirando', 'Crowdlending', 'Fondo de deuda', 'Fintech de circulante', 'Nos lo ofrecieron y dijimos no'],
  },
  {
    id: 'factoring',
    q: '¿Factoring, qué tal? ¿Lo usáis hoy?',
    why: 'Que ya use factoring es señal de compra, no objeción: entiende ceder crédito. Lo que buscas es la fricción concreta — qué deudores le aceptan, cuánto tarda el alta, cuánto le consume de CIRBE.',
    escucha: 'Si lo dejó, pregunta qué falló. Casi siempre es alta lenta o que el factor rechazó a sus clientes.',
    picks: ['No lo usamos', 'Con el banco', 'Con factor independiente', 'Solo con un cliente grande', 'Lo probamos y lo dejamos', 'Confirming de nuestros clientes'],
  },
  {
    id: 'recurso',
    q: '¿Y sin recurso, qué tal? ¿Hacéis seguro de crédito?',
    why: 'Dice si ya paga por cubrir el impago y cuánto. Si tiene seguro de crédito, tiene cartera calificada por una aseguradora: eso acelera nuestro comité. Si no, el riesgo de deudor lo lleva él entero.',
    escucha: 'Si no distingue con recurso de sin recurso, hay hueco de asesoramiento: ahí te ganas la reunión sin vender nada.',
    picks: ['Sin recurso', 'Con recurso', 'Tenemos seguro de crédito', 'No, asumimos el riesgo', 'No sé la diferencia'],
  },
];

window.CALL_FALLBACK = [
  { t: 'Si hay tibieza', s: 'Te mando la info y te llamo en dos semanas para ver si te ha encajado. ¿Te parece?' },
  { t: 'Si es un no claro', s: 'Sin problema. ¿Te importa si te escribo dentro de seis meses por si ha cambiado algo? Gracias por el tiempo.' },
];
