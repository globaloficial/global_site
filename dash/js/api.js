const API_URL = "https://api.globalbot.site";

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function apiRequest(path, { method = "GET", body } = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError(0, "Não foi possível falar com o servidor. Tente novamente em instantes.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, data.erro || "Algo deu errado.");
  return data;
}

const Session = {
  user: null,

  async load() {
    try {
      const data = await apiRequest("/dash/eu");
      this.user = data.logado ? data.usuario : null;
    } catch {
      this.user = null;
    }
    return this.user;
  },

  loginUrl(provider) {
    return `${API_URL}/auth/${provider}?retorno=dash`;
  },

  async logout() {
    try {
      await apiRequest("/dash/sair", { method: "POST", body: {} });
    } catch {}
    this.user = null;
  }
};
