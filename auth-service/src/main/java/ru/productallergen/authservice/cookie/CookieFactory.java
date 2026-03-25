package ru.productallergen.authservice.cookie;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieFactory {

    private final CookieProperties props;

    public CookieFactory(CookieProperties props) {
        this.props = props;
    }

    public ResponseCookie createAccessToken(String token) {
        return build(props.getAccess(), token, props.getAccess().getMaxAge());
    }

    public ResponseCookie createRefreshToken(String token) {
        return build(props.getRefresh(), token, props.getRefresh().getMaxAge());
    }

    public ResponseCookie deleteAccessToken() {
        return build(props.getAccess(), "", 0);
    }

    public ResponseCookie deleteRefreshToken() {
        return build(props.getRefresh(), "", 0);
    }

    private ResponseCookie build(CookieProperties.Token tokenProps, String value, long maxAge) {
        return ResponseCookie.from(tokenProps.getName(), value)
                .httpOnly(props.isHttpOnly())
                .secure(props.isSecure())
                .path(tokenProps.getPath())
                .maxAge(maxAge)
                .sameSite(props.getSameSite())
                .build();
    }
}