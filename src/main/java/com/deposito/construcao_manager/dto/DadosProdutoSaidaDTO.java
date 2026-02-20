package com.deposito.construcao_manager.dto;

import java.math.BigDecimal;

import com.deposito.construcao_manager.domain.Produto;
import lombok.Data;

@Data
public class DadosProdutoSaidaDTO {

    private String nome;
    private BigDecimal preco;
    private Integer quantidadeEstoque;

    public static DadosProdutoSaidaDTO from(Produto produtoSalvo) {
        DadosProdutoSaidaDTO produto_final = new DadosProdutoSaidaDTO();
        produto_final.setNome(produtoSalvo.getNome());
        produto_final.setPreco(produtoSalvo.getPreco());
        produto_final.setQuantidadeEstoque(produtoSalvo.getQuantidadeEstoque());
        return produto_final;
    }
}
