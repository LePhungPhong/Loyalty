const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default {
  get: (path) => fetch(`${API_URL}${path}`).then((r) => r.json()),

  post: (path, body) =>
    fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  put: (path, body) =>
    fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  delete: (path) =>
    fetch(`${API_URL}${path}`, {
      method: "DELETE",
    }).then((r) => r.json()),
};
