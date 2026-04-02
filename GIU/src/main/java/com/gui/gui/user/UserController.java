package com.gui.gui.user;

import com.gui.gui.user.dto.UserCreateRequest;
import com.gui.gui.user.dto.UserResponse;
import com.gui.gui.user.dto.UserUpdateRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * API de administracion de usuarios.
 * Las reglas de acceso se aplican en SecurityConfig (solo ADMIN).
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    /** Servicio que centraliza validaciones y reglas de negocio de usuarios. */
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Lista todos los usuarios para el dashboard admin.
     */
    @GetMapping
    public List<UserResponse> listUsers() {
        return userService.listUsers();
    }

    /**
     * Recupera un usuario por DNI para la pantalla de edicion.
     */
    @GetMapping("/{dni}")
    public UserResponse getUserByDni(@PathVariable String dni) {
        return userService.getUserByDni(dni);
    }

    /**
     * Crea un usuario nuevo (usado por registro y potencialmente por admin).
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@RequestBody UserCreateRequest request) {
        return userService.createUser(request);
    }

    /**
     * Actualiza nombre/email/rol de un usuario existente.
     */
    @PutMapping("/{dni}")
    public UserResponse updateUser(@PathVariable String dni, @RequestBody UserUpdateRequest request) {
        return userService.updateUser(dni, request);
    }

    /**
     * Elimina un usuario por DNI.
     * Se pasa el DNI del solicitante para impedir auto-eliminacion.
     */
    @DeleteMapping("/{dni}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable String dni, Authentication authentication) {
        String requesterDni = authentication == null ? null : authentication.getName();
        userService.deleteUser(dni, requesterDni);
    }
}
