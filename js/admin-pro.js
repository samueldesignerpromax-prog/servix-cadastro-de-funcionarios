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
