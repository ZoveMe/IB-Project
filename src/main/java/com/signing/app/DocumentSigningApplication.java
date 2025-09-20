package com.signing.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DocumentSigningApplication {

	public static void main(String[] args) {
		SpringApplication.run(DocumentSigningApplication.class, args);
		System.out.println("DocumentSigningApplication started");
	}

}
