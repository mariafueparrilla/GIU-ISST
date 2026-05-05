package com.gui.gui.user;

import com.gui.gui.user.dto.LoginRequest;
import com.gui.gui.user.dto.LoginResponse;
import com.gui.gui.user.dto.UserCreateRequest;
import com.gui.gui.user.dto.UserResponse;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador de autenticacion:
 * - login de sesion
 * - registro publico
 * - consulta de usuario de sesion
 * - cierre de sesion
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /** Servicio de dominio para validar credenciales y gestionar usuarios. */
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Realiza login contra la BD y crea el contexto de seguridad en sesion HTTP.
     */
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request, HttpSession session) {
        // 1) Validar credenciales y recuperar usuario.
        LoginResponse response = userService.authenticate(request);

        // 2) Construir autoridad Spring Security a partir del rol de negocio.
        String authority = "ROLE_" + response.role().toUpperCase(Locale.ROOT);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            response.dni(),
            null,
            List.of(new SimpleGrantedAuthority(authority))
        );

        // 3) Guardar autenticacion en SecurityContext y asociarlo a la sesion.
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        return response;
    }

    /**
     * Registro publico de usuario (sin requerir autenticacion previa).
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@RequestBody UserCreateRequest request) {
        UserCreateRequest safeRequest = new UserCreateRequest(
            request.dni(),
            request.name(),
            request.surname(),
            request.email(),
            request.password(),
            "user",
            null
        );
        return userService.createUser(safeRequest);
    }

    /**
     * Devuelve datos del usuario actualmente autenticado en sesion.
     */
    @GetMapping("/me")
    public LoginResponse me(Authentication authentication) {
        return userService.getUserForSession(authentication.getName());
    }

    /**
     * Cierra sesion invalida contexto de seguridad y destruye HttpSession.
     */
    @PostMapping("/logout")
    public void logout(HttpSession session) {
        SecurityContextHolder.clearContext();
        session.invalidate();
    }
}
