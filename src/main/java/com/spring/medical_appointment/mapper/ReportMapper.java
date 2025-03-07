package com.spring.medical_appointment.mapper;

import com.spring.medical_appointment.commands.ReportCommand;
import com.spring.medical_appointment.dto.ReportDto;
import com.spring.medical_appointment.models.ReportEntity;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

public interface ReportMapper {
    ReportMapper INSTANCE = Mappers.getMapper(ReportMapper.class);

    ReportDto ToReportDto(ReportEntity reportEntity);

    ReportEntity ToReportEntity(ReportCommand reportCommand);
}
