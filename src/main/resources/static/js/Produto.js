// ======================= LISTAR PRODUTOS (ESTOQUE) =======================
async function carregarProdutos() {
    const tbody = document.getElementById('tabelaEstoqueBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" class="text-center"><i class="fas fa-spinner fa-spin"></i> Carregando estoque...</td></tr>';

    try {
        const resposta = await fetch('/produtos/listar_produtos');

        if (resposta.ok) {
            const produtos = await resposta.json();
            tbody.innerHTML = '';

            if (produtos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Nenhum produto em estoque.</td></tr>';
                return;
            }

            produtos.forEach(produto => {
                const precoFormatado = produto.preco ? produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';

                let badgeEstoque = `<span class="badge bg-success">${produto.quantidadeEstoque} un</span>`;
                if (produto.quantidadeEstoque <= 0) {
                    badgeEstoque = `<span class="badge bg-danger">Sem Estoque</span>`;
                } else if (produto.quantidadeEstoque <= 10) {
                    badgeEstoque = `<span class="badge bg-warning text-dark">${produto.quantidadeEstoque} un (Baixo)</span>`;
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="ps-4">${produto.id}</td>
                    <td><strong>${produto.nome}</strong></td>
                    <td>${precoFormatado}</td>
                    <td>${badgeEstoque}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" title="Editar Produto">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            console.error('Erro ao carregar a lista de produtos.');
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erro ao carregar os dados.</td></tr>`;
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Falha na conexão com o servidor.</td></tr>`;
    }
}

// ======================= CADASTRAR PRODUTO =======================
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
        const resposta = await fetch('/produtos/cadastrar_produto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produtoDTO)
        });

        if (resposta.ok) {
            const produtoCriado = await resposta.json();
            alert(`Produto registrado com sucesso! ID do Produto: ${produtoCriado.id}`);

            const modalElement = document.getElementById('modalNovoProduto');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            document.getElementById('formProduto').reset();

            if(!document.getElementById('telaEstoque').classList.contains('d-none')) {
                carregarProdutos();
            }
        } else {
            alert("Erro ao registrar produto. Verifique os dados e tente novamente.");
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert("Erro de conexão com o servidor.");
    }
}