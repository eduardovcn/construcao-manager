package com.deposito.construcao_manager.dto;

import com.deposito.construcao_manager.domain.Nota;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Setter
@Getter
public class NotaSaidaDTO {

    private Long id;
    private Long clienteId;
    private String nomeCliente;
    private LocalDate dataEmissao;
    private LocalDate dataVencimento;
    private String status;
    private BigDecimal valorTotal;


    private List<ItemNotaSaidaDTO> itens;


    public static NotaSaidaDTO from(Nota nota) {
        NotaSaidaDTO dto = new NotaSaidaDTO();
        dto.setId(nota.getId());

        // Proteção e extração dos dados do Cliente
        if (nota.getCliente() != null) {
            dto.setClienteId(nota.getCliente().getId());
            dto.setNomeCliente(nota.getCliente().getNomeCompleto());
        } else {
            dto.setNomeCliente("Cliente Não Informado");
        }

        dto.setDataEmissao(nota.getDataEmissao());
        dto.setDataVencimento(nota.getDataVencimento());
        dto.setStatus(nota.getStatus() != null ? nota.getStatus().name() : "PAGO");
        dto.setValorTotal(nota.getValorTotal());

        // Converte a lista de entidades ItemNota para DTOs
        if (nota.getItens() != null) {
            dto.setItens(nota.getItens().stream()
                    .map(ItemNotaSaidaDTO::from)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

}