# urFIX – Gestor de Incidencias Urbanas

Proyecto desarrollado para la asignatura Ingeniería de Sistemas y Servicios Telemáticos (ISST).

## Descripción

urFIX es una aplicación web para la gestión de incidencias urbanas. Permite a los ciudadanos reportar incidencias en la vía pública y a los distintos perfiles del sistema gestionarlas según su rol, cubriendo el flujo completo desde su creación hasta su resolución.

## Actores del sistema

- Ciudadano: reporta incidencias y consulta su estado  
- Administrador: gestiona usuarios e incidencias  
- Técnico: supervisa incidencias  
- Operario: gestiona y resuelve incidencias asignadas  

## Funcionalidades implementadas

- Autenticación de usuarios mediante Spring Security  
- Registro de nuevos usuarios  
- Sistema de roles (administrador, usuario, técnico, operario)  
- Dashboard personalizado según el rol  
- Creación de incidencias  
- Visualización del detalle de incidencias  
- Gestión de usuarios (edición desde panel de administrador)  
- Navegación entre vistas mediante controladores Spring MVC  
- Interfaz web dinámica con JavaScript  

## Arquitectura

El sistema sigue una arquitectura cliente-servidor:

- Frontend: HTML + CSS + JavaScript (archivos en `static`)  
- Renderizado de vistas: Thymeleaf  
- Backend: Spring Boot (controladores, servicios, repositorios)  
- Seguridad: Spring Security  
- Persistencia: JPA/Hibernate  
- Base de datos: H2 (en memoria)  

## Tecnologías

- Java 17  
- Spring Boot  
- Spring Security  
- Spring MVC  
- JPA / Hibernate  
- Thymeleaf  
- HTML, CSS, JavaScript  
- Maven  
- H2 Database  

## Ejecución

Para ejecutar el proyecto, accede a la carpeta GIU y ejecuta el comando .\mvnw.cmd spring-boot:run. Una vez iniciado, abre en el navegador la dirección http://localhost:8080.

## Estructura del proyecto

El proyecto se encuentra en la carpeta GIU. Dentro de src/main/java se organiza el backend en paquetes como user, incident y db, incluyendo controladores, servicios y repositorios. En src/main/resources/templates se encuentran las vistas HTML renderizadas con Thymeleaf, y en src/main/resources/static los scripts JavaScript que gestionan la lógica del frontend. La configuración de la aplicación se encuentra en application.properties y la gestión de dependencias en el fichero pom.xml.

## Metodología

El desarrollo se ha realizado siguiendo metodología Scrum, organizado en tres sprints:

- Sprint 1: diseño y planificación del sistema  
- Sprint 2: desarrollo inicial del frontend y backend  
- Sprint 3: integración, mejora del sistema y finalización  

## Limitaciones

- Uso de base de datos en memoria (H2)  
- Algunas funcionalidades de asignación de incidencias no están completamente implementadas  
- Integración con servicios externos (como geolocalización) pendiente  
- Validaciones y control de errores mejorables  

## Trabajo futuro

- Persistencia con base de datos real (MySQL/PostgreSQL)  
- Implementación completa del flujo de asignación de incidencias  
- Integración con mapas para geolocalización  
- Mejora de estadísticas  
- Refuerzo de seguridad y control de accesos  

## Documentación

- Documento de Visión (VD)  
- Plan de Desarrollo del Software (SDP)  
- Documento de Diseño (SDD)  
- Diagramas C4  

## Conclusión

urFIX constituye una versión funcional de un sistema de gestión de incidencias urbanas, integrando frontend y backend en una arquitectura coherente y preparada para su evolución en futuras iteraciones.