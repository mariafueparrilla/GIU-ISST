package com.gui.gui.user;

import com.gui.gui.incident.IncidentCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entidad JPA que representa un usuario del sistema.
 * El DNI funciona como clave primaria natural.
 */
@Entity
@Table(name = "users")
public class UserEntity {

    /** DNI unico del usuario (PK). */
    @Id
    @Column(name = "dni", nullable = false, length = 9)
    private String dni;

    /** Nombre visible en paneles y cabeceras. */
    @Column(name = "name", nullable = false, length = 120)
    private String name;
    
    /** Apellido del usuario separado del nombre. */
    @Column(name = "surname", length = 120)
    private String surname;

    /** Correo electronico del usuario para contacto/gestion. */
    @Column(name = "email", nullable = false, length = 160)
    private String email;

    /** Password almacenada en hash BCrypt, nunca en texto plano. */
    @Column(name = "password", nullable = false, length = 200)
    private String password;

    /** Rol funcional del usuario para autorizacion. */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role;

    /** Equipo tecnico del usuario (solo aplica a rol TECHNICIAN). */
    @Enumerated(EnumType.STRING)
    @Column(name = "technical_team", length = 30)
    private IncidentCategory technicalTeam;

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public IncidentCategory getTechnicalTeam() {
        return technicalTeam;
    }

    public void setTechnicalTeam(IncidentCategory technicalTeam) {
        this.technicalTeam = technicalTeam;
    }
}
