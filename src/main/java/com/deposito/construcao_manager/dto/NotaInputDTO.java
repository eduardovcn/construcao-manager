package com.deposito.construcao_manager.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class NotaInputDTO {

    private Long clienteId;
    private LocalDate dataPagamento;
    private List<ItemInputDTO> itens;
}
