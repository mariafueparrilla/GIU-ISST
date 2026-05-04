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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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

    /** Equipo tecnico asignado (puede ser null hasta revision operativa). */
    @Enumerated(EnumType.STRING)
    @Column(name = "assigned_team", length = 30)
    private IncidentCategory assignedTeam;

    /** Prioridad asignada a la incidencia (set por operario). */
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    private IncidentPriority priority;

    /** Estado actual del flujo de tramitacion. */
    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false, length = 20)
    private IncidentState state;

    /** Fecha de creacion (solo dia). */
    @Column(name = "creation_date", nullable = false)
    private LocalDate creationDate;

    /** Instante exacto de creacion con hora. */
    @Column(name = "creation_instant", nullable = false)
    private Instant creationInstant;

    // validation_date removed: VALIDADA state removed from flow

    /** Instante en que paso a ASIGNADA. */
    @Column(name = "asignation_date")
    private Instant asignationDate;

    /** Instante en que paso a RESUELTA. */
    @Column(name = "resolution_date")
    private Instant resolutionDate;

    /** Instante en que paso a CERRADA. */
    @Column(name = "closing_date")
    private Instant closingDate;

    /** Instante en que paso a RECHAZADA. */
    @Column(name = "rejection_date")
    private Instant rejectionDate;

    /** Usuario creador de la incidencia (FK creator_dni). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_dni", nullable = false)
    private UserEntity creator;

    // validator removed: VALIDADA actor no longer tracked

    /** Usuario que asigno la incidencia a un equipo. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigner_dni")
    private UserEntity assigner;

    /** Usuario (tecnico) que resolvio la incidencia. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolver_dni")
    private UserEntity resolver;

    /** Usuario que cerro la incidencia. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "closer_dni")
    private UserEntity closer;

    /** Usuario que rechazo la incidencia. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rejecter_dni")
    private UserEntity rejecter;

    /**
     * Ubicacion asociada a la incidencia.
     * Cascade ALL para persistir/actualizar/eliminar ubicacion junto a la incidencia.
     */
    @OneToOne(optional = false, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "ubicacion_id", nullable = false)
    private UbicacionEntity ubicacion;

    /**
     * Imagenes asociadas a la incidencia (maximo 3).
     * Cascade ALL + orphanRemoval true para eliminar imagenes cuando se elimina la incidencia.
     */
    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<IncidentImageEntity> images = new ArrayList<>();

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

    public IncidentCategory getAssignedTeam() {
        return assignedTeam;
    }

    public void setAssignedTeam(IncidentCategory assignedTeam) {
        this.assignedTeam = assignedTeam;
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

    // validationDate accessor removed

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

    public Instant getRejectionDate() {
        return rejectionDate;
    }

    public void setRejectionDate(Instant rejectionDate) {
        this.rejectionDate = rejectionDate;
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

    public List<IncidentImageEntity> getImages() {
        return images;
    }

    public void setImages(List<IncidentImageEntity> images) {
        this.images = images;
    }

    public Instant getCreationInstant() {
        return creationInstant;
    }

    public void setCreationInstant(Instant creationInstant) {
        this.creationInstant = creationInstant;
    }

    // validator accessors removed

    public UserEntity getAssigner() {
        return assigner;
    }

    public void setAssigner(UserEntity assigner) {
        this.assigner = assigner;
    }

    public UserEntity getResolver() {
        return resolver;
    }

    public void setResolver(UserEntity resolver) {
        this.resolver = resolver;
    }

    public UserEntity getCloser() {
        return closer;
    }

    public void setCloser(UserEntity closer) {
        this.closer = closer;
    }

    public UserEntity getRejecter() {
        return rejecter;
    }

    public void setRejecter(UserEntity rejecter) {
        this.rejecter = rejecter;
    }
}
