package com.spring.demo_relationship;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@EntityScan(basePackages = "model")
@EnableJpaRepositories(basePackages = "repository")
@ComponentScan(basePackages = {"service", "controllers"})
@CrossOrigin(origins = "*")
public class DemoRelationshipApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoRelationshipApplication.class, args);
    }

}
