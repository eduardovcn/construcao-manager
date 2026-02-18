/**
 * Função assíncrona para enviar nova venda ao Backend Spring Boot
 */
async function enviarVenda() {
    // 1. Captura os dados dos inputs
    const clienteIdInput = document.getElementById('clienteId').value;
    const produtoIdInput = document.getElementById('produtoId').value;
    const quantidadeInput = document.getElementById('quantidade').value;
    const dataPagamentoInput = document.getElementById('dataPagamento').value;

    // Validação básica de front-end
    if (!clienteIdInput || !produtoIdInput) {
        alert("Por favor, preencha o ID do Cliente e do Produto.");
        return;
    }

    // 2. Monta o Objeto JSON (DTO)
    const vendaDTO = {
        clienteId: parseInt(clienteIdInput),
        dataPagamento: dataPagamentoInput ? dataPagamentoInput : null,
        itens: [
            {
                produtoId: parseInt(produtoIdInput),
                quantidade: parseInt(quantidadeInput)
            }
        ]
    };

    try {
        // 3. Envia requisição POST
        const resposta = await fetch('/cadastrar_venda', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vendaDTO)
        });

        // 4. Trata a resposta
        if (resposta.ok) {
            const notaGerada = await resposta.json();
            alert(`Venda realizada com sucesso! ID da Nota: ${notaGerada.id}`);

            // Fecha o modal usando a API do Bootstrap 5
            const modalElement = document.getElementById('modalNovaVenda');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            // Limpa o formulário para a próxima venda
            document.getElementById('formVenda').reset();

        } else {
            // Se o servidor retornar erro (ex: Produto não encontrado ou sem estoque)
            alert("Erro ao registrar venda. Verifique se o Cliente/Produto existem e se há estoque.");
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert("Erro de conexão com o servidor.");
    }
}