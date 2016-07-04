package org.zanata.rest;

import java.io.IOException;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.jglue.cdiunit.deltaspike.SupportDeltaspikeCore;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Answers;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.zanata.ZanataTest;
import org.zanata.dao.AccountDAO;
import org.zanata.limits.RateLimitingProcessor;
import org.zanata.model.HAccount;
import org.zanata.test.CdiUnitRunner;
import org.zanata.util.HttpUtil;
import org.zanata.util.RunnableEx;

import static org.mockito.Mockito.*;
import static org.mockito.Mockito.doReturn;

/**
 * @author Patrick Huang <a
 *         href="mailto:pahuang@redhat.com">pahuang@redhat.com</a>
 */
@RunWith(CdiUnitRunner.class)
@SupportDeltaspikeCore
public class RestLimitingFilterTest extends ZanataTest {

    // Using @Inject would be better, but some tests currently require
    // authenticatedUser to be null, which is difficult without spy()
    private RestLimitingFilter dispatcher;

    private static final String API_KEY = "apiKey123";

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private HttpServletRequest request;
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private HttpServletResponse response;
    @Mock
    private RateLimitingProcessor processor;
    @Captor
    private ArgumentCaptor<RunnableEx> taskCaptor;
    @Mock
    private FilterChain filterChain;

    private HAccount authenticatedUser;

    @Mock
    private AccountDAO accountDAO;

    private String clientIP = "255.255.0.1";

    @Before
    public void beforeMethod() throws ServletException, IOException {
        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader(HttpUtil.X_AUTH_TOKEN_HEADER)).thenReturn(
                API_KEY);

        dispatcher = spy(new RestLimitingFilter(processor, accountDAO,
            authenticatedUser));

        // this way we can verify the task actually called super.invoke()
        doNothing().when(filterChain).doFilter(request, response);
        authenticatedUser = null;
    }

    @Test
    public void willUseAuthenticatedUserApiKeyIfPresent() throws Exception {
        authenticatedUser = new HAccount();
        authenticatedUser.setApiKey("apiKeyInAuth");
        doReturn(authenticatedUser).when(dispatcher).getAuthenticatedUser();

        dispatcher.doFilter(request, response, filterChain);

        verify(processor).processForApiKey(same("apiKeyInAuth"), same(response),
            taskCaptor.capture());

        // verify task is calling filter chain
        RunnableEx task = taskCaptor.getValue();
        task.run();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void willUseUsernameIfNoApiKeyButAuthenticated() throws Exception {
        authenticatedUser = new HAccount();
        authenticatedUser.setUsername("admin");
        doReturn(authenticatedUser).when(dispatcher).getAuthenticatedUser();

        dispatcher.doFilter(request, response, filterChain);

        verify(processor).processForUser(same("admin"), same(response),
            taskCaptor.capture());

        // verify task is calling filter chain
        RunnableEx task = taskCaptor.getValue();
        task.run();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void willThrowErrorWithPOSTAndNoApiKey() throws Exception {
        when(request.getMethod()).thenReturn("POST");
        when(request.getHeader(HttpUtil.X_AUTH_TOKEN_HEADER)).thenReturn(
            null);
        when(request.getRequestURI()).thenReturn("/rest/in/peace");
        doReturn(null).when(dispatcher).getAuthenticatedUser();

        dispatcher.doFilter(request, response, filterChain);

        verify(response).setStatus(401);
        verify(response).getOutputStream();
        verifyZeroInteractions(processor);
    }

    @Test
    public void willProcessAnonymousWithGETAndNoApiKey() throws Exception {
        when(request.getHeader(HttpUtil.X_AUTH_TOKEN_HEADER)).thenReturn(null);
        when(request.getRequestURI()).thenReturn("/rest/in/peace");
        when(request.getRemoteAddr()).thenReturn(clientIP);
        doReturn(null).when(dispatcher).getAuthenticatedUser();

        dispatcher.doFilter(request, response, filterChain);

        verify(processor).processForAnonymousIP(same(clientIP), same(response),
            taskCaptor.capture());

        // verify task is calling filter chain
        RunnableEx task = taskCaptor.getValue();
        task.run();
        verify(filterChain).doFilter(request, response);
    }
}
