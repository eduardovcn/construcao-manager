

async function registrarProduto() {
    const nomeInput = document.getElementById('nome').value;
    const precoInput = document.getElementById('preco').value;
    const estoqueInput = document.getElementById('quantidadeEstoque').value;

    if (!nomeInput || !precoInput || !estoqueInput) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    const produtoDTO = {
        nome: nomeInput,
        preco: parseFloat(precoInput),
        quantidadeEstoque: parseInt(estoqueInput)
    };

    try {
        const resposta = await fetch('produtos/cadastrar_produto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(produtoDTO)
        });

        if (resposta.ok) {
            const produtoCriado = await resposta.json();
            alert(`Produto registrado com sucesso! ID do Produto: ${produtoCriado.id}`);

            const modalElement = document.getElementById('modalNovoProduto');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            document.getElementById('formProduto').reset();
        } else {
            alert("Erro ao registrar produto. Verifique os dados e tente novamente.");
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert("Erro de conexão com o servidor.");
    }
}