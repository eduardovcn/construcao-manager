package com.deposito.construcao_manager.service;

import com.deposito.construcao_manager.domain.*;
import com.deposito.construcao_manager.repository.*;
import com.deposito.construcao_manager.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GestaoVendaService {

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
            itemNota.setPrecoUnitarioSnapshot(produto.getPreco());

            nota.adicionarItem(itemNota);
        }

        Nota notaSalva = notaRepository.save(nota);
        return NotaSaidaDTO.from(notaSalva);
    }

    @Transactional(readOnly = true)
    public List<NotaSaidaDTO> listarTodasVendas() {
        List<Nota> notas = notaRepository.findAll();

        return notas.stream()
                .map(NotaSaidaDTO::from)
                .collect(Collectors.toList());
    }

    // NOVO MÉTODO PARA ALTERAR O STATUS
    @Transactional
    public void alternarStatusVenda(Long id) {
        Nota nota = notaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Venda não encontrada"));

        // Inverte o status atual
        if (nota.getStatus() == StatusPagamento.PAGO) {
            nota.setStatus(StatusPagamento.PENDENTE);
        } else {
            nota.setStatus(StatusPagamento.PAGO);
        }

        notaRepository.save(nota);
    }
}