
package com.deposito.construcao_manager.service;

import com.deposito.construcao_manager.domain.Nota;
import com.deposito.construcao_manager.repository.NotaRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class BackupVendasService {

    private static final Logger logger = LoggerFactory.getLogger(BackupVendasService.class);

    @Autowired
    private NotaRepository notaRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.backup.email-destino}")
    private String emailDestino;

    @Scheduled(cron = "${app.backup.cron}")
    public void executarRotinaDeBackup() {
        logger.info("Iniciando rotina de backup (CSV + ZIP + Email)...");

        List<Nota> vendas = notaRepository.findAll();

        if (vendas.isEmpty()) {
            logger.warn("Nenhuma venda encontrada. O backup não será enviado hoje.");
            return;
        }

        String dataString = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        File arquivoCsv = new File("vendas_" + dataString + ".csv");
        File arquivoZip = new File("backup_vendas_" + dataString + ".zip");

        try {

            gerarArquivoCSV(vendas, arquivoCsv);

            compactarParaZip(arquivoCsv, arquivoZip);

            enviarEmailComAnexo(arquivoZip, dataString);

            logger.info("Backup enviado com sucesso para: " + emailDestino);

        } catch (Exception e) {
            logger.error("Erro crítico ao gerar/enviar o backup de vendas.", e);
        } finally {

            if (arquivoCsv.exists()) arquivoCsv.delete();
            if (arquivoZip.exists()) arquivoZip.delete();
        }
    }

    private void gerarArquivoCSV(List<Nota> vendas, File arquivoCsv) throws Exception {
        // UTF-8 para garantir que acentos (como no "CONCLUÍDO") não fiquem quebrados
        try (PrintWriter writer = new PrintWriter(arquivoCsv, StandardCharsets.UTF_8)) {
            // Adiciona o BOM do UTF-8 para o Excel reconhecer os acentos automaticamente ao abrir o CSV
            writer.write('\ufeff');

            // Cabeçalho
            writer.println("ID_NOTA;CLIENTE;DATA_EMISSAO;DATA_VENCIMENTO;STATUS;VALOR_TOTAL");

            // Linhas de dados
            for (Nota nota : vendas) {
                String id = String.valueOf(nota.getId());
                String cliente = nota.getCliente() != null ? nota.getCliente().getNomeCompleto() : "Não Informado";
                String emissao = nota.getDataEmissao() != null ? nota.getDataEmissao().toString() : "";
                String vencimento = nota.getDataVencimento() != null ? nota.getDataVencimento().toString() : "";
                String status = nota.getStatus() != null ? nota.getStatus().name() : "PAGO";
                String valor = nota.getValorTotal() != null ? nota.getValorTotal().toString().replace(".", ",") : "0,00";

                // Concatena com ponto e vírgula
                writer.println(String.join(";", id, cliente, emissao, vencimento, status, valor));
            }
        }
    }

    private void compactarParaZip(File arquivoEntrada, File arquivoSaida) throws Exception {
        try (FileOutputStream fos = new FileOutputStream(arquivoSaida);
             ZipOutputStream zos = new ZipOutputStream(fos)) {

            ZipEntry zipEntry = new ZipEntry(arquivoEntrada.getName());
            zos.putNextEntry(zipEntry);

            java.nio.file.Files.copy(arquivoEntrada.toPath(), zos);
            zos.closeEntry();
        }
    }

    private void enviarEmailComAnexo(File arquivoZip, String dataString) throws Exception {
        MimeMessage mensagem = mailSender.createMimeMessage();

        // O MimeMessageHelper com 'true' habilita suporte a anexos (multipart)
        MimeMessageHelper helper = new MimeMessageHelper(mensagem, true, "UTF-8");

        helper.setTo(emailDestino);
        helper.setSubject("⚙️ Backup Diário - LM Materiais (" + dataString + ")");

        String corpoDoEmail = "<h3>Backup Automático de Vendas</h3>"
                + "<p>Olá,</p>"
                + "<p>Segue em anexo o arquivo compactado (ZIP) contendo o histórico de vendas até a data de hoje.</p>"
                + "<p>Para visualizar, basta extrair o arquivo e abrir o CSV no Excel.</p>"
                + "<br><hr><small><i>E-mail gerado automaticamente pelo Sistema de Gestão Construção Manager.</i></small>";

        helper.setText(corpoDoEmail, true); // true indica que o texto é HTML

        // Anexa o arquivo ZIP
        FileSystemResource fileResource = new FileSystemResource(arquivoZip);
        helper.addAttachment(arquivoZip.getName(), fileResource);

        mailSender.send(mensagem);
    }
}