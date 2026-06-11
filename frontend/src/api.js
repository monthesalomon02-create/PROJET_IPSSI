// Fonction centralisée pour appeler l'API.
// Elle ajoute le token automatiquement et gère l'expiration (401).

// On stocke ici la fonction à appeler quand le token expire (définie par App).
let surTokenExpire = () => {};

export function configurerExpiration(callback) {
  surTokenExpire = callback;
}

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };
  // On ajoute le token s'il existe
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const reponse = await fetch(`http://localhost:8000${url}`, {
    ...options,
    headers,
  });

  // Token expiré ou invalide → on déconnecte
  if (reponse.status === 401) {
    surTokenExpire();
  }

  return reponse;
}
