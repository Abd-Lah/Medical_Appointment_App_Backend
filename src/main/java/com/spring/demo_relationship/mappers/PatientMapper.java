package com.spring.demo_relationship.mappers;

import com.spring.demo_relationship.dto.AppointmentDto;
import com.spring.demo_relationship.dto.PatientDto;
import com.spring.demo_relationship.model.Appointment;
import com.spring.demo_relationship.model.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface PatientMapper {

    PatientMapper INSTANCE = Mappers.getMapper(PatientMapper.class);

    // Map Patient to PatientDto without appointments (for getAllPatients)
    //@Mapping(target = "appointments",source = "patient", ignore = true)  // Don't map appointments here
    PatientDto patientToPatientDtoWithoutAppointments(Patient patient);

    // Map Patient to PatientDto with appointments (for getPatientById)
    //@Mapping(target = "appointments", source = "appointments")
    PatientDto patientToPatientDtoWithAppointments(Patient patient);

    // Map Appointment to AppointmentDto, ensuring no recursion
    //@Mapping(target = "patient", source = "patient")  // Use the modified patient mapper
    AppointmentDto appointmentToAppointmentDto(Appointment appointment);

    // Map a list of Appointments to a list of AppointmentDtos
    //@Mapping(target = "patient", source = "patient")
    List<AppointmentDto> appointmentsToAppointmentDtos(List<Appointment> appointments);
}
