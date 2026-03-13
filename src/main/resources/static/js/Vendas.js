let todasAsVendasCarregadas = [];
let itensDaVendaAtual = [];

document.addEventListener("DOMContentLoaded", function() {
    carregarVendas();

    const modalNovaVenda = document.getElementById('modalNovaVenda');
    if (modalNovaVenda) {
        modalNovaVenda.addEventListener('hidden.bs.modal', function () {
            document.getElementById('formVenda').reset();
            itensDaVendaAtual = [];
            atualizarTabelaItensTemporarios();
        });
    }
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
            aplicarFiltroVendas();
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

    const vendasFiltradas = todasAsVendasCarregadas.filter(venda => {
        if (!venda.dataEmissao) return false;

        const dataVenda = new Date(venda.dataEmissao + "T00:00:00");

        if (filtro === 'hoje') {
            return dataVenda.toDateString() === hoje.toDateString();
        } else if (filtro === 'mes') {
            return dataVenda.getMonth() === hoje.getMonth() && dataVenda.getFullYear() === hoje.getFullYear();
        } else if (filtro === 'ano') {
            return dataVenda.getFullYear() === hoje.getFullYear();
        } else {
            return true;
        }
    });

    if (vendasFiltradas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Nenhuma venda encontrada para este período.</td></tr>`;
        return;
    }

    vendasFiltradas.forEach(venda => {
        const valorFormatado = venda.valorTotal ? venda.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';

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

// ======================= EXIBIR DETALHES DA VENDA =======================
function abrirDetalhesDaVenda(idVenda) {
    const venda = todasAsVendasCarregadas.find(v => v.id === idVenda);

    if (!venda) {
        alert("Detalhes da venda não encontrados.");
        return;
    }

    // Preenche o cabeçalho do modal
    document.getElementById('detalheVendaId').textContent = venda.id;
    document.getElementById('detalheVendaCliente').textContent = venda.nomeCliente || 'Cliente Padrão';
    document.getElementById('detalheVendaData').textContent = formatarData(venda.dataEmissao);

    // Configura o status
    let badgeClass = 'bg-secondary';
    if (venda.status === 'PAGO' || venda.status === 'CONCLUÍDO') badgeClass = 'bg-success';
    if (venda.status === 'PENDENTE' || venda.status === 'FIADO') badgeClass = 'bg-warning text-dark';

    const spanStatus = document.getElementById('detalheVendaStatus');
    spanStatus.textContent = venda.status || 'PENDENTE';
    spanStatus.className = `badge ${badgeClass}`;

    // Valor total
    const valorTotal = venda.valorTotal ? venda.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
    document.getElementById('detalheVendaTotal').textContent = valorTotal;

    // Preenche a tabela de itens
    const tabelaItens = document.getElementById('tabelaDetalheItens');
    tabelaItens.innerHTML = '';

    if (venda.itens && venda.itens.length > 0) {
        venda.itens.forEach(item => {
            const precoFormatado = item.precoUnitarioSnapshot ? item.precoUnitarioSnapshot.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
            const subtotalFormatado = item.subTotal ? item.subTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';

            // Tenta exibir o nome do produto, se não tiver mostra o ID
            const nomeProd = item.produto && item.produto.nome ? item.produto.nome : `Produto #${item.produtoId || 'N/A'}`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${nomeProd}</td>
                <td>${item.quantidade}</td>
                <td>${precoFormatado}</td>
                <td><strong>${subtotalFormatado}</strong></td>
            `;
            tabelaItens.appendChild(tr);
        });
    } else {
        tabelaItens.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum item registrado nesta venda.</td></tr>';
    }

    const modalElement = new bootstrap.Modal(document.getElementById('modalDetalhesVenda'));
    modalElement.show();
}

// ======================= LÓGICA DO CARRINHO (NOVA VENDA) =======================
function adicionarItemNaVenda() {
    const produtoIdInput = document.getElementById('produtoId').value;
    const quantidadeInput = document.getElementById('quantidade').value;

    if (!produtoIdInput || quantidadeInput <= 0) {
        alert("Informe um ID de produto e uma quantidade válida.");
        return;
    }

    const prodId = parseInt(produtoIdInput);
    const qtd = parseInt(quantidadeInput);

    const indexExistente = itensDaVendaAtual.findIndex(item => item.produtoId === prodId);
    if (indexExistente !== -1) {
        itensDaVendaAtual[indexExistente].quantidade += qtd;
    } else {
        itensDaVendaAtual.push({ produtoId: prodId, quantidade: qtd });
    }

    atualizarTabelaItensTemporarios();
    document.getElementById('produtoId').value = '';
    document.getElementById('quantidade').value = '1';
    document.getElementById('produtoId').focus();
}

function removerItemDaVenda(prodId) {
    itensDaVendaAtual = itensDaVendaAtual.filter(item => item.produtoId !== prodId);
    atualizarTabelaItensTemporarios();
}

function atualizarTabelaItensTemporarios() {
    const tbody = document.getElementById('listaItensVendaTemp');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (itensDaVendaAtual.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-muted small py-2">Nenhum produto adicionado.</td></tr>';
        return;
    }

    itensDaVendaAtual.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.produtoId}</td>
            <td>${item.quantidade}</td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="removerItemDaVenda(${item.produtoId})" title="Remover item">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ======================= CADASTRAR VENDA (ENVIAR PARA API) =======================
async function registrarVenda() {
    const clienteIdInput = document.getElementById('clienteId').value;
    const dataPagamentoInput = document.getElementById('dataPagamento').value;

    if (!clienteIdInput) {
        alert("Por favor, preencha o ID do Cliente.");
        return;
    }

    if (itensDaVendaAtual.length === 0) {
        alert("Você precisa adicionar pelo menos um produto à venda!");
        return;
    }

    const vendaDTO = {
        clienteId: parseInt(clienteIdInput),
        dataPagamento: dataPagamentoInput ? dataPagamentoInput : null,
        itens: itensDaVendaAtual
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

            carregarVendas();
        } else {
            alert("Erro ao registrar venda. Verifique se o Cliente/Produto existem e se há estoque suficiente.");
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