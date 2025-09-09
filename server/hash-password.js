// server/hash-password.js
console.log("Iniciando o script de hash...");

try {
    const bcrypt = require('bcryptjs');
    const readline = require('readline');
    console.log("Módulos 'bcryptjs' e 'readline' carregados com sucesso.");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("\n--- Gerador de Hash de Senha ---");
    rl.question('Digite a nova senha que você quer criptografar: ', (password) => {
        if (!password) {
            console.error("ERRO: A senha não pode ser vazia.");
            rl.close();
            return;
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        console.log("\nSenha criptografada (hash):");
        console.log("====================================");
        console.log(hash);
        console.log("====================================");
        console.log("\nCOPIE o hash acima e use-o no seu comando SQL (UPDATE ou INSERT).");

        rl.close();
    });

} catch (error) {
    console.error("\n--- ERRO FATAL AO INICIAR O SCRIPT ---");
    console.error("Ocorreu um erro ao tentar carregar os módulos. Isso geralmente significa que um pacote está faltando.");
    console.error("Para corrigir, por favor, execute 'npm install' na pasta 'server' novamente.");
    console.error("--------------------------------------");
    console.error("Erro detalhado:", error);
}