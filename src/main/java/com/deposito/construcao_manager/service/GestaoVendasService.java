package com.deposito.construcao_manager.service;

import com.deposito.construcao_manager.domain.*;
import com.deposito.construcao_manager.repository.*;
import com.deposito.construcao_manager.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class GestaoVendasService {

    @Autowired private ProdutoRepository produtoRepository;
    @Autowired private ClienteRepository clienteRepository;
    @Autowired private NotaRepository notaRepository;

    @Transactional
    public NotaSaidaDTO cadastrarVenda(NotaEntradaDTO dadosVenda) {
        Cliente cliente = clienteRepository.findById((dadosVenda.getClienteId()))
                .orElseThrow(()-> new IllegalArgumentException("Cliente não encontrado"));

        Nota nota = new Nota();
        nota.setCliente(cliente);

        if (dadosVenda.getDataPagamento() != null && dadosVenda.getDataPagamento().isAfter(LocalDate.now())) {
            nota.setStatus(StatusPagamento.PENDENTE);
            nota.setDataVencimento(dadosVenda.getDataPagamento());
        } else {
            nota.setStatus(StatusPagamento.PAGO);
            nota.setDataVencimento(LocalDate.now());
        }

        for (ItemEntradaDTO itemDto : dadosVenda.getItens()) {
            Produto produto = produtoRepository.findById(itemDto.getProdutoId())
                    .orElseThrow(() -> new IllegalArgumentException("Produto ID " + itemDto.getProdutoId() + " não encontrado"));

            produto.baixarEstoque(itemDto.getQuantidade());
            produtoRepository.save(produto);

            ItemNota itemNota = new ItemNota();
            itemNota.setProduto(produto);
            itemNota.setQuantidade(itemDto.getQuantidade());
            itemNota.setPrecoUnitarioSnapshot(produto.getPreco()); // Congela preço

            nota.adicionarItem(itemNota); // Adiciona e calcula total


        }

        Nota notaSalva = notaRepository.save(nota);
        return NotaSaidaDTO.from(notaSalva);

    }
}
