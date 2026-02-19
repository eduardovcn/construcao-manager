package com.deposito.construcao_manager.controller;

import com.deposito.construcao_manager.dto.DadosClienteEntradaDTO;
import com.deposito.construcao_manager.dto.DadosClienteSaidaDTO;
import com.deposito.construcao_manager.service.GestaoClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clientes")
public class GestaoClienteController {

    @Autowired
    private GestaoClienteService gestaoClienteService;

    @PostMapping("/cadastrar_cliente")
    public ResponseEntity<DadosClienteSaidaDTO> cadastrarCliente(@RequestBody DadosClienteEntradaDTO clienteEntradaDTO) {
DadosClienteSaidaDTO clienteSaidaDTO = gestaoClienteService.cadastrarCliente(clienteEntradaDTO);
        return ResponseEntity.ok(clienteSaidaDTO);
    }

    @GetMapping("buscar_cliente/{id}")
    public ResponseEntity<DadosClienteSaidaDTO> obterClientePorId(@PathVariable Long id) {
        DadosClienteSaidaDTO clienteSaidaDTO = gestaoClienteService.obterClientePorId(id);
        if (clienteSaidaDTO != null) {
            return ResponseEntity.ok(clienteSaidaDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}