package com.deposito.construcao_manager.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;



@Entity
@SQLDelete(sql = "UPDATE cliente SET ativo = false WHERE id = ?")
@SQLRestriction("ativo = true")
@Getter @Setter
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomeCompleto;
    private String celular;
    private String cpf;
    private String email;
    private String endereco;

    @Column(nullable = false)
    private boolean ativo = true;


    @OneToOne(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    private Nota nota;
}
