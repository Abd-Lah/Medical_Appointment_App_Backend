package com.spring.demo_relationship.exceptions;

public class ResourceNotFoundException extends RuntimeException  {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}