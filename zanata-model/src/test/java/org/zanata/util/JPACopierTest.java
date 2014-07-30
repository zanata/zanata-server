package org.zanata.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.times;

import java.io.Serializable;
import java.util.List;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import javax.persistence.CascadeType;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.Cascade;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.zanata.common.HasContents;
import org.zanata.common.LocaleId;
import org.zanata.model.HSimpleComment;
import org.zanata.model.HTextContainer;
import org.zanata.model.HasSimpleComment;
import org.zanata.model.ITextFlow;
import org.zanata.model.ITextFlowHistory;
import org.zanata.model.ITextFlowTarget;

import com.google.common.collect.Lists;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest(JPACopier.class)
public class JPACopierTest {
    @Test
    public void testCopy() throws Exception {
        DummyClass original = constructTestData();
        DummyClass clone = JPACopier.<DummyClass> copyBean(original);
        assertClone(original, clone);
    }

    @Test
    public void testRecursiveClone() throws Exception {
        PowerMockito.mockStatic(JPACopier.class);

        DummyClass original = constructTestData();

        DummyClass clone = JPACopier.<DummyClass> copyBean(original);

        PowerMockito.verifyStatic(times(1));
        JPACopier.copyBean(any(DummyClass.class));

        PowerMockito.verifyStatic(times(1));
        JPACopier.copyBean(any(DummyClass2.class));
    }

    private void assertClone(DummyClass original, DummyClass clone) {
        assertThat(clone.getTestString()).isEqualTo(original.getTestString());

        assertThat(clone.getTestClass()).isNotSameAs(original.getTestClass());

        assertThat(clone.getTestClass().getTestString1()).isEqualTo(
                original.getTestClass().getTestString1());

        assertThat(clone.getTestClass().getTestString2()).isEqualTo(
                original.getTestClass().getTestString2());

        assertThat(clone.getTestClass().getTestList()).isNotSameAs(
                original.getTestClass().getTestList());

        assertThat(clone.getTestClass().getTestList()).isEqualTo(
                original.getTestClass().getTestList());
    }

    private DummyClass constructTestData() {
        DummyClass2 child =
                new DummyClass2("String1", "String2", Lists.newArrayList(
                        "item1", "item2", "item3"));
        return new DummyClass("string 1", child);
    }

    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DummyClass {
        private String testString;
        private DummyClass2 testClass;

        // expect to clone but not the same instance
        @OneToOne(optional = true, fetch = FetchType.LAZY,
                cascade = CascadeType.ALL)
        public DummyClass2 getTestClass() {
            return testClass;
        }

        public String getTestString() {
            return testString;
        }
    }

    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DummyClass2 {

        private String testString1;
        private String testString2;
        private List<String> testList;

        public String getTestString1() {
            return testString1;
        }

        public String getTestString2() {
            return testString2;
        }

        // expect to create new instance when copy
        public List<String> getTestList() {
            return testList;
        }
    }

}
