package com.spring.medical_appointment.models;

import com.spring.medical_appointment.commands.ReportCommand;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reports")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportEntity extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private AppointmentEntity appointment;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String treatment;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public void update(ReportCommand reportCommand) {
        diagnosis = reportCommand.getDiagnosis();
        treatment = reportCommand.getTreatment();
        notes = reportCommand.getNotes();
    }
}
