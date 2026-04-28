package com.gui.gui;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;

/**
 * Configura toda la seguridad HTTP de la aplicacion:
 * - que rutas son publicas
 * - que rutas requieren autenticacion
 * - que rutas son solo para ADMIN
 * - como responder ante accesos no autenticados a paginas HTML
 */
@Configuration
public class SecurityConfig {

    /**
     * Define la cadena de filtros de Spring Security.
     *
     * @param http DSL principal para configurar seguridad web.
     * @return configuracion final de seguridad.
     * @throws Exception en caso de error de configuracion.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Si una peticion de tipo HTML no esta autenticada, redirigir al login.
        AuthenticationEntryPoint htmlEntryPoint = new LoginUrlAuthenticationEntryPoint("/login");

        http
            // Se desactiva CSRF porque el frontend trabaja con fetch sencillo y sesion.
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Endpoints publicos: paginas de entrada, auth inicial y estaticos.
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
                // Vistas de aplicación: se dejan accesibles a cualquier sesión autenticada.
                // La propia UI redirige según el rol real del usuario.
                .requestMatchers("/admin-dashboard", "/admin-dashboard.html", "/admin-user-edit", "/admin-user-edit.html").authenticated()
                .requestMatchers("/dashboard", "/dashboard.html", "/new-incident", "/new-incident.html").authenticated()
                .requestMatchers("/technician-profile", "/technician-profile.html").authenticated()
                .requestMatchers("/operator-dashboard", "/operator-dashboard.html").authenticated()
                // API de usuarios solo para admin.
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                // API de incidencias de administracion.
                .requestMatchers(HttpMethod.GET, "/api/incidents").hasAnyRole("ADMIN", "OPERATOR")
                .requestMatchers(HttpMethod.PATCH, "/api/incidents/*/state").hasRole("OPERATOR")
                // API de revision operativa.
                .requestMatchers(HttpMethod.PATCH, "/api/incidents/*/assign-team").hasRole("OPERATOR")
                // API de incidencias de equipo tecnico.
                .requestMatchers(HttpMethod.GET, "/api/incidents/team/my").hasRole("TECHNICIAN")
                .requestMatchers(HttpMethod.PATCH, "/api/incidents/*/team-state").hasRole("TECHNICIAN")
                // API de incidencias de usuario autenticado.
                .requestMatchers(HttpMethod.GET, "/api/incidents/my").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/incidents").authenticated()
                // Endpoints de sesion.
                .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                // Permite preflight CORS si hiciera falta.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Todo lo no listado requiere autenticacion.
                .anyRequest().authenticated()
            )
            // Necesario para visualizar la consola H2 embebida en iframe.
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            // No usamos el login form por defecto de Spring.
            .formLogin(form -> form.disable())
            // Entry point personalizado para peticiones HTML.
            .exceptionHandling(exception -> exception
                .defaultAuthenticationEntryPointFor(htmlEntryPoint, new MediaTypeRequestMatcher(MediaType.TEXT_HTML))
            )
            // No usamos basic auth en navegador.
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}
