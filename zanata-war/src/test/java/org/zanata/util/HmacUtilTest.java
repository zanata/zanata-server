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

package org.zanata.util;

import com.google.common.collect.Lists;
import org.junit.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
public class HmacUtilTest {

    @Test
    public void testCase1() {
        String key = "secret_key";
        String key2 = "secret_key2";
        String data = "Hi There";
        String data2 = "Hi There 2";

        String sha1 = HmacUtil.hmacSha1(key, data);
        String sha2 = HmacUtil.hmacSha1(key, data);
        assertThat(sha1).isEqualTo(sha2);

        String sha3 = HmacUtil.hmacSha1(key, data2);
        String sha4 = HmacUtil.hmacSha1(key, data2);
        assertThat(sha3).isEqualTo(sha4);

        String sha5 = HmacUtil.hmacSha1(key2, data);
        String sha6 = HmacUtil.hmacSha1(key2, data);
        assertThat(sha5).isEqualTo(sha6);

        String sha7 = HmacUtil.hmacSha1(key2, data2);
        String sha8 = HmacUtil.hmacSha1(key2, data2);
        assertThat(sha7).isEqualTo(sha8);

        assertThat(sha1).isNotEqualTo(sha3).isNotEqualTo(sha5)
                .isNotEqualTo(sha7);
    }
}
