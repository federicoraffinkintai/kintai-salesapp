// ============= EMBUDO POR ETAPAS =============
// Etapas reales de HubSpot, en orden. Un aviso que manda sobre todo lo demás:
// el export solo trae la etapa ACTUAL de cada deal, no su histórico. Así que
// "alcanzados" cuenta los deals que hoy están en esa etapa o más adelante, más
// los ganados. Los 3.560 perdidos y rechazados NO dicen dónde murieron, y por
// eso el embudo mide paso entre etapas de los deals vivos, no mortalidad.
window.FN_META = {
  fuente: 'HubSpot · export de deals 12-sep-2026',
  aviso: 'El export expone la etapa actual, no el histórico de cada deal. Los perdidos no registran la etapa en la que se cayeron.',
  perdidos: 3560,
};

window.FN_ORD = ["ENRICHMENT","PREP CARTERA","A REVISAR","PRIMARY INFORMATION (SALES)","NEW DEAL (SALES)","DISCOVERY (SALES)","PRODUCT/COLLATERAL FIT (TEAM)","MORE INFO (SALES)","DATA GATHERING ACTIVACION","SALES VERIFICATION","DEBTOR VERIFICATION (OPS)","PRE CRA (RISK)","RISK ANALYSIS (RISK)","NEGOCIATION (SALES)","WON"];
window.FN_DATA = {"2026":{"n":2048,"won":88,"lost":1359,"rej":130,"cur":{"ENRICHMENT":55,"PREP CARTERA":34,"A REVISAR":0,"PRIMARY INFORMATION (SALES)":33,"NEW DEAL (SALES)":109,"DISCOVERY (SALES)":51,"PRODUCT/COLLATERAL FIT (TEAM)":3,"MORE INFO (SALES)":22,"DATA GATHERING ACTIVACION":20,"SALES VERIFICATION":3,"DEBTOR VERIFICATION (OPS)":2,"PRE CRA (RISK)":21,"RISK ANALYSIS (RISK)":8,"NEGOCIATION (SALES)":110,"WON":88},"alc":{"ENRICHMENT":559,"PREP CARTERA":504,"A REVISAR":470,"PRIMARY INFORMATION (SALES)":470,"NEW DEAL (SALES)":437,"DISCOVERY (SALES)":328,"PRODUCT/COLLATERAL FIT (TEAM)":277,"MORE INFO (SALES)":274,"DATA GATHERING ACTIVACION":252,"SALES VERIFICATION":232,"DEBTOR VERIFICATION (OPS)":229,"PRE CRA (RISK)":227,"RISK ANALYSIS (RISK)":206,"NEGOCIATION (SALES)":198,"WON":88}},"total":{"n":4712,"won":600,"lost":2610,"rej":950,"cur":{"ENRICHMENT":55,"PREP CARTERA":35,"A REVISAR":33,"PRIMARY INFORMATION (SALES)":33,"NEW DEAL (SALES)":125,"DISCOVERY (SALES)":51,"PRODUCT/COLLATERAL FIT (TEAM)":4,"MORE INFO (SALES)":24,"DATA GATHERING ACTIVACION":20,"SALES VERIFICATION":4,"DEBTOR VERIFICATION (OPS)":2,"PRE CRA (RISK)":25,"RISK ANALYSIS (RISK)":9,"NEGOCIATION (SALES)":132,"WON":600},"alc":{"ENRICHMENT":1152,"PREP CARTERA":1097,"A REVISAR":1062,"PRIMARY INFORMATION (SALES)":1029,"NEW DEAL (SALES)":996,"DISCOVERY (SALES)":871,"PRODUCT/COLLATERAL FIT (TEAM)":820,"MORE INFO (SALES)":816,"DATA GATHERING ACTIVACION":792,"SALES VERIFICATION":772,"DEBTOR VERIFICATION (OPS)":768,"PRE CRA (RISK)":766,"RISK ANALYSIS (RISK)":741,"NEGOCIATION (SALES)":732,"WON":600}},"Partners":{"n":2341,"won":387,"lost":1071,"rej":679,"cur":{"ENRICHMENT":2,"PREP CARTERA":4,"A REVISAR":19,"PRIMARY INFORMATION (SALES)":8,"NEW DEAL (SALES)":31,"DISCOVERY (SALES)":8,"PRODUCT/COLLATERAL FIT (TEAM)":0,"MORE INFO (SALES)":16,"DATA GATHERING ACTIVACION":15,"SALES VERIFICATION":2,"DEBTOR VERIFICATION (OPS)":1,"PRE CRA (RISK)":12,"RISK ANALYSIS (RISK)":6,"NEGOCIATION (SALES)":80,"WON":387},"alc":{"ENRICHMENT":591,"PREP CARTERA":589,"A REVISAR":585,"PRIMARY INFORMATION (SALES)":566,"NEW DEAL (SALES)":558,"DISCOVERY (SALES)":527,"PRODUCT/COLLATERAL FIT (TEAM)":519,"MORE INFO (SALES)":519,"DATA GATHERING ACTIVACION":503,"SALES VERIFICATION":488,"DEBTOR VERIFICATION (OPS)":486,"PRE CRA (RISK)":485,"RISK ANALYSIS (RISK)":473,"NEGOCIATION (SALES)":467,"WON":387}},"Outbound":{"n":915,"won":16,"lost":716,"rej":39,"cur":{"ENRICHMENT":0,"PREP CARTERA":8,"A REVISAR":3,"PRIMARY INFORMATION (SALES)":25,"NEW DEAL (SALES)":45,"DISCOVERY (SALES)":35,"PRODUCT/COLLATERAL FIT (TEAM)":0,"MORE INFO (SALES)":5,"DATA GATHERING ACTIVACION":0,"SALES VERIFICATION":0,"DEBTOR VERIFICATION (OPS)":1,"PRE CRA (RISK)":0,"RISK ANALYSIS (RISK)":3,"NEGOCIATION (SALES)":19,"WON":16},"alc":{"ENRICHMENT":160,"PREP CARTERA":160,"A REVISAR":152,"PRIMARY INFORMATION (SALES)":149,"NEW DEAL (SALES)":124,"DISCOVERY (SALES)":79,"PRODUCT/COLLATERAL FIT (TEAM)":44,"MORE INFO (SALES)":44,"DATA GATHERING ACTIVACION":39,"SALES VERIFICATION":39,"DEBTOR VERIFICATION (OPS)":39,"PRE CRA (RISK)":38,"RISK ANALYSIS (RISK)":38,"NEGOCIATION (SALES)":35,"WON":16}},"Inbound":{"n":292,"won":18,"lost":125,"rej":139,"cur":{"ENRICHMENT":0,"PREP CARTERA":0,"A REVISAR":2,"PRIMARY INFORMATION (SALES)":0,"NEW DEAL (SALES)":1,"DISCOVERY (SALES)":0,"PRODUCT/COLLATERAL FIT (TEAM)":1,"MORE INFO (SALES)":0,"DATA GATHERING ACTIVACION":0,"SALES VERIFICATION":0,"DEBTOR VERIFICATION (OPS)":0,"PRE CRA (RISK)":1,"RISK ANALYSIS (RISK)":0,"NEGOCIATION (SALES)":5,"WON":18},"alc":{"ENRICHMENT":28,"PREP CARTERA":28,"A REVISAR":28,"PRIMARY INFORMATION (SALES)":26,"NEW DEAL (SALES)":26,"DISCOVERY (SALES)":25,"PRODUCT/COLLATERAL FIT (TEAM)":25,"MORE INFO (SALES)":24,"DATA GATHERING ACTIVACION":24,"SALES VERIFICATION":24,"DEBTOR VERIFICATION (OPS)":24,"PRE CRA (RISK)":24,"RISK ANALYSIS (RISK)":23,"NEGOCIATION (SALES)":23,"WON":18}},"Referral":{"n":186,"won":87,"lost":48,"rej":28,"cur":{"ENRICHMENT":0,"PREP CARTERA":2,"A REVISAR":2,"PRIMARY INFORMATION (SALES)":0,"NEW DEAL (SALES)":3,"DISCOVERY (SALES)":2,"PRODUCT/COLLATERAL FIT (TEAM)":0,"MORE INFO (SALES)":1,"DATA GATHERING ACTIVACION":4,"SALES VERIFICATION":1,"DEBTOR VERIFICATION (OPS)":0,"PRE CRA (RISK)":0,"RISK ANALYSIS (RISK)":0,"NEGOCIATION (SALES)":8,"WON":87},"alc":{"ENRICHMENT":110,"PREP CARTERA":110,"A REVISAR":108,"PRIMARY INFORMATION (SALES)":106,"NEW DEAL (SALES)":106,"DISCOVERY (SALES)":103,"PRODUCT/COLLATERAL FIT (TEAM)":101,"MORE INFO (SALES)":101,"DATA GATHERING ACTIVACION":100,"SALES VERIFICATION":96,"DEBTOR VERIFICATION (OPS)":95,"PRE CRA (RISK)":95,"RISK ANALYSIS (RISK)":95,"NEGOCIATION (SALES)":95,"WON":87}},"Contacts":{"n":102,"won":5,"lost":15,"rej":8,"cur":{"ENRICHMENT":0,"PREP CARTERA":21,"A REVISAR":0,"PRIMARY INFORMATION (SALES)":0,"NEW DEAL (SALES)":10,"DISCOVERY (SALES)":6,"PRODUCT/COLLATERAL FIT (TEAM)":2,"MORE INFO (SALES)":2,"DATA GATHERING ACTIVACION":1,"SALES VERIFICATION":1,"DEBTOR VERIFICATION (OPS)":0,"PRE CRA (RISK)":12,"RISK ANALYSIS (RISK)":0,"NEGOCIATION (SALES)":19,"WON":5},"alc":{"ENRICHMENT":79,"PREP CARTERA":79,"A REVISAR":58,"PRIMARY INFORMATION (SALES)":58,"NEW DEAL (SALES)":58,"DISCOVERY (SALES)":48,"PRODUCT/COLLATERAL FIT (TEAM)":42,"MORE INFO (SALES)":40,"DATA GATHERING ACTIVACION":38,"SALES VERIFICATION":37,"DEBTOR VERIFICATION (OPS)":36,"PRE CRA (RISK)":36,"RISK ANALYSIS (RISK)":24,"NEGOCIATION (SALES)":24,"WON":5}}};

