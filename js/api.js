async function chamarAPI(endpoint, metodo = 'GET', dados = null) {
  const opcoes = {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
  };

  const token = localStorage.getItem(CONFIG.STORAGE.TOKEN);
  if (token) opcoes.headers['Authorization'] = `Bearer ${token}`;

  if (dados && ['POST', 'PUT', 'PATCH'].includes(metodo)) {
    opcoes.body = JSON.stringify(dados);
  }

  try {
    const resposta = await fetch(`${CONFIG.API_URL}${endpoint}`, opcoes);
    if (resposta.status === 204) return null;
    const json = await resposta.json();

    if (!resposta.ok) {
      const erro = new Error(json.mensagem || `Erro ${resposta.status}`);
      erro.status = resposta.status;
      erro.dados = json;
      throw erro;
    }
    return json;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Não foi possível conectar à API. Verifique sua internet.');
    }
    throw error;
  }
}

function salvarSessao(token, usuario, tipo) {
  localStorage.setItem(CONFIG.STORAGE.TOKEN, token);
  localStorage.setItem(CONFIG.STORAGE.USUARIO, JSON.stringify(usuario));
  localStorage.setItem(CONFIG.STORAGE.TIPO, tipo);
}

function pegarUsuario() {
  try {
    const raw = localStorage.getItem(CONFIG.STORAGE.USUARIO);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function pegarToken() { return localStorage.getItem(CONFIG.STORAGE.TOKEN); }
function pegarTipo() { return localStorage.getItem(CONFIG.STORAGE.TIPO); }
function estaLogado() { return !!pegarToken(); }

function logout() {
  localStorage.removeItem(CONFIG.STORAGE.TOKEN);
  localStorage.removeItem(CONFIG.STORAGE.USUARIO);
  localStorage.removeItem(CONFIG.STORAGE.TIPO);
}
