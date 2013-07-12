package org.zanata.webtrans.shared.rpc;

import java.util.List;

import org.zanata.webtrans.client.service.GetTransUnitActionContext;
import org.zanata.webtrans.shared.model.DocumentId;
import org.zanata.webtrans.shared.model.TransUnitId;
import org.zanata.webtrans.shared.model.ValidationId;

import com.google.common.base.Objects;

public class GetTransUnitList extends AbstractWorkspaceAction<GetTransUnitListResult>
{
   private static final long serialVersionUID = 1L;
   private int offset;
   private int count;
   private DocumentId documentId;
   private String phrase;
   private boolean filterByTranslated, filterByFuzzy, filterByUntranslated, filterByApproved, filterByRejected, filterByHasError;
   private List<ValidationId> validationIds;
   private TransUnitId targetTransUnitId;
   private boolean needReloadIndex = false;

   @SuppressWarnings("unused")
   private GetTransUnitList()
   {
   }

   private GetTransUnitList(DocumentId id, int offset, int count, String phrase, boolean filterByTranslated, boolean filterByFuzzy, boolean filterByUntranslated, boolean filterByApproved, boolean filterByRejected, boolean filterByHasError, TransUnitId targetTransUnitId, List<ValidationId> validationIds)
   {
      this.documentId = id;
      this.offset = offset;
      this.count = count;
      this.phrase = phrase;
      this.filterByTranslated = filterByTranslated;
      this.filterByFuzzy = filterByFuzzy;
      this.filterByUntranslated = filterByUntranslated;
      this.filterByApproved = filterByApproved;
      this.filterByRejected = filterByRejected;
      this.filterByHasError = filterByHasError;
      this.targetTransUnitId = targetTransUnitId;
      this.validationIds = validationIds;

   }

   public static GetTransUnitList newAction(GetTransUnitActionContext context)
   {
      return new GetTransUnitList(context.getDocument().getId(), context.getOffset(), context.getCount(), context.getFindMessage(), context.isFilterTranslated(), context.isFilterNeedReview(), context.isFilterUntranslated(), context.isFilterApproved(), context.isFilterRejected(), context.isFilterHasError(), context.getTargetTransUnitId(), context.getValidationIds());
   }

   public boolean isNeedReloadIndex()
   {
      return needReloadIndex;
   }

   public GetTransUnitList setNeedReloadIndex(boolean needReloadIndex)
   {
      this.needReloadIndex = needReloadIndex;
      return this;
   }

   public int getOffset()
   {
      return offset;
   }

   public int getCount()
   {
      return count;
   }

   public DocumentId getDocumentId()
   {
      return documentId;
   }

   public String getPhrase()
   {
      return this.phrase;
   }

   public boolean isFilterByTranslated()
   {
      return filterByTranslated;
   }

   public boolean isFilterByFuzzy()
   {
      return filterByFuzzy;
   }

   public boolean isFilterByUntranslated()
   {
      return filterByUntranslated;
   }
   
   public boolean isFilterByApproved()
   {
      return filterByApproved;
   }
   
   public boolean isFilterByRejected()
   {
      return filterByRejected;
   }

   public boolean isFilterByHasError()
   {
      return filterByHasError;
   }

   public TransUnitId getTargetTransUnitId()
   {
      return targetTransUnitId;
   }

   public List<ValidationId> getValidationIds()
   {
      return validationIds;
   }

   public boolean isAcceptAllStatus()
   {
      //all filter options are checked or unchecked
      return filterByFuzzy == filterByTranslated && filterByFuzzy == filterByUntranslated && filterByFuzzy == filterByHasError && filterByApproved == filterByFuzzy && filterByRejected == filterByFuzzy;
   }

   @Override
   public String toString()
   {
      // @formatter:off
      return Objects.toStringHelper(this).
            add("offset", offset).
            add("count", count).
            add("documentId", documentId).
            add("phrase", phrase).
            add("filterByTranslated", filterByTranslated).
            add("filterByFuzzy", filterByFuzzy).
            add("filterByUntranslated", filterByUntranslated).
            add("filterByApproved", filterByApproved).
            add("filterByRejected", filterByRejected).
            add("filterByHasError", filterByHasError).
            add("targetTransUnitId", targetTransUnitId).
            add("needReloadIndex", needReloadIndex).
            toString();
      // @formatter:on
   }
}
