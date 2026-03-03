package com.deposito.construcao_manager.dto;

import com.deposito.construcao_manager.domain.Cliente;
import com.deposito.construcao_manager.domain.Nota;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@JsonPropertyOrder({
        "id",
        "nomeCompleto",
        "cpf",
        "celular",
        "email",
        "endereco",
        "nota"
})
public class DadosClienteSaidaDTO {

    private Long id;
    private String nomeCompleto;
    private String cpf;
    private String email;
    private String endereco;
    private String celular;
    private Nota nota;

    public static DadosClienteSaidaDTO from(Cliente clienteSalvo) {

        DadosClienteSaidaDTO dto = new DadosClienteSaidaDTO();
        dto.setId(clienteSalvo.getId());
        dto.setNomeCompleto(clienteSalvo.getNomeCompleto());
        dto.setCpf(clienteSalvo.getCpf());
        dto.setEndereco(clienteSalvo.getEndereco());
        dto.setCelular(clienteSalvo.getCelular());
        dto.setEmail(clienteSalvo.getEmail());
        dto.setNota(clienteSalvo.getNota());

        return dto;
    }
}


