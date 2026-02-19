package com.deposito.construcao_manager.service;

import com.deposito.construcao_manager.domain.*;
import com.deposito.construcao_manager.dto.*;
import com.deposito.construcao_manager.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GestaoClienteService {

    @Autowired private ClienteRepository clienteRepository;

    @Transactional
    public DadosClienteSaidaDTO cadastrarCliente(DadosClienteEntradaDTO clienteEntradaDTO) {
        Cliente cliente = new Cliente();
        cliente.setNomeCompleto(clienteEntradaDTO.getNomeCompleto());
        cliente.setCpf(clienteEntradaDTO.getCpf());
        cliente.setEndereco(clienteEntradaDTO.getEndereco());
        cliente.setCelular(clienteEntradaDTO.getCelular());

        Cliente clienteSalvo = clienteRepository.save(cliente);
        return DadosClienteSaidaDTO.from(clienteSalvo);
    }

    @Transactional
    public DadosClienteSaidaDTO obterClientePorId(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));
        return DadosClienteSaidaDTO.from(cliente);
    }
}
