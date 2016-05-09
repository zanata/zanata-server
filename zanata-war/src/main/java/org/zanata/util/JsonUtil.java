package org.zanata.util;

import java.io.IOException;

import org.codehaus.jackson.map.ObjectMapper;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
public class JsonUtil {
    public static String getJSONString(Object jsonObject) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.writeValueAsString(jsonObject);
        } catch (IllegalStateException | IOException e) {
            return jsonObject.getClass().getName() + "@"
                + Integer.toHexString(jsonObject.hashCode());
        }
    }
}
