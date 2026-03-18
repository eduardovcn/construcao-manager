let clientesCarregados = [];

// ======================= LISTAR CLIENTES =======================
async function carregarClientes() {
    const tabelaClientes = document.getElementById('tabelaClientes');
    if (!tabelaClientes) return;

    tabelaClientes.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Carregando clientes...</td></tr>';

    try {
        const resposta = await fetch('/clientes/listar_clientes');

        if (resposta.ok) {
            clientesCarregados = await resposta.json();
            tabelaClientes.innerHTML = '';

            if (clientesCarregados.length === 0) {
                tabelaClientes.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Nenhum cliente encontrado.</td></tr>`;
                return;
            }

            clientesCarregados.forEach(cliente => {
                const row = tabelaClientes.insertRow();

                row.insertCell(0).textContent = cliente.id;
                row.cells[0].classList.add('ps-4');
                row.insertCell(1).textContent = cliente.nomeCompleto || '-';
                row.insertCell(2).textContent = cliente.email || '-';
                row.insertCell(3).textContent = cliente.cpf || '-';
                row.insertCell(4).textContent = cliente.endereco || '-';
                row.insertCell(5).textContent = cliente.celular || '-';

                // Botão Editar
                let botoesHTML = `
                    <button class="btn btn-sm btn-info text-white me-1" title="Editar" data-bs-toggle="modal" data-bs-target="#modalAtualizarCliente" onclick="preencherModalAtualizarCliente(${cliente.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                `;

                // Botão para abrir o Modal com a LISTA de notas do cliente
                botoesHTML += `
                    <button class="btn btn-sm btn-outline-primary" title="Ver Notas" onclick="abrirModalListaNotas(${cliente.id})">
                        <i class="fas fa-list"></i> Notas
                    </button>
                `;

                row.insertCell(6).innerHTML = botoesHTML;
            });
        } else {
            tabelaClientes.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Erro ao carregar dados.</td></tr>`;
        }
    } catch (erro) {
        console.error('Erro:', erro);
        tabelaClientes.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Falha de conexão.</td></tr>`;
    }
}

// ======================= CADASTRAR CLIENTE =======================
async function registrarCliente() {
    const nomeInput = document.getElementById('nomeCompleto').value;
    const emailInput = document.getElementById('email').value;
    const cpfInput = document.getElementById('cpf').value;
    const enderecoInput = document.getElementById('endereco').value;
    const telefoneInput = document.getElementById('telefone').value;

    const clienteDTO = {
        nomeCompleto: nomeInput,
        email: emailInput,
        cpf: cpfInput,
        endereco: enderecoInput,
        celular: telefoneInput
    };

    try {
        const resposta = await fetch('/clientes/cadastrar_cliente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteDTO)
        });

        if (resposta.ok) {
            const clienteCriado = await resposta.json();
            alert(`Cliente registrado com sucesso! ID do Cliente: ${clienteCriado.id}`);

            const modalElement = document.getElementById('modalNovoCliente');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            document.getElementById('formCliente').reset();
            carregarClientes();
        } else {
            alert("Erro ao registrar cliente. Verifique os dados e tente novamente.");
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert("Erro de conexão com o servidor.");
    }
}

// ======================= ATUALIZAR CLIENTE =======================
function preencherModalAtualizarCliente(id) {
    document.getElementById('idAtualizar').value = id;
}

