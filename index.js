const tbody = document.querySelector("tbody");
const descSelect = document.querySelector("#descSelect");
const amount = document.querySelector("#amount");
const type = document.querySelector("#type");
const btnNew = document.querySelector("#btnNew");
const incomes = document.querySelector(".incomes");
const expenses = document.querySelector(".expenses");
const total = document.querySelector(".total");

let items = [];

// Função para adicionar novo item
btnNew.onclick = () => {
  if (descSelect.value === "Selecione um Item" || amount.value === "" || type.value === "") {
    return alert("Preencha todos os 'Campos'!");
  }

  if (isNaN(amount.value) || Number(amount.value) <= 0) {
    return alert("Insira um valor válido!");
  }

  const selectedOption = descSelect.options[descSelect.selectedIndex];
  const iconClass = selectedOption.dataset.icon || "";

  items.push({
    desc: descSelect.value,
    icon: iconClass,
    amount: Math.abs(amount.value).toFixed(2),
    type: type.value,
    date: document.querySelector("#date").value || new Date().toISOString().split('T')[0],
  });

  setItensBD();
  loadItens();

  descSelect.value = "Selecione um Item";
  amount.value = "";
  type.value = "";
  document.querySelector("#date").value = "";

  alert("Item adicionado com sucesso!");
};

// Função para deletar item
function deleteItem(index) {
  if (confirm("Tem certeza que deseja excluir este item?")) {
    items.splice(index, 1);
    setItensBD();
    loadItens();
  }
}

// Função para inserir item na tabela
function insertItem(item, index) {
  let tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${item.icon ? `<i class="${item.icon}"></i>` : ""} ${item.desc}</td>
    <td>R$ ${item.amount}</td>
    <td>${item.date}</td>
    <td class="columnType">${
      item.type === "Entrada"
        ? '<i class="bx bxs-chevron-up-circle"></i>'
        : '<i class="bx bxs-chevron-down-circle"></i>'
    }</td>
    <td class="columnAction">
      <button onclick="deleteItem(${index})"><i class='bx bx-trash'></i></button>
    </td>
  `;
  tbody.appendChild(tr);
}

// Função para carregar itens
function loadItens() {
  items = getItensBD();
  tbody.innerHTML = "";
  items.forEach((item, index) => {
    insertItem(item, index);
  });
  getTotals();
}

// Função para calcular totais
function getTotals() {
  const amountIncomes = items
    .filter((item) => item.type === "Entrada")
    .reduce((acc, cur) => acc + Number(cur.amount), 0)
    .toFixed(2);

  const amountExpenses = items
    .filter((item) => item.type === "Saída")
    .reduce((acc, cur) => acc + Number(cur.amount), 0)
    .toFixed(2);

  const totalItems = (amountIncomes - amountExpenses).toFixed(2);

  incomes.innerHTML = amountIncomes;
  expenses.innerHTML = amountExpenses;
  total.innerHTML = totalItems;
}

// Funções para manipular localStorage
const getItensBD = () => JSON.parse(localStorage.getItem("db_items")) ?? [];
const setItensBD = () => localStorage.setItem("db_items", JSON.stringify(items));

// Carregar itens ao iniciar
loadItens();

// Exportar para CSV
document.querySelector("#exportCSV").onclick = () => {
  const csvContent = "data:text/csv;charset=utf-8," 
    + items.map(item => Object.values(item).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "transacoes.csv");
  document.body.appendChild(link);
  link.click();
};

// Importar de CSV
document.querySelector("#importCSV").onchange = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split("\n");
    items = lines.map(line => {
      const [desc, icon, amount, type, date] = line.split(",");
      return { desc, icon, amount, type, date };
    });
    setItensBD();
    loadItens();
  };
  reader.readAsText(file);
};

function renderChart() {
  const ctx = document.getElementById('myChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: items.map(item => item.desc),
      datasets: [{
        label: 'Valor',
        data: items.map(item => item.amount),
        backgroundColor: items.map(item => item.type === "Entrada" ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)'),
        borderColor: items.map(item => item.type === "Entrada" ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'),
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Ajustar o padding-top do main conforme a altura da navbar
window.addEventListener('load', () => {
  const navbarHeight = document.querySelector('.navbar').offsetHeight;
  document.querySelector('main').style.paddingTop = `${navbarHeight}px`;
});

// Chamar renderChart() após carregar os itens
loadItens();
renderChart();