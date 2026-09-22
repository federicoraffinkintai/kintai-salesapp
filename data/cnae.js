// Árbol CNAE-2009 para explorar nichos a cualquier profundidad: sección (letra),
// división (2 dígitos), grupo (3) y clase (4). Solo se etiquetan los códigos
// presentes en el universo; lo que no tenga etiqueta se muestra con su código.

window.CNAE_SECTIONS = [
  { letter:'A', label:'Agricultura, ganadería y pesca', from:1, to:3 },
  { letter:'B', label:'Industrias extractivas', from:5, to:9 },
  { letter:'C', label:'Industria manufacturera', from:10, to:33 },
  { letter:'D', label:'Energía eléctrica y gas', from:35, to:35 },
  { letter:'E', label:'Agua, saneamiento y residuos', from:36, to:39 },
  { letter:'F', label:'Construcción', from:41, to:43 },
  { letter:'G', label:'Comercio y reparación de vehículos', from:45, to:47 },
  { letter:'H', label:'Transporte y almacenamiento', from:49, to:53 },
  { letter:'I', label:'Hostelería', from:55, to:56 },
  { letter:'J', label:'Información y comunicaciones', from:58, to:63 },
  { letter:'K', label:'Actividades financieras y seguros', from:64, to:66 },
  { letter:'L', label:'Actividades inmobiliarias', from:68, to:68 },
  { letter:'M', label:'Profesionales, científicas y técnicas', from:69, to:75 },
  { letter:'N', label:'Administrativas y servicios auxiliares', from:77, to:82 },
  { letter:'P', label:'Educación', from:85, to:85 },
  { letter:'Q', label:'Sanidad y servicios sociales', from:86, to:88 },
  { letter:'R', label:'Artísticas y recreativas', from:90, to:93 },
  { letter:'S', label:'Otros servicios', from:94, to:96 },
];

window.CNAE_DIV = {
  1:'Agricultura y ganadería', 10:'Alimentación', 11:'Bebidas', 12:'Tabaco',
  14:'Confección de prendas de vestir', 15:'Cuero y calzado', 16:'Madera y corcho',
  18:'Artes gráficas', 20:'Industria química', 21:'Productos farmacéuticos',
  22:'Caucho y plásticos', 23:'Minerales no metálicos', 24:'Metalurgia',
  25:'Productos metálicos', 26:'Informática y electrónica', 27:'Material eléctrico',
  28:'Maquinaria y equipo', 30:'Otro material de transporte', 31:'Muebles',
  33:'Reparación e instalación de maquinaria', 35:'Energía eléctrica y gas',
  36:'Captación y distribución de agua', 38:'Tratamiento de residuos',
  41:'Construcción de edificios', 42:'Ingeniería civil',
  43:'Construcción especializada', 45:'Venta y reparación de vehículos',
  46:'Comercio al por mayor', 47:'Comercio al por menor',
  49:'Transporte terrestre', 52:'Almacenamiento y logística', 53:'Actividades postales',
  59:'Cine, vídeo y televisión', 61:'Telecomunicaciones', 62:'Programación y consultoría TI',
  68:'Actividades inmobiliarias', 69:'Jurídicas y contabilidad',
  70:'Consultoría de gestión', 71:'Arquitectura e ingeniería', 73:'Publicidad y estudios de mercado',
  77:'Alquiler', 80:'Seguridad e investigación', 81:'Servicios a edificios y jardinería',
  85:'Educación', 86:'Actividades sanitarias', 87:'Establecimientos residenciales',
  88:'Servicios sociales sin alojamiento', 90:'Creación y artes escénicas', 96:'Otros servicios personales',
};

