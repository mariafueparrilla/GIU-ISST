package com.gui.gui.incident;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entidad JPA que almacena una imagen asociada a una incidencia.
 * Se almacena como BLOB en la base de datos.
 * Relacion Many:One con IncidentEntity.
 */
@Entity
@Table(name = "incident_images")
public class IncidentImageEntity {

    /** ID tecnico autogenerado. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Incidencia a la que pertenece la imagen. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "incident_id", nullable = false)
    private IncidentEntity incident;

    /** Nombre original del archivo subido. */
    @Column(name = "filename", nullable = false, length = 255)
    private String filename;

    /** MIME type de la imagen (e.g., image/jpeg, image/png). */
    @Column(name = "mime_type", nullable = false, length = 50)
    private String mimeType;

    /** Datos binarios de la imagen en Base64 para portabilidad. */
    @Column(name = "image_data", nullable = false, columnDefinition = "LONGBLOB")
    private String imageData;

    /** Tamaño en bytes de la imagen original. */
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    public Long getId() {
        return id;
    }

    public IncidentEntity getIncident() {
        return incident;
    }

    public void setIncident(IncidentEntity incident) {
        this.incident = incident;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
}
