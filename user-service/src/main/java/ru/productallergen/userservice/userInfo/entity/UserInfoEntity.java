package ru.productallergen.userservice.userInfo.entity;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import ru.productallergen.userservice.userInfo.Predisposition;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Document(collection = "user_info")
public record UserInfoEntity(
        @Id ObjectId id,
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
        ZonedDateTime registeredAt,
        ZonedDateTime updatedAt
) {}