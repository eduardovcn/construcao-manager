package com.deposito.construcao_manager.service;

import com.deposito.construcao_manager.domain.Produto;
import com.deposito.construcao_manager.dto.DadosProdutoEntradaDTO;
import com.deposito.construcao_manager.dto.DadosProdutoSaidaDTO;
import com.deposito.construcao_manager.repository.ProdutoRepository;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;



@Service
public class GestaoProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    public DadosProdutoSaidaDTO criarProduto(DadosProdutoEntradaDTO dadosProdutoEntradaDTO) {

        Produto novoProduto = new Produto(dadosProdutoEntradaDTO.getNome(), dadosProdutoEntradaDTO.getPreco(), dadosProdutoEntradaDTO.getQuantidadeEstoque());
        Produto produtoSalvo = produtoRepository.save(novoProduto);
        return DadosProdutoSaidaDTO.from(produtoSalvo);
    }

    public List<DadosProdutoSaidaDTO> listarProdutos() {
        java.util.List<Produto> produtos = produtoRepository.findAll();
        java.util.List<DadosProdutoSaidaDTO> produtosDTO = new ArrayList<>();
        for (Produto produto : produtos) {
            produtosDTO.add(DadosProdutoSaidaDTO.from(produto));
        }
        return produtosDTO;
    }

    public DadosProdutoSaidaDTO atualizarProduto(Long id, DadosProdutoEntradaDTO dadosProdutoEntradaDTO) {
        Produto produtoExistente = produtoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        produtoExistente.setNome(dadosProdutoEntradaDTO.getNome());
        produtoExistente.setPreco(dadosProdutoEntradaDTO.getPreco());
        produtoExistente.setQuantidadeEstoque(dadosProdutoEntradaDTO.getQuantidadeEstoque());

        Produto produtoAtualizado = produtoRepository.save(produtoExistente);
        return DadosProdutoSaidaDTO.from(produtoAtualizado);
    }

    public void deletarProduto(Long id) {
        if (!produtoRepository.existsById(id)) {
            throw new IllegalArgumentException("Produto não encontrado");
        }
        produtoRepository.deleteById(id);
    }

}
