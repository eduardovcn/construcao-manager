

let todasAsVendasCarregadas = [];
let itensDaVendaAtual = [];

document.addEventListener("DOMContentLoaded", function() {
    carregarVendas();

    if(typeof carregarClientes === 'function') carregarClientes();
    if(typeof carregarProdutos === 'function') carregarProdutos();

    const modalNovaVenda = document.getElementById('modalNovaVenda');
    if (modalNovaVenda) {
        modalNovaVenda.addEventListener('show.bs.modal', async function () {
            if (typeof clientesCarregados !== 'undefined' && clientesCarregados.length === 0) {
                if(typeof carregarClientes === 'function') await carregarClientes();
            }
            if (typeof produtosCarregados !== 'undefined' && produtosCarregados.length === 0) {
                if(typeof carregarProdutos === 'function') await carregarProdutos();
            }
            preencherDatalistsNovaVenda();

            // NOVO: Pré-preenche a data de emissão com o dia de hoje, mas deixa livre para mudar
            const hoje = new Date().toISOString().split('T')[0];
            document.getElementById('dataEmissaoNova').value = hoje;
        });

        modalNovaVenda.addEventListener('hidden.bs.modal', function () {
            document.getElementById('formVenda').reset();
            itensDaVendaAtual = [];
            atualizarTabelaItensTemporarios();
        });
    }
});

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

        let vencimentoText = '-';
        let corVencimento = 'text-muted';

        if (venda.status === 'PENDENTE') {
            vencimentoText = venda.dataVencimento ? formatarData(venda.dataVencimento) : '-';
            corVencimento = 'text-danger fw-bold';
        } else if (venda.status === 'PAGO' || venda.status === 'CONCLUÍDO') {
            vencimentoText = venda.dataVencimento ? formatarData(venda.dataVencimento) : '-';
            corVencimento = 'text-success fw-bold';
        }

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
                <button class="btn btn-sm btn-primary text-white" title="Editar Nota" onclick="abrirModalEdicao(${venda.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger text-white" title="Excluir Nota" onclick="deletarVenda(${venda.id}, 'vendas')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function alternarStatusVenda(idVenda) {
    if(!confirm("Deseja alterar o status de pagamento desta venda?")) return;

    try {
        const resposta = await fetch(`/vendas/alternar_status/${idVenda}`, {
            method: 'PATCH'
        });

        if (resposta.ok) {
            await carregarVendas();
            if(typeof carregarClientes === 'function') await carregarClientes();

            const modalLista = document.getElementById('modalListaNotasCliente');
            if (modalLista && modalLista.classList.contains('show')) {
                const cliente = clientesCarregados.find(c => c.notas && c.notas.some(n => n.id === idVenda));
                if (cliente) abrirModalListaNotas(cliente.id);
            }

            const modalDetalhes = document.getElementById('modalDetalhesVenda');
            if (modalDetalhes && modalDetalhes.classList.contains('show')) {
                const idVendaAberta = parseInt(document.getElementById('detalheVendaId').textContent);
                if (idVendaAberta === idVenda) {
                    abrirDetalhesDaVenda(idVenda);
                }
            }

        } else {
            alert("Erro ao alterar o status da venda.");
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert("Erro de conexão com o servidor ao alterar status.");
    }
}

