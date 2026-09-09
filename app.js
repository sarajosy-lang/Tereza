const MARCAS=["TG","Lipoless","Tirzec","Tirzedral","Lipoland","Gluconex"];

// BANCO MESTRE — ETAPA 3
// Somente dados já identificados/confirmados nos materiais enviados.
// Campos pendentes permanecem bloqueados para evitar inferência.
const DB={
  "TG":[
    {id:"tg-15-normal",label:"Normal — 15 mg/0,5 mL",concentracaoMg:30,concentracao:"15 mg/0,5 mL",volumeTotal:"2,0 mL",fonte:"Foto da embalagem/material enviado",status:"confirmado"}
  ],
  "Lipoless":[
    {id:"lipoless-15-normal",label:"Normal — 15 mg/0,5 mL",concentracaoMg:30,concentracao:"15 mg/0,5 mL",volumeTotal:"2,0 mL",fonte:"Foto da embalagem/material enviado",status:"confirmado"},
    {id:"lipoless-15-md",label:"MD — 15 mg/0,6 mL",concentracaoMg:25,concentracao:"15 mg/0,6 mL",volumeTotal:"2,4 mL",fonte:"Foto da embalagem/material enviado",status:"confirmado"}
  ],
  "Tirzec":[
    {id:"tirzec-15-05",label:"15 mg/0,5 mL",concentracaoMg:30,concentracao:"15 mg/0,5 mL",volumeTotal:"2,0 mL",fonte:"Foto da embalagem/material enviado",status:"confirmado"}
  ],
  "Tirzedral":[
    {id:"tirzedral-15-md",label:"MD — 15 mg/0,6 mL",concentracaoMg:25,concentracao:"15 mg/0,6 mL",volumeTotal:"2,4 mL",fonte:"Foto da embalagem/material enviado",status:"confirmado"}
  ],
  "Lipoland":[
    {id:"lipoland-15-05",label:"15 mg/0,5 mL",concentracaoMg:30,concentracao:"15 mg/0,5 mL",volumeTotal:"A confirmar",fonte:"Material enviado",status:"confirmado-parcial"}
  ],
  "Gluconex":[
    {id:"gluconex-15-10",label:"15 mg/1,0 mL",concentracaoMg:15,concentracao:"15 mg/1,0 mL",volumeTotal:"A confirmar",fonte:"Foto/material enviado",status:"confirmado-parcial"}
  ]
};

const SERINGAS=[
  {id:"30",label:"Seringa 30 UI",capacidade:"30 UI",graduacao:"Verificar graduação do modelo"},
  {id:"50",label:"Seringa 50 UI",capacidade:"50 UI",graduacao:"Verificar graduação do modelo"},
  {id:"100",label:"Seringa 100 UI",capacidade:"100 UI",graduacao:"Pode haver modelos com divisões diferentes; verificar a escala"}
];

const $=s=>document.querySelector(s);
const marca=$("#marca"), apres=$("#apresentacao");
MARCAS.forEach(m=>marca.add(new Option(m,m)));

function preencher(select, items){
  select.innerHTML="";
  items.forEach(x=>select.add(new Option(x.label,x.id)));
}
marca.addEventListener("change",()=>{
  apres.disabled=!marca.value;
  if(!marca.value){apres.innerHTML="<option>Selecione a marca primeiro</option>";return}
  preencher(apres,DB[marca.value]);
  $("#resultado").textContent="Agora selecione a apresentação.";
});
$("#consultar").addEventListener("click",()=>{
  const m=marca.value, item=DB[m]?.find(x=>x.id===apres.value), dose=parseFloat($("#dose").value);
  if(!m||!item){$("#resultado").textContent="Selecione marca e apresentação.";return}
  if(!Number.isFinite(dose)||dose<=0){$("#resultado").textContent="Informe a dose prescrita em mg.";return}
  $("#resultado").innerHTML=`<b>${m}</b><br>Dose informada: <b>${dose.toLocaleString("pt-BR")} mg</b><br><span class="small">Referência: ${item.fonte}. A apresentação ainda está em validação e a ferramenta não converte dose para UI ou instrução de aplicação.</span>`;
});

