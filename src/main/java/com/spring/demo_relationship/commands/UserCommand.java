package com.spring.demo_relationship.commands;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserCommand {
    private String firstName;
    private String lastName;
    private String phone;
    private String city;
}
