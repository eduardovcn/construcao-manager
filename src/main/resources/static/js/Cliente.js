async function registrarCliente() {
    const nomeInput = document.getElementById('nomeCompleto').value;
    const emailInput = document.getElementById('email').value;
    const cpfInput = document.getElementById('cpf').value;
    const enderecoInput = document.getElementById('endereco').value;
    const telefoneInput = document.getElementById('telefone').value;

    if (!nomeInput || !emailInput || !cpfInput ||!enderecoInput || !telefoneInput) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }


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