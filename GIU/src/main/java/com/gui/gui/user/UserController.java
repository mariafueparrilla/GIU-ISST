package com.gui.gui.user;

import com.gui.gui.user.dto.UserCreateRequest;
import com.gui.gui.user.dto.UserResponse;
import com.gui.gui.user.dto.UserUpdateRequest;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> listUsers() {
        return userService.listUsers();
    }

    @GetMapping("/{dni}")
    public UserResponse getUserByDni(@PathVariable String dni) {
        return userService.getUserByDni(dni);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@RequestBody UserCreateRequest request) {
        return userService.createUser(request);
    }

    @PutMapping("/{dni}")
    public UserResponse updateUser(@PathVariable String dni, @RequestBody UserUpdateRequest request) {
        return userService.updateUser(dni, request);
    }

    @DeleteMapping("/{dni}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable String dni, Authentication authentication) {
        String requesterDni = authentication == null ? null : authentication.getName();
        userService.deleteUser(dni, requesterDni);
    }
}