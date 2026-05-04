package com.gui.gui.db;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Small startup helper that ensures certain DB columns exist when Hibernate schema
 * update does not pick them up correctly on H2 file databases.
 */
@Configuration
public class SchemaFixer {

    private static final Logger log = LoggerFactory.getLogger(SchemaFixer.class);

    @Bean
    public CommandLineRunner ensureCreationInstantColumn(DataSource dataSource) {
        return args -> {
            try (Connection conn = dataSource.getConnection()) {
                // Ensure creation_instant column exists and is nullable
                ResultSet rs = conn.getMetaData().getColumns(null, null, "INCIDENTS", "CREATION_INSTANT");
                if (!rs.next()) {
                    log.info("creation_instant column missing, adding it to incidents table");
                    try (Statement st = conn.createStatement()) {
                        st.executeUpdate("ALTER TABLE incidents ADD COLUMN creation_instant TIMESTAMP");
                    }
                    log.info("creation_instant column added");
                } else {
                    log.debug("creation_instant column already present");
                }

                // Ensure priority column is nullable (operator sets it later)
                try (Statement st = conn.createStatement()) {
                    st.executeUpdate("ALTER TABLE incidents ALTER COLUMN priority SET NULL");
                    log.info("priority column set to allow null");
                } catch (Exception e) {
                    // Column may already be nullable, ignore
                    log.debug("priority column null setting: {}", e.getMessage());
                }
            } catch (Exception e) {
                log.warn("Could not ensure schema fixes: {}", e.getMessage());
            }
        };
    }
}
