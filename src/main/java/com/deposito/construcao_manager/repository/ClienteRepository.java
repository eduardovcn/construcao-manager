package com.deposito.construcao_manager.repository;

import com.deposito.construcao_manager.domain.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, String> {
        List<Cliente> findByNomeContainingIgnoreCase(String nome);

       Optional <Cliente> findById(Long clienteId);
}
