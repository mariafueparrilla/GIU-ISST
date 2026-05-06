package com.gui.gui;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GuiApplication {

	public static void main(String[] args) {
		SpringApplication.run(GuiApplication.class, args);
	}

}
