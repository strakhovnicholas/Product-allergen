FROM --platform=linux/amd64 amazoncorretto:17-alpine

WORKDIR /app

COPY target/auth-service-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]