package com.gui.gui;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controlador de paginas estaticas renderizadas por Thymeleaf.
 * Cada metodo devuelve el nombre de plantilla correspondiente.
 */
@Controller
public class WebPageController {

    /**
     * Ruta de entrada y login.
     */
    @GetMapping({"/", "/login", "/login.html"})
    public String loginPage() {
        return "login";
    }

    /**
     * Vista de registro de nuevos usuarios.
     */
    @GetMapping({"/register", "/register.html"})
    public String registerPage() {
        return "register";
    }

    /**
     * Vista de dashboard para usuarios autenticados no admin.
     */
    @GetMapping({"/dashboard", "/dashboard.html"})
    public String dashboardPage() {
        return "dashboard";
    }

    /**
     * Vista de dashboard administrativo.
     */
    @GetMapping({"/admin-dashboard", "/admin-dashboard.html"})
    public String adminDashboardPage() {
        return "admin-dashboard";
    }

    /**
     * Vista de edicion de usuario desde el panel admin.
     */
    @GetMapping({"/admin-user-edit", "/admin-user-edit.html"})
    public String adminUserEditPage() {
        return "admin-user-edit";
    }

    /**
     * Vista para crear una nueva incidencia.
     */
    @GetMapping({"/new-incident", "/new-incident.html"})
    public String newIncidentPage() {
        return "new-incident";
    }

    /**
     * Vista del panel de tecnico.
     */
    @GetMapping({"/technician-profile", "/technician-profile.html"})
    public String technicianProfilePage() {
        return "technician-profile";
    }

    /**
     * Vista del panel de operario.
     */
    @GetMapping({"/operator-dashboard", "/operator-dashboard.html"})
    public String operatorDashboardPage() {
        return "operator-dashboard";
    }
}