function abrirDetalhesDaVenda(idVenda) {
    let venda = todasAsVendasCarregadas.find(v => v.id === idVenda);

    if (!venda && typeof clientesCarregados !== 'undefined') {
        const cliente = clientesCarregados.find(c => c.notas && c.notas.some(n => n.id === idVenda));
        if (cliente) {
            const notaCliente = cliente.notas.find(n => n.id === idVenda);
            venda = {
                id: notaCliente.id,
                nomeCliente: cliente.nomeCompleto,
                dataEmissao: notaCliente.dataEmissao,
                status: notaCliente.status,
                valorTotal: notaCliente.valorTotal,
                itens: notaCliente.itens
            };
        }
    }

    if (!venda) { alert("Detalhes não encontrados."); return; }

    document.getElementById('detalheVendaId').textContent = venda.id;
    document.getElementById('detalheVendaCliente').textContent = venda.nomeCliente || 'Cliente Padrão';
    document.getElementById('detalheVendaData').textContent = formatarData(venda.dataEmissao);

    let badgeClass = 'bg-secondary';
    if (venda.status === 'PAGO' || venda.status === 'CONCLUÍDO') badgeClass = 'bg-success';
    if (venda.status === 'PENDENTE' || venda.status === 'FIADO') badgeClass = 'bg-warning text-dark';

    const spanStatus = document.getElementById('detalheVendaStatus');
    spanStatus.innerHTML = `${venda.status || 'PENDENTE'} <i class="fas fa-exchange-alt ms-1"></i>`;
    spanStatus.className = `badge ${badgeClass} cursor-pointer shadow-sm`;
    spanStatus.onclick = () => alternarStatusVenda(venda.id);
    spanStatus.title = "Clique para alternar o status";

    const valorTotal = venda.valorTotal ? venda.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
    document.getElementById('detalheVendaTotal').textContent = valorTotal;

    const tabelaItens = document.getElementById('tabelaDetalheItens');
    tabelaItens.innerHTML = '';

    if (venda.itens && venda.itens.length > 0) {
        venda.itens.forEach(item => {
            const precoFormatado = item.precoUnitarioSnapshot ? item.precoUnitarioSnapshot.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
            const subtotalFormatado = item.subTotal ? item.subTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
            const nomeProd = item.produtoNome || (item.produto ? item.produto.nome : `Produto #${item.produtoId}`);

            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${nomeProd}</td><td>${item.quantidade}</td><td>${precoFormatado}</td><td><strong>${subtotalFormatado}</strong></td>`;
            tabelaItens.appendChild(tr);
        });
    } else {
        tabelaItens.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum item registrado nesta venda.</td></tr>';
    }

    const modalElement = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalhesVenda'));
    modalElement.show();
}

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


async function registrarVenda() {
    const clienteBuscaInput = document.getElementById('clienteBusca').value;
    const dataEmissaoInput = document.getElementById('dataEmissaoNova').value;
    const dataPagamentoInput = document.getElementById('dataPagamento').value;
    const observacoesInput = document.getElementById('observacoesNova').value;

    if (!clienteBuscaInput) {
        alert("Por favor, selecione um Cliente.");
        return;
    }
    if (!dataEmissaoInput) {
        alert("A Data de Emissão é obrigatória.");
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
        dataEmissao: dataEmissaoInput, // Enviando a data escolhida
        dataPagamento: dataPagamentoInput ? dataPagamentoInput : null,
        observacoes: observacoesInput, // Enviando as observações
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
            if(typeof carregarClientes === 'function') carregarClientes();
            if(typeof carregarProdutos === 'function') carregarProdutos();
        } else {
            alert("Erro ao registrar venda. Verifique os dados e o estoque.");
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert("Erro de conexão com o servidor.");
    }
}

function formatarData(dataString) {
    if (!dataString) return '--/--/----';
    const partes = dataString.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataString;
}


function abrirModalEdicao(idVenda) {
    const venda = todasAsVendasCarregadas.find(v => v.id === idVenda);
    if(!venda) return;

    document.getElementById('editVendaId').textContent = venda.id;
    document.getElementById('editDataEmissao').value = venda.dataEmissao;
    document.getElementById('editDataVencimento').value = venda.dataVencimento || '';
    document.getElementById('editStatus').value = (venda.status === 'CONCLUÍDO') ? 'PAGO' : venda.status;
    document.getElementById('editObservacoes').value = venda.observacoes || '';

    const modalElement = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarVenda'));
    modalElement.show();
}

async function salvarEdicaoVenda() {
    const id = document.getElementById('editVendaId').textContent;
    const dados = {
        dataEmissao: document.getElementById('editDataEmissao').value,
        dataPagamento: document.getElementById('editDataVencimento').value || null, // Usamos dataPagamento para manter seu padrão
        observacoes: document.getElementById('editObservacoes').value,
        status: document.getElementById('editStatus').value
    };

    try {
        const resposta = await fetch(`/vendas/atualizar_venda/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (resposta.ok) {
            alert("Nota atualizada com sucesso!");
            bootstrap.Modal.getInstance(document.getElementById('modalEditarVenda')).hide();
            carregarVendas();
        } else {
            alert("Erro ao atualizar a venda.");
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Falha de conexão com o servidor.");
    }
}

// Corrigido para não usar Body no Delete, e sim a URL direta (vendaId)
window.deletarVenda = async function(vendaId, origem = 'vendas', clienteId = null) {
    const confirmacao = confirm('ATENÇÃO: Deseja realmente excluir esta venda? O estoque dos produtos será restaurado e esta ação não poderá ser desfeita.');
    if (!confirmacao) return;

    try {
        const response = await fetch(`/vendas/${vendaId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Venda excluída com sucesso!');
            if (origem === 'vendas') {
                carregarVendas();
                if(typeof carregarClientes === 'function') carregarClientes();
            }
            if (origem === 'cliente' && clienteId) {
                if(typeof carregarClientes === 'function') await carregarClientes();
                carregarVendas();
                // Se a função existir na tela, recarrega a janela do cliente
                if(typeof abrirModalListaNotas === 'function') abrirModalListaNotas(clienteId);
            }
        } else {
            alert(`Erro ao excluir venda.`);
        }
    } catch (error) {
        console.error('Erro na requisição DELETE:', error);
        alert('Erro de conexão ao tentar excluir a venda.');
    }
}