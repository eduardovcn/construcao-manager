package com.deposito.construcao_manager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;



@EnableScheduling
@SpringBootApplication
public class ConstrucaoManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConstrucaoManagerApplication.class, args);
	}

}
