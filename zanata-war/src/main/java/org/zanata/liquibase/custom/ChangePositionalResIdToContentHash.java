/*
 * Copyright 2015, Red Hat, Inc. and individual contributors as indicated by the
 * @author tags. See the copyright.txt file in the distribution for a full
 * listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This software is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this software; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA, or see the FSF
 * site: http://www.fsf.org.
 */
package org.zanata.liquibase.custom;

import com.google.common.collect.ImmutableSet;
import liquibase.change.custom.CustomTaskChange;
import liquibase.database.Database;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.CustomChangeException;
import liquibase.exception.DatabaseException;
import liquibase.exception.SetupException;
import liquibase.exception.ValidationErrors;
import liquibase.logging.LogFactory;
import liquibase.logging.Logger;
import liquibase.resource.ResourceAccessor;
import org.zanata.common.DocumentType;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.Set;


/**
 * Change the resource ID (resId) for text flows in some document formats to be
 * a hash of the content, rather than a position-based value.
 *
 * Text flows in the following document types {@link org.zanata.common.DocumentType} are
 * modified:
 *
 *   - txt {@link org.zanata.common.DocumentType#PLAIN_TEXT}
 *   - all libreoffice types
 *
 * If multiple text flows in the same document have the same content, only the first
 * will be kept.
 */
public class ChangePositionalResIdToContentHash implements CustomTaskChange {

    private static final Set<DocumentType> documentTypes = ImmutableSet.of(DocumentType.PLAIN_TEXT,
            DocumentType.OPEN_DOCUMENT_DATABASE, DocumentType.OPEN_DOCUMENT_FORMULA,
            DocumentType.OPEN_DOCUMENT_GRAPHICS, DocumentType.OPEN_DOCUMENT_PRESENTATION,
            DocumentType.OPEN_DOCUMENT_SPREADSHEET, DocumentType.OPEN_DOCUMENT_TEXT);

    private static final String countDocumentsOfTypeSql =
            "select count(*) from HDocument_RawDocument " +
                    "left join HRawDocument on HDocument_RawDocument.rawDocumentId=HRawDocument.id " +
                    "where HRawDocument.type = ?";

    private static final String selectDocumentsOfTypeSql =
            "select documentId from HDocument_RawDocument " +
                    "left join HRawDocument on HDocument_RawDocument.rawDocumentId=HRawDocument.id " +
                    "where HRawDocument.type = ?";

    // id must be present as primary key to allow updates in the ResultSet
    private static final String selectTextFlowsSql =
            "select id, contentHash, pos, resId, obsolete from HTextFlow where document_id = ? " +
                    "order by pos";
    private static final int ID_COLUMN = 1;
    private static final int CONTENT_HASH_COLUMN = 2;
    private static final int POS_COLUMN = 3;
    private static final int RES_ID_COLUMN = 4;
    private static final int OBSOLETE_COLUMN = 5;

    private Logger log = LogFactory.getLogger();

    private PreparedStatement countDocumentsOfType;
    private PreparedStatement selectDocumentsOfType;
    private PreparedStatement selectTextFlows;

    private int totalDocs = 0;
    private int totalTextFlows = 0;

    @Override
    public void execute(Database database) throws CustomChangeException {

        try {
            prepareStatements((JdbcConnection) database.getConnection());
            // could use try-with-resources to define the PreparedStatements here
            // but making them fields allows for cleaner code.
            try {
                for (DocumentType type : documentTypes) {
                    migrateResId(type);
                }
            } finally {
                closeStatements();
            }
        } catch (DatabaseException | SQLException e) {
            throw new CustomChangeException(e);
        }
        // connection is not closed in a finally clause since doing so causes liquibase to throw exceptions.
    }

    private void prepareStatements(JdbcConnection conn) throws DatabaseException {
        countDocumentsOfType = conn.prepareStatement(countDocumentsOfTypeSql,
                ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY);
        selectDocumentsOfType = conn.prepareStatement(selectDocumentsOfTypeSql,
                ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY);
        selectTextFlows = conn.prepareStatement(selectTextFlowsSql,
                ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_UPDATABLE);
    }

    private void closeStatements() throws SQLException {
        countDocumentsOfType.close();
        selectDocumentsOfType.close();
        selectTextFlows.close();
    }

    /**
     * Update resId for all text flows in documents of the given type.
     *
     * @param type type to migrate
     * @throws SQLException
     */
    private void migrateResId(DocumentType type) throws SQLException {
        long docsOfType;
        long docsProcessed = 0;
        countDocumentsOfType.setString(1, type.name());
        try (ResultSet countOfType = countDocumentsOfType.executeQuery()) {
            if (countOfType.next()) {
                docsOfType = countOfType.getLong(1);
                log.info("processing " + docsOfType + " documents of type " + type.name());
            } else {
                // unexpected error, but does not have to destroy everything.
                throw new SQLException("Count query returned no rows.");
            }
        }

        selectDocumentsOfType.setString(1, type.name());
        try (ResultSet documentIds = selectDocumentsOfType.executeQuery()) {
            while (documentIds.next()) {
                Long documentId = documentIds.getLong(1);
                migrateResIdForDocument(documentId);
                docsProcessed++;
                if (docsProcessed % 100 == 0) {
                    log.info("    processed " + docsProcessed + " of " + docsOfType);
                }
                totalDocs++;
            }
        }
    }

    /**
     * Update resId for all text flows in a specified document.
     *
     * @param docId database id for the document
     */
    private void migrateResIdForDocument(Long docId) throws SQLException {
        selectTextFlows.setLong(1, docId);
        try (ResultSet textFlows = selectTextFlows.executeQuery()) {

            Set<String> usedIds = new HashSet<>();
            int newPos = 0;
            int processed = 0;

            while (textFlows.next()) {
                long id = textFlows.getLong(ID_COLUMN);
                boolean isObsolete = textFlows.getBoolean(OBSOLETE_COLUMN);

                if (!isObsolete) {
                    String contentHash = textFlows.getString(CONTENT_HASH_COLUMN);

                    if (usedIds.contains(contentHash)) {
                        textFlows.updateBoolean(OBSOLETE_COLUMN, true);
                        textFlows.updateRow();
                    } else {
                        textFlows.updateLong(POS_COLUMN, newPos);
                        textFlows.updateString(RES_ID_COLUMN, contentHash);
                        // Must set 'bit' fields explicitly when doing an update
                        // due to a bug in the mysql connector. See
                        //     https://bugs.mysql.com/bug.php?id=75475
                        textFlows.updateBoolean(OBSOLETE_COLUMN, isObsolete);
                        textFlows.updateRow();

                        usedIds.add(contentHash);
                        newPos++;
                    }
                }
                processed++;
                if (processed % 500 == 0) {
                    log.info("        processed " + processed + " text flows");
                }
                totalTextFlows++;
            }
        }
    }

    @Override
    public String getConfirmationMessage() {
        return "Finished ChangePositionalResIdToContentHash. Updated resource ID for " + totalTextFlows +
                " text flows in " + totalDocs + "documents.";
    }

    @Override
    public void setUp() throws SetupException {
    }

    @Override
    public void setFileOpener(ResourceAccessor resourceAccessor) {
    }

    @Override
    public ValidationErrors validate(Database database) {
        return null;
    }
}
