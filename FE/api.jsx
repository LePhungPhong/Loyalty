// api.js
const API_URL = "http://localhost:5000/api";

class API {
  static async get(path) {
    const res = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error(`GET ${path} failed: ${res.status}`);
    }

    return res.json();
  }

  static async post(path, body) {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`POST ${path} failed: ${res.status}`);
    }

    return res.json();
  }

  static async put(path, body) {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`PUT ${path} failed: ${res.status}`);
    }

    return res.json();
  }

  static async delete(path) {
    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error(`DELETE ${path} failed: ${res.status}`);
    }

    return res.json();
  }
}

export default API;
