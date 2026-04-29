package com.deposito.construcao_manager.controller;

import com.deposito.construcao_manager.dto.NotaEntradaDTO;
import com.deposito.construcao_manager.dto.NotaSaidaDTO;
import com.deposito.construcao_manager.service.GestaoVendaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/vendas")
public class GestaoVendaController {


    private final GestaoVendaService service;

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

    @PatchMapping("/alternar_status/{id}")
    public ResponseEntity<Void> alternarStatus(@PathVariable Long id) {
        service.alternarStatusVenda(id);
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/atualizar_venda/{id}")
    public ResponseEntity<NotaSaidaDTO> atualizarVenda(@PathVariable Long id, @RequestBody NotaEntradaDTO dados) {
        NotaSaidaDTO atualizada = service.atualizarVenda(id, dados);
        return ResponseEntity.ok(atualizada);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarVenda(@PathVariable Long id) {
        service.deletarVenda(id);
        return ResponseEntity.noContent().build();
    }
}