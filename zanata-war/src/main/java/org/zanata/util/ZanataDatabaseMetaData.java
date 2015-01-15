package org.zanata.util;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.google.common.base.MoreObjects;
import com.google.common.base.Strings;

/**
 * @author Patrick Huang <a
 *         href="mailto:pahuang@redhat.com">pahuang@redhat.com</a>
 */
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
@Slf4j
public class ZanataDatabaseMetaData {
    public static ZanataDatabaseMetaData instance = new ZanataDatabaseMetaData(
            "Unknown", 0, 0, "Unknown");
    private final String name;
    private final int majorVersion;
    private final int minorVersion;
    private final String version;

    public static ZanataDatabaseMetaData createAndSet(String name,
            int majorVersion, int minorVersion, String version) {
        instance =
                new ZanataDatabaseMetaData(name, majorVersion, minorVersion,
                        version);
        return instance;
    }

    public void checkCompatibility() {
        String dbName = Strings.nullToEmpty(name).toLowerCase();

        if (dbName.contains("maria")) {
            checkMariaDB(isMariaDBCompatible());
        } else if (dbName.contains("mysql")) {
            checkMsyql(isMysqlCompatible());
        } else {
            log.warn("Untested or unknown database: {}. Good luck!!", name);
            // we let it run and if it falls apart later we have a warning out
            // upfront
        }
    }

    private void checkMsyql(boolean mysqlCompatible) {
        if (!mysqlCompatible) {
            log.error(
                    "Incompatible MySql DB version: {}. Compatible up to 5.5",
                    version);
            throw new IllegalArgumentException("Incompatible MySQL DB version:"
                    + version);
        }
    }

    private boolean isMysqlCompatible() {
        // we are only compatible up to mysql 5.5
        return majorVersion == 5 && minorVersion < 6;
    }

    private void checkMariaDB(boolean mariaDBCompatible) {
        if (!mariaDBCompatible) {
            log.error(
                    "Incompatible Maria DB version: {}. Compatible from 5.1 to 10.0",
                    version);
            throw new IllegalArgumentException("Incompatible Maria DB version:"
                    + version);
        }
    }

    private boolean isMariaDBCompatible() {
        // compatible "presumably" from mariaDB 5.1 to 10.0
        if (majorVersion == 5) {
            return minorVersion >= 1;
        }
        // we hope minor version change is indeed backward compatible
        return majorVersion == 10;
    }

    public String toString() {
        return MoreObjects.toStringHelper("")
                .add("name", name)
                .add("version", version)
                .toString();
    }
}
