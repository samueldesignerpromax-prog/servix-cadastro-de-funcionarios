// ===== MÁSCARAS =====
function mascaraTelefone(input) {
  input.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    else if (v.length > 0) v = v.replace(/^(\d{0,2}).*/, '($1');
    e.target.value = v;
  });
}

function mascaraCPF(input) {
  input.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = v;
  });
}

function mascaraCEP(input) {
  input.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
    e.target.value = v;
  });
}

// ===== FORMATAÇÕES =====
function formatarData(dataStr) {
  if (!dataStr) return '—';
  const d = new Date(dataStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatarDataHora(dataStr) {
  if (!dataStr) return '—';
  const d = new Date(dataStr);
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function iniciais(nome) {
  if (!nome) return '?';
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

// ===== UI =====
function mostrarAlerta(el, tipo, msg) {
  el.className = `alerta alerta-${tipo}`;
  el.textContent = msg;
  el.style.display = 'flex';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function esconderAlerta(el) { el.style.display = 'none'; }

function limparErros(container = document) {
  container.querySelectorAll('.field').forEach((f) => {
    f.classList.remove('erro');
    const input = f.querySelector('input, select, textarea');
    if (input) input.classList.remove('erro');
    const msg = f.querySelector('.erro-msg');
    if (msg) msg.textContent = '';
  });
}

function mostrarErros(erros) {
  erros.forEach(({ campo, msg }) => {
    const field = document.querySelector(`.field[data-field="${campo}"]`);
    if (!field) return;
    field.classList.add('erro');
    const input = field.querySelector('input, select, textarea');
    if (input) input.classList.add('erro');
    const msgEl = field.querySelector('.erro-msg');
    if (msgEl) msgEl.textContent = msg;
  });
  const primeiro = document.querySelector('.field.erro');
  if (primeiro) primeiro.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ===== PROTEÇÃO DE ROTAS =====
function exigirLogin(tiposPermitidos = []) {
  if (!estaLogado()) {
    window.location.href = 'login.html';
    return false;
  }
  const tipo = pegarTipo();
  if (tiposPermitidos.length > 0 && !tiposPermitidos.includes(tipo)) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function redirecionarSeLogado(tiposDestino = {}) {
  if (!estaLogado()) return false;
  const tipo = pegarTipo();
  const destino = tiposDestino[tipo];
  if (destino) {
    window.location.href = destino;
    return true;
  }
  return false;
}
