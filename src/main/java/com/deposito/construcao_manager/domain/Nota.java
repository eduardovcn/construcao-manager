package com.deposito.construcao_manager.domain;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;



@Entity
@Getter @Setter
public class Nota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    private LocalDate dataEmissao = LocalDate.now();
    private LocalDate dataVencimento;

    @Enumerated(EnumType.STRING)
    private StatusPagamento status;

    //Se salvar a nota, os itens relacionados também serão salvos. Se excluir a nota, os itens relacionados também serão excluídos.
    @OneToMany(mappedBy = "nota", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemNota> itens = new ArrayList<>();

    private BigDecimal valorTotal = BigDecimal.ZERO;

    public void adicionarItem(ItemNota item){
        this.itens.add(item);
        item.setNota(this);
        this.valorTotal = this.valorTotal.add(item.getSubTotal());
    }
}
