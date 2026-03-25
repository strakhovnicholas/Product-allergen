package ru.productallergen.authservice.cookie;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
@Setter
@ConfigurationProperties(prefix = "cookie")
public class CookieProperties {

    private Token access;
    private Token refresh;

    private boolean httpOnly;
    private boolean secure;
    private String sameSite;

    @Getter
    @Setter
    public static class Token {
        private String name;
        private String path;
        private long maxAge;
    }
}
