package com.deposito.construcao_manager.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;


@Entity
@Getter @Setter
public class ItemNota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "nota_id")
    private Nota nota;

    private Integer quantidade;
    private BigDecimal precoUnitarioSnapshot;

    public BigDecimal getSubTotal() {
        return precoUnitarioSnapshot.multiply(BigDecimal.valueOf(quantidade));
    }


}
