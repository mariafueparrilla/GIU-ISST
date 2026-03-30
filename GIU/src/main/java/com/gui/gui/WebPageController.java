package com.gui.gui;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebPageController {

    @GetMapping({"/", "/login", "/login.html"})
    public String loginPage() {
        return "login";
    }

    @GetMapping({"/register", "/register.html"})
    public String registerPage() {
        return "register";
    }

    @GetMapping({"/dashboard", "/dashboard.html"})
    public String dashboardPage() {
        return "dashboard";
    }

    @GetMapping({"/admin-dashboard", "/admin-dashboard.html"})
    public String adminDashboardPage() {
        return "admin-dashboard";
    }

    @GetMapping({"/admin-user-edit", "/admin-user-edit.html"})
    public String adminUserEditPage() {
        return "admin-user-edit";
    }

    @GetMapping({"/new-incident", "/new-incident.html"})
    public String newIncidentPage() {
        return "new-incident";
    }
}
