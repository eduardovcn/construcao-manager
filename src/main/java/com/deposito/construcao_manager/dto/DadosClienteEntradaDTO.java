package com.deposito.construcao_manager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class DadosClienteEntradaDTO {

    @NotBlank(message = "Nome é obrigatório")
    private String nomeCompleto;

    private String cpf;
    private String email;
    private String endereco;
    private String celular;

}


