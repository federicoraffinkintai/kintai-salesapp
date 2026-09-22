// Industry playbook — built from WON NEW CLIENTS (143 clientes ganados)
// Cada sector: benchmark real de clientes ganados + pain points con señal numérica y frase de venta.

window.INDUSTRIES = [
  {
    id: 'mayorista', label: 'Comercio mayorista', letter:'G', divs: [46],
    wins: 28, share: 19.6, ticket: 101307,
    bench: { pmc: 62, pmp: 35, margen: 4.4, ventas: 4311 },
    refs: ['SASTRERIAS ESPAÑOLAS', 'GDV GESTIÓN Y DISTRIBUCIÓN', 'FERNANDO Y TOMAS'],
    opener: 'Trabajamos con bastantes distribuidores y el patrón se repite: cobráis a 60-90 y el proveedor os cobra a 30. Cada euro de crecimiento sale de vuestro bolsillo.',
    pains: [
      { t: 'La tijera proveedor-cliente', d: 'Pagas mercancía a 30 días y cobras a 60-90. El desfase lo financias tú.', ask: '¿A cuánto os paga el cliente y a cuánto pagáis vosotros al proveedor?', say: 'En mayorista la media que vemos es 62 días de cobro contra 35 de pago. Ese gap de un mes es capital tuyo parado.', test: c => (c.pmc || 0) > 55 },
      { t: 'Descuento por pronto pago perdido', d: 'El proveedor ofrece 2-3% por pagar cash y no puedes cogerlo.', ask: '¿Vuestros proveedores os dan descuento por pronto pago? ¿Lo aprovecháis?', say: 'Un 2% de descuento sobre compras suele valer más que el coste del anticipo. Muchos clientes financian el descuento con nosotros y salen ganando.', test: c => (c.margen_ebitda || 0) < 0.08 },
      { t: 'Stock que no rota', d: 'Referencias inmovilizadas que bloquean caja para comprar lo que sí vende.', ask: '¿Cuánto stock tenéis parado? ¿Os limita a la hora de comprar campaña?', say: 'Con margen del 4% en el sector, cada mes de stock parado se come el beneficio de la operación.', test: c => (c.rotacion_inv || 0) > 60 },
      { t: 'Concentración de cartera', d: 'Dos o tres clientes grandes marcan el plazo y no puedes negociarlo.', ask: '¿Cuántos clientes son el 70% de vuestra facturación? ¿Ellos marcan el plazo?', say: 'Cuando el cliente grande impone 90 días no puedes decir que no. Nosotros anticipamos esa factura y tú sigues creciendo con él.', test: c => (c.clientes || 0) / Math.max(1, c.ventas || 1) > 0.25 },
    ],
  },
  {
    id: 'construccion', label: 'Construcción e instalaciones', letter:'F', divs: [41, 42, 43],
    wins: 12, share: 8.4, ticket: 93362,
    bench: { pmc: 122, pmp: 74, margen: 3.1, ventas: 4046 },
    refs: ['CARLOS BELDA INSTALACIONES', 'OBRAS Y PROMOCIONES COMAS', 'MG AISLAMIENTOS'],
    opener: 'En obra el patrón que vemos es certificación a 120 días y material que se paga a 30. Con márgenes del 3%, ese desfase es lo que decide si puedes coger la siguiente obra.',
    pains: [
      { t: 'Certificación a 120 días', d: 'La obra se certifica y se cobra meses después. La nómina y el material no esperan.', ask: '¿Cuánto tardáis desde que certificáis hasta que cobráis? ¿Quién aguanta ese tramo?', say: 'La mediana en construcción de nuestros clientes es 122 días de cobro. Anticipamos la certificación en cuanto está aprobada.', test: c => (c.pmc || 0) > 90 },
      { t: 'Retenciones de garantía', d: '5-10% de cada obra retenido uno o dos años sin remunerar.', ask: '¿Cuánto tenéis retenido en garantías ahora mismo?', say: 'Ese dinero es tuyo, ya lo has ganado, y está inmovilizado. Es de los primeros sitios donde miramos.', test: () => true },
      { t: 'No poder coger la obra grande', d: 'Sale un concurso que encaja pero no hay caja para arrancarlo.', ask: '¿Habéis dejado pasar alguna obra este año por no poder financiar el arranque?', say: 'Es el coste invisible: no es lo que te cuesta el dinero, es la obra que no hiciste.', test: c => (c.ventas || 0) > (c.ventas_1 || 0) },
      { t: 'Aval bancario bloqueado', d: 'El banco consume tu línea con avales y no queda para circulante.', ask: '¿El banco os está consumiendo línea con los avales de obra?', say: 'Nosotros no tocamos tu línea bancaria. Miramos la certificación, no tu balance.', test: c => (c.deuda_cp || 0) / Math.max(1, c.activo_total || 1) > 0.3 },
    ],
  },
  {
    id: 'industria', label: 'Industria y manufactura', letter:'C', divs: [10, 11, 13, 14, 16, 17, 18, 20, 22, 23, 24, 25, 27, 28, 29, 30, 31, 32, 33, 37],
    wins: 17, share: 11.9, ticket: 186863,
    bench: { pmc: 53, pmp: 60, margen: 9.2, ventas: 7368 },
    refs: ['LACREM', 'LABORATORIOS FORENQUI', 'DEFEDER ALCOLEA'],
    opener: 'En fabricación la materia prima se paga casi al contado y el cliente industrial paga a 60-90. Entre medias tienes el ciclo productivo, que también es caja parada.',
    pains: [
      { t: 'Doble ciclo: producción + cobro', d: 'Compras materia, fabricas, entregas, y cobras 60 días después. Son tres ciclos de caja encadenados.', ask: '¿Cuánto pasa desde que compráis la materia prima hasta que cobráis el producto acabado?', say: 'Sumando rotación y cobro, muchos fabricantes tienen 120-150 días de ciclo. Eso es lo que financiamos.', test: c => ((c.pmc || 0) + (c.rotacion_inv || 0)) > 100 },
      { t: 'Pedido grande = problema de caja', d: 'El cliente pide el triple y necesitas comprar materia por adelantado.', ask: '¿Qué pasa cuando entra un pedido que dobla vuestra producción mensual?', say: 'El pedido bueno es el que más aprieta. Anticipamos la factura para que puedas comprar materia sin descapitalizarte.', test: c => ((c.ventas || 0) - (c.ventas_1 || 0)) / Math.max(1, c.ventas_1 || 1) > 0.2 },
      { t: 'CAPEX que compite con circulante', d: 'Hay que renovar máquina pero la caja está en el circulante.', ask: '¿Tenéis inversión en maquinaria pendiente? ¿Qué os frena?', say: 'Si liberamos el circulante, la caja propia queda libre para la inversión productiva.', test: c => (c.ebitda || 0) > 0 },
      { t: 'Precio de materia volátil', d: 'Subidas de materia que no puedes repercutir hasta el siguiente pedido.', ask: '¿Cómo os ha afectado la subida de materias primas? ¿Podéis repercutirla rápido?', say: 'Con margen del 9%, una subida del 5% en materia se come medio beneficio si no puedes comprar cuando el precio está bien.', test: c => (c.margen_ebitda || 0) < 0.1 },
    ],
  },
  {
    id: 'tecnologia', label: 'Tecnología e IT', letter:'J', divs: [58, 59, 61, 62, 63, 72],
    wins: 17, share: 11.9, ticket: 233294,
    bench: { pmc: 53, pmp: 15, margen: 21.9, ventas: 1937 },
    refs: ['NUNSYS', 'IAAS 365', 'INVELON TECHNOLOGIES'],
    opener: 'En IT el problema no es el margen, es el timing: la nómina del equipo sale cada mes y el cliente corporate paga a 60-90 días.',
    pains: [
      { t: 'Nómina mensual vs cobro trimestral', d: 'El coste es 100% personal y sale cada 30 días. El cliente paga a 60-90.', ask: '¿Qué parte de vuestro coste es equipo? ¿A cuánto os paga el cliente grande?', say: 'Vuestro PMP es de 15 días —básicamente nóminas— contra 53 de cobro. Ese gap es estructural, no coyuntural.', test: c => (c.pmc || 0) > 45 },
      { t: 'Crecer exige contratar antes de cobrar', d: 'Firmas el proyecto, contratas al equipo, y facturas tres meses después.', ask: '¿Cuánta gente tenéis que contratar antes de facturar el primer hito?', say: 'Cada nuevo proyecto te descapitaliza durante el arranque. Anticipar el primer hito rompe ese cuello de botella.', test: c => ((c.ventas || 0) - (c.ventas_1 || 0)) / Math.max(1, c.ventas_1 || 1) > 0.15 },
      { t: 'El banco no entiende el activo', d: 'Sin inmovilizado que pignorar, la banca tradicional no da línea.', ask: '¿Qué os dice el banco cuando pedís línea? ¿Os piden garantías personales?', say: 'El banco quiere ladrillo. Nosotros miramos el contrato firmado con tu cliente, que es lo que realmente tienes.', test: c => (c.patrimonio || 0) / Math.max(1, c.activo_total || 1) < 0.35 },
      { t: 'Hitos que se retrasan', d: 'La aceptación del cliente se retrasa y con ella la factura.', ask: '¿Cuánto se os retrasan los hitos por validación del cliente?', say: 'El proyecto está entregado pero el papel tarda. Nosotros no esperamos a ese papel.', test: () => true },
    ],
  },
  {
    id: 'minorista', label: 'Comercio minorista', divs: [47],
    wins: 12, share: 8.4, ticket: 206625,
    bench: { pmc: 61, pmp: 52, margen: 5.6, ventas: 5641 },
    refs: ['VITRO', 'REFRUITING', 'IR MAXOINVERSIONES'],
    opener: 'En retail la campaña se compra meses antes de venderse. Comprar bien exige caja en el peor momento del año.',
    pains: [
      { t: 'Compra de campaña', d: 'Hay que comprar stock de temporada meses antes de facturarlo.', ask: '¿Cuándo compráis la campaña fuerte y cuándo la cobráis?', say: 'La compra de campaña es el pico de tensión del año. Anticipar cartera te deja comprar volumen y negociar mejor precio.', test: c => (c.existencias || 0) / Math.max(1, c.activo_total || 1) > 0.15 },
      { t: 'Margen fino, volumen alto', d: 'Con 5% de margen, cada punto de coste financiero pesa.', ask: '¿Qué coste financiero estáis soportando ahora entre pólizas y descuento?', say: 'Con margen del 5,6% la eficiencia financiera es media rentabilidad. Vale la pena comparar números.', test: c => (c.margen_ebitda || 0) < 0.07 },
      { t: 'Stock inmovilizado', d: 'Referencias que no rotan y bloquean la compra de lo que sí vende.', ask: '¿Qué porcentaje del stock lleva más de seis meses parado?', say: 'Ese stock ya lo pagaste. Liberamos caja por otra vía para que puedas comprar lo que rota.', test: c => (c.rotacion_inv || 0) > 75 },
    ],
  },
  {
    id: 'servicios', label: 'Servicios profesionales', letter:'M', divs: [69, 70, 71, 73, 74],
    wins: 11, share: 7.7, ticket: 101889,
    bench: { pmc: 80, pmp: 14, margen: 4.7, ventas: 1466 },
    refs: ['SALESLAND', 'PUBLIONDA', 'NOVA GLOBAL SPAIN'],
    opener: 'En servicios el coste es gente y sale cada mes. El cliente corporate paga a 80 días de media. No hay activo que financiar, solo el desfase.',
    pains: [
      { t: 'Todo el coste es nómina', d: 'Estructura 100% personal: pagas a 14 días y cobras a 80.', ask: '¿Cuánto pesa la nómina sobre vuestro coste total?', say: 'En servicios vemos 80 días de cobro contra 14 de pago. Casi tres meses de nómina financiada por vosotros.', test: c => (c.pmc || 0) > 60 },
      { t: 'Cliente grande que paga tarde', d: 'La cuenta que da prestigio es la que peor paga y no puedes presionarla.', ask: '¿Vuestro cliente más grande es también el que más tarda en pagar?', say: 'No hace falta romper la relación. Anticipamos su factura y tú sigues siendo el proveedor cómodo.', test: c => (c.clientes || 0) / Math.max(1, c.ventas || 1) > 0.2 },
      { t: 'Sin balance que enseñar al banco', d: 'Sin inmovilizado, la banca no ve garantía.', ask: '¿Qué respuesta os da el banco cuando pedís circulante?', say: 'Tu activo es la factura del cliente. Eso es exactamente lo que valoramos nosotros.', test: c => (c.patrimonio || 0) / Math.max(1, c.activo_total || 1) < 0.3 },
    ],
  },
  {
    id: 'transporte', label: 'Transporte y almacenamiento', letter:'H', divs: [49, 50, 51, 52, 53],
    wins: 7, share: 4.9, ticket: 85714,
    bench: { pmc: 59, pmp: 8, margen: 4.3, ventas: 3779 },
    refs: ['AUTOCARES JULIA', 'TRANS ORION', 'TRANSPORTES FS ROMERO'],
    opener: 'Combustible y peajes son cash inmediato. El cargador paga a 60. Con margen del 4%, ese desfase es todo el beneficio del año.',
    pains: [
      { t: 'Combustible al contado', d: 'Gasóleo, peajes y nóminas salen a días. El cargador paga a 60.', ask: '¿A cuánto os pagan los cargadores y a cuánto pagáis el combustible?', say: 'Vemos 59 días de cobro contra 8 de pago en transporte. Es el gap más brutal de todos los sectores que financiamos.', test: c => (c.pmc || 0) > 45 },
      { t: 'Flota que hay que renovar', d: 'El leasing consume la capacidad de endeudamiento que necesitas para circulante.', ask: '¿Cuánta capacidad de deuda os consume la flota?', say: 'Si el leasing ocupa tu línea, no queda para el día a día. Nosotros vamos por fuera de eso.', test: c => (c.deuda_fin || 0) / Math.max(1, c.activo_total || 1) > 0.25 },
      { t: 'Cargador grande que impone plazo', d: 'El cliente que llena los camiones es el que peor paga.', ask: '¿Quién os marca las condiciones de pago, vosotros o el cargador?', say: 'No hay que negociar con él. Le sigues dando 60 días y tú cobras en 48 horas.', test: () => true },
    ],
  },
  {
    id: 'administrativas', label: 'Servicios auxiliares y ETT', letter:'N', divs: [77, 78, 80, 81, 82],
    wins: 6, share: 4.2, ticket: 248333,
    bench: { pmc: 103, pmp: 26, margen: 12.5, ventas: 7066 },
    refs: ['CINELUX', 'OPCIÓN A GEDES', 'HUARIS CALL CENTER'],
    opener: 'Pagáis la nómina el día 1 y el cliente os paga a 100 días. En servicios auxiliares es el sector con más tensión de todos los que financiamos.',
    pains: [
      { t: 'Nómina el día 1, cobro a 100 días', d: 'Tres meses de masa salarial adelantada de forma permanente.', ask: '¿Cuántos meses de nómina tenéis adelantados en cualquier momento?', say: 'La mediana del sector son 103 días de cobro. Son más de tres nóminas financiadas por vosotros a la vez.', test: c => (c.pmc || 0) > 80 },
      { t: 'Crecer = más nómina adelantada', d: 'Cada contrato nuevo exige contratar antes de facturar.', ask: '¿Qué os frena a la hora de coger un contrato grande nuevo?', say: 'El contrato bueno es el que más caja te pide. Nosotros lo financiamos desde la primera factura.', test: c => ((c.ventas || 0) - (c.ventas_1 || 0)) / Math.max(1, c.ventas_1 || 1) > 0.15 },
      { t: 'Concursos públicos que pagan tarde', d: 'Administración con plazos largos e impredecibles.', ask: '¿Trabajáis con administración pública? ¿Cómo van los plazos?', say: 'El cliente público es solvente pero lento. Perfecto para anticipar: riesgo bajo, plazo largo.', test: () => true },
    ],
  },
  {
    id: 'hosteleria', label: 'Hostelería y restauración', letter:'I', divs: [55, 56],
    wins: 11, share: 7.7, ticket: 103091,
    bench: { pmc: 22, pmp: 28, margen: 16.8, ventas: 2210 },
    refs: ['COMPAÑÍA DEL TRÓPICO', 'ENJOY SHERRY', 'DESARROLLOS Y SOLUCIONES DE CATERING'],
    opener: 'En hostelería cobráis rápido, así que el problema no es el cobro: es la estacionalidad y la inversión en local nuevo.',
    pains: [
      { t: 'Estacionalidad', d: 'Meses fuertes y meses en pérdidas, con estructura fija todo el año.', ask: '¿Cómo de marcada es vuestra temporada? ¿Cómo aguantáis los meses flojos?', say: 'No financiamos solo facturas: cuando el negocio es estacional miramos el flujo completo del año.', test: () => true },
      { t: 'Apertura de local', d: 'La obra y el equipamiento salen meses antes del primer euro facturado.', ask: '¿Tenéis aperturas previstas? ¿Cómo las estáis financiando?', say: 'Con margen del 17% la unidad económica funciona; el problema es solo el timing de la inversión.', test: c => (c.margen_ebitda || 0) > 0.1 },
      { t: 'Proveedor que exige cash', d: 'Producto fresco y bebida que no dan plazo.', ask: '¿Vuestros proveedores os dan plazo o es todo contra entrega?', say: 'Si el proveedor no da plazo, tú eres el banco de tu propia cadena de suministro.', test: c => (c.proveedores || 0) / Math.max(1, c.aprovisionamientos || 1) < 0.1 },
    ],
  },
  {
    id: 'turismo', label: 'Turismo y agencias de viaje', divs: [79],
    wins: 8, share: 5.6, ticket: 550750,
    bench: { pmc: 20, pmp: 8, margen: 4.6, ventas: 21861 },
    refs: ['NAUTALIA VIAJES', 'JULIA TRAVEL', 'VIAJES LIBRATUR'],
    opener: 'En agencias el volumen es enorme y el margen del 4%. Hay que pagar al proveedor antes de que el cliente viaje, y eso es puro circulante.',
    pains: [
      { t: 'Prepago al proveedor', d: 'Hoteles y aerolíneas cobran por adelantado; el cliente paga cerca de la fecha.', ask: '¿Cuánto tenéis que adelantar a proveedor antes de la salida?', say: 'Es el ticket medio más alto que financiamos —550k— justo porque el volumen de prepago es enorme.', test: () => true },
      { t: 'Avales y garantías obligatorias', d: 'Regulación que exige garantías que consumen línea bancaria.', ask: '¿Cuánta línea os consumen los avales regulatorios?', say: 'Si el aval te come la póliza, no queda circulante. Nosotros vamos por otra vía.', test: c => (c.deuda_cp || 0) / Math.max(1, c.activo_total || 1) > 0.2 },
      { t: 'Estacionalidad extrema', d: 'Concentración de caja en pocos meses con estructura anual.', ask: '¿Qué meses concentran vuestra facturación?', say: 'Con 4,6% de margen no hay colchón para aguantar cuatro meses flojos sin financiación.', test: c => (c.margen_ebitda || 0) < 0.08 },
    ],
  },
  {
    id: 'vehiculos', label: 'Comercio y reparación de vehículos', divs: [45],
    wins: 4, share: 2.8, ticket: 53381,
    bench: { pmc: 65, pmp: 49, margen: 3.2, ventas: 6654 },
    refs: ['TURBO 3 TRIDIESEL', 'RECAMBIOS JESÚS', 'BATERÍAS VOLTA'],
    opener: 'Stock de vehículo o recambio es la partida más pesada del balance y el margen es del 3%. Cada mes de stock parado se come la operación.',
    pains: [
      { t: 'Stock de altísimo valor', d: 'Vehículos y recambios inmovilizados que representan casi la mitad del activo.', ask: '¿Cuánto tenéis en stock ahora mismo? ¿Cuánto tarda en rotar?', say: 'En vuestro sector el stock mediano es 2,7M€. Es la partida donde está atrapada toda la caja.', test: c => (c.existencias || 0) / Math.max(1, c.activo_total || 1) > 0.2 },
      { t: 'Margen del 3%', d: 'Cualquier ineficiencia financiera se come el beneficio.', ask: '¿Qué estáis pagando hoy entre pólizas, descuento y financiación de stock?', say: 'Con 3,2% de margen, bajar un punto el coste financiero es subir un tercio el beneficio.', test: c => (c.margen_ebitda || 0) < 0.06 },
      { t: 'Financiación de marca cara', d: 'El fabricante financia el stock pero a coste alto y con condiciones.', ask: '¿A qué coste os financia el stock la marca?', say: 'Merece la pena comparar. Muchos concesionarios descubren que la financiación de marca es la más cara que tienen.', test: c => (c.deuda_fin || 0) / Math.max(1, c.activo_total || 1) > 0.2 },
    ],
  },
  {
    id: 'sanidad', label: 'Sanidad y servicios sociales', letter:'Q', divs: [86, 87, 88],
    wins: 3, share: 2.1, ticket: 145000,
    bench: { pmc: 79, pmp: 2, margen: 13.4, ventas: 1707 },
    refs: ['OVAVIT', 'MEDIPREMIUM', 'AMBULÀNCIES PONENT'],
    opener: 'Aseguradoras y administración pagan a 80-90 días, y vuestra estructura es personal que cobra a mes vencido.',
    pains: [
      { t: 'Aseguradora y administración lentas', d: 'Pagadores solventes pero con plazos largos y burocracia.', ask: '¿Qué parte factura a aseguradora o a pública? ¿A cuánto pagan?', say: 'Pagador solvente y plazo largo es el perfil ideal para anticipar: riesgo bajo, alivio inmediato.', test: c => (c.pmc || 0) > 60 },
      { t: 'Equipamiento caro', d: 'Inversión en equipo médico que compite con el circulante.', ask: '¿Tenéis inversión en equipamiento pendiente?', say: 'Liberamos el circulante para que tu caja propia vaya a equipo, no a financiar a la aseguradora.', test: c => (c.ebitda || 0) > 0 },
    ],
  },
  {
    id: 'energia', label: 'Energía y utilities', letter:'D', divs: [35, 36, 38, 39],
    wins: 0, share: 0, ticket: 0,
    bench: { pmc: 60, pmp: 30, margen: 6, ventas: 5000 },
    refs: [],
    opener: 'En energía el desfase entre lo que compráis en mercado y lo que cobráis del cliente final es puro circulante, y los volúmenes son grandes.',
    pains: [
      { t: 'Compra en mercado vs cobro a cliente', d: 'Se liquida el mercado antes de cobrar al cliente final.', ask: '¿Cómo gestionáis el desfase entre liquidación de mercado y cobro de cliente?', say: 'Volúmenes grandes con margen fino: el circulante es el cuello de botella del crecimiento.', test: () => true },
      { t: 'Garantías de mercado', d: 'Avales exigidos que inmovilizan capital.', ask: '¿Cuánto tenéis inmovilizado en garantías de mercado?', say: 'Ese capital inmovilizado no rinde. Buscamos liberarlo por otra vía.', test: c => (c.deuda_cp || 0) / Math.max(1, c.activo_total || 1) > 0.25 },
      { t: 'Proyectos con CAPEX largo', d: 'Instalaciones que tardan en generar caja.', ask: '¿Tenéis proyectos en desarrollo? ¿Cómo se financia el tramo hasta que generan?', say: 'Mientras el proyecto no genera, la operativa tiene que sostenerse sola.', test: c => ((c.ventas || 0) - (c.ventas_1 || 0)) / Math.max(1, c.ventas_1 || 1) > 0.2 },
    ],
  },
  {
    id: 'agro', label: 'Agroalimentario', letter:'A', divs: [1, 2, 3],
    wins: 1, share: 0.7, ticket: 35000,
    bench: { pmc: 49, pmp: 18, margen: 3.7, ventas: 3763 },
    refs: ['TORDIXAI'],
    opener: 'El ciclo agrícola no negocia: siembras, esperas y cobras meses después. La distribución además paga a 60-90.',
    pains: [
      { t: 'Ciclo biológico largo', d: 'Meses entre inversión en campo y primera venta.', ask: '¿Cuánto pasa desde que invertís en campaña hasta que cobráis?', say: 'El ciclo no se puede acelerar, pero el cobro sí.', test: () => true },
      { t: 'Gran distribución impone plazo', d: 'Cadenas que pagan a 60-90 días sin margen de negociación.', ask: '¿Vendéis a gran distribución? ¿A cuánto os pagan?', say: 'Con la cadena no se negocia el plazo. Nosotros lo acortamos por nuestra cuenta.', test: c => (c.pmc || 0) > 45 },
      { t: 'Precio volátil', d: 'Cotización que cambia y obliga a vender cuando no interesa.', ask: '¿Os habéis visto forzados a vender a mal precio por necesidad de caja?', say: 'Vender por necesidad es el peor negocio. Con circulante puedes esperar al precio bueno.', test: c => (c.margen_ebitda || 0) < 0.06 },
    ],
  },
  {
    id: 'inmobiliario', label: 'Inmobiliario y holding', letter:'L', divs: [64, 65, 66, 68],
    wins: 2, share: 1.4, ticket: 70000,
    bench: { pmc: 100, pmp: 20, margen: 5, ventas: 4000 },
    refs: ['ABANTE SERVICIOS EMPRESARIALES', 'FINTECA TECH'],
    opener: 'Con activo inmobilizado en ladrillo, la caja operativa siempre va justa aunque el balance parezca sólido.',
    pains: [
      { t: 'Activo ilíquido', d: 'Patrimonio importante pero nada convertible en caja a corto.', ask: '¿Cómo cubrís las necesidades de caja del día a día con el activo en inmuebles?', say: 'Balance sólido no es lo mismo que caja disponible. Trabajamos sobre lo que sí es líquido.', test: () => true },
      { t: 'Cobro lento de servicios', d: 'Honorarios y rentas que se cobran con retraso.', ask: '¿A cuánto se os están yendo los cobros?', say: 'Cien días de cobro es medio año de tesorería comprometida.', test: c => (c.pmc || 0) > 75 },
    ],
  },
];

