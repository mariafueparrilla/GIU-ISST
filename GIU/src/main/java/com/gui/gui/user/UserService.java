package com.gui.gui.user;

import com.gui.gui.user.dto.LoginRequest;
import com.gui.gui.user.dto.LoginResponse;
import com.gui.gui.user.dto.UserCreateRequest;
import com.gui.gui.user.dto.UserResponse;
import com.gui.gui.user.dto.UserUpdateRequest;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Servicio de dominio para usuarios.
 * Aqui vive la logica de validacion y negocio, separada del controlador.
 */
@Service
public class UserService {

    /** Acceso persistente a la tabla de usuarios. */
    private final UserRepository userRepository;

    /** Encoder BCrypt para comparar y almacenar passwords de forma segura. */
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Autentica por DNI y password.
     *
     * @throws ResponseStatusException 400 si faltan datos, 401 si credenciales invalidas.
     */
    public LoginResponse authenticate(LoginRequest request) {
        // Validar payload minimo de login.
        if (request == null || isBlank(request.dni()) || isBlank(request.password())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "DNI y password son obligatorios");
        }

        // Normalizar DNI para comparacion consistente.
        String normalizedDni = request.dni().trim().toUpperCase(Locale.ROOT);

        // Buscar usuario en BD.
        UserEntity user = userRepository.findById(normalizedDni)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"));

        // Verificar password en hash BCrypt.
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
        }

        // Devolver solo datos necesarios para frontend/sesion.
        return new LoginResponse(user.getDni(), user.getName(), user.getRole().name().toLowerCase(Locale.ROOT));
    }

    /**
     * Lista usuarios ordenados alfabeticamente por nombre.
     */
    public List<UserResponse> listUsers() {
        return userRepository.findAll()
            .stream()
            .sorted(Comparator.comparing(UserEntity::getName, String.CASE_INSENSITIVE_ORDER))
            .map(this::toResponse)
            .toList();
    }

    /**
     * Crea un usuario nuevo aplicando validaciones y hash de password.
     */
    public UserResponse createUser(UserCreateRequest request) {
        validateCreateRequest(request);

        String normalizedDni = request.dni().trim().toUpperCase(Locale.ROOT);
        if (userRepository.existsById(normalizedDni)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un usuario con ese DNI");
        }

        UserEntity user = new UserEntity();
        user.setDni(normalizedDni);
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(parseRole(request.role()));

        return toResponse(userRepository.save(user));
    }

    /**
     * Recupera un usuario por DNI.
     */
    public UserResponse getUserByDni(String dni) {
        if (isBlank(dni)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dni es obligatorio");
        }

        String normalizedDni = dni.trim().toUpperCase(Locale.ROOT);
        UserEntity user = userRepository.findById(normalizedDni)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        return toResponse(user);
    }

    /**
     * Actualiza nombre, email y rol de un usuario existente.
     */
    public UserResponse updateUser(String dni, UserUpdateRequest request) {
        if (isBlank(dni) || request == null || isBlank(request.name()) || isBlank(request.email()) || isBlank(request.role())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dni, name, email y role son obligatorios");
        }

        String normalizedDni = dni.trim().toUpperCase(Locale.ROOT);
        UserEntity user = userRepository.findById(normalizedDni)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        validateEmail(request.email());
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        user.setRole(parseRole(request.role()));

        return toResponse(userRepository.save(user));
    }

    /**
     * Elimina usuario por DNI, impidiendo auto-eliminacion del admin logueado.
     */
    public void deleteUser(String dni, String requesterDni) {
        if (isBlank(dni)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dni es obligatorio");
        }

        String normalizedDni = dni.trim().toUpperCase(Locale.ROOT);
        String normalizedRequester = requesterDni == null ? "" : requesterDni.trim().toUpperCase(Locale.ROOT);

        if (normalizedDni.equals(normalizedRequester)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes eliminar tu propio usuario");
        }

        if (!userRepository.existsById(normalizedDni)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }

        userRepository.deleteById(normalizedDni);
    }

    /**
     * Consulta datos del usuario autenticado por su DNI de sesion.
     */
    public LoginResponse getUserForSession(String dni) {
        if (isBlank(dni)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesion no valida");
        }

        String normalizedDni = dni.trim().toUpperCase(Locale.ROOT);
        UserEntity user = userRepository.findById(normalizedDni)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesion no valida"));

        return new LoginResponse(user.getDni(), user.getName(), user.getRole().name().toLowerCase(Locale.ROOT));
    }

    /**
     * Validaciones de alta de usuario.
     */
    private void validateCreateRequest(UserCreateRequest request) {
        if (request == null || isBlank(request.dni()) || isBlank(request.name()) || isBlank(request.email()) || isBlank(request.password()) || isBlank(request.role())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dni, name, email, password y role son obligatorios");
        }

        String normalizedDni = request.dni().trim().toUpperCase(Locale.ROOT);
        if (!normalizedDni.matches("^\\d{8}[A-Z]$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de DNI invalido");
        }

        if (request.password().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña debe tener al menos 6 caracteres");
        }

        validateEmail(request.email());
    }

    /**
     * Validacion basica de formato email.
     */
    private void validateEmail(String email) {
        String normalizedEmail = email.trim();
        if (!normalizedEmail.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de email invalido");
        }
    }

    /**
     * Convierte el valor textual del rol a enum de dominio.
     */
    private UserRole parseRole(String roleValue) {
        try {
            return UserRole.valueOf(roleValue.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol invalido");
        }
    }

    /**
     * Mapea entidad a DTO para no exponer password.
     */
    private UserResponse toResponse(UserEntity user) {
        return new UserResponse(user.getDni(), user.getName(), user.getEmail(), user.getRole().name().toLowerCase(Locale.ROOT));
    }

    /**
     * Helper comun para validar strings vacios o null.
     */
    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
