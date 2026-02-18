package com.deposito.construcao_manager.dto;

import com.deposito.construcao_manager.domain.ItemNota;
import com.deposito.construcao_manager.domain.Nota;
import com.deposito.construcao_manager.domain.Produto;
import com.deposito.construcao_manager.domain.Cliente;
import com.deposito.construcao_manager.domain.StatusPagamento;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotaSaidaDTO {

    private Long id;
    private ClienteResumoDTO cliente;
    private LocalDate dataEmissao;
    private LocalDate dataVencimento;
    private StatusPagamento status;
    private List<ItemNotaDTO> itens;
    private BigDecimal valorTotal;

    public static NotaSaidaDTO from(Nota nota) {
        if (nota == null) return null;
        NotaSaidaDTO dto = new NotaSaidaDTO();
        dto.setId(nota.getId());

        Cliente cliente = nota.getCliente();
        if (cliente != null) {
            dto.setCliente(new ClienteResumoDTO(cliente.getId(), cliente.getNomeCompleto()));
        }

        dto.setDataEmissao(nota.getDataEmissao());
        dto.setDataVencimento(nota.getDataVencimento());
        dto.setStatus(nota.getStatus());

        List<ItemNotaDTO> itens = nota.getItens()
                .stream()
                .map(ItemNotaDTO::from)
                .collect(Collectors.toList());
        dto.setItens(itens);

        dto.setValorTotal(nota.getValorTotal());

        return dto;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemNotaDTO {
        private Long id;
        private ProdutoResumoDTO produto;
        private Integer quantidade;
        private BigDecimal precoUnitarioSnapshot;
        private BigDecimal subTotal;

        public static ItemNotaDTO from(ItemNota item) {
            if (item == null) return null;
            Produto produto = item.getProduto();
            ProdutoResumoDTO prodDto = null;
            if (produto != null) {
                prodDto = new ProdutoResumoDTO(produto.getId(), produto.getNome(), produto.getPreco(), produto.getQuantidadeEstoque());
            }
            BigDecimal sub = item.getSubTotal();
            return new ItemNotaDTO(item.getId(), prodDto, item.getQuantidade(), item.getPrecoUnitarioSnapshot(), sub);
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProdutoResumoDTO {
        private Long id;
        private String nome;
        private BigDecimal preco;
        private Integer quantidadeEstoque;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClienteResumoDTO {
        private Long id;
        private String nomeCompleto;
    }
}
