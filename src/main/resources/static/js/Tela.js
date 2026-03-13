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

    // 4. Mudar o título e disparar as funções da API baseadas na tela
    const titulo = document.getElementById('tituloPagina');

    if (idTelaAlvo === 'telaInicio') {
        titulo.innerText = 'Painel de Controle';

    } else if (idTelaAlvo === 'telaVendas') {
        titulo.innerText = 'Gerenciar Vendas';
        if(typeof carregarVendas === 'function') carregarVendas();

    } else if (idTelaAlvo === 'telaClientes') {
        titulo.innerText = 'Gerenciar Clientes';
        if(typeof carregarClientes === 'function') carregarClientes();

    } else if (idTelaAlvo === 'telaEstoque') {
        titulo.innerText = 'Controle de Estoque';
        if(typeof carregarProdutos === 'function') carregarProdutos();
    }
}