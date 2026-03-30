package com.gui.gui.user.dto;

public record UserCreateRequest(String dni, String name, String email, String password, String role) {
}