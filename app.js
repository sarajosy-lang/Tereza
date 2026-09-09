const MARCAS = ["TG", "Lipoless", "Tirzec", "Tirzedral", "Lipoland", "Gluconex"];

/* =========================================================
   TEREZA — APP.JS CONSOLIDADO
   Etapa 20.10 — versão corrigida para substituição/teste

   Princípios:
   - Um único banco canônico de apresentações.
   - Nenhuma inferência de dados não confirmados.
   - Comparador sem referências a campos inexistentes.
   - Inicialização após o DOM completo (index.html corrigido).
   - Navegação mobile e botão voltar ao topo inicializados.
   - Calculadora mantém caráter matemático/educativo.
   ========================================================= */

const DB = {
  TG: [
    {
      id: "tg-15-normal",
      marca: "TG",
      tipo: "Normal",
      label: "Normal — 15 mg/0,5 mL",
      mg: 15,
      volume: 0.5,
      concentracaoMg: 30,
      concentracao: "15 mg/0,5 mL",
      volumeTotal: "2,0 mL",
      fonte: "Foto da embalagem/material enviado",
      status: "confirmado"
    }
  ],
  Lipoless: [
    {
      id: "lipoless-15-normal",
      marca: "Lipoless",
      tipo: "Normal",
      label: "Normal — 15 mg/0,5 mL",
      mg: 15,
      volume: 0.5,
      concentracaoMg: 30,
      concentracao: "15 mg/0,5 mL",
      volumeTotal: "2,0 mL",
      fonte: "Foto da embalagem/material enviado",
      status: "confirmado"
    },
    {
      id: "lipoless-15-md",
      marca: "Lipoless",
      tipo: "MD",
      label: "MD — 15 mg/0,6 mL",
      mg: 15,
      volume: 0.6,
      concentracaoMg: 25,
      concentracao: "15 mg/0,6 mL",
      volumeTotal: "2,4 mL",
      fonte: "Foto da embalagem/material enviado",
      status: "confirmado"
    }
  ],
  Tirzec: [
    {
      id: "tirzec-15-05",
      marca: "Tirzec",
      tipo: "Normal",
      label: "Normal — 15 mg/0,5 mL",
      mg: 15,
      volume: 0.5,
      concentracaoMg: 30,
      concentracao: "15 mg/0,5 mL",
      volumeTotal: "2,0 mL",
      fonte: "Foto da embalagem/material enviado",
      status: "confirmado"
    }
  ],
  Tirzedral: [
    {
      id: "tirzedral-15-md",
      marca: "Tirzedral",
      tipo: "MD",
      label: "MD — 15 mg/0,6 mL",
      mg: 15,
      volume: 0.6,
      concentracaoMg: 25,
      concentracao: "15 mg/0,6 mL",
      volumeTotal: "2,4 mL",
      fonte: "Foto da embalagem/material enviado",
      status: "confirmado"
    }
  ],
  Lipoland: [
    {
      id: "lipoland-15-05",
      marca: "Lipoland",
      tipo: "Normal",
      label: "Normal — 15 mg/0,5 mL",
      mg: 15,
      volume: 0.5,
      concentracaoMg: 30,
      concentracao: "15 mg/0,5 mL",
      volumeTotal: "A confirmar",
      fonte: "Material enviado",
      status: "confirmado-parcial"
    }
  ],
  Gluconex: [
    {
      id: "gluconex-15-10",
      marca: "Gluconex",
      tipo: "Normal",
      label: "Normal — 15 mg/1,0 mL",
      mg: 15,
      volume: 1.0,
      concentracaoMg: 15,
      concentracao: "15 mg/1,0 mL",
      volumeTotal: "A confirmar",
      fonte: "Foto/material enviado",
      status: "confirmado-parcial"
    }
  ]
};

const SERINGAS = [
  { id: "30", label: "Seringa 30 UI", capacidade: "30 UI" },
  { id: "50", label: "Seringa 50 UI", capacidade: "50 UI" },
  { id: "100", label: "Seringa 100 UI", capacidade: "100 UI" }
];

const TEREZA_DATA = MARCAS.flatMap(m => DB[m] || []);

const $ = selector => document.querySelector(selector);

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[char]));
}

function formatNumber(value, maximumFractionDigits = 4) {
  return Number(value).toLocaleString("pt-BR", {
    maximumFractionDigits
  });
}

