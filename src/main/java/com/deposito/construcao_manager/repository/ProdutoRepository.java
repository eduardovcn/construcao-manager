package com.deposito.construcao_manager.repository;

import com.deposito.construcao_manager.domain.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, String> {
        List<Produto> findByNomeContainingIgnoreCase(String nome);
}
