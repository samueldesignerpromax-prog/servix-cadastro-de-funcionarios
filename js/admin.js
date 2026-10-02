let usuariosProfissionais = [];
let usuariosClientes = [];

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('ano').textContent = new Date().getFullYear();

  // Verifica se está logado como admin (comum OU pro pode acessar)
  if (!exigirLogin(['admin', 'admin-pro', 'cliente', 'profissional'])) return;

  const usuario = pegarUsuario();
  if (usuario) {
    document.getElementById('nome-usuario').textContent = usuario.nome || usuario.email;
  }

  // Se for cliente ou profissional, esconde menu admin
  const tipo = pegarTipo();
  if (tipo !== 'admin' && tipo !== 'admin-pro') {
    document.querySelector('.painel-sidebar nav').innerHTML = `
      <a href="#" class="is-active">👤 Minha conta</a>
    `;
    document.getElementById('aba-dashboard').innerHTML = `
      <div class="painel-header">
        <div>
          <h1>Olá, ${usuario?.nome || 'usuário'} 👋</h1>
          <p>Sua conta está ativa. Em breve você terá acesso ao painel completo.</p>
        </div>
      </div>
    `;
    return;
  }

  // Menu de abas
  document.querySelectorAll('[data-aba]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const aba = link.dataset.aba;
      document.querySelectorAll('[data-aba]').forEach((l) => l.classList.remove('is-active'));
      link.classList.add('is-active');
      document.querySelectorAll('[id^="aba-"]').forEach((s) => s.classList.add('hidden'));
      document.getElementById(`aba-${aba}`).classList.remove('hidden');
    });
  });

  // Carrega dados
  await carregarDashboard();
  await carregarProfissionais();
  await carregarClientes();

  // Filtros
  document.getElementById('filtro-prof').addEventListener('input', filtrarProfissionais);
  document.getElementById('filtro-status-prof').addEventListener('change', filtrarProfissionais);
  document.getElementById('filtro-cliente').addEventListener('input', filtrarClientes);
  document.getElementById('filtro-status-cliente').addEventListener('change', filtrarClientes);
});

async function carregarDashboard() {
  try {
    const r = await chamarAPI(CONFIG.ENDPOINTS.adminDashboard);
    const d = r.dados;
    document.getElementById('stat-prof').textContent = d.profissionais;
    document.getElementById('stat-prof-pend').textContent = d.profissionaisPendentes;
    document.getElementById('stat-clientes').textContent = d.clientes;
    document.getElementById('stat-clientes-ativos').textContent = d.clientesAtivos;
  } catch (e) {
    console.error(e);
  }
}

async function carregarProfissionais() {
  try {
    const r = await chamarAPI(CONFIG.ENDPOINTS.adminProfissionais);
    usuariosProfissionais = r.dados;
    renderizarProfissionais(usuariosProfissionais);
  } catch (e) {
    document.getElementById('lista-profissionais').innerHTML =
      `<tr><td colspan="5" class="empty-state">Erro ao carregar: ${e.message}</td></tr>`;
  }
}

async function carregarClientes() {
  try {
    const r = await chamarAPI(CONFIG.ENDPOINTS.adminClientes);
    usuariosClientes = r.dados;
    renderizarClientes(usuariosClientes);
  } catch (e) {
    document.getElementById('lista-clientes').innerHTML =
      `<tr><td colspan="5" class="empty-state">Erro ao carregar: ${e.message}</td></tr>`;
  }
}

function renderizarProfissionais(lista) {
  const tbody = document.getElementById('lista-profissionais');
  if (!lista || lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><div class="ico">👷</div>Nenhum profissional cadastrado ainda.</td></tr>`;
    return;
  }
  tbody.innerHTML = lista.map((p) => `
    <tr>
      <td>
        <div class="usuario-cell">
          <div class="avatar">${iniciais(p.nome)}</div>
          <div>
            <div class="nome">${p.nome || '—'}</div>
            <div class="email">${p.email || '—'}</div>
          </div>
        </div>
      </td>
      <td>${p.cidade || '—'}/${p.estado || '—'}</td>
      <td>${(p.categorias || []).slice(0, 2).join(', ')}${(p.categorias || []).length > 2 ? '...' : ''}</td>
      <td><span class="badge badge-${p.status}">${p.status}</span></td>
      <td>
        <div class="acoes">
          <button class="btn btn-sm btn-outline" onclick="mudarStatusProf('${p._id}', 'ativo')">Ativar</button>
          <button class="btn btn-sm btn-danger" onclick="mudarStatusProf('${p._id}', 'suspenso')">Suspender</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderizarClientes(lista) {
  const tbody = document.getElementById('lista-clientes');
  if (!lista || lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><div class="ico">👥</div>Nenhum cliente cadastrado ainda.</td></tr>`;
    return;
  }
  tbody.innerHTML = lista.map((c) => `
    <tr>
      <td>
        <div class="usuario-cell">
          <div class="avatar">${iniciais(c.nome)}</div>
          <div>
            <div class="nome">${c.nome || '—'}</div>
            <div class="email">${c.email || '—'}</div>
          </div>
        </div>
      </td>
      <td>${c.cidade || '—'}/${c.estado || '—'}</td>
      <td>${c.tipo === 'empresa' ? '🏢 Empresa' : '👤 Pessoa Física'}</td>
      <td><span class="badge badge-${c.status}">${c.status}</span></td>
      <td>
        <div class="acoes">
          <button class="btn btn-sm btn-outline" onclick="mudarStatusCli('${c._id}', 'ativo')">Ativar</button>
          <button class="btn btn-sm btn-danger" onclick="mudarStatusCli('${c._id}', 'bloqueado')">Bloquear</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filtrarProfissionais() {
  const termo = document.getElementById('filtro-prof').value.toLowerCase();
  const status = document.getElementById('filtro-status-prof').value;
  const filtrados = usuariosProfissionais.filter((p) => {
    const bateBusca = !termo || (p.nome || '').toLowerCase().includes(termo) || (p.email || '').toLowerCase().includes(termo);
    const bateStatus = !status || p.status === status;
    return bateBusca && bateStatus;
  });
  renderizarProfissionais(filtrados);
}

function filtrarClientes() {
  const termo = document.getElementById('filtro-cliente').value.toLowerCase();
  const status = document.getElementById('filtro-status-cliente').value;
  const filtrados = usuariosClientes.filter((c) => {
    const bateBusca = !termo || (c.nome || '').toLowerCase().includes(termo) || (c.email || '').toLowerCase().includes(termo);
    const bateStatus = !status || c.status === status;
    return bateBusca && bateStatus;
  });
  renderizarClientes(filtrados);
}

async function mudarStatusProf(id, status) {
  try {
    await chamarAPI(`${CONFIG.ENDPOINTS.adminProfissionais}/${id}/status`, 'PATCH', { status });
    await carregarProfissionais();
    await carregarDashboard();
    mostrarAlerta(document.getElementById('alerta'), 'sucesso', 'Status atualizado!');
  } catch (e) {
    mostrarAlerta(document.getElementById('alerta'), 'erro', e.message);
  }
}

async function mudarStatusCli(id, status) {
  try {
    await chamarAPI(`${CONFIG.ENDPOINTS.adminClientes}/${id}/status`, 'PATCH', { status });
    await carregarClientes();
    await carregarDashboard();
    mostrarAlerta(document.getElementById('alerta'), 'sucesso', 'Status atualizado!');
  } catch (e) {
    mostrarAlerta(document.getElementById('alerta'), 'erro', e.message);
  }
}
