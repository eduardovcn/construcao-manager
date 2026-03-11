function mudarTela(idTelaAlvo, elementoClicado) {
    // 1. Ocultar todas as telas
    const telas = document.querySelectorAll('.tela-conteudo');
    telas.forEach(tela => tela.classList.add('d-none'));

    // 2. Mostrar a tela desejada
    const telaAlvo = document.getElementById(idTelaAlvo);
    if (telaAlvo) {
        telaAlvo.classList.remove('d-none');
    }

    // 3. Atualizar a classe 'active' no menu lateral
    const links = document.querySelectorAll('#menuLateral .nav-link');
    links.forEach(link => link.classList.remove('active'));
    if (elementoClicado) {
        elementoClicado.classList.add('active');
    }

    // 4. Mudar o título e disparar funções de carregamento
    const titulo = document.getElementById('tituloPagina');

    if (idTelaAlvo === 'telaInicio') {
        titulo.innerText = 'Painel de Controle';

    } else if (idTelaAlvo === 'telaVendas') {
        titulo.innerText = 'Gerenciar Vendas';
        // Chama a função que deve estar no seu Vendas.js
        if(typeof carregarVendas === 'function') carregarVendas();

    } else if (idTelaAlvo === 'telaClientes') {
        titulo.innerText = 'Gerenciar Clientes';
        // Chama a função que deve estar no seu Cliente.js
        if(typeof carregarClientes === 'function') carregarClientes();

    } else if (idTelaAlvo === 'telaEstoque') {
        titulo.innerText = 'Controle de Estoque';
        // Chama a função que deve estar no seu Produto.js
        if(typeof carregarProdutos === 'function') carregarProdutos();
    }
}