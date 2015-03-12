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
package org.zanata.action;

import com.google.common.base.Throwables;
import lombok.extern.slf4j.Slf4j;
import org.jboss.seam.ScopeType;
import org.jboss.seam.annotations.In;
import org.jboss.seam.annotations.Name;
import org.jboss.seam.annotations.Observer;
import org.jboss.seam.annotations.Scope;
import org.jboss.seam.contexts.ServletLifecycle;
import org.zanata.ApplicationConfiguration;
import org.zanata.events.HomeContentChangedEvent;
import org.zanata.util.HtmlUtil;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import javax.servlet.ServletContext;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 * @author Sean Flanigan <a href="mailto:sflaniga@redhat.com">sflaniga@redhat.com</a>
 */
@Name("homePage")
@Scope(ScopeType.APPLICATION)
@Slf4j
public class HomePage {

    @In
    ApplicationConfiguration applicationConfiguration;

    @In
    ServletContext servletContext;

    private String html;

    private static final String commonMarkImpl = "commonmark-0.18.1.min.js";

    public String getCommonMarkImpl() {
        return commonMarkImpl;
    }

    public String getHtml() {
        if (html == null) {
            updateHtml();
        }
        return html;
    }

    private void updateHtml() {
        String text = applicationConfiguration.getHomeContent();
        if (text == null) {
            html = "";
        } else {
            String unsafeHtml = renderToHtml(text);
            html = HtmlUtil.SANITIZER.sanitize(unsafeHtml);
        }
    }

    private String renderToHtml(String text) {
        Invocable invocable = getInvocable();
        try {
            return (String) invocable.invokeFunction("mdRender", text);
        } catch (ScriptException | NoSuchMethodException e) {
            throw Throwables.propagate(e);
        }
    }

    private Invocable getInvocable() {
        ServletContext servletContext = ServletLifecycle.getServletContext();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                servletContext.getResourceAsStream(
                        "/resources/script/" + commonMarkImpl)))) {

            ScriptEngine engine = newEngine();
            engine.eval("window = this;");
            engine.eval(reader);
            String initScript =
                    "var reader = new commonmark.Parser();" +
                    "var writer = new commonmark.HtmlRenderer();" +
                    "function mdRender(src) {" +
                    "  return writer.render(reader.parse(src));" +
                    "};";
            engine.eval(initScript);
            return (Invocable) engine;
        } catch (IOException | ScriptException e) {
            throw Throwables.propagate(e);
        }
    }

    private ScriptEngine newEngine() {
        ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
        ScriptEngine engine =
                scriptEngineManager.getEngineByName("rhino17R5");
        if (engine == null) {
            log.warn("Falling back on generic JavaScript engine");
            engine = scriptEngineManager.getEngineByName("JavaScript");
        }
        return engine;
    }

    @Observer(HomeContentChangedEvent.EVENT_NAME)
    public void textUpdated() {
        updateHtml();
    }
}
