package com.deposito.construcao_manager.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class NotaEntradaDTO {
    private Long clienteId;
    private LocalDate dataEmissao;   // NOVO: Data manual
    private LocalDate dataPagamento; // MANTIDO o seu original
    private String observacoes;      // NOVO: Campo de texto
    private String status;           // NOVO: Para usar na edição
    private List<ItemEntradaDTO> itens;
}