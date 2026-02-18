package com.deposito.construcao_manager.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

// DTO para representar os dados de entrada ao criar ou atualizar uma nota, contendo o ID do cliente, a data de pagamento e a lista de itens
@Data
public class NotaEntradaDTO {

    private Long clienteId;
    private LocalDate dataPagamento;
    private List<ItemEntradaDTO> itens;
}
