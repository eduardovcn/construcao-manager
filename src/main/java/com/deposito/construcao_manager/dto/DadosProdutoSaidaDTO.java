package com.deposito.construcao_manager.dto;

import java.math.BigDecimal;

import com.deposito.construcao_manager.domain.Produto;


public record DadosProdutoSaidaDTO(

    Long id,
    String nome,
    BigDecimal preco,
    Integer quantidadeEstoque
) {

    public static DadosProdutoSaidaDTO from(Produto produtoSalvo) {
        return new DadosProdutoSaidaDTO(
            produtoSalvo.getId(),
            produtoSalvo.getNome(),
            produtoSalvo.getPreco(),
            produtoSalvo.getQuantidadeEstoque()
        );
    }
}