window.CNAE_CLASS = {
  113:'Cultivo de hortalizas y tubérculos', 119:'Otros cultivos no perennes',
  123:'Cultivo de cítricos', 147:'Avicultura', 150:'Agricultura y ganadería combinadas',
  1013:'Productos cárnicos elaborados', 1043:'Aceite de oliva', 1102:'Elaboración de vinos',
  1200:'Industria del tabaco', 1413:'Prendas de vestir exteriores', 1419:'Otras prendas y accesorios',
  1520:'Calzado', 1624:'Envases y embalajes de madera', 1812:'Otras artes gráficas',
  2059:'Otros productos químicos', 2120:'Especialidades farmacéuticas',
  2229:'Otros productos de plástico', 2312:'Manipulado de vidrio plano',
  2349:'Otros productos cerámicos', 2370:'Corte y acabado de la piedra',
  2420:'Tubos y perfiles de acero', 2442:'Producción de aluminio',
  2511:'Estructuras metálicas', 2512:'Carpintería metálica', 2529:'Cisternas y contenedores de metal',
  2561:'Tratamiento y revestimiento de metales', 2640:'Electrónica de consumo',
  2711:'Motores y generadores eléctricos', 2841:'Máquinas herramienta para metal',
  2892:'Maquinaria para minería y construcción', 2895:'Maquinaria para papel y cartón',
  3011:'Construcción naval', 3020:'Material ferroviario', 3030:'Aeronáutica y espacial',
  3040:'Vehículos militares', 3101:'Muebles de oficina', 3311:'Reparación de productos metálicos',
  3319:'Reparación de otros equipos', 3514:'Comercio de energía eléctrica',
  3519:'Otra producción de energía', 3600:'Captación y distribución de agua',
  3821:'Residuos no peligrosos',
  4110:'Promoción inmobiliaria', 4121:'Edificios residenciales', 4122:'Edificios no residenciales',
  4211:'Carreteras y autopistas', 4299:'Otros proyectos de ingeniería civil',
  4321:'Instalaciones eléctricas', 4332:'Instalación de carpintería',
  4333:'Revestimiento de suelos y paredes', 4339:'Otro acabado de edificios',
  4399:'Otras actividades de construcción especializada',
  4511:'Venta de automóviles', 4520:'Reparación de vehículos',
  4531:'Mayor de repuestos de vehículos', 4532:'Menor de repuestos de vehículos',
  4540:'Venta y reparación de motocicletas',
  4611:'Intermediarios de materias primas agrarias', 4612:'Intermediarios de combustibles y químicos',
  4617:'Intermediarios de productos alimenticios', 4618:'Intermediarios especializados',
  4619:'Intermediarios de productos diversos', 4621:'Cereales y alimentos para animales',
  4631:'Frutas y hortalizas', 4634:'Bebidas', 4638:'Pescados y otros alimentos',
  4639:'Alimentos no especializado', 4641:'Textiles', 4642:'Prendas de vestir y calzado',
  4643:'Aparatos electrodomésticos', 4645:'Perfumería y cosmética',
  4647:'Muebles e iluminación', 4649:'Otros artículos de uso doméstico',
  4652:'Equipos electrónicos y telecomunicaciones', 4661:'Maquinaria agrícola',
  4662:'Máquinas herramienta', 4665:'Muebles de oficina', 4669:'Otra maquinaria y equipo',
  4671:'Combustibles', 4672:'Metales y minerales metálicos',
  4673:'Madera y materiales de construcción', 4674:'Ferretería y fontanería',
  4675:'Productos químicos', 4676:'Otros productos semielaborados',
  4677:'Chatarra y productos de desecho', 4690:'Mayor no especializado',
  4754:'Electrodomésticos', 4764:'Artículos deportivos', 4765:'Juegos y juguetes',
  4771:'Prendas de vestir', 4773:'Productos farmacéuticos', 4774:'Artículos médicos y ortopédicos',
  4776:'Flores, plantas y animales', 4778:'Otro comercio de artículos nuevos',
  4791:'Comercio por internet y correspondencia',
  4941:'Mercancías por carretera', 5221:'Anexas al transporte terrestre',
  5223:'Anexas al transporte aéreo', 5229:'Otras anexas al transporte',
  5320:'Otras actividades postales',
  5915:'Producción cinematográfica y de vídeo', 5916:'Producción de programas de TV',
  6190:'Otras telecomunicaciones', 6201:'Programación informática',
  6202:'Consultoría informática', 6209:'Otros servicios informáticos',
  6810:'Compraventa de inmuebles', 6831:'Agentes de la propiedad inmobiliaria',
  6832:'Gestión y administración de inmuebles', 6910:'Actividades jurídicas',
  7021:'Relaciones públicas y comunicación', 7022:'Consultoría de gestión empresarial',
  7112:'Servicios técnicos de ingeniería', 7311:'Agencias de publicidad',
  7711:'Alquiler de automóviles', 7732:'Alquiler de maquinaria de construcción',
  8020:'Sistemas de seguridad', 8129:'Otras actividades de limpieza',
  8559:'Otra educación', 8622:'Medicina especializada',
  8731:'Residencias para personas mayores', 8811:'Servicios sociales para mayores',
  9001:'Artes escénicas', 9609:'Otros servicios personales',
};

// La clave de agrupación a cada profundidad. El CNAE viene como número, así que
// la sección se resuelve por división, no por el primer dígito del código.
window.cnaeKey = function (cnae, depth) {
  const n = Number(cnae) || 0;
  if (!n) return null;
  const div = Math.floor(n / 100);
  if (depth === 1) {
    const s = window.CNAE_SECTIONS.find(x => div >= x.from && div <= x.to);
    return s ? s.letter : null;
  }
  if (depth === 2) return String(div).padStart(2, '0');
  if (depth === 3) return String(Math.floor(n / 10)).padStart(3, '0');
  return String(n).padStart(4, '0');
};

window.cnaeLabel = function (key, depth) {
  if (key == null) return 'Sin CNAE';
  if (depth === 1) {
    const s = window.CNAE_SECTIONS.find(x => x.letter === key);
    return s ? s.label : key;
  }
  if (depth === 2) return window.CNAE_DIV[Number(key)] || 'División ' + key;
  if (depth === 3) {
    const div = window.CNAE_DIV[Math.floor(Number(key) / 10)];
    return (div ? div + ' · grupo ' : 'Grupo ') + key;
  }
  return window.CNAE_CLASS[Number(key)] || 'Clase ' + key;
};

// Código legible: la sección es una letra, el resto va con dígitos.
window.cnaeCode = function (key, depth) {
  if (key == null) return '—';
  return depth === 1 ? key : key;
};

window.CNAE_DEPTHS = [
  { d:1, label:'Sección', hint:'letra' },
  { d:2, label:'División', hint:'2 díg.' },
  { d:3, label:'Grupo', hint:'3 díg.' },
  { d:4, label:'Clase', hint:'4 díg.' },
];
