package org.zanata.servlet;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.sql.DataSource;

import lombok.extern.slf4j.Slf4j;

import org.zanata.util.ZanataDatabaseDriverMetadata;
import org.zanata.util.ZanataDatabaseMetaData;

/**
 * @author Patrick Huang <a
 *         href="mailto:pahuang@redhat.com">pahuang@redhat.com</a>
 */
@Slf4j
public class ZanataDatabaseMetadataServletListener implements
        ServletContextListener {
    private static final String LIQUIBASE_DATASOURCE = "liquibase.datasource";

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        ServletContext servletContext = servletContextEvent.getServletContext();
        InitialContext ic = null;
        Connection connection = null;
        try {
            ic = new InitialContext();
            String dataSourceName =
                    getValue(LIQUIBASE_DATASOURCE, servletContext, ic);
            DataSource dataSource = (DataSource) ic.lookup(dataSourceName);
            connection = dataSource.getConnection();
            DatabaseMetaData metaData = connection.getMetaData();

            String dbProductName = metaData.getDatabaseProductName();
            int dbMajorVer = metaData.getDatabaseMajorVersion();
            int dbMinorVer = metaData.getDatabaseMinorVersion();
            String dbVersion =
                    metaData.getDatabaseProductVersion();
            ZanataDatabaseMetaData databaseMetaData = ZanataDatabaseMetaData
                    .createAndSet(dbProductName, dbMajorVer, dbMinorVer,
                            dbVersion);
            databaseMetaData.checkCompatibility();
            ZanataDatabaseDriverMetadata.createAndSet(metaData.getDriverName(),
                    metaData.getDriverVersion());

        } catch (Exception e) {
            log.warn("fail on getting database metadata", e);
        } finally {
            closeResources(ic, connection);
        }
    }

    /**
     * Try to read the value that is stored by the given key from
     * <ul>
     * <li>JNDI</li>
     * <li>the servlet context's init parameters</li>
     * <li>system properties</li>
     * </ul>
     */
    public String getValue(String key, ServletContext servletContext,
            InitialContext initialContext) {
        // Try to get value from JNDI
        try {
            Context envCtx = (Context) initialContext.lookup("java:comp/env");
            return (String) envCtx.lookup(key);
        } catch (NamingException e) {
            // Ignore
        }

        // Return the value from the servlet context
        String valueFromServletContext = servletContext.getInitParameter(key);
        if (valueFromServletContext != null) {
            return valueFromServletContext;
        }

        // Otherwise: Return system property
        return System.getProperty(key);
    }

    private static void closeResources(InitialContext ic, Connection conn) {
        if (ic != null) {
            try {
                ic.close();
            } catch (NamingException e) {
                // ignore
            }
        }
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                // ignore
            }
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
    }
}
