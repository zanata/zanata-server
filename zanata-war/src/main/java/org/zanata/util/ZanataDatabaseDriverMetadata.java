package org.zanata.util;

import lombok.RequiredArgsConstructor;

import com.google.common.base.MoreObjects;

/**
 * @author Patrick Huang <a
 *         href="mailto:pahuang@redhat.com">pahuang@redhat.com</a>
 */
@RequiredArgsConstructor
public class ZanataDatabaseDriverMetadata {
    public static ZanataDatabaseDriverMetadata instance =
            new ZanataDatabaseDriverMetadata("Unknown", "Unknown");
    private final String name;
    private final String version;

    public static ZanataDatabaseDriverMetadata createAndSet(String name,
            String version) {
        instance = new ZanataDatabaseDriverMetadata(name, version);
        return instance;
    }

    @Override
    public String toString() {
        return MoreObjects.toStringHelper("")
                .add("name", name)
                .add("version", version)
                .toString();
    }
}
