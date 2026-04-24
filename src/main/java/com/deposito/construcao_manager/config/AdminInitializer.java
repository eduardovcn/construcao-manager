package com.deposito.construcao_manager.config;
import com.deposito.construcao_manager.domain.Usuario;
import com.deposito.construcao_manager.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.login}")
    private String adminLogin;

    @Value("${app.admin.senha}")
    private String adminSenha;

    public AdminInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        //Se user já existe, não duplica o admin
        if (usuarioRepository.findByLogin(adminLogin) == null) {
            Usuario admin = new Usuario();
            admin.setLogin(adminLogin);

            admin.setSenha(passwordEncoder.encode(adminSenha));

            usuarioRepository.save(admin);
            logger.info("Usuario adicionado com sucesso");

        } else {
            logger.info("Usuario adicionado com erro");
        }
    }
}
