package com.spring.medical_appointment.mapper;

import com.spring.medical_appointment.dto.ReportDto;
import com.spring.medical_appointment.models.ReportEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ReportMapper {
    ReportMapper INSTANCE = Mappers.getMapper(ReportMapper.class);
    ReportDto ToReportDto(ReportEntity reportEntity);
}
