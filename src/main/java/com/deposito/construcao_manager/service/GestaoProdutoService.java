package com.deposito.construcao_manager.service;

import com.deposito.construcao_manager.domain.Produto;
import com.deposito.construcao_manager.dto.DadosProdutoEntradaDTO;
import com.deposito.construcao_manager.dto.DadosProdutoSaidaDTO;
import com.deposito.construcao_manager.repository.ProdutoRepository;
import lombok.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;



@RequiredArgsConstructor
@Service
public class GestaoProdutoService {


    private final ProdutoRepository produtoRepository;

    public DadosProdutoSaidaDTO criarProduto(DadosProdutoEntradaDTO dadosProdutoEntradaDTO) {

        Produto novoProduto = new Produto(dadosProdutoEntradaDTO.getNome(), dadosProdutoEntradaDTO.getPreco(), dadosProdutoEntradaDTO.getQuantidadeEstoque());
        Produto produtoSalvo = produtoRepository.save(novoProduto);
        return DadosProdutoSaidaDTO.from(produtoSalvo);
    }

    public Page<DadosProdutoSaidaDTO> listarProdutos(Pageable pageable) {
        Page<Produto> produtosPaginados = produtoRepository.findAll(pageable);

        return produtosPaginados.map(DadosProdutoSaidaDTO::from);
    }

    public DadosProdutoSaidaDTO atualizarProduto(Long id, DadosProdutoEntradaDTO dadosProdutoEntradaDTO) {
        Produto produtoExistente = produtoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        if (dadosProdutoEntradaDTO.getNome() != null) {
            produtoExistente.setNome(dadosProdutoEntradaDTO.getNome());
        }
        if (dadosProdutoEntradaDTO.getPreco() != null) {
            produtoExistente.setPreco(dadosProdutoEntradaDTO.getPreco());
        }
        if (dadosProdutoEntradaDTO.getQuantidadeEstoque() != null) {
            produtoExistente.setQuantidadeEstoque(dadosProdutoEntradaDTO.getQuantidadeEstoque());
        }

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