window.INDUSTRY_FALLBACK = {
  id: 'general', label: 'Perfil general', divs: [], wins: 143, share: 100, ticket: 145000,
  bench: { pmc: 62, pmp: 30, margen: 6.5, ventas: 4300 },
  refs: [],
  opener: 'El patrón que vemos en las 143 pymes con las que trabajamos es el mismo: cobras más tarde de lo que pagas, y ese desfase lo financias tú.',
  pains: [
    { t: 'Desfase cobro-pago', d: 'Pagas antes de cobrar y el gap sale de tu caja.', ask: '¿A cuánto cobráis y a cuánto pagáis?', say: 'Ese hueco entre cobro y pago es exactamente lo que financiamos.', test: c => (c.pmc || 0) > 50 },
    { t: 'Crecimiento que aprieta la caja', d: 'Cada euro de más ventas exige más circulante.', ask: '¿Estáis creciendo? ¿Notáis que la caja va más justa que antes?', say: 'Crecer consume caja. Es el problema bueno, pero sigue siendo un problema.', test: c => ((c.ventas || 0) - (c.ventas_1 || 0)) / Math.max(1, c.ventas_1 || 1) > 0.1 },
    { t: 'Banco que no acompaña', d: 'Líneas al límite o renovaciones cada vez más duras.', ask: '¿Cómo va la relación con el banco este año?', say: 'Nosotros miramos tus cobros, no tu histórico de balance.', test: c => (c.patrimonio || 0) / Math.max(1, c.activo_total || 1) < 0.3 },
  ],
};

// Resolución en dos pasos. La división CNAE manda; si no está en ninguna lista,
// se usa la letra de sección que SABI ya incrusta en el campo sector ("C – Industria...").
// Así una división nueva u olvidada aterriza igualmente en su playbook.
window.getIndustry = function (cnaeOrCompany, sector) {
  const c = (cnaeOrCompany && typeof cnaeOrCompany === 'object') ? cnaeOrCompany : null;
  const cnae = c ? c.cnae : cnaeOrCompany;
  const sec  = c ? c.sector : sector;

  const div = Math.floor((cnae || 0) / 100);
  for (const ind of window.INDUSTRIES) if (ind.divs.includes(div)) return ind;

  const letter = String(sec || '').trim().charAt(0).toUpperCase();
  if (letter) for (const ind of window.INDUSTRIES) if (ind.letter === letter) return ind;

  return window.INDUSTRY_FALLBACK;
};

window.getIndustryFor = function (c) { return window.getIndustry(c); };
