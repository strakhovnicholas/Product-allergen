package ru.productallergen.analytics.config;

import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperReport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;

@Configuration
public class JasperConfig {

    @Value("${report.template-path}")
    private String templatePath;

    @Bean
    public JasperReport medicalReportTemplate() throws Exception {
        try (InputStream inputStream = new ClassPathResource(templatePath).getInputStream()) {
            return JasperCompileManager.compileReport(inputStream);
        }
    }
}