async function atualizarCliente() {
    const idInput = document.getElementById('idAtualizar').value.trim();
    const nomeInput = document.getElementById('nomeAtualizar').value.trim();
    const emailInput = document.getElementById('emailAtualizar').value.trim();
    const cpfInput = document.getElementById('cpfAtualizar').value.trim();
    const enderecoInput = document.getElementById('enderecoAtualizar').value.trim();
    const telefoneInput = document.getElementById('telefoneAtualizar').value.trim();

    if (!idInput) {
        alert("Por favor, informe o ID do cliente.");
        return;
    }

    const clienteDTO = {};
    if (nomeInput !== "") clienteDTO.nomeCompleto = nomeInput;
    if (emailInput !== "") clienteDTO.email = emailInput;
    if (cpfInput !== "") clienteDTO.cpf = cpfInput;
    if (enderecoInput !== "") clienteDTO.endereco = enderecoInput;
    if (telefoneInput !== "") clienteDTO.celular = telefoneInput;

    if (Object.keys(clienteDTO).length === 0) {
        alert("Preencha pelo menos um campo para atualizar.");
        return;
    }

    try {
        const resposta = await fetch(`/clientes/atualizar_cliente/${idInput}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteDTO)
        });

        if (resposta.ok) {
            alert("Cliente atualizado com sucesso!");

            const modalElement = document.getElementById('modalAtualizarCliente');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            document.getElementById('formAtualizarCliente').reset();
            carregarClientes();
        } else {
            alert("Erro ao atualizar. Verifique o ID e tente novamente.");
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert("Erro de conexão com o servidor.");
    }
}

// ======================= LISTAR TODAS AS NOTAS DO CLIENTE =======================
function abrirModalListaNotas(idCliente) {
    const cliente = clientesCarregados.find(c => c.id === idCliente);

    if (!cliente) return;

    const notas = cliente.notas || [];

    const corpoTabela = document.getElementById('corpoTabelaNotasLista');
    if (!corpoTabela) {
        console.error("HTML do modal de lista de notas não encontrado!");
        return;
    }

    corpoTabela.innerHTML = '';

    if (notas.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhuma nota registrada para este cliente.</td></tr>';
    } else {
        notas.forEach(nota => {
            const dataFormatada = nota.dataEmissao ? nota.dataEmissao.split('-').reverse().join('/') : '-';

            // LÓGICA DO VENCIMENTO NO MODAL DO CLIENTE
            const vencimentoText = (nota.status === 'PENDENTE' && nota.dataVencimento) ? nota.dataVencimento.split('-').reverse().join('/') : '-';
            const corVencimento = nota.status === 'PENDENTE' ? 'text-danger fw-bold' : 'text-muted';

            const valorTotal = nota.valorTotal ? nota.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
            const status = nota.status || 'CONCLUÍDO';

            corpoTabela.innerHTML += `
                <tr>
                    <td>#${nota.id}</td>
                    <td>${dataFormatada}</td>
                    <td class="${corVencimento}">${vencimentoText}</td>
                    <td><span class="badge bg-success">${status}</span></td>
                    <td>${valorTotal}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" title="Ver Detalhes/Itens" onclick="abrirDetalhesDeUmaNota(${idCliente}, ${nota.id})">
                            <i class="fas fa-eye"></i> Ver Itens
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    const modalElement = new bootstrap.Modal(document.getElementById('modalListaNotasCliente'));
    modalElement.show();
}

// ======================= EXIBIR ITENS DE UMA NOTA ESPECÍFICA =======================
function abrirDetalhesDeUmaNota(idCliente, idNota) {
    const cliente = clientesCarregados.find(c => c.id === idCliente);
    if (!cliente || !cliente.notas) return;

    const nota = cliente.notas.find(n => n.id === idNota);
    if (!nota) return;

    const modalListaElement = document.getElementById('modalListaNotasCliente');
    const modalListaInstance = bootstrap.Modal.getInstance(modalListaElement);
    if(modalListaInstance) modalListaInstance.hide();

    document.getElementById('detalheVendaId').textContent = nota.id;
    document.getElementById('detalheVendaCliente').textContent = cliente.nomeCompleto;

    const dataFormatada = nota.dataEmissao ? nota.dataEmissao.split('-').reverse().join('/') : '-';
    document.getElementById('detalheVendaData').textContent = dataFormatada;

    const spanStatus = document.getElementById('detalheVendaStatus');
    spanStatus.textContent = nota.status || 'CONCLUÍDO';
    spanStatus.className = 'badge bg-success';

    const valorTotal = nota.valorTotal ? nota.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
    document.getElementById('detalheVendaTotal').textContent = valorTotal;

    const tabelaItens = document.getElementById('tabelaDetalheItens');
    tabelaItens.innerHTML = '';

    if (nota.itens && nota.itens.length > 0) {
        nota.itens.forEach(item => {
            const precoFormatado = item.precoUnitarioSnapshot ? item.precoUnitarioSnapshot.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
            const subtotalFormatado = item.subTotal ? item.subTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
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
        tabelaItens.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhuma venda registrada nesta nota.</td></tr>';
    }

    const modalDetalheElement = new bootstrap.Modal(document.getElementById('modalDetalhesVenda'));
    modalDetalheElement.show();
}