/* =========================================================
   SEGURANÇA
   ========================================================= */

window.TEREZA_SECURITY = {
  statuses: [
    "confirmado",
    "material_referencia",
    "confirmado-parcial",
    "divergente",
    "nao_confirmado"
  ],

  canCalculate(record) {
    return !!record &&
      ["confirmado", "material_referencia"].includes(record.status);
  },

  label(status) {
    return ({
      confirmado: "🟢 Confirmado",
      material_referencia: "🔵 Material de referência",
      "confirmado-parcial": "🟡 Confirmado parcialmente",
      divergente: "🟠 Divergente",
      nao_confirmado: "🔴 Não confirmado"
    })[status] || "🔴 Não confirmado";
  },

  disclaimer:
    "Conteúdo educativo. A TEREZA não diagnostica, prescreve ou recomenda alteração de tratamento."
};

/* =========================================================
   CALCULADORA / IDENTIFICAÇÃO
   ========================================================= */

function initCalculator() {
  const marca = $("#marca");
  const apres = $("#apresentacao");
  const resultado = $("#resultado");
  const consultar = $("#consultar");

  if (!marca || !apres) return;

  marca.innerHTML =
    '<option value="">Selecione</option>' +
    MARCAS.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join("");

  function preencherApresentacoes() {
    const items = DB[marca.value] || [];

    apres.disabled = items.length === 0;
    apres.innerHTML = items.length
      ? '<option value="">Selecione</option>' +
        items.map(x =>
          `<option value="${escapeHtml(x.id)}">${escapeHtml(x.label)}</option>`
        ).join("")
      : "<option value=\"\">Selecione a marca primeiro</option>";

    if (resultado) {
      resultado.textContent = items.length
        ? "Agora selecione a apresentação."
        : "Selecione a marca primeiro.";
    }
  }

  function selecionada() {
    return (DB[marca.value] || []).find(x => x.id === apres.value) || null;
  }

  function renderReferencia() {
    if (!resultado) return;

    const item = selecionada();

    if (!item) {
      resultado.textContent = "Selecione a marca e a apresentação.";
      return;
    }

    resultado.innerHTML =
      `<b>${escapeHtml(item.marca)} — ${escapeHtml(item.tipo)}</b><br>` +
      `Concentração cadastrada: <b>${escapeHtml(item.concentracao)}</b><br>` +
      `<span class="small">Fonte: ${escapeHtml(item.fonte)}.</span>`;
  }

  marca.addEventListener("change", preencherApresentacoes);
  apres.addEventListener("change", renderReferencia);

  const tool = consultar?.parentElement;

  if (tool && !$("#seringa")) {
    const box = document.createElement("div");
    box.className = "syringe-fields";
    box.innerHTML = `
      <label>Seringa
        <select id="seringa">
          <option value="">Selecione</option>
          ${SERINGAS.map(s =>
            `<option value="${s.id}">${s.label}</option>`
          ).join("")}
        </select>
      </label>
      <label>Menor divisão da seringa
        <select id="divisao">
          <option value="">Selecione</option>
          <option value="1">1 UI</option>
          <option value="2">2 UI</option>
          <option value="5">5 UI</option>
        </select>
      </label>
    `;

    const dose = $("#dose");
    if (dose?.parentElement) {
      dose.parentElement.after(box);
    } else {
      tool.appendChild(box);
    }
  }

  consultar?.addEventListener("click", event => {
    event.preventDefault();

    const item = selecionada();
    const dose = parseFloat($("#dose")?.value);
    const syringe = parseFloat($("#seringa")?.value);
    const division = parseFloat($("#divisao")?.value);

    if (!resultado) return;

    if (!item) {
      resultado.textContent = "Selecione a apresentação.";
      return;
    }

    if (!Number.isFinite(dose) || dose <= 0) {
      resultado.textContent = "Informe a dose prescrita em mg.";
      return;
    }

    /*
      Apresentações com status confirmado-parcial não entram
      em cálculo automático até que o cadastro seja integralmente
      confirmado.
    */
    if (!TEREZA_SECURITY.canCalculate(item)) {
      resultado.innerHTML =
        `<div class="notice"><b>Apresentação ainda não liberada para cálculo.</b><br>` +
        `O cadastro de ${escapeHtml(item.marca)} — ${escapeHtml(item.tipo)} ` +
        `está marcado como "${escapeHtml(item.status)}". ` +
        `Confirme os dados da apresentação antes de qualquer cálculo.</div>`;
      return;
    }

    const ml = dose / (item.mg / item.volume);

    let message =
      `<b>Referência matemática</b><br>` +
      `${formatNumber(dose)} mg → <b>${formatNumber(ml)} mL</b><br>` +
      `<span class="small">Apresentação: ${escapeHtml(item.marca)} ` +
      `${escapeHtml(item.tipo)} (${escapeHtml(item.concentracao)}).</span>`;

    if (Number.isFinite(syringe) && Number.isFinite(division)) {
      /*
        Não assumir que toda seringa é U-100.
        A referência abaixo é explicitamente condicional.
      */
      const ui = ml * 100;
      const nearest = Math.round(ui / division) * division;

      message +=
        `<hr><b>Escala informada: ${formatNumber(syringe, 0)} UI; ` +
        `menor divisão: ${formatNumber(division, 0)} UI.</b><br>` +
        `<span class="small">A referência volumétrica corresponde a ` +
        `${formatNumber(ui, 2)} UI somente sob a convenção U-100 ` +
        `(100 UI = 1 mL). Se a seringa não for U-100, não use essa conversão.</span>`;

      if (Math.abs(nearest - ui) > 0.0001) {
        message +=
          `<br><span class="small">A marcação mais próxima seria ` +
          `${formatNumber(nearest, 0)} UI, mas a TEREZA não arredonda ` +
          `uma dose prescrita automaticamente.</span>`;
      }
    } else {
      message +=
        `<hr><span class="small">Para interpretar UI, selecione a seringa ` +
        `e a menor divisão. A TEREZA não presume a graduação pelos risquinhos.</span>`;
    }

    message +=
      `<div class="warning">⚠️ Confira o rótulo, a concentração e a graduação ` +
      `da seringa. A TEREZA não prescreve, não altera dose e não substitui ` +
      `a orientação do profissional de saúde.</div>`;

    resultado.innerHTML = message;
  });

  preencherApresentacoes();
}

