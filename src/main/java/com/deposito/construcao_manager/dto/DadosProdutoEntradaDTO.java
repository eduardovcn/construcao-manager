package com.deposito.construcao_manager.dto;

import com.deposito.construcao_manager.domain.Produto;
import lombok.Data;
import java.math.BigDecimal;


@Data
public class DadosProdutoEntradaDTO {

    private String nome;
    private BigDecimal preco;
    private Integer quantidadeEstoque;

}
