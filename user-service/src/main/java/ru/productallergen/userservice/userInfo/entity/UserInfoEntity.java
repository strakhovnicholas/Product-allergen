package ru.productallergen.userservice.userInfo.entity;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import ru.productallergen.userservice.userInfo.Predisposition;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Document(collection = "user_info")
public record UserInfoEntity(
        @Id ObjectId id,
        @Field(targetType = FieldType.STRING)
        UUID userId,
        String fullName,
        Integer age,
        Double weight,
        Integer height,
        String gender,
        String country,
        Boolean smoker,
        Boolean alcohol,
        Boolean sports,
        List<String> chronicDiseases,
        List<String> allergies,
        Predisposition predisposition,
        List<String> medicationsRegular,
        String doctorNotes,
        LocalDateTime registeredAt,
        LocalDateTime updatedAt
) {}