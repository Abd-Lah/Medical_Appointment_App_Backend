package com.spring.medical_appointment.util;

import com.spring.medical_appointment.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class Helpers<T> {


    public void isObjectNull(T t, String message) {
        if(t == null){
            throw new ResourceNotFoundException(message);
        }
    }
}
