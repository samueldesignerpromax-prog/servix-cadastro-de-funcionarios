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
    });
  });

  form.addEventListener('submit', enviarFormulario);
});

async function enviarFormulario(e) {
  e.preventDefault();
  esconderAlerta(alerta);
  limparErros();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  const erros = [];
  if (!email) erros.push({ campo: 'email', msg: 'Informe seu e-mail' });
  else if (!/^\S+@\S+\.\S+$/.test(email)) erros.push({ campo: 'email', msg: 'E-mail inválido' });
  if (!senha) erros.push({ campo: 'senha', msg: 'Informe sua senha' });

  if (erros.length > 0) {
    mostrarErros(erros);
    return;
  }

  btnEnviar.classList.add('loading');
  btnEnviar.disabled = true;

  try {
    const t = TEXTOS[tipoAtual];
    const endpoint = CONFIG.ENDPOINTS[t.endpoint];
    const resposta = await chamarAPI(endpoint, 'POST', { email, senha });

    // Pega usuário e token da resposta
    const dados = resposta.dados;
    const usuario = dados.cliente || dados.profissional || dados.admin;
    const token = dados.token;

    salvarSessao(token, usuario, tipoAtual);
    mostrarAlerta(alerta, 'sucesso', '✅ Login realizado! Redirecionando...');

    setTimeout(() => {
      window.location.href = t.destino;
    }, 800);
  } catch (error) {
    mostrarAlerta(alerta, 'erro', error.message || 'Erro ao fazer login');
  } finally {
    btnEnviar.classList.remove('loading');
    btnEnviar.disabled = false;
  }
}
