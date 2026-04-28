package com.gui.gui.user;

import com.gui.gui.incident.IncidentCategory;
import com.gui.gui.incident.IncidentEntity;
import com.gui.gui.incident.IncidentPriority;
import com.gui.gui.incident.IncidentRepository;
import com.gui.gui.incident.IncidentState;
import com.gui.gui.incident.UbicacionEntity;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuracion de arranque para utilidades de usuario:
 * - PasswordEncoder
 * - carga inicial de usuarios semilla
 */
@Configuration
public class UserDataInitializer {

    /**
     * Encoder de password central para toda la aplicacion.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Inserta datos base solo si la tabla users esta vacia.
     */
    @Bean
    public CommandLineRunner seedUsers(UserRepository userRepository, IncidentRepository incidentRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Semilla base solo para BDs vacias.
            if (userRepository.count() == 0) {
                UserEntity admin = new UserEntity();
                admin.setDni("12345678A");
                admin.setName("Noelia");
                admin.setEmail("noelia@urfix.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(UserRole.ADMIN);

                UserEntity user = new UserEntity();
                user.setDni("87654321B");
                user.setName("Maria");
                user.setEmail("maria@urfix.com");
                user.setPassword(passwordEncoder.encode("user123"));
                user.setRole(UserRole.USER);

                UserEntity technician = new UserEntity();
                technician.setDni("11223344T");
                technician.setName("Carlos");
                technician.setEmail("carlos@urfix.com");
                technician.setPassword(passwordEncoder.encode("tech123"));
                technician.setRole(UserRole.TECHNICIAN);
                technician.setTechnicalTeam(IncidentCategory.ALUMBRADO);

                userRepository.save(admin);
                userRepository.save(user);
                userRepository.save(technician);
            }

            // Cuentas de prueba solicitadas: crear solo si no existen.
            if (!userRepository.existsById("00000000T")) {
                UserEntity testTechnician = new UserEntity();
                testTechnician.setDni("00000000T");
                testTechnician.setName("Tecnico Prueba");
                testTechnician.setEmail("tecnico.prueba@urfix.com");
                testTechnician.setPassword(passwordEncoder.encode("tec"));
                testTechnician.setRole(UserRole.TECHNICIAN);
                testTechnician.setTechnicalTeam(IncidentCategory.ALUMBRADO);
                userRepository.save(testTechnician);
            }

            if (!userRepository.existsById("00000000O")) {
                UserEntity testOperator = new UserEntity();
                testOperator.setDni("00000000O");
                testOperator.setName("Operario Prueba");
                testOperator.setEmail("operario.prueba@urfix.com");
                testOperator.setPassword(passwordEncoder.encode("ope"));
                testOperator.setRole(UserRole.OPERATOR);
                testOperator.setTechnicalTeam(null);
                userRepository.save(testOperator);
            }

            // Limpiar incidencias en cada arranque para dejar un tablero de pruebas predecible.
            incidentRepository.deleteAll();
            seedIncidents(incidentRepository, userRepository);
        };
    }

    private void seedIncidents(IncidentRepository incidentRepository, UserRepository userRepository) {
        UserEntity user = userRepository.findById("87654321B").orElseThrow();
        UserEntity technicianCreator = userRepository.findById("00000000T").orElseThrow();

        incidentRepository.saveAll(List.of(
            createIncident(
                "Farola apagada en Gran Vía",
                "La farola no enciende desde anoche y la calle queda muy oscura.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.ALTA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Madrid", "Gran Vía", 12, 28013, 40.4204, -3.7017),
                -2,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Fuga de agua en acera",
                "Sale agua de un registro y avanza por la acera.",
                IncidentCategory.AGUA,
                IncidentPriority.CRITICA,
                IncidentState.VALIDADA,
                null,
                technicianCreator,
                ubicacion("Madrid", "Paseo del Prado", 8, 28014, 40.4138, -3.6922),
                -4,
                -2,
                null,
                null,
                null
            ),
            createIncident(
                "Bancos deteriorados en plaza",
                "Los bancos de la plaza tienen tablas rotas y tornillos sueltos.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.MEDIA,
                IncidentState.CERRADA,
                null,
                user,
                ubicacion("Madrid", "Plaza Mayor", 1, 28012, 40.4154, -3.7074),
                -10,
                -8,
                null,
                null,
                -1
            ),
            createIncident(
                "Contenedor roto en barrio",
                "El contenedor de residuos está agrietado y pierde basura.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.MEDIA,
                IncidentState.ASIGNADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Madrid", "Calle Toledo", 90, 28005, 40.4109, -3.7101),
                -5,
                -4,
                -3,
                null,
                null
            ),
            createIncident(
                "Bache en calzada",
                "Hay un bache importante en el carril derecho.",
                IncidentCategory.MOVILIDAD,
                IncidentPriority.ALTA,
                IncidentState.EN_CURSO,
                IncidentCategory.MOVILIDAD,
                user,
                ubicacion("Madrid", "Avenida de América", 25, 28002, 40.4381, -3.6753),
                -6,
                -5,
                -4,
                -1,
                null
            ),
            createIncident(
                "Suciedad acumulada en parque",
                "Hay basura y hojas acumuladas en la zona infantil.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.BAJA,
                IncidentState.RESUELTA,
                IncidentCategory.LIMPIEZA,
                technicianCreator,
                ubicacion("Madrid", "Parque del Retiro", 1, 28009, 40.4153, -3.6844),
                -12,
                -10,
                -8,
                -2,
                null
            )
        ));
    }

    private IncidentEntity createIncident(
        String title,
        String description,
        IncidentCategory category,
        IncidentPriority priority,
        IncidentState state,
        IncidentCategory assignedTeam,
        UserEntity creator,
        UbicacionEntity ubicacion,
        int daysSinceCreation,
        Integer daysSinceValidation,
        Integer daysSinceAsignation,
        Integer daysSinceResolution,
        Integer daysSinceClosing
    ) {
        IncidentEntity incident = new IncidentEntity();
        incident.setTitle(title);
        incident.setDescription(description);
        incident.setCategory(category);
        incident.setPriority(priority);
        incident.setState(state);
        incident.setAssignedTeam(assignedTeam);
        incident.setCreator(creator);
        incident.setUbicacion(ubicacion);
        incident.setCreationDate(LocalDate.now().plusDays(daysSinceCreation));

        if (daysSinceValidation != null) {
            incident.setValidationDate(Instant.now().plusSeconds(daysSinceValidation.longValue() * 24L * 60L * 60L));
        }
        if (daysSinceAsignation != null) {
            incident.setAsignationDate(Instant.now().plusSeconds(daysSinceAsignation.longValue() * 24L * 60L * 60L));
        }
        if (daysSinceResolution != null) {
            incident.setResolutionDate(Instant.now().plusSeconds(daysSinceResolution.longValue() * 24L * 60L * 60L));
        }
        if (daysSinceClosing != null) {
            incident.setClosingDate(Instant.now().plusSeconds(daysSinceClosing.longValue() * 24L * 60L * 60L));
        }

        return incident;
    }

    private UbicacionEntity ubicacion(String municipio, String calle, int numero, int codigoPostal, double latitud, double longitud) {
        UbicacionEntity ubicacion = new UbicacionEntity();
        ubicacion.setMunicipio(municipio);
        ubicacion.setCalle(calle);
        ubicacion.setNumero(numero);
        ubicacion.setCodigoPostal(codigoPostal);
        ubicacion.setLatitud(latitud);
        ubicacion.setLongitud(longitud);
        return ubicacion;
    }
}
