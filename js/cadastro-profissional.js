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

const form = document.getElementById('form-cadastro');
const alerta = document.getElementById('alerta');
const btnEnviar = document.getElementById('btn-enviar');
const categoriasGrid = document.getElementById('categorias-grid');
const descricaoInput = document.getElementById('descricao');
const descricaoCount = document.getElementById('descricao-count');

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('ano').textContent = new Date().getFullYear();
  redirecionarSeLogado({ profissional: 'admin.html' });

  categoriasGrid.innerHTML = CATEGORIAS.map((cat) => `
    <label class="categoria-item">
      <input type="checkbox" name="categorias" value="${cat.valor}" />
      <span class="check-icon"></span>
      <span class="cat-label">${cat.label}</span>
    </label>
  `).join('');

  mascaraTelefone(document.getElementById('telefone'));
  mascaraCPF(document.getElementById('cpf'));
  mascaraCEP(document.getElementById('cep'));

  descricaoInput.addEventListener('input', () => {
    descricaoCount.textContent = descricaoInput.value.length;
  });

  form.addEventListener('submit', enviarFormulario);
});

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

  if (!nome) erros.push({ campo: 'nome', msg: 'Informe seu nome' });
  else if (nome.length < 3) erros.push({ campo: 'nome', msg: 'Nome muito curto' });
  if (!email) erros.push({ campo: 'email', msg: 'Informe seu e-mail' });
  else if (!/^\S+@\S+\.\S+$/.test(email)) erros.push({ campo: 'email', msg: 'E-mail inválido' });
  if (!senha) erros.push({ campo: 'senha', msg: 'Crie uma senha' });
  else if (senha.length < 6) erros.push({ campo: 'senha', msg: 'Mínimo 6 caracteres' });
  if (senha !== senhaConfirm) erros.push({ campo: 'senhaConfirm', msg: 'As senhas não coincidem' });
  if (!telefone) erros.push({ campo: 'telefone', msg: 'Informe seu telefone' });
  else if (telefone.replace(/\D/g, '').length < 10) erros.push({ campo: 'telefone', msg: 'Telefone incompleto' });
  if (!cidade) erros.push({ campo: 'cidade', msg: 'Informe sua cidade' });
  if (!estado) erros.push({ campo: 'estado', msg: 'Selecione um estado' });
  if (categorias.length === 0) erros.push({ campo: 'categorias', msg: 'Selecione ao menos uma categoria' });
  if (!termos) {
    const msgEl = document.querySelector('.form-termos .erro-msg');
    msgEl.textContent = 'Você precisa aceitar os termos';
    msgEl.style.display = 'block';
  }

  return erros;
}

async function enviarFormulario(e) {
  e.preventDefault();
  esconderAlerta(alerta);

  const erros = validarFormulario();
  if (erros.length > 0) {
    mostrarErros(erros);
    mostrarAlerta(alerta, 'erro', `Corrija ${erros.length} campo(s).`);
    return;
  }

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
  const cpf = document.getElementById('cpf').value.trim();
  if (cpf) dados.cpf = cpf;

  btnEnviar.classList.add('loading');
  btnEnviar.disabled = true;

  try {
    const resposta = await chamarAPI(CONFIG.ENDPOINTS.profissionalCadastro, 'POST', dados);
    salvarSessao(resposta.dados.token, resposta.dados.profissional, 'profissional');
    mostrarAlerta(alerta, 'sucesso', '🎉 Cadastro realizado com sucesso!');
    setTimeout(() => window.location.href = 'login.html', 2000);
  } catch (error) {
    if (error.dados && error.dados.erros && Array.isArray(error.dados.erros)) {
      mostrarErros(error.dados.erros.map((e) => ({ campo: e.campo, msg: e.mensagem })));
      mostrarAlerta(alerta, 'erro', 'Corrija os campos destacados.');
    } else {
      mostrarAlerta(alerta, 'erro', error.message || 'Erro ao cadastrar');
    }
  } finally {
    btnEnviar.classList.remove('loading');
    btnEnviar.disabled = false;
  }
}
