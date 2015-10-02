package org.zanata.model;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.Access;
import javax.persistence.AccessType;
import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import javax.persistence.SequenceGenerator;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Date;

/**
 * @author Alex Eng <a href="aeng@redhat.com">aeng@redhat.com</a>
 */
@MappedSuperclass
@Access(AccessType.FIELD)
@Getter
public class TimeEntityBase implements Serializable {
    @Id
    @GeneratedValue
    protected Long id;

    //TODO: need util to generate same id for edited request (immutable data)
    @Column(nullable = false)
//    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "entity_seq")
//    @SequenceGenerator(
//        name="entity_seq",
//        sequenceName="entity_sequence",
//        allocationSize=20
//    )
    @NotNull
    @Setter
    protected Long entityId;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    @NotNull
    @Setter(AccessLevel.PROTECTED)
    protected Date validFrom;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = true)
    @Setter(AccessLevel.PROTECTED)
    protected Date validTo;
}
