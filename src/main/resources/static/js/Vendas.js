let todasAsVendasCarregadas = [];

document.addEventListener("DOMContentLoaded", function() {
    // Carrega as vendas mas não exibe se a tela não for a de Vendas
    // Deixaremos a responsabilidade de exibição inicial para a navegação do Menu
    carregarVendas();
});

// ======================= LISTAR VENDAS E FILTRAR =======================
async function carregarVendas() {
    const tbody = document.getElementById('tabelaVendasBody');
    if(!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Carregando vendas...</td></tr>';

    try {
        const resposta = await fetch('/vendas/listar_vendas');

        if (resposta.ok) {
            todasAsVendasCarregadas = await resposta.json();
            aplicarFiltroVendas(); // Chama a função que desenha a tabela baseada no filtro selecionado
        } else {
            console.error('Erro ao carregar a lista de vendas do servidor.');
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Erro ao carregar os dados.</td></tr>`;
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Falha na conexão com o servidor.</td></tr>`;
    }
}

function aplicarFiltroVendas() {
    const filtro = document.getElementById('filtroTempoVendas').value;
    const tbody = document.getElementById('tabelaVendasBody');
    tbody.innerHTML = '';

    const hoje = new Date();

    // Filtra o array baseado na escolha do usuário
    const vendasFiltradas = todasAsVendasCarregadas.filter(venda => {
        if (!venda.dataEmissao) return false;

        const dataVenda = new Date(venda.dataEmissao + "T00:00:00"); // Garante fuso correto

        if (filtro === 'hoje') {
            return dataVenda.toDateString() === hoje.toDateString();
        } else if (filtro === 'mes') {
            return dataVenda.getMonth() === hoje.getMonth() && dataVenda.getFullYear() === hoje.getFullYear();
        } else if (filtro === 'ano') {
            return dataVenda.getFullYear() === hoje.getFullYear();
        } else {
            return true; // 'todas'
        }
    });

    if (vendasFiltradas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Nenhuma venda encontrada para este período.</td></tr>`;
        return;
    }

    vendasFiltradas.forEach(venda => {
        const valorFormatado = venda.valorTotal ? venda.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';

        // Escolhe a classe visual do Bootstrap baseada no status
        let badgeClass = 'bg-secondary';
        if (venda.status === 'PAGO' || venda.status === 'CONCLUÍDO') badgeClass = 'bg-success';
        if (venda.status === 'PENDENTE' || venda.status === 'FIADO') badgeClass = 'bg-warning text-dark';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4">${venda.id}</td>
            <td>${venda.nomeCliente || 'Cliente Padrão'}</td>
            <td>${formatarData(venda.dataEmissao)}</td>
            <td><strong>${valorFormatado}</strong></td>
            <td><span class="badge ${badgeClass}">${venda.status || 'PENDENTE'}</span></td>
            <td>
                <button class="btn btn-sm btn-info text-white" title="Ver Detalhes" onclick="abrirDetalhesDaVenda(${venda.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function abrirDetalhesDaVenda(idVenda) {
    // Se você já tiver a lógica de abrir detalhes de uma venda independente no Java,
    // faça a requisição aqui, caso contrário, pode usar a busca no array 'todasAsVendasCarregadas'
    console.log("Visualizar venda:", idVenda);
    alert("Funcionalidade de detalhar venda independente em construção.");
}

// ======================= CADASTRAR VENDA =======================
async function registrarVenda() {
    const clienteIdInput = document.getElementById('clienteId').value;
    const produtoIdInput = document.getElementById('produtoId').value;
    const quantidadeInput = document.getElementById('quantidade').value;
    const dataPagamentoInput = document.getElementById('dataPagamento').value;

    if (!clienteIdInput || !produtoIdInput) {
        alert("Por favor, preencha o ID do Cliente e do Produto.");
        return;
    }

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
        const resposta = await fetch('/vendas/cadastrar_venda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vendaDTO)
        });

        if (resposta.ok) {
            const notaGerada = await resposta.json();
            alert(`Venda realizada com sucesso! ID da Nota: ${notaGerada.id}`);

            const modalElement = document.getElementById('modalNovaVenda');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            document.getElementById('formVenda').reset();

            // Atualiza os dados na tela
            carregarVendas();

        } else {
            alert("Erro ao registrar venda. Verifique se o Cliente/Produto existem e se há estoque.");
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert("Erro de conexão com o servidor.");
    }
}

// ======================= UTILITÁRIOS =======================
function formatarData(dataString) {
    if (!dataString) return '--/--/----';
    const partes = dataString.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataString;
}