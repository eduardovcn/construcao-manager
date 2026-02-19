package com.deposito.construcao_manager.controller;

import com.deposito.construcao_manager.dto.NotaEntradaDTO;
import com.deposito.construcao_manager.dto.NotaSaidaDTO;
import com.deposito.construcao_manager.service.GestaoVendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/vendas")
public class GestaoVendaController {

    @Autowired
    private GestaoVendaService service;

    @PostMapping("/cadastrar_venda")
    public ResponseEntity<NotaSaidaDTO> criarVenda(@RequestBody NotaEntradaDTO notaEntradaDTO) {
        NotaSaidaDTO notaSaidaDTO = service.cadastrarVenda(notaEntradaDTO);
        return ResponseEntity.ok(notaSaidaDTO);
    }
}
