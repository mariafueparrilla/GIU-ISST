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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request, HttpSession session) {
        LoginResponse response = userService.authenticate(request);

        String authority = "ROLE_" + response.role().toUpperCase(Locale.ROOT);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            response.dni(),
            null,
            List.of(new SimpleGrantedAuthority(authority))
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        return response;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@RequestBody UserCreateRequest request) {
        return userService.createUser(request);
    }

    @GetMapping("/me")
    public LoginResponse me(Authentication authentication) {
        return userService.getUserForSession(authentication.getName());
    }

    @PostMapping("/logout")
    public void logout(HttpSession session) {
        SecurityContextHolder.clearContext();
        session.invalidate();
    }
}