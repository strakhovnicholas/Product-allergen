package ru.productallergen.analytics.config;

import chat.giga.model.ModelName;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "gigachat")
public class GigaChatProperties {
    private String authKey = "";
    private boolean verifySslCerts = false;
    private String model = ModelName.GIGA_CHAT_MAX_2;
}
