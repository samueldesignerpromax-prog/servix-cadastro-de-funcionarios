const form = document.getElementById('form-login');
const alerta = document.getElementById('alerta');
const btnEnviar = document.getElementById('btn-enviar');
const tabs = document.querySelectorAll('.login-tab');
const titulo = document.getElementById('login-titulo');
const subtitulo = document.getElementById('login-subtitulo');

const TEXTOS = {
  cliente: {
    titulo: 'Entrar como cliente',
    sub: 'Acesse sua conta para solicitar serviços.',
    endpoint: 'clienteLogin',
    destino: 'admin.html', // por enquanto, cliente cai no painel comum
  },
  profissional: {
    titulo: 'Entrar como profissional',
    sub: 'Acesse sua conta para gerenciar seus serviços.',
    endpoint: 'profissionalLogin',
    destino: 'admin.html',
  },
  admin: {
    titulo: 'Entrar como administrador',
    sub: 'Acesso restrito a administradores.',
    endpoint: 'adminLogin',
    destino: 'admin.html',
  },
  'admin-pro': {
    titulo: 'Entrar como Admin PRO',
    sub: 'Acesso restrito ao super administrador.',
    endpoint: 'adminProLogin',
    destino: 'admin-pro.html',
  },
};

let tipoAtual = 'cliente';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('ano').textContent = new Date().getFullYear();

  // Se já estiver logado, redireciona
  redirecionarSeLogado({
    cliente: 'admin.html',
    profissional: 'admin.html',
    admin: 'admin.html',
    'admin-pro': 'admin-pro.html',
  });

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      tipoAtual = tab.dataset.tipo;
      const t = TEXTOS[tipoAtual];
      titulo.textContent = t.titulo;
      subtitulo.textContent = t.sub;
      esconderAlerta(alerta);
      form.reset();
      limparErros();
