let todasAsVendasCarregadas = [];
let itensDaVendaAtual = [];

document.addEventListener("DOMContentLoaded", function() {
    carregarVendas();

    // Garante que a lista de clientes e produtos já estejam em memória ao carregar a página inicial
    if(typeof carregarClientes === 'function') carregarClientes();
    if(typeof carregarProdutos === 'function') carregarProdutos();

    const modalNovaVenda = document.getElementById('modalNovaVenda');
    if (modalNovaVenda) {
        // MUDANÇA: 'async function' para forçar o carregamento caso as listas estejam vazias antes de desenhar o datalist
        modalNovaVenda.addEventListener('show.bs.modal', async function () {
            if (typeof clientesCarregados !== 'undefined' && clientesCarregados.length === 0) {
                if(typeof carregarClientes === 'function') await carregarClientes();
            }
            if (typeof produtosCarregados !== 'undefined' && produtosCarregados.length === 0) {
                if(typeof carregarProdutos === 'function') await carregarProdutos();
            }
            preencherDatalistsNovaVenda();
        });

        // Ao fechar, limpa tudo
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

    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Carregando vendas...</td></tr>';

    try {
        const resposta = await fetch('/vendas/listar_vendas');

        if (resposta.ok) {
            todasAsVendasCarregadas = await resposta.json();
            aplicarFiltroVendas();
        } else {
            console.error('Erro ao carregar a lista de vendas do servidor.');
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Erro ao carregar os dados.</td></tr>`;
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Falha na conexão com o servidor.</td></tr>`;
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
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Nenhuma venda encontrada para este período.</td></tr>`;
        return;
    }

    vendasFiltradas.forEach(venda => {
        const valorFormatado = venda.valorTotal ? venda.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';

        let badgeClass = 'bg-secondary';
        if (venda.status === 'PAGO' || venda.status === 'CONCLUÍDO') badgeClass = 'bg-success';
        if (venda.status === 'PENDENTE' || venda.status === 'FIADO') badgeClass = 'bg-warning text-dark';

        // LÓGICA DO VENCIMENTO ADICIONADA AQUI
        const vencimentoText = (venda.status === 'PENDENTE' && venda.dataVencimento) ? formatarData(venda.dataVencimento) : '-';
        const corVencimento = venda.status === 'PENDENTE' ? 'text-danger fw-bold' : 'text-muted';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4">${venda.id}</td>
            <td>${venda.nomeCliente || 'Cliente Padrão'}</td>
            <td>${formatarData(venda.dataEmissao)}</td>
            <td class="${corVencimento}">${vencimentoText}</td>
            <td><strong>${valorFormatado}</strong></td>
            <td>
                <span class="badge ${badgeClass} cursor-pointer shadow-sm" onclick="alternarStatusVenda(${venda.id})" title="Clique para alternar o status">
                    ${venda.status || 'PENDENTE'} <i class="fas fa-exchange-alt ms-1"></i>
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-info text-white" title="Ver Detalhes" onclick="abrirDetalhesDaVenda(${venda.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ======================= ALTERAR STATUS DA VENDA (PENDENTE <-> PAGO) =======================
async function alternarStatusVenda(idVenda) {
    if(!confirm("Deseja alterar o status de pagamento desta venda?")) return;

    try {
        const resposta = await fetch(`/vendas/alternar_status/${idVenda}`, {
            method: 'PATCH'
        });

        if (resposta.ok) {
            carregarVendas();
            // Atualiza a lista de clientes para refletir a mudança de status nas notas deles também
            if(typeof carregarClientes === 'function') carregarClientes();
        } else {
            alert("Erro ao alterar o status da venda.");
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert("Erro de conexão com o servidor ao alterar status.");
    }
}

// ======================= EXIBIR DETALHES DA VENDA =======================
function abrirDetalhesDaVenda(idVenda) {
    const venda = todasAsVendasCarregadas.find(v => v.id === idVenda);
    if (!venda) { alert("Detalhes não encontrados."); return; }

    document.getElementById('detalheVendaId').textContent = venda.id;
    document.getElementById('detalheVendaCliente').textContent = venda.nomeCliente || 'Cliente Padrão';
    document.getElementById('detalheVendaData').textContent = formatarData(venda.dataEmissao);

    let badgeClass = 'bg-secondary';
    if (venda.status === 'PAGO' || venda.status === 'CONCLUÍDO') badgeClass = 'bg-success';
    if (venda.status === 'PENDENTE' || venda.status === 'FIADO') badgeClass = 'bg-warning text-dark';

    const spanStatus = document.getElementById('detalheVendaStatus');
    spanStatus.textContent = venda.status || 'PENDENTE';
    spanStatus.className = `badge ${badgeClass}`;

    const valorTotal = venda.valorTotal ? venda.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
    document.getElementById('detalheVendaTotal').textContent = valorTotal;

    const tabelaItens = document.getElementById('tabelaDetalheItens');
    tabelaItens.innerHTML = '';

    if (venda.itens && venda.itens.length > 0) {
        venda.itens.forEach(item => {
            const precoFormatado = item.precoUnitarioSnapshot ? item.precoUnitarioSnapshot.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
            const subtotalFormatado = item.subTotal ? item.subTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
            const nomeProd = item.produtoNome || `Produto #${item.produtoId}`;

            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${nomeProd}</td><td>${item.quantidade}</td><td>${precoFormatado}</td><td><strong>${subtotalFormatado}</strong></td>`;
            tabelaItens.appendChild(tr);
        });
    } else {
        tabelaItens.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum item registrado nesta venda.</td></tr>';
    }

    const modalElement = new bootstrap.Modal(document.getElementById('modalDetalhesVenda'));
    modalElement.show();
}

// ======================= LÓGICA DO CARRINHO E AUTOCOMPLETE =======================
function preencherDatalistsNovaVenda() {
    const listaClientes = document.getElementById('listaClientes');
    const listaProdutos = document.getElementById('listaProdutos');

    if (listaClientes) listaClientes.innerHTML = '';
    if (listaProdutos) listaProdutos.innerHTML = '';

    if (typeof clientesCarregados !== 'undefined') {
        clientesCarregados.forEach(cliente => {
            const option = document.createElement('option');
            option.value = `${cliente.id} - ${cliente.nomeCompleto}`;
            listaClientes.appendChild(option);
        });
    }

    if (typeof produtosCarregados !== 'undefined') {
        produtosCarregados.forEach(produto => {
            const option = document.createElement('option');
            option.value = `${produto.id} - ${produto.nome}`;
            listaProdutos.appendChild(option);
        });
    }
}

function adicionarItemNaVenda() {
    const produtoBuscaInput = document.getElementById('produtoBusca').value;
    const quantidadeInput = document.getElementById('quantidade').value;

    if (!produtoBuscaInput || quantidadeInput <= 0) {
        alert("Informe um produto válido e a quantidade.");
        return;
    }

    const prodId = parseInt(produtoBuscaInput.split(' - ')[0]);

    const produtoSelecionado = produtosCarregados.find(p => p.id === prodId);

    if(!produtoSelecionado) {
        alert("Produto não identificado! Selecione uma opção sugerida na lista.");
        return;
    }

    const qtd = parseInt(quantidadeInput);

    const indexExistente = itensDaVendaAtual.findIndex(item => item.produtoId === prodId);
    if (indexExistente !== -1) {
        itensDaVendaAtual[indexExistente].quantidade += qtd;
        itensDaVendaAtual[indexExistente].subtotal = itensDaVendaAtual[indexExistente].quantidade * produtoSelecionado.preco;
    } else {
        itensDaVendaAtual.push({
            produtoId: prodId,
            nome: produtoSelecionado.nome,
            preco: produtoSelecionado.preco,
            quantidade: qtd,
            subtotal: qtd * produtoSelecionado.preco
        });
    }

    atualizarTabelaItensTemporarios();
    document.getElementById('produtoBusca').value = '';
    document.getElementById('quantidade').value = '1';
    document.getElementById('produtoBusca').focus();
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
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted small py-2">Nenhum produto adicionado.</td></tr>';
        return;
    }

    itensDaVendaAtual.forEach(item => {
        const subtotalFormatado = item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.produtoId}</td>
            <td class="text-start"><strong>${item.nome}</strong></td>
            <td>${item.quantidade}</td>
            <td>${subtotalFormatado}</td>
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
    const clienteBuscaInput = document.getElementById('clienteBusca').value;
    const dataPagamentoInput = document.getElementById('dataPagamento').value;

    if (!clienteBuscaInput) {
        alert("Por favor, selecione um Cliente.");
        return;
    }

    const clienteIdNum = parseInt(clienteBuscaInput.split(' - ')[0]);
    if (isNaN(clienteIdNum)) {
        alert("Cliente inválido. Selecione um cliente da lista.");
        return;
    }

    if (itensDaVendaAtual.length === 0) {
        alert("Você precisa adicionar pelo menos um produto à venda!");
        return;
    }

    const vendaDTO = {
        clienteId: clienteIdNum,
        dataPagamento: dataPagamentoInput ? dataPagamentoInput : null,
        itens: itensDaVendaAtual.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade }))
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

            // ATUALIZA CLIENTES AQUI PARA A NOVA NOTA APARECER IMEDIATAMENTE NA ABA CLIENTES
            if(typeof carregarClientes === 'function') carregarClientes();

            if(typeof carregarProdutos === 'function') carregarProdutos(); // Atualiza o estoque ocultamente
        } else {
            alert("Erro ao registrar venda. Verifique os dados e o estoque.");
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