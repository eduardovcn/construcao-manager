package com.deposito.construcao_manager.controller;

import com.deposito.construcao_manager.dto.NotaEntradaDTO;
import com.deposito.construcao_manager.dto.NotaSaidaDTO;
import com.deposito.construcao_manager.service.GestaoVendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vendas")
public class GestaoVendaController {

    @Autowired
    private GestaoVendaService service;

    @PostMapping("/cadastrar_venda")
    public ResponseEntity<NotaSaidaDTO> criarVenda(@RequestBody NotaEntradaDTO notaEntradaDTO) {
        NotaSaidaDTO notaSaidaDTO = service.cadastrarVenda(notaEntradaDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(notaSaidaDTO);
    }

    @GetMapping("/listar_vendas")
    public ResponseEntity<List<NotaSaidaDTO>> listarVendas() {
        List<NotaSaidaDTO> listaDeVendas = service.listarTodasVendas();
        return ResponseEntity.status(HttpStatus.OK).body(listaDeVendas);
    }

    // NOVA ROTA PARA ALTERAR O STATUS
    @PatchMapping("/alternar_status/{id}")
    public ResponseEntity<Void> alternarStatus(@PathVariable Long id) {
        service.alternarStatusVenda(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/deletar_venda")
    public ResponseEntity<Void> deletarVenda(@RequestBody Long id) {
        service.deletarVenda(id);
        return ResponseEntity.noContent().build();
    }
}