window.FN_LABEL = {
  'ENRICHMENT':'Enrichment', 'PREP CARTERA':'Prep cartera', 'A REVISAR':'A revisar',
  'PRIMARY INFORMATION (SALES)':'Información primaria', 'NEW DEAL (SALES)':'Nuevo deal',
  'DISCOVERY (SALES)':'Discovery', 'PRODUCT/COLLATERAL FIT (TEAM)':'Encaje de producto',
  'MORE INFO (SALES)':'Más información', 'DATA GATHERING ACTIVACION':'Data gathering',
  'SALES VERIFICATION':'Verificación ventas', 'DEBTOR VERIFICATION (OPS)':'Verificación deudor',
  'PRE CRA (RISK)':'Pre CRA', 'RISK ANALYSIS (RISK)':'Risk analysis',
  'NEGOCIATION (SALES)':'Proposal', 'WON':'Won',
};

// Fases del SDR: de la lista al deal cualificado. Termina donde empieza el AE.
window.FN_SDR = [
  { id:'prospeccion',  label:'Prospección',  etapas:['ENRICHMENT','PREP CARTERA','A REVISAR'],
    desc:'Lista preparada y empresa enriquecida antes de llamar.' },
  { id:'cualificacion',label:'Cualificación',etapas:['PRIMARY INFORMATION (SALES)','NEW DEAL (SALES)'],
    desc:'Conversación con el decisor y datos primarios recogidos.' },
  { id:'deal',         label:'Deal',         etapas:['DISCOVERY (SALES)'],
    desc:'Discovery agendado: el deal pasa al AE.' },
];

