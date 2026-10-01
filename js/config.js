const CONFIG = {
  API_URL: 'https://servix-api-1.onrender.com',
  STORAGE: {
    TOKEN: 'servix_token',
    USUARIO: 'servix_usuario',
    TIPO: 'servix_tipo',
  },
  ENDPOINTS: {
    health: '/api/health',
    profissionalCadastro: '/api/profissionais/cadastro',
    profissionalLogin: '/api/profissionais/login',
    profissionalListar: '/api/profissionais',
    clienteCadastro: '/api/clientes/cadastro',
    clienteLogin: '/api/clientes/login',
    clienteMe: '/api/clientes/me',
    adminLogin: '/api/admin/login',
    adminMe: '/api/admin/me',
    adminDashboard: '/api/admin/dashboard',
    adminProfissionais: '/api/admin/profissionais',
    adminClientes: '/api/admin/clientes',
    adminProLogin: '/api/admin-pro/login',
    adminProDashboard: '/api/admin-pro/dashboard',
    adminProAdmins: '/api/admin-pro/admins',
  },
};
Object.freeze(CONFIG);
Object.freeze(CONFIG.STORAGE);
Object.freeze(CONFIG.ENDPOINTS);
