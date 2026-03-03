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

    public List<DadosClienteSaidaDTO> listarClientes() {
        List<Cliente> clientes = clienteRepository.findAll();
        return clientes.stream()
                .map(DadosClienteSaidaDTO::from)
                .toList();
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
    public void deletarCliente(Long id) {
        clienteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));
        clienteRepository.deleteById(id);

    }


}
