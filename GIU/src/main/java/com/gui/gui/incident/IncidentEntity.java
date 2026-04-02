package com.gui.gui.incident;

import com.gui.gui.user.UserEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Entidad principal de incidencia.
 * Modela los datos funcionales y su ciclo de vida completo.
 */
@Entity
@Table(name = "incidents")
public class IncidentEntity {

    /** ID tecnico autogenerado (PK). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Titulo corto de la incidencia. */
    @Column(name = "title", nullable = false, length = 160)
    private String title;

    /** Descripcion detallada aportada por el usuario. */
    @Column(name = "description", nullable = false, length = 1200)
    private String description;

    /** Categoria funcional de negocio. */
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private IncidentCategory category;

    /** Prioridad asignada a la incidencia. */
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private IncidentPriority priority;

    /** Estado actual del flujo de tramitacion. */
    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false, length = 20)
    private IncidentState state;

    /** Fecha de creacion (solo dia). */
    @Column(name = "creation_date", nullable = false)
    private LocalDate creationDate;

    /** Instante en que paso a VALIDADA. */
    @Column(name = "validation_date")
    private Instant validationDate;

    /** Instante en que paso a ASIGNADA. */
    @Column(name = "asignation_date")
    private Instant asignationDate;

    /** Instante en que paso a RESUELTA. */
    @Column(name = "resolution_date")
    private Instant resolutionDate;

    /** Instante en que paso a CERRADA. */
    @Column(name = "closing_date")
    private Instant closingDate;

    /** Usuario creador de la incidencia (FK creator_dni). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_dni", nullable = false)
    private UserEntity creator;

    /**
     * Ubicacion asociada a la incidencia.
     * Cascade ALL para persistir/actualizar/eliminar ubicacion junto a la incidencia.
     */
    @OneToOne(optional = false, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "ubicacion_id", nullable = false)
    private UbicacionEntity ubicacion;

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public IncidentCategory getCategory() {
        return category;
    }

    public void setCategory(IncidentCategory category) {
        this.category = category;
    }

    public IncidentPriority getPriority() {
        return priority;
    }

    public void setPriority(IncidentPriority priority) {
        this.priority = priority;
    }

    public IncidentState getState() {
        return state;
    }

    public void setState(IncidentState state) {
        this.state = state;
    }

    public LocalDate getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDate creationDate) {
        this.creationDate = creationDate;
    }

    public Instant getValidationDate() {
        return validationDate;
    }

    public void setValidationDate(Instant validationDate) {
        this.validationDate = validationDate;
    }

    public Instant getAsignationDate() {
        return asignationDate;
    }

    public void setAsignationDate(Instant asignationDate) {
        this.asignationDate = asignationDate;
    }

    public Instant getResolutionDate() {
        return resolutionDate;
    }

    public void setResolutionDate(Instant resolutionDate) {
        this.resolutionDate = resolutionDate;
    }

    public Instant getClosingDate() {
        return closingDate;
    }

    public void setClosingDate(Instant closingDate) {
        this.closingDate = closingDate;
    }

    public UserEntity getCreator() {
        return creator;
    }

    public void setCreator(UserEntity creator) {
        this.creator = creator;
    }

    public UbicacionEntity getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(UbicacionEntity ubicacion) {
        this.ubicacion = ubicacion;
    }
}