// Fases del AE: del discovery a la activación.
window.FN_AE = [
  { id:'discovery',  label:'Discovery',     etapas:['DISCOVERY (SALES)','PRODUCT/COLLATERAL FIT (TEAM)'],
    desc:'Reunión de descubrimiento y encaje de producto.' },
  { id:'data',       label:'Data gathering',etapas:['MORE INFO (SALES)','DATA GATHERING ACTIVACION'],
    desc:'Documentación, cuentas y mayor de clientes.' },
  { id:'riesgos',    label:'Risk analysis', etapas:['SALES VERIFICATION','DEBTOR VERIFICATION (OPS)','PRE CRA (RISK)','RISK ANALYSIS (RISK)'],
    desc:'Verificación de deudor, pre CRA y comité de riesgos.' },
  { id:'proposal',   label:'Proposal',      etapas:['NEGOCIATION (SALES)'],
    desc:'Propuesta con límite y precio sobre la mesa.' },
  { id:'activacion', label:'Activation',    etapas:['WON'],
    desc:'Firma y alta de la línea.' },
  { id:'won',        label:'Won',           etapas:['WON'],
    desc:'Cliente con línea firmada.' },
];

// Alcanzados de una fase: la etapa más temprana de la fase manda, porque
// "alcanzar la fase" es haber llegado a su primera etapa.
window.fnFase = function (canal, fase) {
  const d = window.FN_DATA[canal] || window.FN_DATA.total;
  const primera = fase.etapas[0];
  return { alc: d.alc[primera] || 0, aqui: fase.etapas.reduce((a, e) => a + (d.cur[e] || 0), 0) };
};

// Embudo de un canal por fases, con el paso entre fases consecutivas.
window.fnEmbudo = function (canal, fases) {
  const d = window.FN_DATA[canal] || window.FN_DATA.total;
  const rows = fases.map(f => ({ ...f, ...window.fnFase(canal, f) }));
  // Activation y Won comparten etapa en el export: se distingue el paso, no el
  // recuento, y se dice en la nota.
  rows.forEach((r, i) => {
    const prev = i > 0 ? rows[i - 1] : null;
    r.paso = prev && prev.alc ? r.alc / prev.alc : null;
    r.caida = prev ? Math.max(0, prev.alc - r.alc) : null;
  });
  return { rows, n: d.n, won: d.won, lost: d.lost + d.rej,
    e2e: rows.length && rows[0].alc ? rows[rows.length - 1].alc / rows[0].alc : null };
};

// Embudo por etapa suelta, sin agrupar, para el detalle fino.
window.fnEtapas = function (canal) {
  const d = window.FN_DATA[canal] || window.FN_DATA.total;
  return window.FN_ORD.map((e, i) => {
    const prev = i > 0 ? window.FN_ORD[i - 1] : null;
    return { id:e, label: window.FN_LABEL[e] || e, alc: d.alc[e] || 0, aqui: d.cur[e] || 0,
      paso: prev && d.alc[prev] ? d.alc[e] / d.alc[prev] : null,
      caida: prev ? Math.max(0, d.alc[prev] - d.alc[e]) : null };
  });
};
