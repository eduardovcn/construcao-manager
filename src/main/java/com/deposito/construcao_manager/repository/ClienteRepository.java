package com.deposito.construcao_manager.repository;

import com.deposito.construcao_manager.domain.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, String> {
        List<Cliente> findByNomeContainingIgnoreCase(String nome);
}
