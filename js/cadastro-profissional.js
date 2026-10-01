/**
 * Cadastro de Profissional — SERVIX
 * Lógica do formulário de cadastro
 */

// ===== CATEGORIAS DISPONÍVEIS =====
const CATEGORIAS = [
  { valor: 'limpeza', label: 'Limpeza' },
  { valor: 'manutencao', label: 'Manutenção' },
  { valor: 'jardinagem', label: 'Jardinagem' },
  { valor: 'reparos', label: 'Pequenos reparos' },
  { valor: 'eletrica', label: 'Elétrica' },
  { valor: 'hidraulica', label: 'Hidráulica' },
  { valor: 'pintura', label: 'Pintura' },
  { valor: 'montagem-moveis', label: 'Montagem de móveis' },
  { valor: 'cuidados-idosos', label: 'Cuidados com idosos' },
  { valor: 'baba', label: 'Babá' },
  { valor: 'pet-sitter', label: 'Pet sitter' },
  { valor: 'automotivo', label: 'Automotivo' },
  { valor: 'logistica', label: 'Logística' },
  { valor: 'tecnologia', label: 'Tecnologia' },
  { valor: 'design', label: 'Design' },
  { valor: 'marketing', label: 'Marketing' },
  { valor: 'ia-automacao', label: 'IA e Automação' },
  { valor: 'administrativo', label: 'Administrativo' },
  { valor: 'outros', label: 'Outros' },
];

// ===== ELEMENTOS =====
const form = document.getElementById('form-cadastro');
const alerta = document.getElementById('alerta');
const btnEnviar = document.getElementById('btn-enviar');
const categoriasGrid = document.getElementById('categorias-grid');
const descricaoInput = document.getElementById('descricao');
const descricaoCount = document.getElementById('descricao-count');

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  // Ano no footer
  document.getElementById('ano').textContent = new Date().getFullYear();

  // Renderiza as categorias
  renderizarCategorias();

  // Máscaras
  aplicarMascaraTelefone();
  aplicarMascaraCPF();
  aplicarMascaraCEP();

  // Contador de caracteres da descrição
  if (descricaoInput) {
    descricaoInput.addEventListener('input', () => {
      descricaoCount.textContent = descricaoInput.value.length;
    });
  }

  // Submit
  form.addEventListener('submit', enviarFormulario);

  // Se já estiver logado, redireciona
  if (typeof estaLogado === 'function' && estaLogado()) {
    // Opcional: redirecionar pra algum painel
  }
});

// ===== RENDERIZAR CATEGORIAS =====
function renderizarCategorias() {
  categoriasGrid.innerHTML = CATEGORIAS.map((cat) => `
    <label class="categoria-item">
      <input type="checkbox" name="categorias" value="${cat.valor}" />
      <span class="check-icon"></span>
      <span class="cat-label">${cat.label}</span>
    </label>
  `).join('');
}

// ===== MÁSCARAS =====
function aplicarMascaraTelefone() {
  const tel = document.getElementById('telefone');
  if (!tel) return;

  tel.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (v.length > 6) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else if (v.length > 0) {
      v = v.replace(/^(\d{0,2}).*/, '($1');
    }
    e.target.value = v;
  });
}

function aplicarMascaraCPF() {
  const cpf = document.getElementById('cpf');
  if (!cpf) return;

  cpf.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = v;
  });
}

function aplicarMascaraCEP() {
  const cep = document.getElementById('cep');
  if (!cep) return;

  cep.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) {
      v = v.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
    }
    e.target.value = v;
  });
}

// ===== VALIDAÇÃO =====
function validarFormulario() {
  limparErros();

  const erros = [];

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const senhaConfirm = document.getElementById('senhaConfirm').value;
  const telefone = document.getElementById('telefone').value.trim();
  const cidade = document.getElementById('cidade').value.trim();
  const estado = document.getElementById('estado').value;
  const categorias = [...document.querySelectorAll('input[name="categorias"]:checked')].map((c) => c.value);
  const termos = document.getElementById('termos').checked;

  // Nome
  if (!nome) {
    erros.push({ campo: 'nome', msg: 'Informe seu nome completo' });
  } else if (nome.length < 3) {
    erros.push({ campo: 'nome', msg: 'Nome muito curto' });
  }

  // Email
  if (!email) {
    erros.push({ campo: 'email', msg: 'Informe seu e-mail' });
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    erros.push({ campo: 'email', msg: 'E-mail inválido' });
  }

  // Senha
  if (!senha) {
    erros.push({ campo: 'senha', msg: 'Crie uma senha' });
  } else if (senha.length < 6) {
    erros.push({ campo: 'senha', msg: 'Mínimo 6 caracteres' });
  }

  // Confirmar senha
  if (senha !== senhaConfirm) {
    erros.push({ campo: 'senhaConfirm', msg: 'As senhas não coincidem' });
  }

  // Telefone
  if (!telefone) {
    erros.push({ campo: 'telefone', msg: 'Informe seu telefone' });
  } else if (telefone.replace(/\D/g, '').length < 10) {
    erros.push({ campo: 'telefone', msg: 'Telefone incompleto' });
  }

  // Cidade
  if (!cidade) {
    erros.push({ campo: 'cidade', msg: 'Informe sua cidade' });
  }

  // Estado
  if (!estado) {
    erros.push({ campo: 'estado', msg: 'Selecione um estado' });
  }

  // Categorias
  if (categorias.length === 0) {
    erros.push({ campo: 'categorias', msg: 'Selecione ao menos uma categoria' });
  }

  // Termos
  if (!termos) {
    erros.push({ campo: 'termos', msg: 'Você precisa aceitar os termos' });
  }

  return erros;
}

