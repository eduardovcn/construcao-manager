package com.deposito.construcao_manager.controller;

import com.deposito.construcao_manager.domain.Cliente;
import com.deposito.construcao_manager.dto.DadosClienteEntradaDTO;
import com.deposito.construcao_manager.dto.DadosClienteSaidaDTO;
import com.deposito.construcao_manager.service.GestaoClienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clientes")

public class GestaoClienteController {

    @Autowired
    private GestaoClienteService gestaoClienteService;

    @PostMapping("/cadastrar_cliente")
    public ResponseEntity<DadosClienteSaidaDTO> cadastrarCliente(@Valid @RequestBody DadosClienteEntradaDTO clienteEntradaDTO) {
        DadosClienteSaidaDTO clienteSaidaDTO = gestaoClienteService.cadastrarCliente(clienteEntradaDTO);
        return ResponseEntity.ok(clienteSaidaDTO);
    }

    @GetMapping("/buscar_cliente/{id}")
    public ResponseEntity<DadosClienteSaidaDTO> obterClientePorId(@PathVariable Long id) {
        DadosClienteSaidaDTO clienteSaidaDTO = gestaoClienteService.obterClientePorId(id);
        if (clienteSaidaDTO != null) {
            return ResponseEntity.ok(clienteSaidaDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/listar_clientes")
    public ResponseEntity<List<DadosClienteSaidaDTO>> listarClientes() {
        List<DadosClienteSaidaDTO> clientes = gestaoClienteService.listarClientes();
        return ResponseEntity.ok(clientes);
    }

    @PatchMapping("/atualizar_cliente/{id}")
    public ResponseEntity<DadosClienteSaidaDTO> atualizarCliente(@PathVariable Long id, @RequestBody DadosClienteEntradaDTO clienteEntradaDTO) {
        DadosClienteSaidaDTO clienteAtualizado = gestaoClienteService.atualizarCliente(id, clienteEntradaDTO);
        if (clienteAtualizado != null) {
            return ResponseEntity.ok(clienteAtualizado);
        } else {
            return ResponseEntity.notFound().build();

        }
    }

    @DeleteMapping("/deletar_cliente/{id}")
    public ResponseEntity<Void> deletarCliente(@PathVariable Long id) {
        try {
            gestaoClienteService.deletarCliente(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