const all=()=>MARCAS.flatMap(m=>DB[m].map(x=>({...x,marca:m})));
const ca=$("#compA"),cb=$("#compB");
function loadComps(){
  [ca,cb].forEach(s=>{s.innerHTML="";all().forEach(x=>s.add(new Option(`${x.marca} — ${x.label}`,`${x.marca}|${x.id}`)))});
}
function getComp(v){const [m,id]=(v||"").split("|");return DB[m]?.find(x=>x.id===id)?{...DB[m].find(x=>x.id===id),marca:m}:null}
function renderCompare(){
 const a=getComp(ca.value),b=getComp(cb.value);
 if(!a||!b){$("#compareTable").innerHTML="";return}
 const rows=[["Concentração",a.concentracao,b.concentracao],["Volume",a.volume,b.volume],["Quantidade total",a.total,b.total],["Fonte",a.fonte,b.fonte]];
 $("#compareTable").innerHTML=`<table class="compare-table"><thead><tr><th>Informação</th><th>${a.marca}</th><th>${b.marca}</th></tr></thead><tbody>${rows.map(r=>`<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table>`;
}
loadComps(); ca.addEventListener("change",renderCompare);cb.addEventListener("change",renderCompare);

$("#products").innerHTML=MARCAS.map(m=>`<article class="product"><div class="product-icon">📦</div><span class="tag">Em validação</span><h3>${m}</h3><p class="small">Apresentações e imagens dos materiais enviados serão cadastradas e conferidas antes da publicação.</p><a href="#calculadora" class="btn ghost">Consultar</a></article>`).join("");

$("#menuBtn").addEventListener("click",()=>$("#nav").classList.toggle("open"));
document.querySelectorAll("#nav a").forEach(a=>a.addEventListener("click",()=>$("#nav").classList.remove("open")));

$("#search").addEventListener("keydown",e=>{
 if(e.key!=="Enter")return;
 const q=e.target.value.toLowerCase().trim();
 if(!q)return;
 const target=MARCAS.find(m=>m.toLowerCase().includes(q));
 if(target){marca.value=target;marca.dispatchEvent(new Event("change"));location.hash="calculadora";}
 else {alert("Ainda não encontrei esse termo no cadastro. Vamos adicioná-lo ao banco da Tereza.");}
});

/* TEREZA — ETAPA 4: Calculadora funcional
   A calculadora trabalha com a dose prescrita e com a concentração cadastrada.
   UI só é calculada quando o usuário informa a escala e a menor divisão da seringa.
*/
(function(){
  const DATA = [
    {marca:"TG", apresentacao:"Normal", mg:15, volume:0.5, fonte:"Material cadastrado da TEREZA"},
    {marca:"Lipoless", apresentacao:"Normal", mg:15, volume:0.5, fonte:"Material cadastrado da TEREZA"},
    {marca:"Lipoless", apresentacao:"MD", mg:15, volume:0.6, fonte:"Material cadastrado da TEREZA"},
    {marca:"Tirzec", apresentacao:"Normal", mg:15, volume:0.5, fonte:"Embalagem fornecida; conferir rótulo da unidade"},
    {marca:"Tirzedral", apresentacao:"MD", mg:15, volume:0.6, fonte:"Material cadastrado da TEREZA"},
    {marca:"Lipoland", apresentacao:"Normal", mg:15, volume:0.5, fonte:"Material cadastrado da TEREZA"},
    {marca:"Gluconex", apresentacao:"Normal", mg:15, volume:1.0, fonte:"Material cadastrado da TEREZA"}
  ];
  const $ = s => document.querySelector(s);
  const m = $("#marca"), a = $("#apresentacao");
  if(!m || !a) return;

  // rebuild brand options
  m.innerHTML = '<option value="">Selecione</option>' +
    [...new Set(DATA.map(x=>x.marca))].map(x=>`<option>${x}</option>`).join("");

  function refresh(){
    const items=DATA.filter(x=>x.marca===m.value);
    a.disabled=!items.length;
    a.innerHTML=items.length ? items.map((x,i)=>`<option value="${i}">${x.apresentacao} — ${x.mg} mg/${x.volume.toString().replace(".",",")} mL</option>`).join("") : '<option>Selecione a marca primeiro</option>';
    renderReference();
  }
  function selected(){
    const items=DATA.filter(x=>x.marca===m.value);
    return items[Number(a.value)] || null;
  }
  function renderReference(){
    const out=$("#resultado"); const x=selected();
    if(!out)return;
    if(!x){out.textContent="Selecione a marca e a apresentação.";return;}
    out.innerHTML=`<b>${x.marca} — ${x.apresentacao}</b><br>Concentração cadastrada: <b>${x.mg} mg/${String(x.volume).replace(".",",")} mL</b><br><span class="small">Fonte: ${x.fonte}.</span>`;
  }
  m.addEventListener("change",refresh); a.addEventListener("change",renderReference); refresh();

  // Add syringe controls if the page doesn't have them.
  const tool = document.querySelector("#consultar")?.parentElement;
  if(tool && !$("#seringa")){
    const box=document.createElement("div");
    box.className="syringe-fields";
    box.innerHTML=`<label>Seringa
      <select id="seringa"><option value="">Selecione</option><option value="30">30 UI</option><option value="50">50 UI</option><option value="100">100 UI</option></select>
    </label>
    <label>Menor divisão da seringa
      <select id="divisao"><option value="">Selecione</option><option value="1">1 UI</option><option value="2">2 UI</option><option value="5">5 UI</option></select>
    </label>`;
    const dose=$("#dose"); dose?.parentElement?.after(box);
  }

  const btn=$("#consultar");
  if(btn){
    btn.addEventListener("click",function(e){
      e.preventDefault();
      const x=selected(), dose=parseFloat($("#dose")?.value), syringe=parseFloat($("#seringa")?.value), div=parseFloat($("#divisao")?.value);
      const out=$("#resultado");
      if(!x){out.textContent="Selecione a apresentação.";return;}
      if(!Number.isFinite(dose)||dose<=0){out.textContent="Informe a dose prescrita em mg.";return;}
      const ml=dose/(x.mg/x.volume);
      let msg=`<b>Referência matemática</b><br>${dose.toLocaleString("pt-BR")} mg → <b>${ml.toLocaleString("pt-BR",{maximumFractionDigits:4})} mL</b><br><span class="small">Apresentação: ${x.marca} ${x.apresentacao} (${x.mg} mg/${String(x.volume).replace(".",",")} mL).</span>`;
      if(Number.isFinite(syringe)&&Number.isFinite(div)){
        // For a U-100 style syringe, 100 UI corresponds to 1 mL.
        // Do not assume this for an unidentified device.
        const ui=ml*100;
        const nearest=Math.round(ui/div)*div;
        msg += `<hr><b>Escala informada: ${syringe} UI; menor divisão: ${div} UI.</b><br>`;
        msg += `<span class="small">A referência volumétrica corresponde a ${ui.toLocaleString("pt-BR",{maximumFractionDigits:2})} UI somente sob a convenção U-100 (100 UI = 1 mL). Se a seringa não for U-100, não use essa conversão.</span>`;
        if(Math.abs(nearest-ui)>0.0001) msg += `<br><span class="small">A marcação mais próxima seria ${nearest.toLocaleString("pt-BR")} UI, mas a Teresa não arredonda uma dose prescrita automaticamente.</span>`;
      } else {
        msg += `<hr><span class="small">Para interpretar UI, selecione a seringa e a menor divisão. A Teresa não presume a graduação pelos risquinhos.</span>`;
      }
      msg += `<div class="warning">⚠️ Confira o rótulo, a concentração e a graduação da seringa. A Teresa não prescreve, não altera dose e não substitui a orientação do profissional de saúde.</div>`;
      out.innerHTML=msg;
    });
  }
})();

/* ETAPA 5 — guia visual de seringas + comparador */
(function(){
 const configs={30:{title:"Seringa de 30 UI",text:"Capacidade total de 30 UI. A graduação deve ser conferida no modelo físico.",div:"A menor divisão varia por modelo."},
 50:{title:"Seringa de 50 UI",text:"Capacidade total de 50 UI. Não deduza a menor divisão apenas pelo número 50.",div:"A menor divisão varia por modelo."},
 100:{title:"Seringa de 100 UI",text:"Capacidade total de 100 UI. Existem modelos com diferentes graduações.",div:"A menor divisão varia por modelo."}};
 const tabs=document.querySelectorAll(".syringe-tab"), info=document.querySelector("#syringeInfo"), label=document.querySelector("#scaleLabel"), ticks=document.querySelector("#ticks");
 function draw(n){
   const c=configs[n]; if(!c)return;
   tabs.forEach(t=>t.classList.toggle("active",t.dataset.syringe===String(n)));
   label.textContent=n+" UI";
   ticks.innerHTML=Array.from({length: n===30?16:n===50?21:21},()=>"<i></i>").join("");
   info.innerHTML=`<h3>${c.title}</h3><p>${c.text}</p><div class="tip"><b>Como ler:</b> observe os números impressos e conte as divisões entre eles. ${c.div}</div><div class="warning">⚠️ Não presuma que cada risquinho vale 1 UI. A graduação precisa ser conferida na própria seringa.</div>`;
 }
 tabs.forEach(t=>t.addEventListener("click",()=>draw(t.dataset.syringe)));
 draw(30);

 const DATA=[
 ["TG","Normal","15 mg/0,5 mL","0,5 mL"],
 ["Lipoless","Normal","15 mg/0,5 mL","0,5 mL"],
 ["Lipoless","MD","15 mg/0,6 mL","0,6 mL"],
 ["Tirzec","Normal","15 mg/0,5 mL","0,5 mL"],
 ["Tirzedral","MD","15 mg/0,6 mL","0,6 mL"],
 ["Lipoland","Normal","15 mg/0,5 mL","0,5 mL"],
 ["Gluconex","Normal","15 mg/1 mL","1 mL"]
 ];
 const ca=document.querySelector("#compA"),cb=document.querySelector("#compB"),table=document.querySelector("#compareTable");
 if(ca&&cb&&table){
   const opts=DATA.map((x,i)=>`<option value="${i}">${x[0]} — ${x[1]} — ${x[2]}</option>`).join("");
   ca.innerHTML=opts;cb.innerHTML=opts;cb.value="1";
   function render(){
     const a=DATA[+ca.value],b=DATA[+cb.value];
     table.innerHTML=`<table class="compare-table"><thead><tr><th>Informação</th><th>${a[0]} — ${a[1]}</th><th>${b[0]} — ${b[1]}</th></tr></thead><tbody>
     <tr><th>Concentração</th><td>${a[2]}</td><td>${b[2]}</td></tr>
     <tr><th>Volume</th><td>${a[3]}</td><td>${b[3]}</td></tr>
     <tr><th>Observação</th><td>Consultar material/rotulagem.</td><td>Consultar material/rotulagem.</td></tr></tbody></table>`;
   }
   ca.addEventListener("change",render);cb.addEventListener("change",render);render();
 }
})();

/* ETAPA 10 — Central de perguntas e dúvidas */
(function(){
 const faqs=[
 {cat:"Seringas",q:"Cada risquinho da seringa vale 1 UI?",a:"Não necessariamente. A graduação depende do modelo. Uma seringa de 100 UI pode ter divisões diferentes de outra seringa de 100 UI. Confira a escala impressa no próprio dispositivo.",tag:"Escala da seringa"},
 {cat:"Seringas",q:"Como diferenciar seringas de 30, 50 e 100 UI?",a:"Esses números indicam a capacidade nominal da escala da seringa. Eles não informam, sozinhos, a concentração do medicamento nem garantem que cada pequeno intervalo tenha o mesmo valor em todos os modelos.",tag:"Escala da seringa"},
 {cat:"Seringas",q:"Minha seringa de 100 UI conta de 2 em 2. Está errado?",a:"Não dá para concluir que está errado apenas pela aparência. Algumas seringas possuem graduação em intervalos diferentes. A leitura deve ser feita conforme as marcações do modelo específico.",tag:"Escala da seringa"},
 {cat:"Apresentações",q:"Lipoless normal e Lipoless MD são a mesma apresentação?",a:"Não trate como a mesma apresentação. A TEREZA mantém fichas separadas para versões diferentes e pede conferência do rótulo antes de consultar qualquer informação.",tag:"Identificação do produto"},
 {cat:"Apresentações",q:"Por que o frasco pode parecer ter pouco líquido?",a:"A aparência do volume não deve ser usada para estimar a quantidade de medicamento. A informação relevante é a concentração e o volume declarados no rótulo da apresentação.",tag:"Identificação do produto"},
 {cat:"Medicamento",q:"Posso escolher a dose pela TEREZA?",a:"Não. A TEREZA não escolhe, prescreve ou altera dose. Quando houver uma dose já prescrita, a ferramenta pode organizar informações matemáticas de uma apresentação cadastrada, desde que os dados estejam confirmados.",tag:"Limite da ferramenta"},
 {cat:"Medicamento",q:"Posso usar uma tabela da internet como regra para qualquer frasco?",a:"Não. Concentração, volume e graduação precisam corresponder à apresentação e ao dispositivo reais. Materiais de fontes diferentes podem não ser equivalentes.",tag:"Fontes"},
 {cat:"Alimentação",q:"Preciso seguir uma dieta específica durante o tratamento?",a:"A alimentação deve ser individualizada. A TEREZA pode reunir informações educativas, mas não substitui avaliação de nutricionista ou médico para definir necessidades pessoais.",tag:"Educação"},
 {cat:"Peso",q:"O que é um platô de peso?",a:"É um período de estabilidade relativa do peso. Ele não deve ser interpretado isoladamente; medidas, rotina, alimentação, atividade física e tempo de acompanhamento também podem ser considerados.",tag:"Educação"},
 {cat:"Sintomas",q:"Náusea, vômito e diarreia podem acontecer?",a:"Podem ocorrer durante o uso de tirzepatida. A intensidade, duração e contexto são importantes. Sintomas intensos, persistentes ou preocupantes devem ser avaliados por um profissional de saúde.",tag:"Segurança"},
 {cat:"Segurança",q:"O que fazer se o rótulo não bater com o cadastro da TEREZA?",a:"Não use a ficha para fazer uma conversão. Pare a consulta e confirme a apresentação pelo rótulo e com o profissional ou fornecedor responsável.",tag:"Conferência"},
 {cat:"Segurança",q:"A TEREZA substitui médico ou farmacêutico?",a:"Não. Ela é uma central informativa. Dúvidas sobre indicação, dose, mudança de tratamento, interação, sintomas importantes ou aplicação devem ser direcionadas ao profissional que acompanha o tratamento.",tag:"Limite da ferramenta"}
 ];
 const list=document.querySelector("#faqList"), search=document.querySelector("#faqSearch"), cats=document.querySelectorAll(".faq-cat"), count=document.querySelector("#faqCount");
 let active="Todas";
 function render(){
   const term=(search?.value||"").toLowerCase().trim();
   const items=faqs.filter(x=>(active==="Todas"||x.cat===active)&&(!term||(x.q+" "+x.a+" "+x.tag).toLowerCase().includes(term)));
   if(count) count.textContent=`${items.length} ${items.length===1?"dúvida":"dúvidas"}`;
   list.innerHTML=items.length?items.map((x)=>`<article class="faq-item"><button class="faq-question" aria-expanded="false">${x.q}<span>＋</span></button><div class="faq-answer" hidden><p>${x.a}</p><span class="faq-tag">${x.tag}</span></div></article>`).join(""):`<div class="notice"><b>Não encontramos essa pergunta.</b><br>Tente outra palavra ou escreva sua dúvida no campo abaixo. Se o assunto envolver dose, diagnóstico ou reação importante, procure o profissional de saúde que acompanha o tratamento.</div>`;
   list.querySelectorAll(".faq-question").forEach(b=>b.addEventListener("click",()=>{const ans=b.nextElementSibling;const open=ans.hidden;ans.hidden=!open;b.setAttribute("aria-expanded",String(open));b.querySelector("span").textContent=open?"−":"＋";}));
 }
 cats.forEach(b=>b.addEventListener("click",()=>{active=b.dataset.cat;cats.forEach(x=>x.classList.toggle("active",x===b));render();}));
 search?.addEventListener("input",render); render();
 document.querySelector("#askBtn")?.addEventListener("click",()=>{
   const raw=(document.querySelector("#askInput")?.value||"").trim(); const text=raw.toLowerCase(); const out=document.querySelector("#askResult");
   if(!raw){out.innerHTML='<div class="notice">Digite uma pergunta primeiro.</div>';return;}
   let cat="Segurança";
   if(/seringa|risquinho|risco|ui|unidade|marcação|marcacao|divisão|divisao/.test(text))cat="Seringas";
   else if(/lipoless|lipoland|gluconex|tirzec|tirzedral|lipoland|frasco|0,5|0,6|1 ml|apresenta/.test(text))cat="Apresentações";
   else if(/dose|concentra|medicamento|tirzep|aplicar|injeção|injecao/.test(text))cat="Medicamento";
   else if(/comer|comida|dieta|proteína|proteina|aliment/.test(text))cat="Alimentação";
   else if(/peso|platô|plato|emagrec|medida/.test(text))cat="Peso";
   else if(/náuse|nause|vomit|diarre|constip|dor|sintoma/.test(text))cat="Sintomas";
   out.innerHTML=`<div class="notice"><b>Assunto mais próximo: ${cat}</b><br>Abra a categoria correspondente acima. Essa classificação é apenas organizacional; não é diagnóstico e não determina conduta.</div>`;
 });
})();

/* ETAPA 7 — Catálogo visual */
(function(){
 const products=[
  {marca:"TG",tipo:"Normal",conc:"15 mg/0,5 mL",vol:"0,5 mL",status:"Confirmado",source:"Material de referência enviado",note:"Conferir sempre o rótulo da unidade."},
  {marca:"Lipoless",tipo:"Normal",conc:"15 mg/0,5 mL",vol:"0,5 mL",status:"Confirmado",source:"Material de referência enviado",note:"Apresentação separada da versão MD."},
  {marca:"Lipoless",tipo:"MD",conc:"15 mg/0,6 mL",vol:"0,6 mL por dose",status:"Confirmado",source:"Material de referência enviado",note:"Multidose; não misturar com a apresentação normal."},
  {marca:"Tirzec",tipo:"Normal",conc:"15 mg/0,5 mL",vol:"0,5 mL",status:"Confirmado",source:"Imagem da embalagem enviada",note:"A TEREZA prioriza a apresentação identificada no rótulo."},
  {marca:"Tirzedral",tipo:"MD",conc:"15 mg/0,6 mL",vol:"0,6 mL por dose",status:"Confirmado",source:"Material de referência enviado",note:"Multidose; conferir rotulagem."},
  {marca:"Lipoland",tipo:"Normal",conc:"15 mg/0,5 mL",vol:"0,5 mL",status:"Confirmado",source:"Material de referência enviado",note:"Conferir rótulo antes de qualquer cálculo."},
  {marca:"Gluconex",tipo:"Normal",conc:"15 mg/1 mL",vol:"1 mL",status:"Confirmado",source:"Material de referência enviado",note:"Não usar a mesma conversão das apresentações 15 mg/0,5 mL."}
 ];
 const grid=document.querySelector("#catalogGrid"), search=document.querySelector("#catalogSearch"), type=document.querySelector("#catalogType");
 if(!grid)return;
 function render(){
  const term=(search?.value||"").toLowerCase().trim(), t=type?.value||"Todas";
  const arr=products.filter(p=>(t==="Todas"||p.tipo===t)&&(!term||(p.marca+" "+p.tipo+" "+p.conc).toLowerCase().includes(term)));
  grid.innerHTML=arr.map(p=>`<article class="product-card ${p.status==="Confirmado"?"confirmed":"pending"}">
    <div class="product-photo">💊</div><div class="product-body">
    <span class="badge">${p.tipo}</span><h3>${p.marca}</h3>
    <div class="product-data"><div class="data-chip"><b>Concentração</b><br>${p.conc}</div><div class="data-chip"><b>Volume</b><br>${p.vol}</div></div>
    <p class="source-note"><b>Status:</b> ${p.status}<br><b>Fonte:</b> ${p.source}<br>${p.note}</p>
    </div></article>`).join("") || '<div class="notice">Nenhuma apresentação encontrada.</div>';
 }
 search?.addEventListener("input",render); type?.addEventListener("change",render); render();
})();

/* ETAPA 8 — Fichas individuais + limites informativos */
(function(){
 const data=[
  {marca:"TG",tipo:"Normal",conc:"15 mg/0,5 mL",vol:"0,5 mL",id:"TG-15",status:"Confirmado",source:"Material de referência enviado",
   identify:"Confira nome, concentração e volume diretamente no rótulo da unidade.",
   notes:["Não confundir concentração com capacidade da seringa.","Para qualquer conversão, a apresentação exata deve ser selecionada."]},
  {marca:"Lipoless",tipo:"Normal",conc:"15 mg/0,5 mL",vol:"0,5 mL",id:"LIP-N-15",status:"Confirmado",source:"Material de referência enviado",
   identify:"A apresentação normal é separada da apresentação MD.",
   notes:["Confira se a embalagem é Normal ou MD.","Não use uma conversão de MD para a apresentação normal."]},
  {marca:"Lipoless",tipo:"MD",conc:"15 mg/0,6 mL",vol:"0,6 mL por dose",id:"LIP-MD-15",status:"Confirmado",source:"Material de referência enviado",
   identify:"Procure a identificação de multidose e os dados de concentração/volume no rótulo.",
   notes:["MD significa multidose.","A apresentação MD não deve ser confundida com a normal."]},
  {marca:"Tirzec",tipo:"Normal",conc:"15 mg/0,5 mL",vol:"0,5 mL",id:"TIR-15",status:"Confirmado",source:"Imagem da embalagem enviada",
   identify:"A ficha usa a apresentação identificada na imagem fornecida; confira o rótulo do seu próprio frasco.",
   notes:["Se o rótulo do seu produto divergir, não use esta ficha para cálculo."]},
  {marca:"Tirzedral",tipo:"MD",conc:"15 mg/0,6 mL",vol:"0,6 mL por dose",id:"TIRZ-MD-15",status:"Confirmado",source:"Material de referência enviado",
   identify:"Confira no rótulo se a apresentação é MD e confirme concentração e volume.",
   notes:["Não extrapole dados para outra apresentação."]},
  {marca:"Lipoland",tipo:"Normal",conc:"15 mg/0,5 mL",vol:"0,5 mL",id:"LIPOLAND-15",status:"Confirmado",source:"Material de referência enviado",
   identify:"Confira nome, concentração e volume diretamente na embalagem.",
   notes:["A ficha não substitui conferência do rótulo."]},
  {marca:"Gluconex",tipo:"Normal",conc:"15 mg/1 mL",vol:"1 mL",id:"GLUCONEX-15",status:"Confirmado",source:"Material de referência enviado",
   identify:"A concentração cadastrada é diferente das apresentações 15 mg/0,5 mL.",
   notes:["Não aplique automaticamente uma conversão usada para 15 mg/0,5 mL."]}
 ];
 const sel=document.querySelector("#productDetailSelect"), card=document.querySelector("#productDetail");
 if(!sel||!card)return;
 sel.innerHTML=data.map((p,i)=>`<option value="${i}">${p.marca} — ${p.tipo} — ${p.conc}</option>`).join("");
 function render(){
  const p=data[+sel.value];
  card.innerHTML=`<div class="detail-head"><div><span class="detail-badge">${p.tipo}</span><h3>${p.marca}</h3><p>${p.identify}</p></div><div class="detail-photo">💊</div></div>
   <div class="detail-grid"><div class="detail-box"><b>Concentração</b>${p.conc}</div><div class="detail-box"><b>Volume</b>${p.vol}</div><div class="detail-box"><b>Status</b>${p.status}</div></div>
   <h4>Como conferir</h4><ul class="detail-list"><li>Compare o nome do produto com o rótulo.</li><li>Confira concentração e volume exatamente como impressos.</li><li>Confira se a apresentação é Normal ou MD quando aplicável.</li><li>Se houver divergência, interrompa a consulta e confirme a informação com profissional de saúde ou fornecedor responsável.</li></ul>
   <h4>Cuidados específicos</h4><ul class="detail-list">${p.notes.map(n=>`<li>${n}</li>`).join("")}</ul>
   <p class="source-note"><b>Fonte:</b> ${p.source}.</p>
   <div class="medical-disclaimer"><b>⚠️ Conteúdo informativo — não é orientação médica.</b><br>A TEREZA não prescreve, não define dose, não recomenda aumento ou redução de dose e não substitui médico, farmacêutico ou outro profissional habilitado. A calculadora deve ser usada apenas para fins matemáticos/educacionais com dados já definidos por profissional de saúde.</div>`;
 }
 sel.addEventListener("change",render);render();
})();


/* ETAPA 11 — TEREZA como assistente informativa */
(function(){
 const messages=document.querySelector('#assistantMessages');
 const input=document.querySelector('#assistantInput');
 const send=document.querySelector('#assistantSend');
 const chips=document.querySelectorAll('.intent-chip');
 if(!messages||!input||!send)return;
 const routes={
  seringa:{label:'💉 Entender minha seringa',text:'Vamos para o guia visual das seringas. Lá você consegue comparar 30, 50 e 100 UI e, principalmente, verificar que a divisão entre os risquinhos pode variar conforme o modelo.',href:'#seringas',cta:'Abrir guia das seringas'},
  produto:{label:'📦 Identificar meu produto',text:'Posso ajudar a organizar a identificação. Compare nome, apresentação, concentração e volume exatamente como aparecem no rótulo. Se houver divergência, não use uma ficha diferente como substituta.',href:'#fichas',cta:'Abrir fichas dos produtos'},
  duvida:{label:'❓ Tirar uma dúvida',text:'Escreva sua pergunta com suas próprias palavras. Eu posso classificar o assunto e apontar o conteúdo correspondente. Se envolver prescrição, diagnóstico ou mudança de tratamento, vou sinalizar o limite da TEREZA.',href:'#duvidas',cta:'Abrir central de dúvidas'},
  fontes:{label:'📚 Ver fontes',text:'Na área de fontes você encontra os critérios usados pela TEREZA e a origem declarada dos materiais. Quando houver conflito entre informações, a TEREZA não escolhe uma versão por conta própria.',href:'#fontes',cta:'Ver fontes e critérios'},
  locais:{label:'📍 Ver locais de aplicação',text:'Você pode consultar o material visual com os locais apresentados pela TEREZA. Ele é educativo e não substitui a orientação recebida do profissional de saúde.',href:'#locaisAplicacao',cta:'Ver locais de aplicação'},
  sintoma:{label:'⚠️ Estou com um sintoma',text:'A TEREZA pode explicar informações gerais sobre sintomas, mas não consegue diagnosticar nem decidir uma conduta. Se o sintoma for intenso, persistente, preocupante ou uma emergência, procure avaliação profissional.',href:'#duvidas',cta:'Ver dúvidas e segurança'}
 };
 function add(text,type='user'){
   const el=document.createElement('div');el.className='message '+type;
   el.innerHTML=type==='user'?`<p>${escapeHtml(text)}</p>`:`<b>TEREZA</b><p>${text}</p>`;
   messages.appendChild(el);messages.scrollTop=messages.scrollHeight;
 }
 function escapeHtml(v){return v.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
 function replyFor(text){
   const q=text.toLowerCase();
   if(/seringa|risquinho|marcação|marcacao|divisão|divisao|30 ui|50 ui|100 ui/.test(q))return routes.seringa;
   if(/lipoless|lipoland|gluconex|tirzec|tirzedral|frasco|rótulo|rotulo|apresentação|apresentacao/.test(q))return routes.produto;
   if(/fonte|bula|origem|referência|referencia|confiá|confia/.test(q))return routes.fontes;
   if(/onde aplicar|local de aplicação|local de aplicacao|abdômen|abdomen|coxa|braço|braco|flanco/.test(q))return routes.locais;
   if(/dor|náuse|nause|vômit|vomit|diarre|constip|sintoma|reação|reacao/.test(q))return routes.sintoma;
   return routes.duvida;
 }
 function respond(text){
   const r=replyFor(text);
   setTimeout(()=>{
     add(`${r.text}<br><a class="chat-cta" href="${r.href}">${r.cta} →</a>`,'bot');
   },120);
 }
 function sendText(){const v=input.value.trim();if(!v)return;add(v,'user');input.value='';respond(v);}
 send.addEventListener('click',sendText);input.addEventListener('keydown',e=>{if(e.key==='Enter')sendText();});
 chips.forEach(c=>c.addEventListener('click',()=>{const r=routes[c.dataset.intent];if(!r)return;add(r.label,'user');setTimeout(()=>add(`${r.text}<br><a class="chat-cta" href="${r.href}">${r.cta} →</a>`,'bot'),120);}));
})();

/* ETAPA 12 — Guardião de segurança da TEREZA */
window.TEREZA_SECURITY = {
  statuses: ["confirmado","material_referencia","divergente","nao_confirmado"],
  canCalculate: function(record){
    return !!record && ["confirmado","material_referencia"].includes(record.status);
  },
  label: function(status){
    return ({confirmado:"🟢 Confirmado",material_referencia:"🔵 Material de referência",divergente:"🟡 Divergente",nao_confirmado:"🔴 Não confirmado"})[status] || "🔴 Não confirmado";
  },
  disclaimer: "Conteúdo educativo. A TEREZA não diagnostica, prescreve ou recomenda alteração de tratamento."
};

/* ETAPA 13 — Navegação mobile */
(function(){
 const back=document.querySelector("#backTop");
 window.addEventListener("scroll",()=>back?.classList.toggle("show",window.scrollY>500),{passive:true});
 back?.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
 // close/open native details-like navigation behavior on hash navigation
 document.querySelectorAll(".mobile-bottom-nav a").forEach(a=>a.addEventListener("click",()=>{
   document.querySelectorAll(".mobile-bottom-nav a").forEach(x=>x.classList.remove("active"));
   a.classList.add("active");
 }));
})();

/* ETAPA 14 — Smoke tests estruturais */
(function(){
 const required=["#catalogGrid","#productDetail","#faqList","#backTop","#seguranca"];
 const missing=required.filter(s=>!document.querySelector(s));
 window.TEREZA_QA={passed:missing.length===0,missing:missing};
})();
