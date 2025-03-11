package com.spring.medical_appointment.service.billing;

import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.models.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {
    private final PdfGenerationService pdfGenerationService;

    @Override
    public void appointmentBill(AppointmentEntity appointment, UserEntity user) {
        try {
            pdfGenerationService.generateAndSavePdfAsync(appointment, user);
        } catch(Exception e){
            throw new RuntimeException("Internal server error");
        }
    }
}
