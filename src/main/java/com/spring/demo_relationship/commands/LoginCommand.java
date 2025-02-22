package com.spring.demo_relationship.commands;

import lombok.Data;

@Data
public class LoginCommand {
    private String email;
    private String password;
}
