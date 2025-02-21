package com.spring.demo_relationship;

import com.spring.demo_relationship.security.entities.AppRole;
import com.spring.demo_relationship.security.entities.AppUser;
import com.spring.demo_relationship.security.service.impl.AccountServiceImpl;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;

@SpringBootApplication
public class DemoRelationshipApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoRelationshipApplication.class, args);
    }

   //@Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

   //@Bean
    CommandLineRunner start(AccountServiceImpl accountService, PasswordEncoder p) {
     return args -> {
         AppRole role1 = accountService.addRole(new AppRole(null,"admin"));
         AppRole role2 = accountService.addRole(new AppRole(null,"user"));
         AppUser user1 = accountService.addUser(new AppUser(null,"abd", "abd@mail.com", p.encode("1234"),false,new ArrayList<>()));
         AppUser user2 = accountService.addUser(new AppUser(null,"anas", "anas@mail.com", p.encode("1234"),false,new ArrayList<>()));

         accountService.assignRoleToUser(user1,role1);
         accountService.assignRoleToUser(user2,role2);
         accountService.assignRoleToUser(user1,role2);
     };
    }

}
