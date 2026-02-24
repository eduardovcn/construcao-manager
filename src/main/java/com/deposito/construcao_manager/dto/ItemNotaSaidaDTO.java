package com.deposito.construcao_manager.dto;

import com.deposito.construcao_manager.domain.ItemNota;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
public class ItemNotaSaidaDTO {
    private Long id;
    private Long produtoId;
    private String produtoNome;
    private Integer quantidade;
    private BigDecimal precoUnitarioSnapshot;
    private BigDecimal subTotal;


    public static ItemNotaSaidaDTO from(ItemNota item) {
        ItemNotaSaidaDTO dto = new ItemNotaSaidaDTO();
        dto.setId(item.getId());

        // Proteção e extração dos dados do Produto
        if (item.getProduto() != null) {
            dto.setProdutoId(item.getProduto().getId());
            dto.setProdutoNome(item.getProduto().getNome());
        }

        dto.setQuantidade(item.getQuantidade());
        dto.setPrecoUnitarioSnapshot(item.getPrecoUnitarioSnapshot());
        dto.setSubTotal(item.getSubTotal());
        return dto;
    }

}