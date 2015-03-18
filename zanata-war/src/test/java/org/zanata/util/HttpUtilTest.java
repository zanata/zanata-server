package org.zanata.util;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.HttpMethod;

import org.mockito.Mockito;
import org.testng.annotations.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 */
@Test(groups = { "unit-tests" })
public class HttpUtilTest {

    @Test
    public void getClientIpTest() {
        String expectedIP = "127.0.0.1";
        HttpServletRequest mockRequest = Mockito.mock(HttpServletRequest.class);
        when(mockRequest.getHeader(HttpUtil.X_FORWARDED_FOR)).thenReturn(expectedIP);
        testClientIP(mockRequest, expectedIP);

        Mockito.reset(mockRequest);
        when(mockRequest.getHeader(HttpUtil.X_FORWARDED_FOR)).thenReturn("unknown");
        when(mockRequest.getHeader(HttpUtil.PROXY_CLIENT_IP)).thenReturn(expectedIP);
        testClientIP(mockRequest, expectedIP);

        Mockito.reset(mockRequest);
        when(mockRequest.getHeader(HttpUtil.X_FORWARDED_FOR)).thenReturn(
            "unknown");
        when(mockRequest.getHeader(HttpUtil.PROXY_CLIENT_IP)).thenReturn("");
        when(mockRequest.getHeader(HttpUtil.WL_Proxy_Client_IP)).thenReturn(expectedIP);
        testClientIP(mockRequest, expectedIP);

        Mockito.reset(mockRequest);
        when(mockRequest.getHeader(HttpUtil.X_FORWARDED_FOR)).thenReturn("unknown");
        when(mockRequest.getHeader(HttpUtil.PROXY_CLIENT_IP)).thenReturn("");
        when(mockRequest.getHeader(HttpUtil.WL_Proxy_Client_IP)).thenReturn(null);
        when(mockRequest.getHeader(HttpUtil.HTTP_CLIENT_IP)).thenReturn(expectedIP);
        testClientIP(mockRequest, expectedIP);

        Mockito.reset(mockRequest);
        when(mockRequest.getHeader(HttpUtil.X_FORWARDED_FOR)).thenReturn("unknown");
        when(mockRequest.getHeader(HttpUtil.PROXY_CLIENT_IP)).thenReturn("");
        when(mockRequest.getHeader(HttpUtil.WL_Proxy_Client_IP)).thenReturn(null);
        when(mockRequest.getHeader(HttpUtil.HTTP_CLIENT_IP)).thenReturn("");
        when(mockRequest.getHeader(HttpUtil.HTTP_X_FORWARDED_FOR)).thenReturn(expectedIP);
        testClientIP(mockRequest, expectedIP);

        Mockito.reset(mockRequest);
        when(mockRequest.getHeader(HttpUtil.X_FORWARDED_FOR)).thenReturn("unknown");
        when(mockRequest.getHeader(HttpUtil.PROXY_CLIENT_IP)).thenReturn("");
        when(mockRequest.getHeader(HttpUtil.WL_Proxy_Client_IP)).thenReturn(null);
        when(mockRequest.getHeader(HttpUtil.HTTP_CLIENT_IP)).thenReturn("");
        when(mockRequest.getHeader(HttpUtil.HTTP_X_FORWARDED_FOR)).thenReturn("");
        when(mockRequest.getRemoteAddr()).thenReturn(expectedIP);
        testClientIP(mockRequest, expectedIP);
    }

    private void testClientIP(HttpServletRequest mockRequest, String expectedIP) {
        String ip = HttpUtil.getClientIp(mockRequest);
        assertThat(ip).isEqualTo(expectedIP);
    }

    @Test
    public void isReadMethodTest() {
        assertThat(HttpUtil.isReadMethod(HttpMethod.DELETE)).isFalse();
        assertThat(HttpUtil.isReadMethod(HttpMethod.POST)).isFalse();
        assertThat(HttpUtil.isReadMethod(HttpMethod.PUT)).isFalse();

        assertThat(HttpUtil.isReadMethod(HttpMethod.GET)).isTrue();
        assertThat(HttpUtil.isReadMethod(HttpMethod.HEAD)).isTrue();
        assertThat(HttpUtil.isReadMethod(HttpMethod.OPTIONS)).isTrue();
    }


}
