// server/test-password.js
const bcrypt = require('bcryptjs');

// !! MUITO IMPORTANTE !!
// Cole o HASH que você copiou do pgAdmin AQUI, dentro das aspas.
const hashFromDatabase = '$2a$10$/fwJfNuT0p/vIBtO7mDbaeJYicIPwtxaO4YUoVVUi4EMGpYaAZxOC'; 

const passwordToTest = 'admin123';

console.log("Testando a senha:", passwordToTest);
console.log("Contra o hash do banco:", hashFromDatabase);

try {
    const isMatch = bcrypt.compareSync(passwordToTest, hashFromDatabase);

    if (isMatch) {
        console.log("\n✅ SUCESSO! A senha BATE com o hash. O problema não é a senha.");
    } else {
        console.log("\n❌ FALHA! A senha NÃO BATE com o hash. O problema está no hash salvo no banco.");
    }
} catch (error) {
    console.error("\n🚨 ERRO AO COMPARAR! O hash no banco provavelmente está corrompido ou em formato inválido.", error);
}