-- src/main/resources/data.sql

-- O 'INSERT IGNORE' garante que o Spring não dê erro de duplicação caso
-- o servidor seja reiniciado e o administrador já exista no banco.
INSERT IGNORE INTO usuarios (login, senha)
VALUES ('ramalho', '$2a$12$00BTIWyuGH1pajR7nzeRNOxJprVmSA5.oSYe00bwDjg1kEvznL01u');