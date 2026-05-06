package com.gui.gui.user;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.gui.gui.incident.IncidentCategory;
import com.gui.gui.incident.IncidentEntity;
import com.gui.gui.incident.IncidentPriority;
import com.gui.gui.incident.IncidentRepository;
import com.gui.gui.incident.IncidentState;
import com.gui.gui.incident.UbicacionEntity;

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
          incidentRepository.deleteAll(); // Limpia incidentes para evitar conflictos con usuarios semilla
          userRepository.deleteAll(); // Limpia usuarios para evitar conflictos con usuarios semilla
            // Only seed if database is empty
           /* 
            if (userRepository.count() > 0) {
                return; // Database already has data, skip seeding
            }
*/
            // Helper to compute control letter for numeric DNI
            final String DNI_CONTROL_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";
            java.util.function.IntFunction<String> buildDni = number -> {
                int n = number;
                String num = String.format("%08d", n);
                char letter = DNI_CONTROL_LETTERS.charAt(n % 23);
                return num + letter;
            };

            // Seed primary users
            UserEntity admin = new UserEntity();
            admin.setDni(buildDni.apply(12345678));
            admin.setName("Noelia");
            admin.setSurname("García");
            admin.setEmail("noelia@urfix.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.ADMIN);

            UserEntity user = new UserEntity();
            user.setDni(buildDni.apply(87654321));
            user.setName("Maria");
            user.setSurname("López");
            user.setEmail("maria@urfix.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole(UserRole.USER);

            UserEntity technician = new UserEntity();
            technician.setDni(buildDni.apply(11223344));
            technician.setName("Carlos");
            technician.setSurname("Rodríguez");
            technician.setEmail("carlos@urfix.com");
            technician.setPassword(passwordEncoder.encode("tech123"));
            technician.setRole(UserRole.TECHNICIAN);
            technician.setTechnicalTeam(IncidentCategory.ALUMBRADO);

            userRepository.save(admin);
            userRepository.save(user);
            userRepository.save(technician);

            // Test accounts
            UserEntity testTechnician = new UserEntity();
            testTechnician.setDni(buildDni.apply(0));
            testTechnician.setName("Tecnico");
            testTechnician.setSurname("Prueba");
            testTechnician.setEmail("tecnico.prueba@urfix.com");
            testTechnician.setPassword(passwordEncoder.encode("tec"));
            testTechnician.setRole(UserRole.TECHNICIAN);
            testTechnician.setTechnicalTeam(IncidentCategory.ALUMBRADO);
            userRepository.save(testTechnician);

            UserEntity testOperator = new UserEntity();
            testOperator.setDni(buildDni.apply(1));
            testOperator.setName("Operario");
            testOperator.setSurname("Prueba");
            testOperator.setEmail("operario.prueba@urfix.com");
            testOperator.setPassword(passwordEncoder.encode("ope"));
            testOperator.setRole(UserRole.OPERATOR);
            testOperator.setTechnicalTeam(null);
            userRepository.save(testOperator);

            UserEntity user2 = new UserEntity();
            user2.setDni(buildDni.apply(23456789));
            user2.setName("Lucía");
            user2.setSurname("Martínez");
            user2.setEmail("lucia.martinez@urfix.com");
            user2.setPassword(passwordEncoder.encode("user123"));
            user2.setRole(UserRole.USER);
            userRepository.save(user2);

            UserEntity user3 = new UserEntity();
            user3.setDni(buildDni.apply(24567900));
            user3.setName("Javier");
            user3.setSurname("Sánchez");
            user3.setEmail("javier.sanchez@urfix.com");
            user3.setPassword(passwordEncoder.encode("user123"));
            user3.setRole(UserRole.USER);
            userRepository.save(user3);

            UserEntity user4 = new UserEntity();
            user4.setDni(buildDni.apply(25679011));
            user4.setName("Paula");
            user4.setSurname("Fernández");
            user4.setEmail("paula.fernandez@urfix.com");
            user4.setPassword(passwordEncoder.encode("user123"));
            user4.setRole(UserRole.USER);
            userRepository.save(user4);

            UserEntity user5 = new UserEntity();
            user5.setDni(buildDni.apply(26790122));
            user5.setName("Alejandro");
            user5.setSurname("Ruiz");
            user5.setEmail("alejandro.ruiz@urfix.com");
            user5.setPassword(passwordEncoder.encode("user123"));
            user5.setRole(UserRole.USER);
            userRepository.save(user5);

            UserEntity user6 = new UserEntity();
            user6.setDni(buildDni.apply(27901233));
            user6.setName("Carmen");
            user6.setSurname("Moreno");
            user6.setEmail("carmen.moreno@urfix.com");
            user6.setPassword(passwordEncoder.encode("user123"));
            user6.setRole(UserRole.USER);
            userRepository.save(user6);

            UserEntity user7 = new UserEntity();
            user7.setDni(buildDni.apply(29012344));
            user7.setName("Diego");
            user7.setSurname("Hernández");
            user7.setEmail("diego.hernandez@urfix.com");
            user7.setPassword(passwordEncoder.encode("user123"));
            user7.setRole(UserRole.USER);
            userRepository.save(user7);

            UserEntity user8 = new UserEntity();
            user8.setDni(buildDni.apply(30123455));
            user8.setName("Elena");
            user8.setSurname("Jiménez");
            user8.setEmail("elena.jimenez@urfix.com");
            user8.setPassword(passwordEncoder.encode("user123"));
            user8.setRole(UserRole.USER);
            userRepository.save(user8);

            UserEntity operator2 = new UserEntity();
            operator2.setDni(buildDni.apply(12020202));
            operator2.setName("Álvaro");
            operator2.setSurname("Navarro");
            operator2.setEmail("alvaro.navarro@urfix.com");
            operator2.setPassword(passwordEncoder.encode("ope"));
            operator2.setRole(UserRole.OPERATOR);
            operator2.setTechnicalTeam(null);
            userRepository.save(operator2);

            UserEntity operator3 = new UserEntity();
            operator3.setDni(buildDni.apply(13030303));
            operator3.setName("Marta");
            operator3.setSurname("Castro");
            operator3.setEmail("marta.castro@urfix.com");
            operator3.setPassword(passwordEncoder.encode("ope"));
            operator3.setRole(UserRole.OPERATOR);
            operator3.setTechnicalTeam(null);
            userRepository.save(operator3);

            UserEntity operator4 = new UserEntity();
            operator4.setDni(buildDni.apply(14040404));
            operator4.setName("Sergio");
            operator4.setSurname("Ortega");
            operator4.setEmail("sergio.ortega@urfix.com");
            operator4.setPassword(passwordEncoder.encode("ope"));
            operator4.setRole(UserRole.OPERATOR);
            operator4.setTechnicalTeam(null);
            userRepository.save(operator4);

            UserEntity operator5 = new UserEntity();
            operator5.setDni(buildDni.apply(15050505));
            operator5.setName("Irene");
            operator5.setSurname("Molina");
            operator5.setEmail("irene.molina@urfix.com");
            operator5.setPassword(passwordEncoder.encode("ope"));
            operator5.setRole(UserRole.OPERATOR);
            operator5.setTechnicalTeam(null);
            userRepository.save(operator5);

            UserEntity technician2 = new UserEntity();
            technician2.setDni(buildDni.apply(32020202));
            technician2.setName("Raúl");
            technician2.setSurname("Domínguez");
            technician2.setEmail("raul.dominguez@urfix.com");
            technician2.setPassword(passwordEncoder.encode("tec"));
            technician2.setRole(UserRole.TECHNICIAN);
            technician2.setTechnicalTeam(IncidentCategory.AGUA);
            userRepository.save(technician2);

            UserEntity technician3 = new UserEntity();
            technician3.setDni(buildDni.apply(33030303));
            technician3.setName("Nuria");
            technician3.setSurname("Vega");
            technician3.setEmail("nuria.vega@urfix.com");
            technician3.setPassword(passwordEncoder.encode("tec"));
            technician3.setRole(UserRole.TECHNICIAN);
            technician3.setTechnicalTeam(IncidentCategory.AGUA);
            userRepository.save(technician3);

            UserEntity technician4 = new UserEntity();
            technician4.setDni(buildDni.apply(34040404));
            technician4.setName("Pablo");
            technician4.setSurname("Romero");
            technician4.setEmail("pablo.romero@urfix.com");
            technician4.setPassword(passwordEncoder.encode("tec"));
            technician4.setRole(UserRole.TECHNICIAN);
            technician4.setTechnicalTeam(IncidentCategory.ALUMBRADO);
            userRepository.save(technician4);

            UserEntity technician5 = new UserEntity();
            technician5.setDni(buildDni.apply(35050505));
            technician5.setName("Clara");
            technician5.setSurname("Serrano");
            technician5.setEmail("clara.serrano@urfix.com");
            technician5.setPassword(passwordEncoder.encode("tec"));
            technician5.setRole(UserRole.TECHNICIAN);
            technician5.setTechnicalTeam(IncidentCategory.ALUMBRADO);
            userRepository.save(technician5);

            UserEntity technician6 = new UserEntity();
            technician6.setDni(buildDni.apply(36060606));
            technician6.setName("Víctor");
            technician6.setSurname("Reyes");
            technician6.setEmail("victor.reyes@urfix.com");
            technician6.setPassword(passwordEncoder.encode("tec"));
            technician6.setRole(UserRole.TECHNICIAN);
            technician6.setTechnicalTeam(IncidentCategory.MOBILIARIO);
            userRepository.save(technician6);

            UserEntity technician7 = new UserEntity();
            technician7.setDni(buildDni.apply(37070707));
            technician7.setName("Sandra");
            technician7.setSurname("Gil");
            technician7.setEmail("sandra.gil@urfix.com");
            technician7.setPassword(passwordEncoder.encode("tec"));
            technician7.setRole(UserRole.TECHNICIAN);
            technician7.setTechnicalTeam(IncidentCategory.MOBILIARIO);
            userRepository.save(technician7);

            UserEntity technician8 = new UserEntity();
            technician8.setDni(buildDni.apply(38080808));
            technician8.setName("Hugo");
            technician8.setSurname("Blanco");
            technician8.setEmail("hugo.blanco@urfix.com");
            technician8.setPassword(passwordEncoder.encode("tec"));
            technician8.setRole(UserRole.TECHNICIAN);
            technician8.setTechnicalTeam(IncidentCategory.RESIDUOS);
            userRepository.save(technician8);

            UserEntity technician9 = new UserEntity();
            technician9.setDni(buildDni.apply(39090909));
            technician9.setName("Beatriz");
            technician9.setSurname("Campos");
            technician9.setEmail("beatriz.campos@urfix.com");
            technician9.setPassword(passwordEncoder.encode("tec"));
            technician9.setRole(UserRole.TECHNICIAN);
            technician9.setTechnicalTeam(IncidentCategory.RESIDUOS);
            userRepository.save(technician9);

            UserEntity technician10 = new UserEntity();
            technician10.setDni(buildDni.apply(40101010));
            technician10.setName("Adrián");
            technician10.setSurname("Prieto");
            technician10.setEmail("adrian.prieto@urfix.com");
            technician10.setPassword(passwordEncoder.encode("tec"));
            technician10.setRole(UserRole.TECHNICIAN);
            technician10.setTechnicalTeam(IncidentCategory.LIMPIEZA);
            userRepository.save(technician10);

            UserEntity technician11 = new UserEntity();
            technician11.setDni(buildDni.apply(41111111));
            technician11.setName("Laura");
            technician11.setSurname("Marín");
            technician11.setEmail("laura.marin@urfix.com");
            technician11.setPassword(passwordEncoder.encode("tec"));
            technician11.setRole(UserRole.TECHNICIAN);
            technician11.setTechnicalTeam(IncidentCategory.LIMPIEZA);
            userRepository.save(technician11);

            UserEntity admin2 = new UserEntity();
            admin2.setDni(buildDni.apply(72020202));
            admin2.setName("Roberto");
            admin2.setSurname("Cano");
            admin2.setEmail("roberto.cano@urfix.com");
            admin2.setPassword(passwordEncoder.encode("admin123"));
            admin2.setRole(UserRole.ADMIN);
            userRepository.save(admin2);

            UserEntity admin3 = new UserEntity();
            admin3.setDni(buildDni.apply(73030303));
            admin3.setName("Patricia");
            admin3.setSurname("Iglesias");
            admin3.setEmail("patricia.iglesias@urfix.com");
            admin3.setPassword(passwordEncoder.encode("admin123"));
            admin3.setRole(UserRole.ADMIN);
            userRepository.save(admin3);

            // Seed incidents for the primary user (Maria)
            seedIncidents(incidentRepository, userRepository, user);
        };
    }

    private void seedIncidents(IncidentRepository incidentRepository, UserRepository userRepository, UserEntity user) {

        incidentRepository.saveAll(List.of(
            createIncident(
                "Farola apagada en Gran Vía - Madrid",
                "La luminaria lleva varias noches sin funcionar y reduce la visibilidad de la zona.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.BAJA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Madrid", "Gran Vía", 12, 28013, 40.4204, -3.7017),
                -6,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Alcantarilla rebosando - Madrid",
                "La alcantarilla desprende mal olor y rebosa agua en la vía pública.",
                IncidentCategory.AGUA,
                IncidentPriority.CRITICA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Madrid", "Paseo del Prado", 8, 28014, 40.4138, -3.6922),
                -7,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Valla de protección rota - Madrid",
                "La valla presenta daños y no protege correctamente la zona peatonal.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.ALTA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Madrid", "Plaza Mayor", 1, 28012, 40.4154, -3.7074),
                -8,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Mal estado del punto de residuos - Madrid",
                "La zona de contenedores presenta suciedad y residuos dispersos.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.MEDIA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Madrid", "Calle Toledo", 90, 28005, 40.4109, -3.7101),
                -9,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Suciedad acumulada en acera - Madrid",
                "Hay restos de basura y hojas acumuladas en la zona de paso.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.BAJA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Madrid", "Parque del Retiro", 1, 28009, 40.4153, -3.6844),
                -10,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Cableado visible en punto de luz - Alcalá de Henares",
                "Se observa cableado expuesto en una farola cercana a zona peatonal.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.CRITICA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Alcalá de Henares", "Calle Mayor", 33, 28801, 40.4820, -3.3635),
                -11,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Tapa de registro hundida - Móstoles",
                "La tapa de saneamiento está hundida y puede provocar tropiezos.",
                IncidentCategory.AGUA,
                IncidentPriority.ALTA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Móstoles", "Avenida de Portugal", 20, 28931, 40.3223, -3.8649),
                -12,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Papelera desprendida - Fuenlabrada",
                "La papelera está suelta y apoyada en el suelo.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.MEDIA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Fuenlabrada", "Calle de Leganés", 18, 28945, 40.2867, -3.7935),
                -13,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Contenedor roto en Avenida de Fuenlabrada - Leganés",
                "El contenedor está agrietado y deja residuos en la vía pública.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.BAJA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Leganés", "Avenida de Fuenlabrada", 5, 28911, 40.3272, -3.7635),
                -14,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Pintadas en mobiliario urbano - Getafe",
                "Se observan pintadas recientes en elementos municipales.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.CRITICA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Getafe", "Calle Madrid", 40, 28901, 40.3057, -3.7329),
                -15,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Intermitencias en alumbrado público - Alcorcón",
                "Varias farolas se apagan y encienden de forma intermitente durante la noche.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.ALTA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Alcorcón", "Calle Mayor", 14, 28921, 40.3493, -3.8284),
                -16,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Boca de riego dañada - Parla",
                "La boca de riego pierde agua de manera constante.",
                IncidentCategory.AGUA,
                IncidentPriority.MEDIA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Parla", "Calle Real", 35, 28981, 40.2370, -3.7675),
                -17,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Banco deteriorado en zona pública - Torrejón de Ardoz",
                "El banco tiene piezas rotas y tornillos sueltos.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.BAJA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Torrejón de Ardoz", "Avenida de la Constitución", 12, 28850, 40.4567, -3.4755),
                -18,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Contenedores desbordados - Alcobendas",
                "Hay bolsas acumuladas fuera de los contenedores.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.CRITICA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Alcobendas", "Paseo de la Chopera", 56, 28100, 40.5475, -3.6420),
                -19,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Zona infantil con residuos - San Sebastián de los Reyes",
                "La zona infantil tiene envoltorios y restos de comida en el suelo.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.ALTA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("San Sebastián de los Reyes", "Avenida de España", 22, 28701, 40.5469, -3.6261),
                -20,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Cuadro eléctrico abierto - Rivas-Vaciamadrid",
                "El armario del alumbrado está abierto y accesible desde la acera.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.MEDIA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Rivas-Vaciamadrid", "Avenida de Covibar", 9, 28523, 40.3587, -3.5478),
                -21,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Fuga de agua en Avenida de Europa - Pozuelo de Alarcón",
                "Sale agua de un registro y se está formando un charco en la acera.",
                IncidentCategory.AGUA,
                IncidentPriority.BAJA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Pozuelo de Alarcón", "Avenida de Europa", 18, 28224, 40.4397, -3.7899),
                -22,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Señal vertical torcida - Majadahonda",
                "Una señal está inclinada e invade parcialmente la zona de paso.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.CRITICA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Majadahonda", "Gran Vía", 25, 28220, 40.4735, -3.8718),
                -23,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Restos voluminosos sin recoger - Las Rozas de Madrid",
                "Se han dejado muebles y enseres junto al punto de recogida.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.ALTA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Las Rozas de Madrid", "Calle Real", 44, 28231, 40.4929, -3.8737),
                -24,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Cristales en la vía pública - Boadilla del Monte",
                "Hay cristales rotos en la acera y supone riesgo para peatones.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.MEDIA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Boadilla del Monte", "Avenida Siglo XXI", 7, 28660, 40.4050, -3.8783),
                -25,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Farola apagada en Avenida de Colmenar Viejo - Tres Cantos",
                "La luminaria lleva varias noches sin funcionar y reduce la visibilidad de la zona.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.BAJA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Tres Cantos", "Avenida de Colmenar Viejo", 15, 28760, 40.6009, -3.7081),
                -26,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Alcantarilla rebosando - Aranjuez",
                "La alcantarilla desprende mal olor y rebosa agua en la vía pública.",
                IncidentCategory.AGUA,
                IncidentPriority.CRITICA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Aranjuez", "Calle de la Reina", 4, 28300, 40.0364, -3.6087),
                -27,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Valla de protección rota - Valdemoro",
                "La valla presenta daños y no protege correctamente la zona peatonal.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.ALTA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Valdemoro", "Calle Estrella de Elola", 11, 28341, 40.1908, -3.6789),
                -28,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Mal estado del punto de residuos - Pinto",
                "La zona de contenedores presenta suciedad y residuos dispersos.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.MEDIA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Pinto", "Calle Hospital", 6, 28320, 40.2429, -3.6991),
                -29,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Suciedad acumulada en acera - Collado Villalba",
                "Hay restos de basura y hojas acumuladas en la zona de paso.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.BAJA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Collado Villalba", "Calle Real", 28, 28400, 40.6321, -4.0086),
                -30,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Cableado visible en punto de luz - Colmenar Viejo",
                "Se observa cableado expuesto en una farola cercana a zona peatonal.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.CRITICA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Colmenar Viejo", "Calle de la Feria", 10, 28770, 40.6591, -3.7666),
                -31,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Tapa de registro hundida - Arganda del Rey",
                "La tapa de saneamiento está hundida y puede provocar tropiezos.",
                IncidentCategory.AGUA,
                IncidentPriority.ALTA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Arganda del Rey", "Avenida del Ejército", 19, 28500, 40.3036, -3.4478),
                -32,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Papelera desprendida - San Fernando de Henares",
                "La papelera está suelta y apoyada en el suelo.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.MEDIA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("San Fernando de Henares", "Calle Libertad", 16, 28830, 40.4259, -3.5326),
                -33,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Contenedor roto en Avenida de la Constitución - Coslada",
                "El contenedor está agrietado y deja residuos en la vía pública.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.BAJA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Coslada", "Avenida de la Constitución", 31, 28821, 40.4238, -3.5613),
                -34,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Pintadas en mobiliario urbano - Villaviciosa de Odón",
                "Se observan pintadas recientes en elementos municipales.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.CRITICA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Villaviciosa de Odón", "Calle Carretas", 8, 28670, 40.3586, -3.9003),
                -35,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Intermitencias en alumbrado público - Madrid",
                "Varias farolas se apagan y encienden de forma intermitente durante la noche.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.ALTA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Madrid", "Gran Vía", 12, 28013, 40.4204, -3.7017),
                -36,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Boca de riego dañada - Madrid",
                "La boca de riego pierde agua de manera constante.",
                IncidentCategory.AGUA,
                IncidentPriority.MEDIA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Madrid", "Paseo del Prado", 8, 28014, 40.4138, -3.6922),
                -37,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Banco deteriorado en zona pública - Madrid",
                "El banco tiene piezas rotas y tornillos sueltos.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.BAJA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Madrid", "Plaza Mayor", 1, 28012, 40.4154, -3.7074),
                -38,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Contenedores desbordados - Madrid",
                "Hay bolsas acumuladas fuera de los contenedores.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.CRITICA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Madrid", "Calle Toledo", 90, 28005, 40.4109, -3.7101),
                -39,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Zona infantil con residuos - Madrid",
                "La zona infantil tiene envoltorios y restos de comida en el suelo.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.ALTA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Madrid", "Parque del Retiro", 1, 28009, 40.4153, -3.6844),
                -40,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Cuadro eléctrico abierto - Alcalá de Henares",
                "El armario del alumbrado está abierto y accesible desde la acera.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.MEDIA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Alcalá de Henares", "Calle Mayor", 33, 28801, 40.4820, -3.3635),
                -41,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Fuga de agua en Avenida de Portugal - Móstoles",
                "Sale agua de un registro y se está formando un charco en la acera.",
                IncidentCategory.AGUA,
                IncidentPriority.BAJA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Móstoles", "Avenida de Portugal", 20, 28931, 40.3223, -3.8649),
                -42,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Señal vertical torcida - Fuenlabrada",
                "Una señal está inclinada e invade parcialmente la zona de paso.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.CRITICA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Fuenlabrada", "Calle de Leganés", 18, 28945, 40.2867, -3.7935),
                -43,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Restos voluminosos sin recoger - Leganés",
                "Se han dejado muebles y enseres junto al punto de recogida.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.ALTA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Leganés", "Avenida de Fuenlabrada", 5, 28911, 40.3272, -3.7635),
                -44,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Cristales en la vía pública - Getafe",
                "Hay cristales rotos en la acera y supone riesgo para peatones.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.MEDIA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Getafe", "Calle Madrid", 40, 28901, 40.3057, -3.7329),
                -45,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Farola apagada en Calle Mayor - Alcorcón",
                "La luminaria lleva varias noches sin funcionar y reduce la visibilidad de la zona.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.BAJA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Alcorcón", "Calle Mayor", 14, 28921, 40.3493, -3.8284),
                -46,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Alcantarilla rebosando - Parla",
                "La alcantarilla desprende mal olor y rebosa agua en la vía pública.",
                IncidentCategory.AGUA,
                IncidentPriority.CRITICA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Parla", "Calle Real", 35, 28981, 40.2370, -3.7675),
                -47,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Valla de protección rota - Torrejón de Ardoz",
                "La valla presenta daños y no protege correctamente la zona peatonal.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.ALTA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Torrejón de Ardoz", "Avenida de la Constitución", 12, 28850, 40.4567, -3.4755),
                -48,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Mal estado del punto de residuos - Alcobendas",
                "La zona de contenedores presenta suciedad y residuos dispersos.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.MEDIA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Alcobendas", "Paseo de la Chopera", 56, 28100, 40.5475, -3.6420),
                -49,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Suciedad acumulada en acera - San Sebastián de los Reyes",
                "Hay restos de basura y hojas acumuladas en la zona de paso.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.BAJA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("San Sebastián de los Reyes", "Avenida de España", 22, 28701, 40.5469, -3.6261),
                -50,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Cableado visible en punto de luz - Rivas-Vaciamadrid",
                "Se observa cableado expuesto en una farola cercana a zona peatonal.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.CRITICA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Rivas-Vaciamadrid", "Avenida de Covibar", 9, 28523, 40.3587, -3.5478),
                -51,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Tapa de registro hundida - Pozuelo de Alarcón",
                "La tapa de saneamiento está hundida y puede provocar tropiezos.",
                IncidentCategory.AGUA,
                IncidentPriority.ALTA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Pozuelo de Alarcón", "Avenida de Europa", 18, 28224, 40.4397, -3.7899),
                -52,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Papelera desprendida - Majadahonda",
                "La papelera está suelta y apoyada en el suelo.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.MEDIA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Majadahonda", "Gran Vía", 25, 28220, 40.4735, -3.8718),
                -53,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Contenedor roto en Calle Real - Las Rozas de Madrid",
                "El contenedor está agrietado y deja residuos en la vía pública.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.BAJA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Las Rozas de Madrid", "Calle Real", 44, 28231, 40.4929, -3.8737),
                -54,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Pintadas en mobiliario urbano - Boadilla del Monte",
                "Se observan pintadas recientes en elementos municipales.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.CRITICA,
                IncidentState.CREADA,
                null,
                user,
                ubicacion("Boadilla del Monte", "Avenida Siglo XXI", 7, 28660, 40.4050, -3.8783),
                -55,
                null,
                null,
                null,
                null
            ),
            createIncident(
                "Intermitencias en alumbrado público - Tres Cantos",
                "Varias farolas se apagan y encienden de forma intermitente durante la noche.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.ALTA,
                IncidentState.ASIGNADA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Tres Cantos", "Avenida de Colmenar Viejo", 15, 28760, 40.6009, -3.7081),
                -56,
                -55,
                null,
                null,
                null
            ),
            createIncident(
                "Boca de riego dañada - Aranjuez",
                "La boca de riego pierde agua de manera constante.",
                IncidentCategory.AGUA,
                IncidentPriority.MEDIA,
                IncidentState.ASIGNADA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Aranjuez", "Calle de la Reina", 4, 28300, 40.0364, -3.6087),
                -57,
                -56,
                null,
                null,
                null
            ),
            createIncident(
                "Banco deteriorado en zona pública - Valdemoro",
                "El banco tiene piezas rotas y tornillos sueltos.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.BAJA,
                IncidentState.ASIGNADA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Valdemoro", "Calle Estrella de Elola", 11, 28341, 40.1908, -3.6789),
                -58,
                -57,
                null,
                null,
                null
            ),
            createIncident(
                "Contenedores desbordados - Pinto",
                "Hay bolsas acumuladas fuera de los contenedores.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.CRITICA,
                IncidentState.ASIGNADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Pinto", "Calle Hospital", 6, 28320, 40.2429, -3.6991),
                -59,
                -58,
                null,
                null,
                null
            ),
            createIncident(
                "Zona infantil con residuos - Collado Villalba",
                "La zona infantil tiene envoltorios y restos de comida en el suelo.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.ALTA,
                IncidentState.ASIGNADA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Collado Villalba", "Calle Real", 28, 28400, 40.6321, -4.0086),
                -60,
                -59,
                null,
                null,
                null
            ),
            createIncident(
                "Cuadro eléctrico abierto - Colmenar Viejo",
                "El armario del alumbrado está abierto y accesible desde la acera.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.MEDIA,
                IncidentState.ASIGNADA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Colmenar Viejo", "Calle de la Feria", 10, 28770, 40.6591, -3.7666),
                -61,
                -60,
                null,
                null,
                null
            ),
            createIncident(
                "Fuga de agua en Avenida del Ejército - Arganda del Rey",
                "Sale agua de un registro y se está formando un charco en la acera.",
                IncidentCategory.AGUA,
                IncidentPriority.BAJA,
                IncidentState.ASIGNADA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Arganda del Rey", "Avenida del Ejército", 19, 28500, 40.3036, -3.4478),
                -62,
                -61,
                null,
                null,
                null
            ),
            createIncident(
                "Señal vertical torcida - San Fernando de Henares",
                "Una señal está inclinada e invade parcialmente la zona de paso.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.CRITICA,
                IncidentState.ASIGNADA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("San Fernando de Henares", "Calle Libertad", 16, 28830, 40.4259, -3.5326),
                -63,
                -62,
                null,
                null,
                null
            ),
            createIncident(
                "Restos voluminosos sin recoger - Coslada",
                "Se han dejado muebles y enseres junto al punto de recogida.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.ALTA,
                IncidentState.ASIGNADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Coslada", "Avenida de la Constitución", 31, 28821, 40.4238, -3.5613),
                -64,
                -63,
                null,
                null,
                null
            ),
            createIncident(
                "Cristales en la vía pública - Villaviciosa de Odón",
                "Hay cristales rotos en la acera y supone riesgo para peatones.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.MEDIA,
                IncidentState.ASIGNADA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Villaviciosa de Odón", "Calle Carretas", 8, 28670, 40.3586, -3.9003),
                -65,
                -64,
                null,
                null,
                null
            ),
            createIncident(
                "Farola apagada en Gran Vía - Madrid",
                "La luminaria lleva varias noches sin funcionar y reduce la visibilidad de la zona.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.BAJA,
                IncidentState.ASIGNADA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Madrid", "Gran Vía", 12, 28013, 40.4204, -3.7017),
                -66,
                -65,
                null,
                null,
                null
            ),
            createIncident(
                "Alcantarilla rebosando - Madrid",
                "La alcantarilla desprende mal olor y rebosa agua en la vía pública.",
                IncidentCategory.AGUA,
                IncidentPriority.CRITICA,
                IncidentState.ASIGNADA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Madrid", "Paseo del Prado", 8, 28014, 40.4138, -3.6922),
                -67,
                -66,
                null,
                null,
                null
            ),
            createIncident(
                "Valla de protección rota - Madrid",
                "La valla presenta daños y no protege correctamente la zona peatonal.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.ALTA,
                IncidentState.ASIGNADA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Madrid", "Plaza Mayor", 1, 28012, 40.4154, -3.7074),
                -68,
                -67,
                null,
                null,
                null
            ),
            createIncident(
                "Mal estado del punto de residuos - Madrid",
                "La zona de contenedores presenta suciedad y residuos dispersos.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.MEDIA,
                IncidentState.ASIGNADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Madrid", "Calle Toledo", 90, 28005, 40.4109, -3.7101),
                -69,
                -68,
                null,
                null,
                null
            ),
            createIncident(
                "Suciedad acumulada en acera - Madrid",
                "Hay restos de basura y hojas acumuladas en la zona de paso.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.BAJA,
                IncidentState.ASIGNADA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Madrid", "Parque del Retiro", 1, 28009, 40.4153, -3.6844),
                -70,
                -69,
                null,
                null,
                null
            ),
            createIncident(
                "Cableado visible en punto de luz - Alcalá de Henares",
                "Se observa cableado expuesto en una farola cercana a zona peatonal.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.CRITICA,
                IncidentState.ASIGNADA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Alcalá de Henares", "Calle Mayor", 33, 28801, 40.4820, -3.3635),
                -71,
                -70,
                null,
                null,
                null
            ),
            createIncident(
                "Tapa de registro hundida - Móstoles",
                "La tapa de saneamiento está hundida y puede provocar tropiezos.",
                IncidentCategory.AGUA,
                IncidentPriority.ALTA,
                IncidentState.ASIGNADA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Móstoles", "Avenida de Portugal", 20, 28931, 40.3223, -3.8649),
                -72,
                -71,
                null,
                null,
                null
            ),
            createIncident(
                "Papelera desprendida - Fuenlabrada",
                "La papelera está suelta y apoyada en el suelo.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.MEDIA,
                IncidentState.ASIGNADA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Fuenlabrada", "Calle de Leganés", 18, 28945, 40.2867, -3.7935),
                -73,
                -72,
                null,
                null,
                null
            ),
            createIncident(
                "Contenedor roto en Avenida de Fuenlabrada - Leganés",
                "El contenedor está agrietado y deja residuos en la vía pública.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.BAJA,
                IncidentState.ASIGNADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Leganés", "Avenida de Fuenlabrada", 5, 28911, 40.3272, -3.7635),
                -74,
                -73,
                null,
                null,
                null
            ),
            createIncident(
                "Pintadas en mobiliario urbano - Getafe",
                "Se observan pintadas recientes en elementos municipales.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.CRITICA,
                IncidentState.ASIGNADA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Getafe", "Calle Madrid", 40, 28901, 40.3057, -3.7329),
                -75,
                -74,
                null,
                null,
                null
            ),
            createIncident(
                "Intermitencias en alumbrado público - Alcorcón",
                "Varias farolas se apagan y encienden de forma intermitente durante la noche.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.ALTA,
                IncidentState.ASIGNADA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Alcorcón", "Calle Mayor", 14, 28921, 40.3493, -3.8284),
                -76,
                -75,
                null,
                null,
                null
            ),
            createIncident(
                "Boca de riego dañada - Parla",
                "La boca de riego pierde agua de manera constante.",
                IncidentCategory.AGUA,
                IncidentPriority.MEDIA,
                IncidentState.ASIGNADA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Parla", "Calle Real", 35, 28981, 40.2370, -3.7675),
                -77,
                -76,
                null,
                null,
                null
            ),
            createIncident(
                "Banco deteriorado en zona pública - Torrejón de Ardoz",
                "El banco tiene piezas rotas y tornillos sueltos.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.BAJA,
                IncidentState.ASIGNADA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Torrejón de Ardoz", "Avenida de la Constitución", 12, 28850, 40.4567, -3.4755),
                -78,
                -77,
                null,
                null,
                null
            ),
            createIncident(
                "Contenedores desbordados - Alcobendas",
                "Hay bolsas acumuladas fuera de los contenedores.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.CRITICA,
                IncidentState.ASIGNADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Alcobendas", "Paseo de la Chopera", 56, 28100, 40.5475, -3.6420),
                -79,
                -78,
                null,
                null,
                null
            ),
            createIncident(
                "Zona infantil con residuos - San Sebastián de los Reyes",
                "La zona infantil tiene envoltorios y restos de comida en el suelo.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.ALTA,
                IncidentState.ASIGNADA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("San Sebastián de los Reyes", "Avenida de España", 22, 28701, 40.5469, -3.6261),
                -80,
                -79,
                null,
                null,
                null
            ),
            createIncident(
                "Cuadro eléctrico abierto - Rivas-Vaciamadrid",
                "El armario del alumbrado está abierto y accesible desde la acera.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.MEDIA,
                IncidentState.ASIGNADA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Rivas-Vaciamadrid", "Avenida de Covibar", 9, 28523, 40.3587, -3.5478),
                -81,
                -80,
                null,
                null,
                null
            ),
            createIncident(
                "Fuga de agua en Avenida de Europa - Pozuelo de Alarcón",
                "Sale agua de un registro y se está formando un charco en la acera.",
                IncidentCategory.AGUA,
                IncidentPriority.BAJA,
                IncidentState.ASIGNADA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Pozuelo de Alarcón", "Avenida de Europa", 18, 28224, 40.4397, -3.7899),
                -82,
                -81,
                null,
                null,
                null
            ),
            createIncident(
                "Señal vertical torcida - Majadahonda",
                "Una señal está inclinada e invade parcialmente la zona de paso.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.CRITICA,
                IncidentState.ASIGNADA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Majadahonda", "Gran Vía", 25, 28220, 40.4735, -3.8718),
                -83,
                -82,
                null,
                null,
                null
            ),
            createIncident(
                "Restos voluminosos sin recoger - Las Rozas de Madrid",
                "Se han dejado muebles y enseres junto al punto de recogida.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.ALTA,
                IncidentState.ASIGNADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Las Rozas de Madrid", "Calle Real", 44, 28231, 40.4929, -3.8737),
                -84,
                -83,
                null,
                null,
                null
            ),
            createIncident(
                "Cristales en la vía pública - Boadilla del Monte",
                "Hay cristales rotos en la acera y supone riesgo para peatones.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.MEDIA,
                IncidentState.ASIGNADA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Boadilla del Monte", "Avenida Siglo XXI", 7, 28660, 40.4050, -3.8783),
                -85,
                -84,
                null,
                null,
                null
            ),
            createIncident(
                "Farola apagada en Avenida de Colmenar Viejo - Tres Cantos",
                "La luminaria lleva varias noches sin funcionar y reduce la visibilidad de la zona.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.BAJA,
                IncidentState.ASIGNADA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Tres Cantos", "Avenida de Colmenar Viejo", 15, 28760, 40.6009, -3.7081),
                -86,
                -85,
                null,
                null,
                null
            ),
            createIncident(
                "Alcantarilla rebosando - Aranjuez",
                "La alcantarilla desprende mal olor y rebosa agua en la vía pública.",
                IncidentCategory.AGUA,
                IncidentPriority.CRITICA,
                IncidentState.ASIGNADA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Aranjuez", "Calle de la Reina", 4, 28300, 40.0364, -3.6087),
                -87,
                -86,
                null,
                null,
                null
            ),
            createIncident(
                "Valla de protección rota - Valdemoro",
                "La valla presenta daños y no protege correctamente la zona peatonal.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.ALTA,
                IncidentState.ASIGNADA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Valdemoro", "Calle Estrella de Elola", 11, 28341, 40.1908, -3.6789),
                -88,
                -87,
                null,
                null,
                null
            ),
            createIncident(
                "Mal estado del punto de residuos - Pinto",
                "La zona de contenedores presenta suciedad y residuos dispersos.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.MEDIA,
                IncidentState.ASIGNADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Pinto", "Calle Hospital", 6, 28320, 40.2429, -3.6991),
                -89,
                -88,
                null,
                null,
                null
            ),
            createIncident(
                "Suciedad acumulada en acera - Collado Villalba",
                "Hay restos de basura y hojas acumuladas en la zona de paso.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.BAJA,
                IncidentState.ASIGNADA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Collado Villalba", "Calle Real", 28, 28400, 40.6321, -4.0086),
                -90,
                -89,
                null,
                null,
                null
            ),
            createIncident(
                "Cableado visible en punto de luz - Colmenar Viejo",
                "Se observa cableado expuesto en una farola cercana a zona peatonal.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.CRITICA,
                IncidentState.ASIGNADA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Colmenar Viejo", "Calle de la Feria", 10, 28770, 40.6591, -3.7666),
                -91,
                -90,
                null,
                null,
                null
            ),
            createIncident(
                "Tapa de registro hundida - Arganda del Rey",
                "La tapa de saneamiento está hundida y puede provocar tropiezos.",
                IncidentCategory.AGUA,
                IncidentPriority.ALTA,
                IncidentState.ASIGNADA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Arganda del Rey", "Avenida del Ejército", 19, 28500, 40.3036, -3.4478),
                -92,
                -91,
                null,
                null,
                null
            ),
            createIncident(
                "Papelera desprendida - San Fernando de Henares",
                "La papelera está suelta y apoyada en el suelo.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.MEDIA,
                IncidentState.ASIGNADA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("San Fernando de Henares", "Calle Libertad", 16, 28830, 40.4259, -3.5326),
                -93,
                -92,
                null,
                null,
                null
            ),
            createIncident(
                "Contenedor roto en Avenida de la Constitución - Coslada",
                "El contenedor está agrietado y deja residuos en la vía pública.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.BAJA,
                IncidentState.ASIGNADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Coslada", "Avenida de la Constitución", 31, 28821, 40.4238, -3.5613),
                -94,
                -93,
                null,
                null,
                null
            ),
            createIncident(
                "Pintadas en mobiliario urbano - Villaviciosa de Odón",
                "Se observan pintadas recientes en elementos municipales.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.CRITICA,
                IncidentState.ASIGNADA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Villaviciosa de Odón", "Calle Carretas", 8, 28670, 40.3586, -3.9003),
                -95,
                -94,
                null,
                null,
                null
            ),
            createIncident(
                "Intermitencias en alumbrado público - Madrid",
                "Varias farolas se apagan y encienden de forma intermitente durante la noche.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.ALTA,
                IncidentState.EN_CURSO,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Madrid", "Gran Vía", 12, 28013, 40.4204, -3.7017),
                -96,
                -95,
                null,
                null,
                null
            ),
            createIncident(
                "Boca de riego dañada - Madrid",
                "La boca de riego pierde agua de manera constante.",
                IncidentCategory.AGUA,
                IncidentPriority.MEDIA,
                IncidentState.EN_CURSO,
                IncidentCategory.AGUA,
                user,
                ubicacion("Madrid", "Paseo del Prado", 8, 28014, 40.4138, -3.6922),
                -97,
                -96,
                null,
                null,
                null
            ),
            createIncident(
                "Banco deteriorado en zona pública - Madrid",
                "El banco tiene piezas rotas y tornillos sueltos.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.BAJA,
                IncidentState.EN_CURSO,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Madrid", "Plaza Mayor", 1, 28012, 40.4154, -3.7074),
                -98,
                -97,
                null,
                null,
                null
            ),
            createIncident(
                "Contenedores desbordados - Madrid",
                "Hay bolsas acumuladas fuera de los contenedores.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.CRITICA,
                IncidentState.EN_CURSO,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Madrid", "Calle Toledo", 90, 28005, 40.4109, -3.7101),
                -99,
                -98,
                null,
                null,
                null
            ),
            createIncident(
                "Zona infantil con residuos - Madrid",
                "La zona infantil tiene envoltorios y restos de comida en el suelo.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.ALTA,
                IncidentState.EN_CURSO,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Madrid", "Parque del Retiro", 1, 28009, 40.4153, -3.6844),
                -100,
                -99,
                null,
                null,
                null
            ),
            createIncident(
                "Cuadro eléctrico abierto - Alcalá de Henares",
                "El armario del alumbrado está abierto y accesible desde la acera.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.MEDIA,
                IncidentState.EN_CURSO,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Alcalá de Henares", "Calle Mayor", 33, 28801, 40.4820, -3.3635),
                -101,
                -100,
                null,
                null,
                null
            ),
            createIncident(
                "Fuga de agua en Avenida de Portugal - Móstoles",
                "Sale agua de un registro y se está formando un charco en la acera.",
                IncidentCategory.AGUA,
                IncidentPriority.BAJA,
                IncidentState.EN_CURSO,
                IncidentCategory.AGUA,
                user,
                ubicacion("Móstoles", "Avenida de Portugal", 20, 28931, 40.3223, -3.8649),
                -102,
                -101,
                null,
                null,
                null
            ),
            createIncident(
                "Señal vertical torcida - Fuenlabrada",
                "Una señal está inclinada e invade parcialmente la zona de paso.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.CRITICA,
                IncidentState.EN_CURSO,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Fuenlabrada", "Calle de Leganés", 18, 28945, 40.2867, -3.7935),
                -103,
                -102,
                null,
                null,
                null
            ),
            createIncident(
                "Restos voluminosos sin recoger - Leganés",
                "Se han dejado muebles y enseres junto al punto de recogida.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.ALTA,
                IncidentState.EN_CURSO,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Leganés", "Avenida de Fuenlabrada", 5, 28911, 40.3272, -3.7635),
                -104,
                -103,
                null,
                null,
                null
            ),
            createIncident(
                "Cristales en la vía pública - Getafe",
                "Hay cristales rotos en la acera y supone riesgo para peatones.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.MEDIA,
                IncidentState.EN_CURSO,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Getafe", "Calle Madrid", 40, 28901, 40.3057, -3.7329),
                -105,
                -104,
                null,
                null,
                null
            ),
            createIncident(
                "Farola apagada en Calle Mayor - Alcorcón",
                "La luminaria lleva varias noches sin funcionar y reduce la visibilidad de la zona.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.BAJA,
                IncidentState.EN_CURSO,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Alcorcón", "Calle Mayor", 14, 28921, 40.3493, -3.8284),
                -106,
                -105,
                null,
                null,
                null
            ),
            createIncident(
                "Alcantarilla rebosando - Parla",
                "La alcantarilla desprende mal olor y rebosa agua en la vía pública.",
                IncidentCategory.AGUA,
                IncidentPriority.CRITICA,
                IncidentState.EN_CURSO,
                IncidentCategory.AGUA,
                user,
                ubicacion("Parla", "Calle Real", 35, 28981, 40.2370, -3.7675),
                -107,
                -106,
                null,
                null,
                null
            ),
            createIncident(
                "Valla de protección rota - Torrejón de Ardoz",
                "La valla presenta daños y no protege correctamente la zona peatonal.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.ALTA,
                IncidentState.EN_CURSO,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Torrejón de Ardoz", "Avenida de la Constitución", 12, 28850, 40.4567, -3.4755),
                -108,
                -107,
                null,
                null,
                null
            ),
            createIncident(
                "Mal estado del punto de residuos - Alcobendas",
                "La zona de contenedores presenta suciedad y residuos dispersos.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.MEDIA,
                IncidentState.EN_CURSO,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Alcobendas", "Paseo de la Chopera", 56, 28100, 40.5475, -3.6420),
                -109,
                -108,
                null,
                null,
                null
            ),
            createIncident(
                "Suciedad acumulada en acera - San Sebastián de los Reyes",
                "Hay restos de basura y hojas acumuladas en la zona de paso.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.BAJA,
                IncidentState.EN_CURSO,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("San Sebastián de los Reyes", "Avenida de España", 22, 28701, 40.5469, -3.6261),
                -110,
                -109,
                null,
                null,
                null
            ),
            createIncident(
                "Cableado visible en punto de luz - Rivas-Vaciamadrid",
                "Se observa cableado expuesto en una farola cercana a zona peatonal.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.CRITICA,
                IncidentState.EN_CURSO,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Rivas-Vaciamadrid", "Avenida de Covibar", 9, 28523, 40.3587, -3.5478),
                -111,
                -110,
                null,
                null,
                null
            ),
            createIncident(
                "Tapa de registro hundida - Pozuelo de Alarcón",
                "La tapa de saneamiento está hundida y puede provocar tropiezos.",
                IncidentCategory.AGUA,
                IncidentPriority.ALTA,
                IncidentState.EN_CURSO,
                IncidentCategory.AGUA,
                user,
                ubicacion("Pozuelo de Alarcón", "Avenida de Europa", 18, 28224, 40.4397, -3.7899),
                -112,
                -111,
                null,
                null,
                null
            ),
            createIncident(
                "Papelera desprendida - Majadahonda",
                "La papelera está suelta y apoyada en el suelo.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.MEDIA,
                IncidentState.EN_CURSO,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Majadahonda", "Gran Vía", 25, 28220, 40.4735, -3.8718),
                -113,
                -112,
                null,
                null,
                null
            ),
            createIncident(
                "Contenedor roto en Calle Real - Las Rozas de Madrid",
                "El contenedor está agrietado y deja residuos en la vía pública.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.BAJA,
                IncidentState.EN_CURSO,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Las Rozas de Madrid", "Calle Real", 44, 28231, 40.4929, -3.8737),
                -114,
                -113,
                null,
                null,
                null
            ),
            createIncident(
                "Pintadas en mobiliario urbano - Boadilla del Monte",
                "Se observan pintadas recientes en elementos municipales.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.CRITICA,
                IncidentState.EN_CURSO,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Boadilla del Monte", "Avenida Siglo XXI", 7, 28660, 40.4050, -3.8783),
                -115,
                -114,
                null,
                null,
                null
            ),
            createIncident(
                "Intermitencias en alumbrado público - Tres Cantos",
                "Varias farolas se apagan y encienden de forma intermitente durante la noche.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.ALTA,
                IncidentState.EN_CURSO,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Tres Cantos", "Avenida de Colmenar Viejo", 15, 28760, 40.6009, -3.7081),
                -116,
                -115,
                null,
                null,
                null
            ),
            createIncident(
                "Boca de riego dañada - Aranjuez",
                "La boca de riego pierde agua de manera constante.",
                IncidentCategory.AGUA,
                IncidentPriority.MEDIA,
                IncidentState.EN_CURSO,
                IncidentCategory.AGUA,
                user,
                ubicacion("Aranjuez", "Calle de la Reina", 4, 28300, 40.0364, -3.6087),
                -117,
                -116,
                null,
                null,
                null
            ),
            createIncident(
                "Banco deteriorado en zona pública - Valdemoro",
                "El banco tiene piezas rotas y tornillos sueltos.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.BAJA,
                IncidentState.EN_CURSO,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Valdemoro", "Calle Estrella de Elola", 11, 28341, 40.1908, -3.6789),
                -118,
                -117,
                null,
                null,
                null
            ),
            createIncident(
                "Contenedores desbordados - Pinto",
                "Hay bolsas acumuladas fuera de los contenedores.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.CRITICA,
                IncidentState.EN_CURSO,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Pinto", "Calle Hospital", 6, 28320, 40.2429, -3.6991),
                -119,
                -118,
                null,
                null,
                null
            ),
            createIncident(
                "Zona infantil con residuos - Collado Villalba",
                "La zona infantil tiene envoltorios y restos de comida en el suelo.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.ALTA,
                IncidentState.EN_CURSO,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Collado Villalba", "Calle Real", 28, 28400, 40.6321, -4.0086),
                -120,
                -119,
                null,
                null,
                null
            ),
            createIncident(
                "Cuadro eléctrico abierto - Colmenar Viejo",
                "El armario del alumbrado está abierto y accesible desde la acera.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.MEDIA,
                IncidentState.EN_CURSO,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Colmenar Viejo", "Calle de la Feria", 10, 28770, 40.6591, -3.7666),
                -121,
                -120,
                null,
                null,
                null
            ),
            createIncident(
                "Fuga de agua en Avenida del Ejército - Arganda del Rey",
                "Sale agua de un registro y se está formando un charco en la acera.",
                IncidentCategory.AGUA,
                IncidentPriority.BAJA,
                IncidentState.EN_CURSO,
                IncidentCategory.AGUA,
                user,
                ubicacion("Arganda del Rey", "Avenida del Ejército", 19, 28500, 40.3036, -3.4478),
                -122,
                -121,
                null,
                null,
                null
            ),
            createIncident(
                "Señal vertical torcida - San Fernando de Henares",
                "Una señal está inclinada e invade parcialmente la zona de paso.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.CRITICA,
                IncidentState.EN_CURSO,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("San Fernando de Henares", "Calle Libertad", 16, 28830, 40.4259, -3.5326),
                -123,
                -122,
                null,
                null,
                null
            ),
            createIncident(
                "Restos voluminosos sin recoger - Coslada",
                "Se han dejado muebles y enseres junto al punto de recogida.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.ALTA,
                IncidentState.EN_CURSO,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Coslada", "Avenida de la Constitución", 31, 28821, 40.4238, -3.5613),
                -124,
                -123,
                null,
                null,
                null
            ),
            createIncident(
                "Cristales en la vía pública - Villaviciosa de Odón",
                "Hay cristales rotos en la acera y supone riesgo para peatones.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.MEDIA,
                IncidentState.EN_CURSO,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Villaviciosa de Odón", "Calle Carretas", 8, 28670, 40.3586, -3.9003),
                -125,
                -124,
                null,
                null,
                null
            ),
            createIncident(
                "Farola apagada en Gran Vía - Madrid",
                "La luminaria lleva varias noches sin funcionar y reduce la visibilidad de la zona.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.BAJA,
                IncidentState.RESUELTA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Madrid", "Gran Vía", 12, 28013, 40.4204, -3.7017),
                -6,
                -5,
                -5,
                null,
                null
            ),
            createIncident(
                "Alcantarilla rebosando - Madrid",
                "La alcantarilla desprende mal olor y rebosa agua en la vía pública.",
                IncidentCategory.AGUA,
                IncidentPriority.CRITICA,
                IncidentState.RESUELTA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Madrid", "Paseo del Prado", 8, 28014, 40.4138, -3.6922),
                -7,
                -6,
                -5,
                null,
                null
            ),
            createIncident(
                "Valla de protección rota - Madrid",
                "La valla presenta daños y no protege correctamente la zona peatonal.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.ALTA,
                IncidentState.RESUELTA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Madrid", "Plaza Mayor", 1, 28012, 40.4154, -3.7074),
                -8,
                -7,
                -5,
                null,
                null
            ),
            createIncident(
                "Mal estado del punto de residuos - Madrid",
                "La zona de contenedores presenta suciedad y residuos dispersos.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.MEDIA,
                IncidentState.RESUELTA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Madrid", "Calle Toledo", 90, 28005, 40.4109, -3.7101),
                -9,
                -8,
                -5,
                null,
                null
            ),
            createIncident(
                "Suciedad acumulada en acera - Madrid",
                "Hay restos de basura y hojas acumuladas en la zona de paso.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.BAJA,
                IncidentState.RESUELTA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Madrid", "Parque del Retiro", 1, 28009, 40.4153, -3.6844),
                -10,
                -9,
                -9,
                null,
                null
            ),
            createIncident(
                "Cableado visible en punto de luz - Alcalá de Henares",
                "Se observa cableado expuesto en una farola cercana a zona peatonal.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.CRITICA,
                IncidentState.RESUELTA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Alcalá de Henares", "Calle Mayor", 33, 28801, 40.4820, -3.3635),
                -11,
                -10,
                -9,
                null,
                null
            ),
            createIncident(
                "Tapa de registro hundida - Móstoles",
                "La tapa de saneamiento está hundida y puede provocar tropiezos.",
                IncidentCategory.AGUA,
                IncidentPriority.ALTA,
                IncidentState.RESUELTA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Móstoles", "Avenida de Portugal", 20, 28931, 40.3223, -3.8649),
                -12,
                -11,
                -9,
                null,
                null
            ),
            createIncident(
                "Papelera desprendida - Fuenlabrada",
                "La papelera está suelta y apoyada en el suelo.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.MEDIA,
                IncidentState.RESUELTA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Fuenlabrada", "Calle de Leganés", 18, 28945, 40.2867, -3.7935),
                -13,
                -12,
                -9,
                null,
                null
            ),
            createIncident(
                "Contenedor roto en Avenida de Fuenlabrada - Leganés",
                "El contenedor está agrietado y deja residuos en la vía pública.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.BAJA,
                IncidentState.RESUELTA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Leganés", "Avenida de Fuenlabrada", 5, 28911, 40.3272, -3.7635),
                -14,
                -13,
                -13,
                null,
                null
            ),
            createIncident(
                "Pintadas en mobiliario urbano - Getafe",
                "Se observan pintadas recientes en elementos municipales.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.CRITICA,
                IncidentState.RESUELTA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Getafe", "Calle Madrid", 40, 28901, 40.3057, -3.7329),
                -15,
                -14,
                -13,
                null,
                null
            ),
            createIncident(
                "Intermitencias en alumbrado público - Alcorcón",
                "Varias farolas se apagan y encienden de forma intermitente durante la noche.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.ALTA,
                IncidentState.RESUELTA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Alcorcón", "Calle Mayor", 14, 28921, 40.3493, -3.8284),
                -16,
                -15,
                -13,
                null,
                null
            ),
            createIncident(
                "Boca de riego dañada - Parla",
                "La boca de riego pierde agua de manera constante.",
                IncidentCategory.AGUA,
                IncidentPriority.MEDIA,
                IncidentState.RESUELTA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Parla", "Calle Real", 35, 28981, 40.2370, -3.7675),
                -17,
                -16,
                -13,
                null,
                null
            ),
            createIncident(
                "Banco deteriorado en zona pública - Torrejón de Ardoz",
                "El banco tiene piezas rotas y tornillos sueltos.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.BAJA,
                IncidentState.RESUELTA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Torrejón de Ardoz", "Avenida de la Constitución", 12, 28850, 40.4567, -3.4755),
                -18,
                -17,
                -17,
                null,
                null
            ),
            createIncident(
                "Contenedores desbordados - Alcobendas",
                "Hay bolsas acumuladas fuera de los contenedores.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.CRITICA,
                IncidentState.RESUELTA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Alcobendas", "Paseo de la Chopera", 56, 28100, 40.5475, -3.6420),
                -19,
                -18,
                -17,
                null,
                null
            ),
            createIncident(
                "Zona infantil con residuos - San Sebastián de los Reyes",
                "La zona infantil tiene envoltorios y restos de comida en el suelo.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.ALTA,
                IncidentState.RESUELTA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("San Sebastián de los Reyes", "Avenida de España", 22, 28701, 40.5469, -3.6261),
                -20,
                -19,
                -17,
                null,
                null
            ),
            createIncident(
                "Cuadro eléctrico abierto - Rivas-Vaciamadrid",
                "El armario del alumbrado está abierto y accesible desde la acera.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.MEDIA,
                IncidentState.RESUELTA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Rivas-Vaciamadrid", "Avenida de Covibar", 9, 28523, 40.3587, -3.5478),
                -21,
                -20,
                -17,
                null,
                null
            ),
            createIncident(
                "Fuga de agua en Avenida de Europa - Pozuelo de Alarcón",
                "Sale agua de un registro y se está formando un charco en la acera.",
                IncidentCategory.AGUA,
                IncidentPriority.BAJA,
                IncidentState.RESUELTA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Pozuelo de Alarcón", "Avenida de Europa", 18, 28224, 40.4397, -3.7899),
                -22,
                -21,
                -21,
                null,
                null
            ),
            createIncident(
                "Señal vertical torcida - Majadahonda",
                "Una señal está inclinada e invade parcialmente la zona de paso.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.CRITICA,
                IncidentState.RESUELTA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Majadahonda", "Gran Vía", 25, 28220, 40.4735, -3.8718),
                -23,
                -22,
                -21,
                null,
                null
            ),
            createIncident(
                "Restos voluminosos sin recoger - Las Rozas de Madrid",
                "Se han dejado muebles y enseres junto al punto de recogida.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.ALTA,
                IncidentState.RESUELTA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Las Rozas de Madrid", "Calle Real", 44, 28231, 40.4929, -3.8737),
                -24,
                -23,
                -21,
                null,
                null
            ),
            createIncident(
                "Cristales en la vía pública - Boadilla del Monte",
                "Hay cristales rotos en la acera y supone riesgo para peatones.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.MEDIA,
                IncidentState.RESUELTA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Boadilla del Monte", "Avenida Siglo XXI", 7, 28660, 40.4050, -3.8783),
                -25,
                -24,
                -21,
                null,
                null
            ),
            createIncident(
                "Farola apagada en Avenida de Colmenar Viejo - Tres Cantos",
                "La luminaria lleva varias noches sin funcionar y reduce la visibilidad de la zona.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.BAJA,
                IncidentState.RESUELTA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Tres Cantos", "Avenida de Colmenar Viejo", 15, 28760, 40.6009, -3.7081),
                -26,
                -25,
                -25,
                null,
                null
            ),
            createIncident(
                "Alcantarilla rebosando - Aranjuez",
                "La alcantarilla desprende mal olor y rebosa agua en la vía pública.",
                IncidentCategory.AGUA,
                IncidentPriority.CRITICA,
                IncidentState.RESUELTA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Aranjuez", "Calle de la Reina", 4, 28300, 40.0364, -3.6087),
                -27,
                -26,
                -25,
                null,
                null
            ),
            createIncident(
                "Valla de protección rota - Valdemoro",
                "La valla presenta daños y no protege correctamente la zona peatonal.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.ALTA,
                IncidentState.RESUELTA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Valdemoro", "Calle Estrella de Elola", 11, 28341, 40.1908, -3.6789),
                -28,
                -27,
                -25,
                null,
                null
            ),
            createIncident(
                "Mal estado del punto de residuos - Pinto",
                "La zona de contenedores presenta suciedad y residuos dispersos.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.MEDIA,
                IncidentState.RESUELTA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Pinto", "Calle Hospital", 6, 28320, 40.2429, -3.6991),
                -29,
                -28,
                -25,
                null,
                null
            ),
            createIncident(
                "Suciedad acumulada en acera - Collado Villalba",
                "Hay restos de basura y hojas acumuladas en la zona de paso.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.BAJA,
                IncidentState.RESUELTA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Collado Villalba", "Calle Real", 28, 28400, 40.6321, -4.0086),
                -30,
                -29,
                -29,
                null,
                null
            ),
            createIncident(
                "Cableado visible en punto de luz - Colmenar Viejo",
                "Se observa cableado expuesto en una farola cercana a zona peatonal.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.CRITICA,
                IncidentState.RESUELTA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Colmenar Viejo", "Calle de la Feria", 10, 28770, 40.6591, -3.7666),
                -31,
                -30,
                -29,
                null,
                null
            ),
            createIncident(
                "Tapa de registro hundida - Arganda del Rey",
                "La tapa de saneamiento está hundida y puede provocar tropiezos.",
                IncidentCategory.AGUA,
                IncidentPriority.ALTA,
                IncidentState.RESUELTA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Arganda del Rey", "Avenida del Ejército", 19, 28500, 40.3036, -3.4478),
                -32,
                -31,
                -29,
                null,
                null
            ),
            createIncident(
                "Papelera desprendida - San Fernando de Henares",
                "La papelera está suelta y apoyada en el suelo.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.MEDIA,
                IncidentState.RESUELTA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("San Fernando de Henares", "Calle Libertad", 16, 28830, 40.4259, -3.5326),
                -33,
                -32,
                -29,
                null,
                null
            ),
            createIncident(
                "Contenedor roto en Avenida de la Constitución - Coslada",
                "El contenedor está agrietado y deja residuos en la vía pública.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.BAJA,
                IncidentState.RESUELTA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Coslada", "Avenida de la Constitución", 31, 28821, 40.4238, -3.5613),
                -34,
                -33,
                -33,
                null,
                null
            ),
            createIncident(
                "Pintadas en mobiliario urbano - Villaviciosa de Odón",
                "Se observan pintadas recientes en elementos municipales.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.CRITICA,
                IncidentState.RESUELTA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Villaviciosa de Odón", "Calle Carretas", 8, 28670, 40.3586, -3.9003),
                -35,
                -34,
                -33,
                null,
                null
            ),
            createIncident(
                "Intermitencias en alumbrado público - Madrid",
                "Varias farolas se apagan y encienden de forma intermitente durante la noche.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.ALTA,
                IncidentState.RESUELTA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Madrid", "Gran Vía", 12, 28013, 40.4204, -3.7017),
                -36,
                -35,
                -33,
                null,
                null
            ),
            createIncident(
                "Boca de riego dañada - Madrid",
                "La boca de riego pierde agua de manera constante.",
                IncidentCategory.AGUA,
                IncidentPriority.MEDIA,
                IncidentState.RESUELTA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Madrid", "Paseo del Prado", 8, 28014, 40.4138, -3.6922),
                -37,
                -36,
                -33,
                null,
                null
            ),
            createIncident(
                "Banco deteriorado en zona pública - Madrid",
                "El banco tiene piezas rotas y tornillos sueltos.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.BAJA,
                IncidentState.RESUELTA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Madrid", "Plaza Mayor", 1, 28012, 40.4154, -3.7074),
                -38,
                -37,
                -37,
                null,
                null
            ),
            createIncident(
                "Contenedores desbordados - Madrid",
                "Hay bolsas acumuladas fuera de los contenedores.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.CRITICA,
                IncidentState.RESUELTA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Madrid", "Calle Toledo", 90, 28005, 40.4109, -3.7101),
                -39,
                -38,
                -37,
                null,
                null
            ),
            createIncident(
                "Zona infantil con residuos - Madrid",
                "La zona infantil tiene envoltorios y restos de comida en el suelo.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.ALTA,
                IncidentState.RESUELTA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Madrid", "Parque del Retiro", 1, 28009, 40.4153, -3.6844),
                -40,
                -39,
                -37,
                null,
                null
            ),
            createIncident(
                "Cuadro eléctrico abierto - Alcalá de Henares",
                "El armario del alumbrado está abierto y accesible desde la acera.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.MEDIA,
                IncidentState.RESUELTA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Alcalá de Henares", "Calle Mayor", 33, 28801, 40.4820, -3.3635),
                -41,
                -40,
                -37,
                null,
                null
            ),
            createIncident(
                "Fuga de agua en Avenida de Portugal - Móstoles",
                "Sale agua de un registro y se está formando un charco en la acera.",
                IncidentCategory.AGUA,
                IncidentPriority.BAJA,
                IncidentState.RESUELTA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Móstoles", "Avenida de Portugal", 20, 28931, 40.3223, -3.8649),
                -42,
                -41,
                -41,
                null,
                null
            ),
            createIncident(
                "Señal vertical torcida - Fuenlabrada",
                "Una señal está inclinada e invade parcialmente la zona de paso.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.CRITICA,
                IncidentState.RESUELTA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Fuenlabrada", "Calle de Leganés", 18, 28945, 40.2867, -3.7935),
                -43,
                -42,
                -41,
                null,
                null
            ),
            createIncident(
                "Restos voluminosos sin recoger - Leganés",
                "Se han dejado muebles y enseres junto al punto de recogida.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.ALTA,
                IncidentState.RESUELTA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Leganés", "Avenida de Fuenlabrada", 5, 28911, 40.3272, -3.7635),
                -44,
                -43,
                -41,
                null,
                null
            ),
            createIncident(
                "Cristales en la vía pública - Getafe",
                "Hay cristales rotos en la acera y supone riesgo para peatones.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.MEDIA,
                IncidentState.RESUELTA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Getafe", "Calle Madrid", 40, 28901, 40.3057, -3.7329),
                -45,
                -44,
                -41,
                null,
                null
            ),
            createIncident(
                "Farola apagada en Calle Mayor - Alcorcón",
                "La luminaria lleva varias noches sin funcionar y reduce la visibilidad de la zona.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.BAJA,
                IncidentState.RESUELTA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Alcorcón", "Calle Mayor", 14, 28921, 40.3493, -3.8284),
                -46,
                -45,
                -45,
                null,
                null
            ),
            createIncident(
                "Alcantarilla rebosando - Parla",
                "La alcantarilla desprende mal olor y rebosa agua en la vía pública.",
                IncidentCategory.AGUA,
                IncidentPriority.CRITICA,
                IncidentState.RESUELTA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Parla", "Calle Real", 35, 28981, 40.2370, -3.7675),
                -47,
                -46,
                -45,
                null,
                null
            ),
            createIncident(
                "Valla de protección rota - Torrejón de Ardoz",
                "La valla presenta daños y no protege correctamente la zona peatonal.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.ALTA,
                IncidentState.RESUELTA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Torrejón de Ardoz", "Avenida de la Constitución", 12, 28850, 40.4567, -3.4755),
                -48,
                -47,
                -45,
                null,
                null
            ),
            createIncident(
                "Mal estado del punto de residuos - Alcobendas",
                "La zona de contenedores presenta suciedad y residuos dispersos.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.MEDIA,
                IncidentState.RESUELTA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Alcobendas", "Paseo de la Chopera", 56, 28100, 40.5475, -3.6420),
                -49,
                -48,
                -45,
                null,
                null
            ),
            createIncident(
                "Suciedad acumulada en acera - San Sebastián de los Reyes",
                "Hay restos de basura y hojas acumuladas en la zona de paso.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.BAJA,
                IncidentState.RESUELTA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("San Sebastián de los Reyes", "Avenida de España", 22, 28701, 40.5469, -3.6261),
                -50,
                -49,
                -49,
                null,
                null
            ),
            createIncident(
                "Cableado visible en punto de luz - Rivas-Vaciamadrid",
                "Se observa cableado expuesto en una farola cercana a zona peatonal.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.CRITICA,
                IncidentState.RESUELTA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Rivas-Vaciamadrid", "Avenida de Covibar", 9, 28523, 40.3587, -3.5478),
                -51,
                -50,
                -49,
                null,
                null
            ),
            createIncident(
                "Tapa de registro hundida - Pozuelo de Alarcón",
                "La tapa de saneamiento está hundida y puede provocar tropiezos.",
                IncidentCategory.AGUA,
                IncidentPriority.ALTA,
                IncidentState.RESUELTA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Pozuelo de Alarcón", "Avenida de Europa", 18, 28224, 40.4397, -3.7899),
                -52,
                -51,
                -49,
                null,
                null
            ),
            createIncident(
                "Papelera desprendida - Majadahonda",
                "La papelera está suelta y apoyada en el suelo.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.MEDIA,
                IncidentState.RESUELTA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Majadahonda", "Gran Vía", 25, 28220, 40.4735, -3.8718),
                -53,
                -52,
                -49,
                null,
                null
            ),
            createIncident(
                "Contenedor roto en Calle Real - Las Rozas de Madrid",
                "El contenedor está agrietado y deja residuos en la vía pública.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.BAJA,
                IncidentState.RESUELTA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Las Rozas de Madrid", "Calle Real", 44, 28231, 40.4929, -3.8737),
                -54,
                -53,
                -53,
                null,
                null
            ),
            createIncident(
                "Pintadas en mobiliario urbano - Boadilla del Monte",
                "Se observan pintadas recientes en elementos municipales.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.CRITICA,
                IncidentState.RESUELTA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Boadilla del Monte", "Avenida Siglo XXI", 7, 28660, 40.4050, -3.8783),
                -55,
                -54,
                -53,
                null,
                null
            ),
            createIncident(
                "Intermitencias en alumbrado público - Tres Cantos",
                "Varias farolas se apagan y encienden de forma intermitente durante la noche.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.ALTA,
                IncidentState.CERRADA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Tres Cantos", "Avenida de Colmenar Viejo", 15, 28760, 40.6009, -3.7081),
                -56,
                -55,
                -53,
                -52,
                null
            ),
            createIncident(
                "Boca de riego dañada - Aranjuez",
                "La boca de riego pierde agua de manera constante.",
                IncidentCategory.AGUA,
                IncidentPriority.MEDIA,
                IncidentState.CERRADA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Aranjuez", "Calle de la Reina", 4, 28300, 40.0364, -3.6087),
                -57,
                -56,
                -53,
                -52,
                null
            ),
            createIncident(
                "Banco deteriorado en zona pública - Valdemoro",
                "El banco tiene piezas rotas y tornillos sueltos.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.BAJA,
                IncidentState.CERRADA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Valdemoro", "Calle Estrella de Elola", 11, 28341, 40.1908, -3.6789),
                -58,
                -57,
                -57,
                -56,
                null
            ),
            createIncident(
                "Contenedores desbordados - Pinto",
                "Hay bolsas acumuladas fuera de los contenedores.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.CRITICA,
                IncidentState.CERRADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Pinto", "Calle Hospital", 6, 28320, 40.2429, -3.6991),
                -59,
                -58,
                -57,
                -56,
                null
            ),
            createIncident(
                "Zona infantil con residuos - Collado Villalba",
                "La zona infantil tiene envoltorios y restos de comida en el suelo.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.ALTA,
                IncidentState.CERRADA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Collado Villalba", "Calle Real", 28, 28400, 40.6321, -4.0086),
                -60,
                -59,
                -57,
                -56,
                null
            ),
            createIncident(
                "Cuadro eléctrico abierto - Colmenar Viejo",
                "El armario del alumbrado está abierto y accesible desde la acera.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.MEDIA,
                IncidentState.CERRADA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Colmenar Viejo", "Calle de la Feria", 10, 28770, 40.6591, -3.7666),
                -61,
                -60,
                -57,
                -56,
                null
            ),
            createIncident(
                "Fuga de agua en Avenida del Ejército - Arganda del Rey",
                "Sale agua de un registro y se está formando un charco en la acera.",
                IncidentCategory.AGUA,
                IncidentPriority.BAJA,
                IncidentState.CERRADA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Arganda del Rey", "Avenida del Ejército", 19, 28500, 40.3036, -3.4478),
                -62,
                -61,
                -61,
                -60,
                null
            ),
            createIncident(
                "Señal vertical torcida - San Fernando de Henares",
                "Una señal está inclinada e invade parcialmente la zona de paso.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.CRITICA,
                IncidentState.CERRADA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("San Fernando de Henares", "Calle Libertad", 16, 28830, 40.4259, -3.5326),
                -63,
                -62,
                -61,
                -60,
                null
            ),
            createIncident(
                "Restos voluminosos sin recoger - Coslada",
                "Se han dejado muebles y enseres junto al punto de recogida.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.ALTA,
                IncidentState.CERRADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Coslada", "Avenida de la Constitución", 31, 28821, 40.4238, -3.5613),
                -64,
                -63,
                -61,
                -60,
                null
            ),
            createIncident(
                "Cristales en la vía pública - Villaviciosa de Odón",
                "Hay cristales rotos en la acera y supone riesgo para peatones.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.MEDIA,
                IncidentState.CERRADA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Villaviciosa de Odón", "Calle Carretas", 8, 28670, 40.3586, -3.9003),
                -65,
                -64,
                -61,
                -60,
                null
            ),
            createIncident(
                "Farola apagada en Gran Vía - Madrid",
                "La luminaria lleva varias noches sin funcionar y reduce la visibilidad de la zona.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.BAJA,
                IncidentState.CERRADA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Madrid", "Gran Vía", 12, 28013, 40.4204, -3.7017),
                -66,
                -65,
                -65,
                -64,
                null
            ),
            createIncident(
                "Alcantarilla rebosando - Madrid",
                "La alcantarilla desprende mal olor y rebosa agua en la vía pública.",
                IncidentCategory.AGUA,
                IncidentPriority.CRITICA,
                IncidentState.CERRADA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Madrid", "Paseo del Prado", 8, 28014, 40.4138, -3.6922),
                -67,
                -66,
                -65,
                -64,
                null
            ),
            createIncident(
                "Valla de protección rota - Madrid",
                "La valla presenta daños y no protege correctamente la zona peatonal.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.ALTA,
                IncidentState.CERRADA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Madrid", "Plaza Mayor", 1, 28012, 40.4154, -3.7074),
                -68,
                -67,
                -65,
                -64,
                null
            ),
            createIncident(
                "Mal estado del punto de residuos - Madrid",
                "La zona de contenedores presenta suciedad y residuos dispersos.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.MEDIA,
                IncidentState.CERRADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Madrid", "Calle Toledo", 90, 28005, 40.4109, -3.7101),
                -69,
                -68,
                -65,
                -64,
                null
            ),
            createIncident(
                "Suciedad acumulada en acera - Madrid",
                "Hay restos de basura y hojas acumuladas en la zona de paso.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.BAJA,
                IncidentState.CERRADA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Madrid", "Parque del Retiro", 1, 28009, 40.4153, -3.6844),
                -70,
                -69,
                -69,
                -68,
                null
            ),
            createIncident(
                "Cableado visible en punto de luz - Alcalá de Henares",
                "Se observa cableado expuesto en una farola cercana a zona peatonal.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.CRITICA,
                IncidentState.CERRADA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Alcalá de Henares", "Calle Mayor", 33, 28801, 40.4820, -3.3635),
                -71,
                -70,
                -69,
                -68,
                null
            ),
            createIncident(
                "Tapa de registro hundida - Móstoles",
                "La tapa de saneamiento está hundida y puede provocar tropiezos.",
                IncidentCategory.AGUA,
                IncidentPriority.ALTA,
                IncidentState.CERRADA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Móstoles", "Avenida de Portugal", 20, 28931, 40.3223, -3.8649),
                -72,
                -71,
                -69,
                -68,
                null
            ),
            createIncident(
                "Papelera desprendida - Fuenlabrada",
                "La papelera está suelta y apoyada en el suelo.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.MEDIA,
                IncidentState.CERRADA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Fuenlabrada", "Calle de Leganés", 18, 28945, 40.2867, -3.7935),
                -73,
                -72,
                -69,
                -68,
                null
            ),
            createIncident(
                "Contenedor roto en Avenida de Fuenlabrada - Leganés",
                "El contenedor está agrietado y deja residuos en la vía pública.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.BAJA,
                IncidentState.CERRADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Leganés", "Avenida de Fuenlabrada", 5, 28911, 40.3272, -3.7635),
                -74,
                -73,
                -73,
                -72,
                null
            ),
            createIncident(
                "Pintadas en mobiliario urbano - Getafe",
                "Se observan pintadas recientes en elementos municipales.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.CRITICA,
                IncidentState.CERRADA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Getafe", "Calle Madrid", 40, 28901, 40.3057, -3.7329),
                -75,
                -74,
                -73,
                -72,
                null
            ),
            createIncident(
                "Intermitencias en alumbrado público - Alcorcón",
                "Varias farolas se apagan y encienden de forma intermitente durante la noche.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.ALTA,
                IncidentState.CERRADA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Alcorcón", "Calle Mayor", 14, 28921, 40.3493, -3.8284),
                -76,
                -75,
                -73,
                -72,
                null
            ),
            createIncident(
                "Boca de riego dañada - Parla",
                "La boca de riego pierde agua de manera constante.",
                IncidentCategory.AGUA,
                IncidentPriority.MEDIA,
                IncidentState.CERRADA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Parla", "Calle Real", 35, 28981, 40.2370, -3.7675),
                -77,
                -76,
                -73,
                -72,
                null
            ),
            createIncident(
                "Banco deteriorado en zona pública - Torrejón de Ardoz",
                "El banco tiene piezas rotas y tornillos sueltos.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.BAJA,
                IncidentState.CERRADA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Torrejón de Ardoz", "Avenida de la Constitución", 12, 28850, 40.4567, -3.4755),
                -78,
                -77,
                -77,
                -76,
                null
            ),
            createIncident(
                "Contenedores desbordados - Alcobendas",
                "Hay bolsas acumuladas fuera de los contenedores.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.CRITICA,
                IncidentState.CERRADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Alcobendas", "Paseo de la Chopera", 56, 28100, 40.5475, -3.6420),
                -79,
                -78,
                -77,
                -76,
                null
            ),
            createIncident(
                "Zona infantil con residuos - San Sebastián de los Reyes",
                "La zona infantil tiene envoltorios y restos de comida en el suelo.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.ALTA,
                IncidentState.CERRADA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("San Sebastián de los Reyes", "Avenida de España", 22, 28701, 40.5469, -3.6261),
                -80,
                -79,
                -77,
                -76,
                null
            ),
            createIncident(
                "Cuadro eléctrico abierto - Rivas-Vaciamadrid",
                "El armario del alumbrado está abierto y accesible desde la acera.",
                IncidentCategory.ALUMBRADO,
                IncidentPriority.MEDIA,
                IncidentState.RECHAZADA,
                IncidentCategory.ALUMBRADO,
                user,
                ubicacion("Rivas-Vaciamadrid", "Avenida de Covibar", 9, 28523, 40.3587, -3.5478),
                -81,
                null,
                null,
                null,
                -80
            ),
            createIncident(
                "Fuga de agua en Avenida de Europa - Pozuelo de Alarcón",
                "Sale agua de un registro y se está formando un charco en la acera.",
                IncidentCategory.AGUA,
                IncidentPriority.BAJA,
                IncidentState.RECHAZADA,
                IncidentCategory.AGUA,
                user,
                ubicacion("Pozuelo de Alarcón", "Avenida de Europa", 18, 28224, 40.4397, -3.7899),
                -82,
                null,
                null,
                null,
                -81
            ),
            createIncident(
                "Señal vertical torcida - Majadahonda",
                "Una señal está inclinada e invade parcialmente la zona de paso.",
                IncidentCategory.MOBILIARIO,
                IncidentPriority.CRITICA,
                IncidentState.RECHAZADA,
                IncidentCategory.MOBILIARIO,
                user,
                ubicacion("Majadahonda", "Gran Vía", 25, 28220, 40.4735, -3.8718),
                -83,
                null,
                null,
                null,
                -82
            ),
            createIncident(
                "Restos voluminosos sin recoger - Las Rozas de Madrid",
                "Se han dejado muebles y enseres junto al punto de recogida.",
                IncidentCategory.RESIDUOS,
                IncidentPriority.ALTA,
                IncidentState.RECHAZADA,
                IncidentCategory.RESIDUOS,
                user,
                ubicacion("Las Rozas de Madrid", "Calle Real", 44, 28231, 40.4929, -3.8737),
                -84,
                null,
                null,
                null,
                -83
            ),
            createIncident(
                "Cristales en la vía pública - Boadilla del Monte",
                "Hay cristales rotos en la acera y supone riesgo para peatones.",
                IncidentCategory.LIMPIEZA,
                IncidentPriority.MEDIA,
                IncidentState.RECHAZADA,
                IncidentCategory.LIMPIEZA,
                user,
                ubicacion("Boadilla del Monte", "Avenida Siglo XXI", 7, 28660, 40.4050, -3.8783),
                -85,
                null,
                null,
                null,
                -84
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
        Integer daysSinceAsignation,
        Integer daysSinceResolution,
        Integer daysSinceClosing,
        Integer daysSinceRejection
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
        incident.setCreationInstant(Instant.now().plusSeconds(daysSinceCreation * 24L * 60L * 60L));

        if (daysSinceAsignation != null) {
            incident.setAsignationDate(Instant.now().plusSeconds(daysSinceAsignation * 24L * 60L * 60L));
            incident.setAssigner(creator); // Set assigner to creator for seed data
        }
        if (daysSinceResolution != null) {
            incident.setResolutionDate(Instant.now().plusSeconds(daysSinceResolution * 24L * 60L * 60L));
            incident.setResolver(creator);
        }
        if (daysSinceClosing != null) {
            incident.setClosingDate(Instant.now().plusSeconds(daysSinceClosing * 24L * 60L * 60L));
            incident.setCloser(creator);
        }
        if (daysSinceRejection != null) {
            incident.setRejectionDate(Instant.now().plusSeconds(daysSinceRejection * 24L * 60L * 60L));
            incident.setRejecter(creator);
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
