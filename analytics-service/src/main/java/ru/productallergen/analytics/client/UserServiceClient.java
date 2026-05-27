package ru.productallergen.analytics.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import ru.productallergen.analytics.config.FeignConfig;
import ru.productallergen.analytics.dto.internal.CommonFeelingRequest;
import ru.productallergen.analytics.dto.internal.FoodComponentSymptomsResponse;
import ru.productallergen.analytics.dto.internal.MedicineDto;
import ru.productallergen.analytics.dto.internal.UserInfoDto;

import java.util.List;

@FeignClient(name = "gateway-service", configuration = FeignConfig.class, url = "http://gateway-service:8080")
public interface UserServiceClient {

    @GetMapping("/api/user/info")
    UserInfoDto getUserInfo();

    @GetMapping("/api/feelings/medicines")
    List<MedicineDto> getMedicines(@RequestParam("from") String from, @RequestParam("to") String to);

    @GetMapping("/api/feelings/common")
    List<CommonFeelingRequest> getWellbeing(@RequestParam("from") String from, @RequestParam("to") String to);

    @GetMapping("/api/food-analyzer/analyze")
    List<FoodComponentSymptomsResponse> analyzeFood(@RequestParam("from") String from, @RequestParam("to") String to);
}
