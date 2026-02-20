package com.deposito.construcao_manager.dto;

import com.deposito.construcao_manager.domain.Cliente;
import com.deposito.construcao_manager.domain.Nota;
import lombok.Value;


@Value
public class DadosClienteSaidaDTO {

    Long id;
    String nomeCompleto;
    String cpf;
    String email;
    String endereco;
    String celular;
    Nota nota;

    public static DadosClienteSaidaDTO from(Cliente clienteSalvo) {

        return new DadosClienteSaidaDTO(
                clienteSalvo.getId(),
                clienteSalvo.getNomeCompleto(),
                clienteSalvo.getCpf(),
                clienteSalvo.getEndereco(),
                clienteSalvo.getCelular(),
                clienteSalvo.getEmail(),
                clienteSalvo.getNota()

        );
    }
}


