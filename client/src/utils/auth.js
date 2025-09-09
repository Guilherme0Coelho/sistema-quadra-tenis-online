// src/utils/auth.js

// Esta função pega o token do navegador
export const getToken = () => {
    return localStorage.getItem('token');
};

// Esta função pega o token, decodifica e retorna os dados do usuário (incluindo o admin_level)
export const getUserFromToken = () => {
    const token = getToken();
    if (!token) {
        return null;
    }
    try {
        // O token JWT é dividido em 3 partes por ".". A parte do meio (payload) contém nossos dados.
        const payload = token.split('.')[1];
        // Usamos atob para decodificar a string que está em Base64
        const decodedPayload = atob(payload);
        return JSON.parse(decodedPayload);
    } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        // Se o token for inválido ou corrompido, remove-o
        localStorage.removeItem('token');
        return null;
    }
};