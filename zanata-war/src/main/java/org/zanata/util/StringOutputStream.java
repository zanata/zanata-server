package org.zanata.util;

import java.io.IOException;
import java.io.OutputStream;

public class StringOutputStream extends OutputStream {
    private final StringBuilder builder = new StringBuilder();

    @Override
    public String toString() {
        return builder.toString();
    }

    @Override
    public void write(int ch) throws IOException {
        builder.append((char) ch);
    }
}
