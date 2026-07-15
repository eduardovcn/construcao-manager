package com.deposito.construcao_manager.controller;

import com.deposito.construcao_manager.dto.DadosProdutoEntradaDTO;
import com.deposito.construcao_manager.dto.DadosProdutoSaidaDTO;
import com.deposito.construcao_manager.service.GestaoProdutoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/produtos")
@RequiredArgsConstructor
public class GestaoProdutoController {


    private final GestaoProdutoService produtoService;

    @PostMapping("/cadastrar_produto")
    public ResponseEntity<DadosProdutoSaidaDTO> cadastrarProduto(@RequestBody DadosProdutoEntradaDTO dadosProdutoEntradaDTO) {
        DadosProdutoSaidaDTO produtoCriado = produtoService.criarProduto(dadosProdutoEntradaDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoCriado);
    }

    @GetMapping("/listar_produtos")
    public ResponseEntity<Page<DadosProdutoSaidaDTO>> listarProdutos(@PageableDefault(size = 10, sort = {"nome"}) Pageable pageable) {
        Page<DadosProdutoSaidaDTO> produtos = produtoService.listarProdutos(pageable);
        return ResponseEntity.status(HttpStatus.CREATED).body(produtos);
    }

    @PatchMapping("/atualizar_produto/{id}")
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
