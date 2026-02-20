package com.deposito.construcao_manager.controller;

import com.deposito.construcao_manager.dto.DadosProdutoEntradaDTO;
import com.deposito.construcao_manager.dto.DadosProdutoSaidaDTO;
import com.deposito.construcao_manager.service.GestaoProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/produtos")
public class GestaoProdutoController {

    @Autowired
    private GestaoProdutoService produtoService;

    @PostMapping("/criar_produto")
    public ResponseEntity<DadosProdutoSaidaDTO> criarProduto(@RequestBody DadosProdutoEntradaDTO dadosProdutoEntradaDTO) {
        DadosProdutoSaidaDTO produtoCriado = produtoService.criarProduto(dadosProdutoEntradaDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoCriado);
    }

    @GetMapping("/listar_produtos")
    public ResponseEntity<List<DadosProdutoSaidaDTO>> listarProdutos() {
        List<DadosProdutoSaidaDTO> produtos = produtoService.listarProdutos();
        return ResponseEntity.status(HttpStatus.CREATED).body(produtos);
    }

    @PostMapping("/atualizar_produto/{id}")
    public ResponseEntity<DadosProdutoSaidaDTO> atualizarProduto(@PathVariable Long id, @RequestBody DadosProdutoEntradaDTO dadosProdutoEntradaDTO) {
        DadosProdutoSaidaDTO produtoAtualizado = produtoService.atualizarProduto(id, dadosProdutoEntradaDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoAtualizado);
    }

    @DeleteMapping("/deletar_produto/{id}")
    public ResponseEntity<Void> deletarProduto(@PathVariable Long id) {
        produtoService.deletarProduto(id);
        return ResponseEntity.noContent().build();
    }

}
