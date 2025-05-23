import { ref } from "vue";
import { defineStore } from "pinia";

function generateJWT(payload) {
  // Header en base64
  const header = btoa(
    JSON.stringify({
      alg: "HS256",
      typ: "JWT",
    })
  );

  const jwtPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hora de expiración
  };

  const encodedPayload = btoa(JSON.stringify(jwtPayload));

  const signature = btoa("pokemon_memorama_signature_" + Math.random());

  return `${header}.${encodedPayload}.${signature}`;
}

export const authStore = defineStore("auth", () => {
  const authToken = ref("");

  function getAuthToken() {
    return authToken.value;
  }

  function setAuthToken(token) {
    authToken.value = token;
  }

  function createUserToken(userData) {
    // crear un token JWT con los datos del usuario
    const token = generateJWT(userData);
    authToken.value = token;
    return token;
  }

  function decodeToken() {
    if (!authToken.value) return null;

    try {
      const parts = authToken.value.split(".");
      if (parts.length !== 3) return null;

      return JSON.parse(atob(parts[1]));
    } catch (error) {
      console.error("Error decodificando token:", error);
      return null;
    }
  }

  function isTokenValid() {
    if (!authToken.value) return false;

    try {
      const payload = decodeToken();
      if (!payload) return false;

      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      console.error("Error validando token:", error);
      return false;
    }
  }

  function clearToken() {
    authToken.value = "";
  }

  return {
    getAuthToken,
    setAuthToken,
    createUserToken,
    decodeToken,
    isTokenValid,
    clearToken,
  };
});
