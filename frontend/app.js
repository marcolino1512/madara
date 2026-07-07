// ============================================================
// app.js — Lógica principal do frontend
// Responsável por:
//   1. Alternar entre as telas (login, cadastro, carregando, logado)
//   2. Enviar os dados para a API do backend
//   3. Salvar e recuperar a sessão do usuário
// ============================================================


// ------------------------------------------------------------
// CONFIGURAÇÃO — URL da API
//
// Em desenvolvimento (localhost): chama o backend direto na porta 3000.
// Em produção (Vercel): usa "/api" relativo — o vercel.json redireciona
// essa rota para o servidor local exposto pelo ngrok.
// ------------------------------------------------------------
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';


// ------------------------------------------------------------
// REFERÊNCIAS AOS ELEMENTOS DO HTML
// Cada variável aponta para um elemento da página pelo seu id.
// ------------------------------------------------------------

// Os quatro "estados" que a tela pode exibir
const formLogin        = document.getElementById('form-login');
const formRegistro     = document.getElementById('form-registro');
const estadoCarregando = document.getElementById('estado-carregando');
const estadoLogado     = document.getElementById('estado-logado');

// A caixa branca central (usada para mudar a altura quando o
// formulário de cadastro tem mais campos)
const loginBox = document.getElementById('login-box');

// Links que alternam entre formulários
const irParaRegistro = document.getElementById('ir-para-registro');
const irParaLogin    = document.getElementById('ir-para-login');

// Botão de sair da conta
const btnSair = document.getElementById('btn-sair');

// Divs de mensagem de erro de cada formulário
const loginErro = document.getElementById('login-erro');
const regErro   = document.getElementById('reg-erro');

// Lista com todos os estados (usada para esconder todos de uma vez)
const todosOsEstados = [formLogin, formRegistro, estadoCarregando, estadoLogado];


// ------------------------------------------------------------
// FUNÇÃO: mostrar(elemento)
// Esconde todos os estados e exibe apenas o passado como argumento.
// Também adiciona a classe "alto" na caixa quando o formulário
// de cadastro está visível (pois tem mais campos).
// ------------------------------------------------------------
function mostrar(elemento) {
    todosOsEstados.forEach(el => el.classList.add('hidden'));
    elemento.classList.remove('hidden');

    // A caixa cresce verticalmente quando o cadastro está aberto
    loginBox.classList.toggle('alto', elemento === formRegistro);
}


// ------------------------------------------------------------
// FUNÇÃO: mostrarErro(el, msg)
// Exibe uma mensagem de erro vermelha dentro do formulário.
// ------------------------------------------------------------
function mostrarErro(el, msg) {
    el.textContent = msg;
    el.classList.add('visivel');
}


// ------------------------------------------------------------
// FUNÇÃO: limparErro(el)
// Remove a mensagem de erro do formulário.
// ------------------------------------------------------------
function limparErro(el) {
    el.textContent = '';
    el.classList.remove('visivel');
}


// ------------------------------------------------------------
// NAVEGAÇÃO ENTRE FORMULÁRIOS
// Ao clicar em "Registrar-se" → mostra o formulário de cadastro.
// Ao clicar em "Fazer Login"  → volta para o formulário de login.
// ------------------------------------------------------------
irParaRegistro.addEventListener('click', e => {
    e.preventDefault();        // impede o link de navegar para outra página
    limparErro(loginErro);     // limpa qualquer erro anterior
    mostrar(formRegistro);     // exibe o formulário de cadastro
});

irParaLogin.addEventListener('click', e => {
    e.preventDefault();
    limparErro(regErro);
    mostrar(formLogin);
});


