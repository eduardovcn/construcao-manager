package com.deposito.construcao_manager.repository;

import com.deposito.construcao_manager.domain.Nota;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotaRepository extends JpaRepository<Nota, Long> {
        List<Nota> findByClienteId(Long clienteId);
}
