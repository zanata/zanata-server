/*
 * Copyright 2010, Red Hat, Inc. and individual contributors as indicated by the
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

package org.zanata.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.PrePersist;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.NaturalId;
import org.hibernate.annotations.Type;
import org.hibernate.search.annotations.IndexedEmbedded;
import org.zanata.common.ContentState;
import com.google.common.base.Predicates;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Patrick Huang <a
 *         href="mailto:pahuang@redhat.com">pahuang@redhat.com</a>
 */
@Entity
@Immutable
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@BatchSize(size = 20)
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class HTextFlowTargetReviewComment implements Serializable
{
   private static final long serialVersionUID = 1413384329431214946L;

   @Setter(AccessLevel.PROTECTED)
   private Long id;
   private Date madeDate;
   private HPerson madeBy;
   private HTextFlowTarget textFlowTarget;
   private String comment;

   @Setter(AccessLevel.PROTECTED)
   private Integer targetVersion;

   @Setter(AccessLevel.NONE)
   private transient String madeByName;

   public HTextFlowTargetReviewComment(HTextFlowTarget target, String comment, HPerson madeBy)
   {
      this.textFlowTarget = target;
      this.comment = comment;
      this.madeBy = madeBy;
      madeByName = madeBy.getName();
      targetVersion = target.getVersionNum();
   }

   @Id
   @GeneratedValue
   public Long getId()
   {
      return id;
   }

   @Temporal(TemporalType.TIMESTAMP)
   @Column(nullable = false)
   public Date getMadeDate()
   {
      return madeDate;
   }

   @PrePersist
   private void onPersist()
   {
      madeDate = new Date();
   }

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "made_by_id", nullable = false)
   public HPerson getMadeBy()
   {
      return madeBy;
   }

   @Transient
   public String getMadeByName()
   {
      return madeByName;
   }

   @NotNull
   @Type(type = "text")
   public String getComment()
   {
      return comment;
   }

   @NotNull
   @NaturalId
   @ManyToOne
   @JoinColumn(name = "target_id")
   @IndexedEmbedded
   public HTextFlowTarget getTextFlowTarget()
   {
      return textFlowTarget;
   }

   @NotNull
   @NaturalId
   public Integer getTargetVersion()
   {
      return targetVersion;
   }

   // TODO pahuang we probably want to cache below two methods
   @Transient
   public ContentState getContentStateOfCommentedTarget()
   {
      if (textFlowTarget.getVersionNum().equals(targetVersion))
      {
         return textFlowTarget.getState();
      }
      return textFlowTarget.getHistory().get(targetVersion).getState();
   }

   @Transient
   public List<String> getContentsOfCommentedTarget()
   {
      if (textFlowTarget.getVersionNum().equals(targetVersion))
      {
         return textFlowTarget.getContents();
      }
      return textFlowTarget.getHistory().get(targetVersion).getContents();
   }

}
