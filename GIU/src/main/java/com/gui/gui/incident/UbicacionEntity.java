package com.gui.gui.incident;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entidad JPA para la ubicacion de una incidencia.
 * Se vincula en relacion 1:1 desde IncidentEntity.
 */
@Entity
@Table(name = "ubicaciones")
public class UbicacionEntity {

    /** ID tecnico autogenerado para la ubicacion. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Municipio donde se reporta la incidencia. */
    @Column(name = "municipio", nullable = false, length = 120)
    private String municipio;

    /** Calle de la ubicacion. */
    @Column(name = "calle", nullable = false, length = 160)
    private String calle;

    /** Numero de portal o referencia numerica. */
    @Column(name = "numero", nullable = false)
    private Integer numero;

    /** Codigo postal de la ubicacion. */
    @Column(name = "codigo_postal", nullable = false)
    private Integer codigoPostal;

    /** Latitud geografica decimal. */
    @Column(name = "latitud", nullable = false)
    private Double latitud;

    /** Longitud geografica decimal. */
    @Column(name = "longitud", nullable = false)
    private Double longitud;

    public Long getId() {
        return id;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public String getCalle() {
        return calle;
    }

    public void setCalle(String calle) {
        this.calle = calle;
    }

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public Integer getCodigoPostal() {
        return codigoPostal;
    }

    public void setCodigoPostal(Integer codigoPostal) {
        this.codigoPostal = codigoPostal;
    }

    public Double getLatitud() {
        return latitud;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }
}
