package com.deposito.construcao_manager.service;

import com.deposito.construcao_manager.domain.*;
import com.deposito.construcao_manager.dto.*;
import com.deposito.construcao_manager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class GestaoClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional
    public DadosClienteSaidaDTO cadastrarCliente(DadosClienteEntradaDTO clienteEntradaDTO) {
        Cliente cliente = new Cliente();
        cliente.setNomeCompleto(clienteEntradaDTO.getNomeCompleto());
        cliente.setCpf(clienteEntradaDTO.getCpf());
        cliente.setEmail(clienteEntradaDTO.getEmail());
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

    @Transactional
    public Page<DadosClienteSaidaDTO> listarClientes(Pageable pageable) {
        Page<Cliente> clientes = clienteRepository.findAll(pageable);
        return clientes.map(DadosClienteSaidaDTO::from);
    }

    @Transactional
    public DadosClienteSaidaDTO atualizarCliente(Long id, DadosClienteEntradaDTO clienteEntradaDTO) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));

        if (clienteEntradaDTO.getNomeCompleto() != null) {
            cliente.setNomeCompleto(clienteEntradaDTO.getNomeCompleto());
        }
        if (clienteEntradaDTO.getCpf() != null) {
            cliente.setCpf(clienteEntradaDTO.getCpf());
        }
        if (clienteEntradaDTO.getEmail() != null) {
            cliente.setEmail(clienteEntradaDTO.getEmail());
        }
        if (clienteEntradaDTO.getEndereco() != null) {
            cliente.setEndereco(clienteEntradaDTO.getEndereco());
        }
        if (clienteEntradaDTO.getCelular() != null) {
            cliente.setCelular(clienteEntradaDTO.getCelular());
        }

        Cliente clienteAtualizado = clienteRepository.save(cliente);

        return DadosClienteSaidaDTO.from(clienteAtualizado);
    }

    @Transactional
    public void inativarCliente(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));
        cliente.setAtivo(false);
        clienteRepository.save(cliente);

    }

    @Transactional
    public void reativarCliente(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));
        cliente.setAtivo(true);
        clienteRepository.save(cliente);
    }

}
