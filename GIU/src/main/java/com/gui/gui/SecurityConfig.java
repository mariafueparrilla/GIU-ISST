package com.gui.gui;

import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        AuthenticationEntryPoint htmlEntryPoint = new LoginUrlAuthenticationEntryPoint("/login");

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/",
                    "/error",
                    "/login",
                    "/login.html",
                    "/register",
                    "/register.html",
                    "/api/auth/login",
                    "/api/auth/register",
                    "/**/*.js",
                    "/**/*.css",
                    "/h2-console/**"
                ).permitAll()
                .requestMatchers("/admin-dashboard", "/admin-dashboard.html", "/admin-user-edit", "/admin-user-edit.html").hasRole("ADMIN")
                .requestMatchers("/dashboard", "/dashboard.html", "/new-incident", "/new-incident.html").authenticated()
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .formLogin(form -> form.disable())
            .exceptionHandling(exception -> exception
                .defaultAuthenticationEntryPointFor(htmlEntryPoint, new MediaTypeRequestMatcher(MediaType.TEXT_HTML))
            )
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}