// ===== MOSTRAR ERROS =====
function limparErros() {
  document.querySelectorAll('.field').forEach((f) => {
    f.classList.remove('erro');
    const input = f.querySelector('input, select, textarea');
    if (input) input.classList.remove('erro');
    const msg = f.querySelector('.erro-msg');
    if (msg) msg.textContent = '';
  });

  document.querySelectorAll('.form-termos .erro-msg').forEach((m) => {
    m.textContent = '';
    m.style.display = 'none';
  });
}

function mostrarErros(erros) {
  erros.forEach(({ campo, msg }) => {
    if (campo === 'termos') {
      const msgEl = document.querySelector('.form-termos .erro-msg');
      if (msgEl) {
        msgEl.textContent = msg;
        msgEl.style.display = 'block';
        msgEl.style.color = 'var(--red-600)';
        msgEl.style.fontSize = '.8rem';
      }
      return;
    }

    const field = document.querySelector(`.field[data-field="${campo}"]`);
    if (!field) return;

    field.classList.add('erro');
    const input = field.querySelector('input, select, textarea');
    if (input) input.classList.add('erro');
    const msgEl = field.querySelector('.erro-msg');
    if (msgEl) msgEl.textContent = msg;
  });

  // Scroll pro primeiro erro
  const primeiroErro = document.querySelector('.field.erro, .form-termos .erro-msg:not(:empty)');
  if (primeiroErro) {
    primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ===== ALERTAS =====
function mostrarAlerta(tipo, mensagem) {
  alerta.className = `alerta alerta-${tipo}`;
  alerta.textContent = mensagem;
  alerta.style.display = 'flex';

  // Scroll pra cima
  alerta.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function esconderAlerta() {
  alerta.style.display = 'none';
}

// ===== ENVIAR FORMULÁRIO =====
async function enviarFormulario(e) {
  e.preventDefault();
  esconderAlerta();

  // Valida
  const erros = validarFormulario();
  if (erros.length > 0) {
    mostrarErros(erros);
    mostrarAlerta('erro', `Corrija ${erros.length} campo(s) antes de continuar.`);
    return;
  }

  // Junta os dados
  const dados = {
    nome: document.getElementById('nome').value.trim(),
    email: document.getElementById('email').value.trim().toLowerCase(),
    senha: document.getElementById('senha').value,
    telefone: document.getElementById('telefone').value.trim(),
    cidade: document.getElementById('cidade').value.trim(),
    estado: document.getElementById('estado').value,
    bairro: document.getElementById('bairro').value.trim(),
    cep: document.getElementById('cep').value.trim(),
    categorias: [...document.querySelectorAll('input[name="categorias"]:checked')].map((c) => c.value),
    descricao: document.getElementById('descricao').value.trim(),
    experienciaAnos: Number(document.getElementById('experienciaAnos').value) || 0,
    disponibilidade: document.getElementById('disponibilidade').value,
  };

  // Adiciona CPF se preenchido
  const cpf = document.getElementById('cpf').value.trim();
  if (cpf) dados.cpf = cpf;

  // Loading
  btnEnviar.classList.add('loading');
  btnEnviar.disabled = true;

  try {
    const resposta = await chamarAPI(CONFIG.ENDPOINTS.profissionalCadastro, 'POST', dados);

    // Salva sessão
    salvarSessao(resposta.dados.token, resposta.dados.profissional, 'profissional');

    // Sucesso!
    mostrarAlerta('sucesso', '🎉 Cadastro realizado com sucesso! Redirecionando...');

    // Redireciona depois de 2s
    setTimeout(() => {
      // Por enquanto volta pra home — depois pode ir pro painel do profissional
      window.location.href = 'index.html';
    }, 2000);

  } catch (error) {
    console.error(error);

    // Erros de validação da API (campo específico)
    if (error.dados && error.dados.erros && Array.isArray(error.dados.erros)) {
      const errosAPI = error.dados.erros.map((e) => ({
        campo: e.campo,
        msg: e.mensagem,
      }));
      mostrarErros(errosAPI);
      mostrarAlerta('erro', 'Corrija os campos destacados.');
    } else {
      // Erro genérico
      const msg = error.message || 'Erro ao cadastrar. Tente novamente.';
      mostrarAlerta('erro', msg);
    }
  } finally {
    btnEnviar.classList.remove('loading');
    btnEnviar.disabled = false;
  }
}
