let listaAdmins = [];

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('ano').textContent = new Date().getFullYear();

  // Só admin-pro pode entrar
  if (!exigirLogin(['admin-pro'])) return;

  const usuario = pegarUsuario();
  if (usuario) {
    document.getElementById('nome-usuario').textContent = usuario.nome || usuario.email;
  }

  // Menu
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

  // Máscaras
  mascaraTelefone(document.getElementById('admin-telefone'));

  // Submit do form de criar admin
  document.getElementById('form-admin').addEventListener('submit', criarAdmin);

  // Carrega tudo
  await carregarDashboard();
  await carregarAdmins();
  await carregarProfissionais();
  await carregarClientes();
});

async function carregarDashboard() {
  try {
    const r = await chamarAPI(CONFIG.ENDPOINTS.adminProDashboard);
    const d = r.dados;
    document.getElementById('stat-admins').textContent = d.admins;
    document.getElementById('stat-prof').textContent = d.profissionais;
    document.getElementById('stat-prof-pend').textContent = d.profissionaisPendentes;
    document.getElementById('stat-clientes').textContent = d.clientes;
  } catch (e) { console.error(e); }
}

async function carregarAdmins() {
  try {
    const r = await chamarAPI(CONFIG.ENDPOINTS.adminProAdmins);
    listaAdmins = r.dados || [];
    renderizarAdmins();
  } catch (e) {
    document.getElementById('lista-admins').innerHTML =
      `<tr><td colspan="5" class="empty-state">Erro: ${e.message}</td></tr>`;
  }
}

function renderizarAdmins() {
  const tbody = document.getElementById('lista-admins');
  if (listaAdmins.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><div class="ico">🔐</div>Nenhum admin criado ainda.</td></tr>`;
    return;
  }
  tbody.innerHTML = listaAdmins.map((a) => `
    <tr>
      <td>
        <div class="usuario-cell">
          <div class="avatar">${iniciais(a.nome)}</div>
          <div>
            <div class="nome">${a.nome || '—'}</div>
            <div class="email">${a.email || '—'}</div>
          </div>
        </div>
      </td>
      <td>${a.nivel === 'pro' ? '<span class="badge badge-pro">PRO</span>' : 'Comum'}</td>
      <td>${a.ativo ? '<span class="badge badge-ativo">Ativo</span>' : '<span class="badge badge-inativo">Inativo</span>'}</td>
      <td>${formatarData(a.createdAt)}</td>
      <td>
        <div class="acoes">
          ${a.nivel !== 'pro' ? `
            <button class="btn btn-sm btn-outline" onclick="toggleAtivoAdmin('${a._id}')">${a.ativo ? 'Desativar' : 'Ativar'}</button>
            <button class="btn btn-sm btn-danger" onclick="deletarAdmin('${a._id}')">Excluir</button>
          ` : '—'}
        </div>
      </td>
    </tr>
  `).join('');
}

async function carregarProfissionais() {
  try {
    const r = await chamarAPI(CONFIG.ENDPOINTS.adminProfissionais);
    const lista = r.dados || [];
    const tbody = document.getElementById('lista-profissionais');
    if (lista.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Nenhum profissional.</td></tr>`;
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
        <td><span class="badge badge-${p.status}">${p.status}</span></td>
        <td>${formatarData(p.createdAt)}</td>
      </tr>
    `).join('');
  } catch (e) { console.error(e); }
}

async function carregarClientes() {
  try {
    const r = await chamarAPI(CONFIG.ENDPOINTS.adminClientes);
    const lista = r.dados || [];
    const tbody = document.getElementById('lista-clientes');
    if (lista.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Nenhum cliente.</td></tr>`;
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
        <td>${c.tipo === 'empresa' ? '🏢 Empresa' : '👤 Pessoa'}</td>
        <td><span class="badge badge-${c.status}">${c.status}</span></td>
        <td>${formatarData(c.createdAt)}</td>
      </tr>
    `).join('');
  } catch (e) { console.error(e); }
}

function abrirModalCriarAdmin() {
  document.getElementById('modal-admin').classList.add('is-open');
  document.getElementById('form-admin').reset();
  limparErros(document.getElementById('form-admin'));
  esconderAlerta(document.getElementById('modal-alerta'));
}

function fecharModalAdmin() {
  document.getElementById('modal-admin').classList.remove('is-open');
}

async function criarAdmin(e) {
  e.preventDefault();
  const alerta = document.getElementById('modal-alerta');
  esconderAlerta(alerta);
  limparErros(document.getElementById('form-admin'));

  const nome = document.getElementById('admin-nome').value.trim();
  const email = document.getElementById('admin-email').value.trim();
  const senha = document.getElementById('admin-senha').value;
  const telefone = document.getElementById('admin-telefone').value.trim();

  const erros = [];
  if (!nome || nome.length < 3) erros.push({ campo: 'nome', msg: 'Informe um nome válido' });
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) erros.push({ campo: 'email', msg: 'E-mail inválido' });
  if (!senha || senha.length < 8) erros.push({ campo: 'senha', msg: 'Mínimo 8 caracteres' });

  if (erros.length > 0) { mostrarErros(erros); return; }

  const btn = document.getElementById('btn-criar-admin');
  btn.classList.add('loading');
  btn.disabled = true;

  try {
    await chamarAPI(CONFIG.ENDPOINTS.adminProAdmins, 'POST', { nome, email, senha, telefone });
    fecharModalAdmin();
    await carregarAdmins();
    await carregarDashboard();
    mostrarAlerta(document.getElementById('alerta'), 'sucesso', '✅ Administrador criado com sucesso!');
  } catch (error) {
    mostrarAlerta(alerta, 'erro', error.message || 'Erro ao criar admin');
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

async function toggleAtivoAdmin(id) {
  try {
    await chamarAPI(`${CONFIG.ENDPOINTS.adminProAdmins}/${id}/toggle-ativo`, 'PATCH');
    await carregarAdmins();
    mostrarAlerta(document.getElementById('alerta'), 'sucesso', 'Status atualizado!');
  } catch (e) {
    mostrarAlerta(document.getElementById('alerta'), 'erro', e.message);
  }
}

async function deletarAdmin(id) {
  if (!confirm('Tem certeza que deseja excluir este administrador?')) return;
  try {
    await chamarAPI(`${CONFIG.ENDPOINTS.adminProAdmins}/${id}`, 'DELETE');
    await carregarAdmins();
    await carregarDashboard();
    mostrarAlerta(document.getElementById('alerta'), 'sucesso', 'Administrador removido!');
  } catch (e) {
    mostrarAlerta(document.getElementById('alerta'), 'erro', e.message);
  }
}
