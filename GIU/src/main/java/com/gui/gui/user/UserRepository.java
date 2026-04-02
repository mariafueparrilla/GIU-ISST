package com.gui.gui.user;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio JPA de usuarios.
 * Extiende operaciones CRUD estandar sobre UserEntity usando DNI (String) como PK.
 */
public interface UserRepository extends JpaRepository<UserEntity, String> {
}
