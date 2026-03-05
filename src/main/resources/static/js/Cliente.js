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
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clienteDTO)
        });

        if (resposta.ok) {
            const clienteCriado = await resposta.json();
            alert(`Cliente registrado com sucesso! ID do Cliente: ${clienteCriado.id}`);

            const modalElement = document.getElementById('modalNovoCliente');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            document.getElementById('formCliente').reset();
        } else {
            alert("Erro ao registrar cliente. Verifique os dados e tente novamente.");
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert("Erro de conexão com o servidor.");
    }
}

// Variável para guardar os clientes e evitar fazer várias requisições ao Java
let clientesCarregados = [];

async function carregarClientes() {
    const telaVendas = document.querySelector('.card.shadow-sm.border-0:not(#telaClientes)');
    const telaClientes = document.getElementById('telaClientes');

    if (telaVendas) telaVendas.classList.add('d-none');
    if (telaClientes) telaClientes.classList.remove('d-none');

    try {
        const resposta = await fetch('/clientes/listar_clientes');
        if (resposta.ok) {
            // Guarda a resposta na nossa variável
            clientesCarregados = await resposta.json();
            const tabelaClientes = document.getElementById('tabelaClientes');

            if (!tabelaClientes) return;

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

                // Como a "nota" traz as vendas, colocamos um botão que passa o ID do cliente
                let botaoNota = '';
                if (cliente.nota && cliente.nota.id) {
                    botaoNota = `<button class="btn btn-sm btn-outline-primary" onclick="abrirNotaDoCliente(${cliente.id})">
                                    <i class="fas fa-file-invoice"></i> Nota #${cliente.nota.id}
                                 </button>`;
                } else {
                    botaoNota = '<span class="text-muted small">Sem nota</span>';
                }
                row.insertCell(6).innerHTML = botaoNota;
            });
        } else {
            alert("Erro ao carregar clientes.");
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert("Erro de conexão com o servidor.");
    }
}

//  abre o modal já usando os dados que vieram junto com o cliente
function abrirNotaDoCliente(idCliente) {
    // Busca o cliente na lista que já está carregada
    const cliente = clientesCarregados.find(c => c.id === idCliente);

    if (!cliente || !cliente.nota) {
        alert("Nota não encontrada para este cliente.");
        return;
    }

    const nota = cliente.nota;

    // Preenche o Modal
    document.getElementById('detalheVendaId').textContent = nota.id;
    document.getElementById('detalheVendaCliente').textContent = cliente.nomeCompleto;

    const dataFormatada = nota.dataEmissao ? nota.dataEmissao.split('-').reverse().join('/') : '-';
    document.getElementById('detalheVendaData').textContent = dataFormatada;

    document.getElementById('detalheVendaStatus').textContent = nota.status || 'CONCLUÍDO';

    const valorTotal = nota.valorTotal ? nota.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
    document.getElementById('detalheVendaTotal').textContent = valorTotal;

    const tabelaItens = document.getElementById('tabelaDetalheItens');
    tabelaItens.innerHTML = '';

    // Se a nota tem uma lista de itens (vendas), preenche aqui
    if (nota.itens && nota.itens.length > 0) {
        nota.itens.forEach(item => {
            const precoFormatado = item.precoUnitarioSnapshot ? item.precoUnitarioSnapshot.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
            const subtotalFormatado = item.subTotal ? item.subTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Produto #${item.produto ? item.produto.id : 'N/A'}</td>
                <td>${item.quantidade}</td>
                <td>${precoFormatado}</td>
                <td><strong>${subtotalFormatado}</strong></td>
            `;
            tabelaItens.appendChild(tr);
        });
    } else {
        tabelaItens.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhuma venda registrada nesta nota.</td></tr>';
    }

    // Abre o Modal
    const modalElement = new bootstrap.Modal(document.getElementById('modalDetalhesVenda'));
    modalElement.show();
}

async function atualizarCliente() {

    const idInput = document.getElementById('idAtualizar').value.trim();
    const nomeInput = document.getElementById('nomeAtualizar').value.trim();
    const emailInput = document.getElementById('emailAtualizar').value.trim();
    const cpfInput = document.getElementById('cpfAtualizar').value.trim();
    const enderecoInput = document.getElementById('enderecoAtualizar').value.trim();
    const telefoneInput = document.getElementById('telefoneAtualizar').value.trim();

    if (!idInput) {
        alert("Por favor, informe o ID do cliente que deseja atualizar.");
        return;
    }


    const clienteDTO = {};

    // Só vai adicionar se o campo estiver preenchido
    if (nomeInput !== "") clienteDTO.nomeCompleto = nomeInput;
    if (emailInput !== "") clienteDTO.email = emailInput;
    if (cpfInput !== "") clienteDTO.cpf = cpfInput;
    if (enderecoInput !== "") clienteDTO.endereco = enderecoInput;
    if (telefoneInput !== "") clienteDTO.celular = telefoneInput;

    // Verifica se o usuário preencheu pelo menos uma coisa
    if (Object.keys(clienteDTO).length === 0) {
        alert("Preencha pelo menos um campo para atualizar.");
        return;
    }

    try {
        const resposta = await fetch(`/clientes/atualizar_cliente/${idInput}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clienteDTO)
        });

        if (resposta.ok) {
            alert("Cliente atualizado com sucesso!");

            // Fecha o modal
            const modalElement = document.getElementById('modalAtualizarCliente');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            // Limpa o formulário e recarrega a tabela na hora
            document.getElementById('formAtualizarCliente').reset();
            carregarClientes();
        } else {
            alert("Erro ao atualizar. Verifique se o ID existe e tente novamente.");
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert("Erro de conexão com o servidor.");
    }
}


