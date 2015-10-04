/*
 * Copyright 2015, Red Hat, Inc. and individual contributors
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

package org.zanata.model;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;
import org.zanata.common.LocaleId;
import org.zanata.model.type.EntityStatusType;
import org.zanata.model.type.LocaleIdType;
import org.zanata.model.type.RequestState;
import org.zanata.model.type.RequestStateType;
import org.zanata.model.type.RequestType;
import org.zanata.model.type.RequestTypeType;

import javax.persistence.Access;
import javax.persistence.AccessType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Date;

/**
 * @author Alex Eng <a href="aeng@redhat.com">aeng@redhat.com</a>
 */
@Access(AccessType.FIELD)
@Getter
@Setter(AccessLevel.PRIVATE)
@Entity
@EntityListeners({ Request.EntityListener.class })
@TypeDefs({
    @TypeDef(name = "requestState", typeClass = RequestStateType.class),
    @TypeDef(name = "requestType", typeClass = RequestTypeType.class)

})
@NoArgsConstructor
public class Request extends TimeEntityBase {

    @Type(type = "requestState")
    @Column(nullable = true)
    private RequestState state;

    @Type(type = "requestType")
    @Column(nullable = false)
    @NotNull
    private RequestType requestType;

    @Column(nullable = true)
    @Size(max = 255)
    private String comment;

    //requesting account.
    @ManyToOne
    @JoinColumn(name = "requesterId", nullable = false)
    @NotNull
    private HAccount requester;

    //account who actioned on the request.
    @ManyToOne
    @JoinColumn(name = "actorId", nullable = true)
    private HAccount actor;

    public Request(RequestType requestType, HAccount requester) {
        this.requestType = requestType;
        this.requester = requester;
    }

    public void update(HAccount actor, RequestState state, String comment) {
        this.actor = actor;
        this.state = state;
        this.comment = comment;
    }

    public static class EntityListener {
        @PreUpdate
        private void preUpdate(Request request) {
            request.setValidTo(getNow()); //request invalid after changes
        }

        @PrePersist
        private void prePersist(Request request) {
            request.setValidFrom(getNow()); //request valid from now
        }

        private Date getNow() {
            return new Date();
        }
    }

    public final Request clone() {
        Request newRequest = new Request(this.requestType, this.requester);
        newRequest.state = this.state;
        newRequest.comment = this.comment;
        newRequest.actor = this.actor;
        newRequest.entityId = this.entityId;
        return newRequest;
    }
}