/* =========================================================
   COMPARADOR
   ========================================================= */

function initComparator() {
  const ca = $("#compA");
  const cb = $("#compB");
  const table = $("#compareTable");

  if (!ca || !cb || !table) return;

  const options =
    '<option value="">Selecione</option>' +
    TEREZA_DATA.map(item =>
      `<option value="${escapeHtml(item.marca)}|${escapeHtml(item.id)}">` +
      `${escapeHtml(item.marca)} — ${escapeHtml(item.label)}</option>`
    ).join("");

  ca.innerHTML = options;
  cb.innerHTML = options;

  function getItem(value) {
    const [marca, id] = String(value || "").split("|");
    return (DB[marca] || []).find(item => item.id === id) || null;
  }

  function render() {
    const a = getItem(ca.value);
    const b = getItem(cb.value);

    if (!a || !b) {
      table.innerHTML = "";
      return;
    }

    const rows = [
      ["Concentração", a.concentracao, b.concentracao],
      ["Volume da apresentação", a.volumeTotal, b.volumeTotal],
      ["Fonte", a.fonte, b.fonte],
      ["Status", TEREZA_SECURITY.label(a.status), TEREZA_SECURITY.label(b.status)]
    ];

    table.innerHTML = `
      <table class="compare-table">
        <thead>
          <tr>
            <th>Informação</th>
            <th>${escapeHtml(a.marca)} — ${escapeHtml(a.tipo)}</th>
            <th>${escapeHtml(b.marca)} — ${escapeHtml(b.tipo)}</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <th>${escapeHtml(row[0])}</th>
              <td>${escapeHtml(row[1])}</td>
              <td>${escapeHtml(row[2])}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  ca.addEventListener("change", render);
  cb.addEventListener("change", render);
}

/* =========================================================
   CATÁLOGO VISUAL
   ========================================================= */

function initCatalog() {
  const grid = $("#catalogGrid");
  const search = $("#catalogSearch");
  const type = $("#catalogType");

  if (!grid) return;

  function render() {
    const term = (search?.value || "").toLowerCase().trim();
    const selectedType = type?.value || "Todas";

    const items = TEREZA_DATA.filter(item => {
      const matchesType =
        selectedType === "Todas" || item.tipo === selectedType;

      const text =
        `${item.marca} ${item.tipo} ${item.concentracao}`.toLowerCase();

      return matchesType && (!term || text.includes(term));
    });

    grid.innerHTML = items.length
      ? items.map(item => `
        <article class="product-card ${item.status === "confirmado" ? "confirmed" : "pending"}">
          <div class="product-photo">💊</div>
          <div class="product-body">
            <span class="badge">${escapeHtml(item.tipo)}</span>
            <h3>${escapeHtml(item.marca)}</h3>

            <div class="product-data">
              <div class="data-chip">
                <b>Concentração</b><br>
                ${escapeHtml(item.concentracao)}
              </div>
              <div class="data-chip">
                <b>Volume</b><br>
                ${escapeHtml(item.volumeTotal)}
              </div>
            </div>

            <p class="source-note">
              <b>Status:</b> ${escapeHtml(TEREZA_SECURITY.label(item.status))}<br>
              <b>Fonte:</b> ${escapeHtml(item.fonte)}<br>
              Confira sempre o rótulo da unidade.
            </p>
          </div>
        </article>
      `).join("")
      : '<div class="notice">Nenhuma apresentação encontrada.</div>';
  }

  search?.addEventListener("input", render);
  type?.addEventListener("change", render);
  render();
}

/* =========================================================
   FICHAS INDIVIDUAIS
   ========================================================= */

function initProductDetails() {
  const select = $("#productDetailSelect");
  const card = $("#productDetail");

  if (!select || !card) return;

  select.innerHTML = TEREZA_DATA.map((item, index) =>
    `<option value="${index}">${escapeHtml(item.marca)} — ` +
    `${escapeHtml(item.tipo)} — ${escapeHtml(item.concentracao)}</option>`
  ).join("");

  function render() {
    const item = TEREZA_DATA[Number(select.value)];

    if (!item) {
      card.innerHTML = "";
      return;
    }

    const notes = [
      "Compare o nome do produto com o rótulo.",
      "Confira concentração e volume exatamente como impressos.",
      "Confira se a apresentação é Normal ou MD quando aplicável.",
      ...(item.tipo === "MD"
        ? ["MD significa multidose; não confunda com a apresentação normal."]
        : []),
      ...(item.status !== "confirmado"
        ? ["Esta ficha possui dados pendentes de confirmação; não use para cálculo."]
        : []),
      "Se houver divergência, interrompa a consulta e confirme a informação com profissional de saúde ou fornecedor responsável."
    ];

    card.innerHTML = `
      <div class="detail-head">
        <div>
          <span class="detail-badge">${escapeHtml(item.tipo)}</span>
          <h3>${escapeHtml(item.marca)}</h3>
          <p>Confira nome, concentração e volume diretamente no rótulo da unidade.</p>
        </div>
        <div class="detail-photo">💊</div>
      </div>

      <div class="detail-grid">
        <div class="detail-box">
          <b>Concentração</b>
          ${escapeHtml(item.concentracao)}
        </div>
        <div class="detail-box">
          <b>Volume</b>
          ${escapeHtml(item.volumeTotal)}
        </div>
        <div class="detail-box">
          <b>Status</b>
          ${escapeHtml(TEREZA_SECURITY.label(item.status))}
        </div>
      </div>

      <h4>Como conferir</h4>
      <ul class="detail-list">
        ${notes.map(note => `<li>${escapeHtml(note)}</li>`).join("")}
      </ul>

      <p class="source-note">
        <b>Fonte:</b> ${escapeHtml(item.fonte)}.
      </p>

      <div class="medical-disclaimer">
        <b>⚠️ Conteúdo informativo — não é orientação médica.</b><br>
        A TEREZA não prescreve, não define dose, não recomenda aumento ou
        redução de dose e não substitui médico, farmacêutico ou outro
        profissional habilitado.
      </div>
    `;
  }

  select.addEventListener("change", render);
  render();
}

/* =========================================================
   GUIA VISUAL DE SERINGAS
   ========================================================= */

function initSyringeGuide() {
  const tabs = document.querySelectorAll(".syringe-tab");
  const info = $("#syringeInfo");
  const label = $("#scaleLabel");
  const ticks = $("#ticks");

  if (!tabs.length || !info || !label || !ticks) return;

  const configs = {
    30: {
      title: "Seringa de 30 UI",
      text: "Capacidade total de 30 UI. A graduação deve ser conferida no modelo físico.",
      div: "A menor divisão varia por modelo.",
      count: 16
    },
    50: {
      title: "Seringa de 50 UI",
      text: "Capacidade total de 50 UI. Não deduza a menor divisão apenas pelo número 50.",
      div: "A menor divisão varia por modelo.",
      count: 21
    },
    100: {
      title: "Seringa de 100 UI",
      text: "Capacidade total de 100 UI. Existem modelos com diferentes graduações.",
      div: "A menor divisão varia por modelo.",
      count: 21
    }
  };

  function draw(number) {
    const config = configs[number];
    if (!config) return;

    tabs.forEach(tab => {
      tab.classList.toggle("active", tab.dataset.syringe === String(number));
    });

    label.textContent = `${number} UI`;
    ticks.innerHTML =
      Array.from({ length: config.count }, () => "<i></i>").join("");

    info.innerHTML = `
      <h3>${escapeHtml(config.title)}</h3>
      <p>${escapeHtml(config.text)}</p>
      <div class="tip">
        <b>Como ler:</b> observe os números impressos e conte as divisões
        entre eles. ${escapeHtml(config.div)}
      </div>
      <div class="warning">
        ⚠️ Não presuma que cada risquinho vale 1 UI. A graduação precisa
        ser conferida na própria seringa.
      </div>
    `;
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => draw(tab.dataset.syringe));
  });

  draw(30);
}

/* =========================================================
   CENTRAL DE PERGUNTAS
   ========================================================= */

function initFaq() {
  const list = $("#faqList");
  const search = $("#faqSearch");
  const count = $("#faqCount");
  const categories = document.querySelectorAll(".faq-cat");
  const askButton = $("#askBtn");
  const askInput = $("#askInput");
  const askResult = $("#askResult");

  if (!list) return;

  const faqs = [
    {
      cat: "Seringas",
      q: "Cada risquinho da seringa vale 1 UI?",
      a: "Não necessariamente. A graduação depende do modelo. Uma seringa de 100 UI pode ter divisões diferentes de outra seringa de 100 UI. Confira a escala impressa no próprio dispositivo.",
      tag: "Escala da seringa"
    },
    {
      cat: "Seringas",
      q: "Como diferenciar seringas de 30, 50 e 100 UI?",
      a: "Esses números indicam a capacidade nominal da escala da seringa. Eles não informam, sozinhos, a concentração do medicamento nem garantem que cada pequeno intervalo tenha o mesmo valor em todos os modelos.",
      tag: "Escala da seringa"
    },
    {
      cat: "Seringas",
      q: "Minha seringa de 100 UI conta de 2 em 2. Está errado?",
      a: "Não dá para concluir que está errado apenas pela aparência. Algumas seringas possuem graduação em intervalos diferentes. A leitura deve ser feita conforme as marcações do modelo específico.",
      tag: "Escala da seringa"
    },
    {
      cat: "Apresentações",
      q: "Lipoless normal e Lipoless MD são a mesma apresentação?",
      a: "Não trate como a mesma apresentação. A TEREZA mantém fichas separadas para versões diferentes e pede conferência do rótulo antes de consultar qualquer informação.",
      tag: "Identificação do produto"
    },
    {
      cat: "Apresentações",
      q: "Por que o frasco pode parecer ter pouco líquido?",
      a: "A aparência do volume não deve ser usada para estimar a quantidade de medicamento. A informação relevante é a concentração e o volume declarados no rótulo da apresentação.",
      tag: "Identificação do produto"
    },
    {
      cat: "Medicamento",
      q: "Posso escolher a dose pela TEREZA?",
      a: "Não. A TEREZA não escolhe, prescreve ou altera dose. Quando houver uma dose já prescrita, a ferramenta pode organizar informações matemáticas de uma apresentação cadastrada, desde que os dados estejam confirmados.",
      tag: "Limite da ferramenta"
    },
    {
      cat: "Medicamento",
      q: "Posso usar uma tabela da internet como regra para qualquer frasco?",
      a: "Não. Concentração, volume e graduação precisam corresponder à apresentação e ao dispositivo reais. Materiais de fontes diferentes podem não ser equivalentes.",
      tag: "Fontes"
    },
    {
      cat: "Alimentação",
      q: "Preciso seguir uma dieta específica durante o tratamento?",
      a: "A alimentação deve ser individualizada. A TEREZA pode reunir informações educativas, mas não substitui avaliação de nutricionista ou médico para definir necessidades pessoais.",
      tag: "Educação"
    },
    {
      cat: "Peso",
      q: "O que é um platô de peso?",
      a: "É um período de estabilidade relativa do peso. Ele não deve ser interpretado isoladamente; medidas, rotina, alimentação, atividade física e tempo de acompanhamento também podem ser considerados.",
      tag: "Educação"
    },
    {
      cat: "Sintomas",
      q: "Náusea, vômito e diarreia podem acontecer?",
      a: "Podem ocorrer durante o uso de tirzepatida. A intensidade, duração e contexto são importantes. Sintomas intensos, persistentes ou preocupantes devem ser avaliados por um profissional de saúde.",
      tag: "Segurança"
    },
    {
      cat: "Segurança",
      q: "O que fazer se o rótulo não bater com o cadastro da TEREZA?",
      a: "Não use a ficha para fazer uma conversão. Pare a consulta e confirme a apresentação pelo rótulo e com o profissional ou fornecedor responsável.",
      tag: "Conferência"
    },
    {
      cat: "Segurança",
      q: "A TEREZA substitui médico ou farmacêutico?",
      a: "Não. Ela é uma central informativa. Dúvidas sobre indicação, dose, mudança de tratamento, interação, sintomas importantes ou aplicação devem ser direcionadas ao profissional que acompanha o tratamento.",
      tag: "Limite da ferramenta"
    }
  ];

  let activeCategory = "Todas";

  function render() {
    const term = (search?.value || "").toLowerCase().trim();

    const items = faqs.filter(item =>
      (activeCategory === "Todas" || item.cat === activeCategory) &&
      (!term ||
        `${item.q} ${item.a} ${item.tag}`.toLowerCase().includes(term))
    );

    if (count) {
      count.textContent =
        `${items.length} ${items.length === 1 ? "dúvida" : "dúvidas"}`;
    }

    list.innerHTML = items.length
      ? items.map(item => `
        <article class="faq-item">
          <button class="faq-question" aria-expanded="false">
            ${escapeHtml(item.q)}
            <span>＋</span>
          </button>
          <div class="faq-answer" hidden>
            <p>${escapeHtml(item.a)}</p>
            <span class="faq-tag">${escapeHtml(item.tag)}</span>
          </div>
        </article>
      `).join("")
      : `
        <div class="notice">
          <b>Não encontramos essa pergunta.</b><br>
          Tente outra palavra ou escreva sua dúvida no campo abaixo.
        </div>
      `;

    list.querySelectorAll(".faq-question").forEach(button => {
      button.addEventListener("click", () => {
        const answer = button.nextElementSibling;
        const isOpening = answer.hidden;

        answer.hidden = !isOpening;
        button.setAttribute("aria-expanded", String(isOpening));
        const icon = button.querySelector("span");
        if (icon) icon.textContent = isOpening ? "−" : "＋";
      });
    });
  }

  categories.forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.cat || "Todas";
      categories.forEach(item =>
        item.classList.toggle("active", item === button)
      );
      render();
    });
  });

  search?.addEventListener("input", render);

  askButton?.addEventListener("click", () => {
    const raw = (askInput?.value || "").trim();
    const text = raw.toLowerCase();

    if (!askResult) return;

    if (!raw) {
      askResult.innerHTML =
        '<div class="notice">Digite uma pergunta primeiro.</div>';
      return;
    }

    let category = "Segurança";

    if (/seringa|risquinho|risco|ui|unidade|marcação|marcacao|divisão|divisao/.test(text)) {
      category = "Seringas";
    } else if (/lipoless|lipoland|gluconex|tirzec|tirzedral|frasco|0,5|0,6|1 ml|apresenta/.test(text)) {
      category = "Apresentações";
    } else if (/dose|concentra|medicamento|tirzep|aplicar|injeção|injecao/.test(text)) {
      category = "Medicamento";
    } else if (/comer|comida|dieta|proteína|proteina|aliment/.test(text)) {
      category = "Alimentação";
    } else if (/peso|platô|plato|emagrec|medida/.test(text)) {
      category = "Peso";
    } else if (/náuse|nause|vomit|diarre|constip|dor|sintoma/.test(text)) {
      category = "Sintomas";
    }

    askResult.innerHTML = `
      <div class="notice">
        <b>Assunto mais próximo: ${escapeHtml(category)}</b><br>
        Abra a categoria correspondente acima. Essa classificação é apenas
        organizacional; não é diagnóstico e não determina conduta.
      </div>
    `;
  });

  render();
}

/* =========================================================
   ASSISTENTE TEREZA
   ========================================================= */

function initAssistant() {
  const messages = $("#assistantMessages");
  const input = $("#assistantInput");
  const send = $("#assistantSend");
  const chips = document.querySelectorAll(".intent-chip");

  if (!messages || !input || !send) return;

  const routes = {
    seringa: {
      label: "💉 Entender minha seringa",
      text: "Vamos para o guia visual das seringas. Lá você consegue comparar 30, 50 e 100 UI e, principalmente, verificar que a divisão entre os risquinhos pode variar conforme o modelo.",
      href: "#seringas",
      cta: "Abrir guia das seringas"
    },
    produto: {
      label: "📦 Identificar meu produto",
      text: "Posso ajudar a organizar a identificação. Compare nome, apresentação, concentração e volume exatamente como aparecem no rótulo. Se houver divergência, não use uma ficha diferente como substituta.",
      href: "#fichas",
      cta: "Abrir fichas dos produtos"
    },
    duvida: {
      label: "❓ Tirar uma dúvida",
      text: "Escreva sua pergunta com suas próprias palavras. Eu posso classificar o assunto e apontar o conteúdo correspondente. Se envolver prescrição, diagnóstico ou mudança de tratamento, vou sinalizar o limite da TEREZA.",
      href: "#duvidas",
      cta: "Abrir central de dúvidas"
    },
    fontes: {
      label: "📚 Ver fontes",
      text: "Na área de fontes você encontra os critérios usados pela TEREZA e a origem declarada dos materiais. Quando houver conflito entre informações, a TEREZA não escolhe uma versão por conta própria.",
      href: "#fontes",
      cta: "Ver fontes e critérios"
    },
    locais: {
      label: "📍 Ver locais de aplicação",
      text: "Você pode consultar o material visual com os locais apresentados pela TEREZA. Ele é educativo e não substitui a orientação recebida do profissional de saúde.",
      href: "#locaisAplicacao",
      cta: "Ver locais de aplicação"
    },
    sintoma: {
      label: "⚠️ Estou com um sintoma",
      text: "A TEREZA pode explicar informações gerais sobre sintomas, mas não consegue diagnosticar nem decidir uma conduta. Se o sintoma for intenso, persistente, preocupante ou uma emergência, procure avaliação profissional.",
      href: "#duvidas",
      cta: "Ver dúvidas e segurança"
    }
  };

  function addMessage(text, type = "user") {
    const element = document.createElement("div");
    element.className = `message ${type}`;

    element.innerHTML = type === "user"
      ? `<p>${escapeHtml(text)}</p>`
      : `<b>TEREZA</b><p>${text}</p>`;

    messages.appendChild(element);
    messages.scrollTop = messages.scrollHeight;
  }

  function routeFor(text) {
    const query = text.toLowerCase();

    if (/seringa|risquinho|marcação|marcacao|divisão|divisao|30 ui|50 ui|100 ui/.test(query)) {
      return routes.seringa;
    }

    if (/lipoless|lipoland|gluconex|tirzec|tirzedral|frasco|rótulo|rotulo|apresentação|apresentacao/.test(query)) {
      return routes.produto;
    }

    if (/fonte|bula|origem|referência|referencia|confiá|confia/.test(query)) {
      return routes.fontes;
    }

    if (/onde aplicar|local de aplicação|local de aplicacao|abdômen|abdomen|coxa|braço|braco|flanco/.test(query)) {
      return routes.locais;
    }

    if (/dor|náuse|nause|vômit|vomit|diarre|constip|sintoma|reação|reacao/.test(query)) {
      return routes.sintoma;
    }

    return routes.duvida;
  }

  function respond(text) {
    const route = routeFor(text);

    window.setTimeout(() => {
      addMessage(
        `${escapeHtml(route.text)}<br>` +
        `<a class="chat-cta" href="${route.href}">${escapeHtml(route.cta)} →</a>`,
        "bot"
      );
    }, 120);
  }

  function sendText() {
    const value = input.value.trim();
    if (!value) return;

    addMessage(value, "user");
    input.value = "";
    respond(value);
  }

  send.addEventListener("click", sendText);

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") sendText();
  });

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const route = routes[chip.dataset.intent];
      if (!route) return;

      addMessage(route.label, "user");

      window.setTimeout(() => {
        addMessage(
          `${escapeHtml(route.text)}<br>` +
          `<a class="chat-cta" href="${route.href}">${escapeHtml(route.cta)} →</a>`,
          "bot"
        );
      }, 120);
    });
  });
}

/* =========================================================
   BUSCA PRINCIPAL + PRODUTOS
   ========================================================= */

function initMainSearch() {
  const search = $("#search");
  const marca = $("#marca");

  if (!search || !marca) return;

  search.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;

    const query = search.value.toLowerCase().trim();
    if (!query) return;

    const target = MARCAS.find(
      item => item.toLowerCase().includes(query)
    );

    if (target) {
      marca.value = target;
      marca.dispatchEvent(new Event("change"));
      location.hash = "calculadora";
    } else {
      alert(
        "Ainda não encontrei esse termo no cadastro. " +
        "Vamos adicioná-lo ao banco da Tereza."
      );
    }
  });
}

function initProducts() {
  const products = $("#products");
  if (!products) return;

  products.innerHTML = MARCAS.map(marca => `
    <article class="product">
      <div class="product-icon">📦</div>
      <span class="tag">Em validação</span>
      <h3>${escapeHtml(marca)}</h3>
      <p class="small">
        Apresentações e imagens dos materiais enviados serão cadastradas
        e conferidas antes da publicação.
      </p>
      <a href="#calculadora" class="btn ghost">Consultar</a>
    </article>
  `).join("");
}

/* =========================================================
   MENU / NAVEGAÇÃO MOBILE
   ========================================================= */

function initNavigation() {
  const menuButton = $("#menuBtn");
  const nav = $("#nav");

  menuButton?.addEventListener("click", () => {
    nav?.classList.toggle("open");
  });

  document.querySelectorAll("#nav a").forEach(link => {
    link.addEventListener("click", () => {
      nav?.classList.remove("open");
    });
  });

  const backTop = $("#backTop");

  function updateBackTop() {
    backTop?.classList.toggle("show", window.scrollY > 500);
  }

  window.addEventListener("scroll", updateBackTop, { passive: true });

  backTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  document.querySelectorAll(".mobile-bottom-nav a").forEach(link => {
    link.addEventListener("click", () => {
      document
        .querySelectorAll(".mobile-bottom-nav a")
        .forEach(item => item.classList.remove("active"));

      link.classList.add("active");
    });
  });

  updateBackTop();
}

/* =========================================================
   QA ESTRUTURAL
   ========================================================= */

function runQA() {
  const required = [
    "#calculadora",
    "#marca",
    "#apresentacao",
    "#dose",
    "#resultado",
    "#compA",
    "#compB",
    "#compareTable",
    "#catalogGrid",
    "#productDetail",
    "#productDetailSelect",
    "#faqList",
    "#backTop",
    "#seguranca",
    "#fontes",
    "#locaisAplicacao"
  ];

  const missing = required.filter(selector => !$(selector));

  window.TEREZA_QA = {
    passed: missing.length === 0,
    missing,
    appVersion: "20.10-consolidado-corrigido",
    databaseRecords: TEREZA_DATA.length,
    initializedAt: new Date().toISOString()
  };

  if (!window.TEREZA_QA.passed) {
    console.warn(
      "TEREZA_QA: elementos ausentes no DOM:",
      window.TEREZA_QA.missing
    );
  }
}

/* =========================================================
   INICIALIZAÇÃO ÚNICA
   ========================================================= */

function initTerezaApp() {
  /*
    O index.html da Etapa 20.5 deve carregar este arquivo
    imediatamente antes de </body>. O guard abaixo também evita
    inicialização duplicada caso o script seja movido para outro ponto.
  */
  if (window.__TEREZA_APP_INITIALIZED) return;
  window.__TEREZA_APP_INITIALIZED = true;

  initCalculator();
  initComparator();
  initCatalog();
  initProductDetails();
  initSyringeGuide();
  initFaq();
  initAssistant();
  initMainSearch();
  initProducts();
  initNavigation();
  runQA();

  console.info("TEREZA: app.js 20.10 consolidado corrigido carregado.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTerezaApp, { once: true });
} else {
  initTerezaApp();
}
