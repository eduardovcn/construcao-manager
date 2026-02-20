/**
 * Função assíncrona para enviar nova venda ao Backend Spring Boot
 */
async function registrarVenda() {
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

// O evento 'DOMContentLoaded' garante que a função só rode quando a página terminar de carregar
document.addEventListener("DOMContentLoaded", function() {
    carregarUltimasVendas();
});

async function carregarUltimasVendas() {
    try {
        // ATENÇÃO: Verifique se a rota do seu Java para listar vendas é exatamente essa
        const resposta = await fetch('/vendas/listar_vendas');

        if (resposta.ok) {
            const vendas = await resposta.json();
            const tbody = document.getElementById('tabelaVendasBody');

            // Limpa a mensagem de "Carregando..."
            tbody.innerHTML = '';

            // Se não houver vendas no banco
            if (vendas.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Nenhuma venda registrada ainda.</td></tr>`;
                return;
            }

            // Para cada venda na lista, criamos uma nova linha (<tr>)
            vendas.forEach(venda => {

                // Formata o valor para a moeda Real (R$)
                const valorFormatado = venda.valorTotal ?
                    venda.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) :
                    'R$ 0,00';

                // Escolhe a classe CSS correta baseada no status
                const classeStatus = (venda.status === 'PAGO') ? 'status-pago' : 'status-pendente';

                // Desenha a linha HTML
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="ps-4">${venda.id}</td>
                    <td>${venda.nomeCliente || 'Cliente Padrão'}</td>
                    <td>${formatarData(venda.dataEmissao)}</td>
                    <td>${valorFormatado}</td>
                    <td><span class="${classeStatus}">${venda.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-light border" title="Ver Detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

        } else {
            console.error('Erro ao carregar a lista de vendas do servidor.');
            document.getElementById('tabelaVendasBody').innerHTML = `<tr><td colspan="6" class="text-center text-danger">Erro ao carregar os dados.</td></tr>`;
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        document.getElementById('tabelaVendasBody').innerHTML = `<tr><td colspan="6" class="text-center text-danger">Falha na conexão com o servidor.</td></tr>`;
    }
}

// Função auxiliar simples para formatar a data que vem do Java (ex: de "2026-02-18" para "18/02/2026")
function formatarData(dataString) {
    if (!dataString) return '--/--/----';
    const partes = dataString.split('-'); // Supondo formato YYYY-MM-DD
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataString;
}