package com.gui.gui.user;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuracion de arranque para utilidades de usuario:
 * - PasswordEncoder
 * - carga inicial de usuarios semilla
 */
@Configuration
public class UserDataInitializer {

    /**
     * Encoder de password central para toda la aplicacion.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Inserta datos base solo si la tabla users esta vacia.
     */
    @Bean
    public CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Evitar duplicar datos semilla en reinicios.
            if (userRepository.count() > 0) {
                return;
            }

            // Usuario administrador inicial.
            UserEntity admin = new UserEntity();
            admin.setDni("12345678A");
            admin.setName("Noelia");
            admin.setEmail("noelia@urfix.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.ADMIN);

            // Usuario estandar inicial.
            UserEntity user = new UserEntity();
            user.setDni("87654321B");
            user.setName("Maria");
            user.setEmail("maria@urfix.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole(UserRole.USER);

            userRepository.save(admin);
            userRepository.save(user);
        };
    }
}
