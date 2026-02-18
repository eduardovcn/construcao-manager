package com.deposito.construcao_manager.dto;

import lombok.Data;

// DTO para representar os itens de uma nota, contendo o ID do produto e a quantidade solicitada.
@Data
public class ItemEntradaDTO {

    private Long produtoId;
    private Integer quantidade;

}
