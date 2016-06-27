/*
 * Copyright 2013, Red Hat, Inc. and individual contributors
 * as indicated by the @author tags. See the copyright.txt file in the
 * distribution for a full listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

package org.zanata.database;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;

import com.google.common.base.Throwables;
import org.hibernate.service.jdbc.connections.spi.ConnectionProvider;
import org.hibernate.service.spi.Configurable;
import org.hibernate.service.spi.Stoppable;

/**
 * @author Sean Flanigan <a
 *         href="mailto:sflaniga@redhat.com">sflaniga@redhat.com</a>
 */
public class WrappedDatasourceConnectionProvider
        implements ConnectionProvider, Configurable, Stoppable {

    private static Class<ConnectionProvider> delegateClass;

    static {
        try {
            delegateClass =
                    (Class<ConnectionProvider>) Class.forName("org.hibernate.service.jdbc.connections.internal.DatasourceConnectionProviderImpl");
        } catch (ClassNotFoundException e) {
            try {
                delegateClass =
                        (Class<ConnectionProvider>) Class.forName("org.hibernate.engine.jdbc.connections.internal.DatasourceConnectionProviderImpl");
            } catch (ClassNotFoundException e1) {
                throw new RuntimeException("Unable to find DatasourceConnectionProviderImpl");
            }
        }
    }

    private static final long serialVersionUID = 1L;
    private final WrapperManager wrapperManager = new WrapperManager();
    private final ConnectionProvider delegate;

    public WrappedDatasourceConnectionProvider() {
        try {
            delegate = delegateClass.newInstance();
        } catch (Exception e) {
            throw Throwables.propagate(e);
        }
    }

    @Override
    public Connection getConnection() throws SQLException {
        return wrapperManager.wrapIfNeeded(delegate.getConnection());
    }

    @Override
    public void closeConnection(Connection conn) throws SQLException {
        delegate.closeConnection(conn);
    }

    @Override
    public boolean supportsAggressiveRelease() {
        return delegate.supportsAggressiveRelease();
    }

    @Override
    public boolean isUnwrappableAs(Class unwrapType) {
        return delegate.isUnwrappableAs(unwrapType);
    }

    @Override
    public <T> T unwrap(Class<T> unwrapType) {
        return delegate.unwrap(unwrapType);
    }

    @Override
    public void configure(Map configurationValues) {
        ((Configurable) delegate).configure(configurationValues);
    }

    @Override
    public void stop() {
        ((Stoppable) delegate).stop();
    }

}
