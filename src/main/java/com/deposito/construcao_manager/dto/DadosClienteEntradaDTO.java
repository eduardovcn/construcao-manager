package com.deposito.construcao_manager.dto;

import lombok.Data;

@Data
public class DadosClienteEntradaDTO {

    private String nomeCompleto;
    private String cpf;
    private String email;
    private String endereco;
    private String celular;
}
