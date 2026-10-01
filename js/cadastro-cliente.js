const form = document.getElementById('form-cadastro');
const alerta = document.getElementById('alerta');
const btnEnviar = document.getElementById('btn-enviar');
const cpfCnpjInput = document.getElementById('cpfCnpj');
const wrapperDoc = document.getElementById('wrapper-doc');

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('ano').textContent = new Date().getFullYear();
  redirecionarSeLogado({ cliente: 'admin.html' });

  mascaraTelefone(document.getElementById('telefone'));
  mascaraCEP(document.getElementById('cep'));

  // Máscara dinâmica pra CPF/CNPJ
  cpfCnpjInput.addEventListener('input', () => {
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    let v = cpfCnpjInput.value.replace(/\D/g, '');
    if (tipo === 'empresa') {
      v = v.slice(0, 14);
      v = v.replace(/^(\d{2})(\d)/, '$1.$2');
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
      v = v.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      v = v.slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    cpfCnpjInput.value = v;
  });

  // Trocar label conforme tipo
  document.querySelectorAll('input[name="tipo"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const tipo = radio.value;
      const label = wrapperDoc.querySelector('label');
      if (tipo === 'empresa') {
        label.innerHTML = 'CNPJ (opcional)';
        cpfCnpjInput.placeholder = '00.000.000/0000-00';
        cpfCnpjInput.maxLength = 18;
        cpfCnpjInput.value = '';
      } else {
        label.innerHTML = 'CPF (opcional)';
        cpfCnpjInput.placeholder = '000.000.000-00';
        cpfCnpjInput.maxLength = 14;
        cpfCnpjInput.value = '';
      }
    });
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
  const termos = document.getElementById('termos').checked;

  if (!nome || nome.length < 3) erros.push({ campo: 'nome', msg: 'Informe seu nome' });
  if (!email) erros.push({ campo: 'email', msg: 'Informe seu e-mail' });
  else if (!/^\S+@\S+\.\S+$/.test(email)) erros.push({ campo: 'email', msg: 'E-mail inválido' });
  if (!senha || senha.length < 6) erros.push({ campo: 'senha', msg: 'Mínimo 6 caracteres' });
  if (senha !== senhaConfirm) erros.push({ campo: 'senhaConfirm', msg: 'Senhas não coincidem' });
  if (!telefone || telefone.replace(/\D/g, '').length < 10) erros.push({ campo: 'telefone', msg: 'Telefone inválido' });
  if (!cidade) erros.push({ campo: 'cidade', msg: 'Informe sua cidade' });
  if (!estado) erros.push({ campo: 'estado', msg: 'Selecione um estado' });
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
    tipo: document.querySelector('input[name="tipo"]:checked').value,
    cidade: document.getElementById('cidade').value.trim(),
    estado: document.getElementById('estado').value,
    bairro: document.getElementById('bairro').value.trim(),
    endereco: document.getElementById('endereco').value.trim(),
    cep: document.getElementById('cep').value.trim(),
  };
  const doc = cpfCnpjInput.value.trim();
  if (doc) dados.cpfCnpj = doc;

  btnEnviar.classList.add('loading');
  btnEnviar.disabled = true;

  try {
    const resposta = await chamarAPI(CONFIG.ENDPOINTS.clienteCadastro, 'POST', dados);
    salvarSessao(resposta.dados.token, resposta.dados.cliente, 'cliente');
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
