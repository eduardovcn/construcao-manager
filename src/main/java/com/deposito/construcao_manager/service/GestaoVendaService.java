package com.deposito.construcao_manager.service;

import com.deposito.construcao_manager.domain.*;
import com.deposito.construcao_manager.repository.*;
import com.deposito.construcao_manager.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class GestaoVendaService {

    private final ProdutoRepository produtoRepository;
    private final ClienteRepository clienteRepository;
    private final NotaRepository notaRepository;

    @Transactional
    public NotaSaidaDTO cadastrarVenda(NotaEntradaDTO dadosVenda) {
        Cliente cliente = clienteRepository.findById((dadosVenda.getClienteId()))
                .orElseThrow(()-> new IllegalArgumentException("Cliente não encontrado"));

        Nota nota = new Nota();
        nota.setCliente(cliente);

        // Usa a data do formulário. Se vazia, assume hoje.
        if (dadosVenda.getDataEmissao() != null) {
            nota.setDataEmissao(dadosVenda.getDataEmissao());
        } else {
            nota.setDataEmissao(LocalDate.now());
        }

        nota.setObservacoes(dadosVenda.getObservacoes());

        if (dadosVenda.getDataPagamento() != null && dadosVenda.getDataPagamento().isAfter(nota.getDataEmissao())) {
            nota.setStatus(StatusPagamento.PENDENTE);
            nota.setDataVencimento(dadosVenda.getDataPagamento());
        } else {
            nota.setStatus(StatusPagamento.PAGO);
            nota.setDataVencimento(nota.getDataEmissao());
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


    @Transactional
    public NotaSaidaDTO atualizarVenda(Long id, NotaEntradaDTO dadosVenda) {
        Nota nota = notaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Venda não encontrada"));

        if (dadosVenda.getDataEmissao() != null) nota.setDataEmissao(dadosVenda.getDataEmissao());
        if (dadosVenda.getDataPagamento() != null) nota.setDataVencimento(dadosVenda.getDataPagamento());
        if (dadosVenda.getObservacoes() != null) nota.setObservacoes(dadosVenda.getObservacoes());
        if (dadosVenda.getStatus() != null) {
            try {
                nota.setStatus(StatusPagamento.valueOf(dadosVenda.getStatus().toUpperCase()));
            } catch (Exception e) {}
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

    @Transactional
    public void alternarStatusVenda(Long id) {
        Nota nota = notaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Venda não encontrada"));

        if (nota.getStatus() == StatusPagamento.PAGO) {
            nota.setStatus(StatusPagamento.PENDENTE);
        } else {
            nota.setStatus(StatusPagamento.PAGO);
            nota.setDataVencimento(LocalDate.now());
        }

        notaRepository.save(nota);
    }

    @Transactional
    public void deletarVenda(Long id) {
        // Logica para devolver o estoque antes de apagar a nota
        Nota nota = notaRepository.findById(id).orElseThrow();
        for (ItemNota item : nota.getItens()) {
            Produto p = item.getProduto();
            p.setQuantidadeEstoque(p.getQuantidadeEstoque() + item.getQuantidade());
            produtoRepository.save(p);
        }
        notaRepository.deleteById(id);
    }
}