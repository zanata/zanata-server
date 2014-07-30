package org.zanata.service.impl;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jboss.seam.util.Work;
import org.zanata.dao.DocumentDAO;
import org.zanata.dao.ProjectIterationDAO;
import org.zanata.file.FilePersistService;
import org.zanata.model.HDocument;
import org.zanata.model.HProjectIteration;
import org.zanata.model.HRawDocument;
import org.zanata.service.CopyVersionService;

import com.google.common.collect.Maps;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Slf4j
@AllArgsConstructor
public class CopyDocumentWork extends Work<Map<Long, Long>> {

    private final Long versionId;
    private final Long newVersionId;
    private final DocumentDAO documentDAO;
    private final ProjectIterationDAO projectIterationDAO;
    private final FilePersistService filePersistService;
    private final CopyVersionService copyVersionService;
    private final int batchStart;
    private final int batchLength;

    @Override
    protected Map<Long, Long> work() throws Exception {
        Map<Long, Long> docMap = Maps.newHashMap();

        HProjectIteration newVersion =
                projectIterationDAO.findById(newVersionId);

        List<HDocument> documents = documentDAO.getByVersionId(versionId,
                batchStart, batchLength);

        for (HDocument doc : documents) {
            HDocument newDocument =
                    copyVersionService.copyDocument(newVersion, doc);
            // Needs to persist before insert raw document
            newDocument = documentDAO.makePersistent(newDocument);

            if (doc.getRawDocument() != null) {
                HRawDocument newRawDocument =
                        copyVersionService.copyRawDocument(newDocument,
                                doc.getRawDocument());

                filePersistService.copyAndPersistRawDocument(
                        doc.getRawDocument(), newRawDocument);

                documentDAO.addRawDocument(newDocument, newRawDocument);
            }
            newVersion.getDocuments()
                    .put(newDocument.getDocId(), newDocument);
            docMap.put(doc.getId(), newDocument.getId());
        }
        documentDAO.flush();
        return docMap;
    }
}
