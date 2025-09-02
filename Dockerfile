ARG JAVA_VERSION=21

FROM maven AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:${JAVA_VERSION}-jdk
WORKDIR /app
COPY --from=builder /app/target/Medical-app-service.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]