// ------------------------------------------------------------
// EVENTO: envio do formulário de LOGIN
// Coleta email e senha, envia para a API e trata a resposta.
// ------------------------------------------------------------
formLogin.addEventListener('submit', async e => {
    e.preventDefault();        // impede o recarregamento da página
    limparErro(loginErro);

    // Lê os valores digitados pelo usuário
    const email  = document.getElementById('login-email').value.trim();
    const senha  = document.getElementById('login-senha').value;
    const lembrar = document.getElementById('lembre-me').checked;

    // Exibe a tela "Logando..." enquanto aguarda a resposta
    mostrar(estadoCarregando);

    try {
        // Faz a requisição POST para a rota de login da API
        const resposta = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        // Se a API retornou erro (ex: senha errada), volta para o
        // formulário e exibe a mensagem de erro recebida
        if (!resposta.ok) {
            mostrar(formLogin);
            mostrarErro(loginErro, dados.mensagem || 'Erro ao fazer login.');
            return;
        }

        // Escolhe onde salvar a sessão:
        // - localStorage   → persiste mesmo depois de fechar o navegador
        // - sessionStorage → some quando o navegador é fechado
        const storage = lembrar ? localStorage : sessionStorage;
        storage.setItem('token',   dados.token);
        storage.setItem('usuario', JSON.stringify(dados.usuario));

        // Exibe a tela de usuário logado
        exibirLogado(dados.usuario);

    } catch {
        // Erro de rede: o servidor pode estar desligado
        mostrar(formLogin);
        mostrarErro(loginErro, 'Não foi possível conectar ao servidor.');
    }
});


// ------------------------------------------------------------
// EVENTO: envio do formulário de REGISTRO
// Valida os campos, envia para a API e trata a resposta.
// ------------------------------------------------------------
formRegistro.addEventListener('submit', async e => {
    e.preventDefault();
    limparErro(regErro);

    // Lê os valores digitados pelo usuário
    const nome           = document.getElementById('reg-nome').value.trim();
    const email          = document.getElementById('reg-email').value.trim();
    const senha          = document.getElementById('reg-senha').value;
    const confirmarSenha = document.getElementById('reg-confirmar-senha').value;

    // Validação 1: campos obrigatórios
    if (!nome || !email || !senha || !confirmarSenha) {
        mostrarErro(regErro, 'Preencha todos os campos.');
        return;
    }

    // Validação 2: a senha deve ter no mínimo 6 caracteres
    if (senha.length < 6) {
        mostrarErro(regErro, 'A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    // Validação 3: as duas senhas precisam ser iguais
    // Essa verificação é feita aqui no frontend ANTES de enviar para a API
    if (senha !== confirmarSenha) {
        mostrarErro(regErro, 'As senhas não coincidem. Tente novamente.');
        return;
    }

    // Validações passaram → exibe a tela de carregamento
    mostrar(estadoCarregando);

    try {
        // Envia apenas nome, email e senha para a API
        // A confirmação de senha é validada só no frontend e nunca enviada
        const resposta = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrar(formRegistro);
            mostrarErro(regErro, dados.mensagem || 'Erro ao criar conta.');
            return;
        }

        // Salva a sessão na sessionStorage (até fechar o navegador)
        sessionStorage.setItem('token',   dados.token);
        sessionStorage.setItem('usuario', JSON.stringify(dados.usuario));

        // Vai direto para a tela de logado após o cadastro
        exibirLogado(dados.usuario);

    } catch {
        mostrar(formRegistro);
        mostrarErro(regErro, 'Não foi possível conectar ao servidor.');
    }
});


// ------------------------------------------------------------
// EVENTO: botão SAIR
// Remove o token e os dados do usuário do storage e volta
// para o formulário de login.
// ------------------------------------------------------------
btnSair.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    mostrar(formLogin);
});


// ------------------------------------------------------------
// FUNÇÃO: exibirLogado(usuario)
// Preenche os campos da tela de "logado" com os dados do usuário
// e exibe essa tela.
// ------------------------------------------------------------
function exibirLogado(usuario) {
    document.getElementById('usuario-nome-exibido').textContent  = `Olá, ${usuario.nome}!`;
    document.getElementById('usuario-email-exibido').textContent = usuario.email;
    document.getElementById('usuario-id-exibido').textContent    = `ID: ${usuario.id}`;
    mostrar(estadoLogado);
}


// ------------------------------------------------------------
// VERIFICAÇÃO DE SESSÃO (executada assim que a página carrega)
// Se já existir um token salvo, o usuário vai direto para a
// tela de logado sem precisar fazer login novamente.
// ------------------------------------------------------------
(function verificarSessaoSalva() {
    const token      = localStorage.getItem('token')   || sessionStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');

    if (token && usuarioStr) {
        // Sessão encontrada → restaura a tela de logado
        exibirLogado(JSON.parse(usuarioStr));
    }
    // Se não houver sessão, o formulário de login já está visível por padrão
})();
