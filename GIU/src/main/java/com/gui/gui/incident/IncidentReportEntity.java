package com.gui.gui.incident;

import com.gui.gui.user.UserEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Informe tecnico asociado a una incidencia.
 */
@Entity
@Table(name = "incident_reports")
public class IncidentReportEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "incident_id", nullable = false, unique = true)
    private IncidentEntity incident;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_dni", nullable = false)
    private UserEntity sender;

    @Column(name = "report_instant", nullable = false)
    private Instant reportInstant;

    @Column(name = "description", length = 2000)
    private String description;

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<IncidentReportImageEntity> images = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public IncidentEntity getIncident() {
        return incident;
    }

    public void setIncident(IncidentEntity incident) {
        this.incident = incident;
    }

    public UserEntity getSender() {
        return sender;
    }

    public void setSender(UserEntity sender) {
        this.sender = sender;
    }

    public Instant getReportInstant() {
        return reportInstant;
    }

    public void setReportInstant(Instant reportInstant) {
        this.reportInstant = reportInstant;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<IncidentReportImageEntity> getImages() {
        return images;
    }

    public void setImages(List<IncidentReportImageEntity> images) {
        this.images = images;
    }
}