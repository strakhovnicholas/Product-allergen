package ru.productallergen.analytics;

import chat.giga.client.GigaChatClient;
import chat.giga.client.auth.AuthClient;
import chat.giga.client.auth.AuthClientBuilder;
import chat.giga.model.ModelName;
import chat.giga.model.Scope;
import chat.giga.model.completion.ChatMessage;
import chat.giga.model.completion.ChatMessageRole;
import chat.giga.model.completion.CompletionRequest;
import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.JRException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.productallergen.analytics.service.ReportService;
import ru.productallergen.analytics.dto.ai.AnalysisResultDto;
import ru.productallergen.analytics.dto.internal.MedicineDto;
import ru.productallergen.analytics.dto.internal.UserInfoDto;
import ru.productallergen.analytics.dto.report.ReportDataDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/generate")
    public ResponseEntity<byte[]> generateReport(@RequestAttribute("currentUserId") String userId,
                                                 @RequestParam("from") LocalDateTime from,
                                                 @RequestParam("to") LocalDateTime to) throws JRException {
        UUID id = UUID.fromString(userId);
//        // 1. Данные пользователя
//        UserInfoDto user = new UserInfoDto(
//                "Константин",
//                "Александров",
//                32, 82.5, "Мужской",
//                false, false, true,
//                List.of("Хронический гастрит в стадии ремиссии", "Сезонная поллиноз"),
//                List.of("Арахис", "Фундук", "Пшеница (глютен)", "Морские моллюски")
//        );
//
//        // 2. Расширенная история самочувствия (10 дней для красивого графика)
//        List<WellbeingDto> wellbeingHistory = List.of(
//                new WellbeingDto(LocalDateTime.now().minusDays(30), 1),
//                new WellbeingDto(LocalDateTime.now().minusDays(29), 7),
//                new WellbeingDto(LocalDateTime.now().minusDays(28), 3),
//                new WellbeingDto(LocalDateTime.now().minusDays(27), 5),
//                new WellbeingDto(LocalDateTime.now().minusDays(26), 6),
//                new WellbeingDto(LocalDateTime.now().minusDays(25), 10),
//                new WellbeingDto(LocalDateTime.now().minusDays(24), 10),
//                new WellbeingDto(LocalDateTime.now().minusDays(23), 10),
//                new WellbeingDto(LocalDateTime.now().minusDays(22), 10),
//                new WellbeingDto(LocalDateTime.now().minusDays(21), 10),
//                new WellbeingDto(LocalDateTime.now().minusDays(20), 10),
//                new WellbeingDto(LocalDateTime.now().minusDays(19), 10),
//                new WellbeingDto(LocalDateTime.now().minusDays(18), 10),
//                new WellbeingDto(LocalDateTime.now().minusDays(17), 10),
//                new WellbeingDto(LocalDateTime.now().minusDays(16), 10),
//                new WellbeingDto(LocalDateTime.now().minusDays(15), 1),
//                new WellbeingDto(LocalDateTime.now().minusDays(14), 7),
//                new WellbeingDto(LocalDateTime.now().minusDays(13), 6),
//                new WellbeingDto(LocalDateTime.now().minusDays(12), 5),
//                new WellbeingDto(LocalDateTime.now().minusDays(11), 2),
//                new WellbeingDto(LocalDateTime.now().minusDays(10), 3),
//                new WellbeingDto(LocalDateTime.now().minusDays(9), 8),
//                new WellbeingDto(LocalDateTime.now().minusDays(8), 7),
//                new WellbeingDto(LocalDateTime.now().minusDays(7), 4), // Спад
//                new WellbeingDto(LocalDateTime.now().minusDays(6), 3), // Пик симптомов
//                new WellbeingDto(LocalDateTime.now().minusDays(5), 5),
//                new WellbeingDto(LocalDateTime.now().minusDays(4), 6),
//                new WellbeingDto(LocalDateTime.now().minusDays(3), 8),
//                new WellbeingDto(LocalDateTime.now().minusDays(2), 9),
//                new WellbeingDto(LocalDateTime.now().minusDays(1), 7),
//                new WellbeingDto(LocalDateTime.now(), 9)
//        );
//
//        // 3. Большой список лекарств (заполнит таблицу)
//        List<MedicineDto> medicineList = List.of(
//                new MedicineDto("Энтеросгель", "1", "пакет", LocalDateTime.now().minusDays(6).withHour(10)),
//                new MedicineDto("Супрастин", "25", "мг", LocalDateTime.now().minusDays(6).withHour(14)),
//                new MedicineDto("Лоратадин", "10", "мг", LocalDateTime.now().minusDays(5).withHour(9)),
//                new MedicineDto("Но-шпа", "40", "мг", LocalDateTime.now().minusDays(5).withHour(20)),
//                new MedicineDto("Омез", "20", "мг", LocalDateTime.now().minusDays(4).withHour(8)),
//                new MedicineDto("Полисорб", "1.2", "г", LocalDateTime.now().minusDays(3).withHour(12)),
//                new MedicineDto("Зиртек", "10", "капель", LocalDateTime.now().minusDays(2).withHour(21)),
//                new MedicineDto("Креон 10000", "1", "капсула", LocalDateTime.now().minusDays(1).withHour(13)),
//                new MedicineDto("Дюспаталин", "200", "мг", LocalDateTime.now().minusHours(5)),
//                new MedicineDto("Аква Марис", "2", "впрыска", LocalDateTime.now().minusHours(1))
//        );
//
//        GigaChatClient client = GigaChatClient.builder()
//                .verifySslCerts(false)
//                .authClient(AuthClient.builder()
//                        .withOAuth(AuthClientBuilder.OAuthBuilder.builder()
//                                .scope(Scope.GIGACHAT_API_PERS)
//                                .authKey("")
//                                .build())
//                        .build())
//                .build();
//
//        String ai = String.valueOf(client.completions(CompletionRequest.builder()
//                .model(ModelName.GIGA_CHAT_MAX_2)
//                .message(ChatMessage.builder()
//                        .content("Привет, верни этот текст с разметкой:                \"<b>Заключение по результатам комплексного мониторинга:</b><br/>\" +\n" +
//                                "                        \"На основании анализа дневника питания и динамики самочувствия за отчетный период выявлена <b>высокая корреляция</b> \" +\n" +
//                                "                        \"между употреблением продуктов, содержащих скрытые аллергены (арахис, кунжут), и возникновением кожных реакций (крапивница).<br/><br/>\" +\n" +
//                                "                        \"<i>Ключевые наблюдения:</i><br/>\" +\n" +
//                                "                        \"1. Снижение балла самочувствия до 3-х единиц совпадает с употреблением соусов промышленного производства.<br/>\" +\n" +
//                                "                        \"2. Обнаружено присутствие LTP-белков, что указывает на риск тяжелых системных реакций.<br/>\" +\n" +
//                                "                        \"3. Терапия антигистаминными препаратами (Супрастин, Зиртек) дает положительный, но кратковременный эффект.<br/><br/>\" +\n" +
//                                "                        \"<b>Рекомендации:</b><br/>\" +\n" +
//                                "                        \"• Строгая элиминационная диета с полным исключением продуктов с маркировкой 'может содержать следы орехов'.<br/>\" +\n" +
//                                "                        \"• Пройти дообследование: компонентная аллергодиагностика (ISAC или ImmunoCAP).<br/>\" +\n" +
//                                "                        \"• Вести детальный учет состава сложных многокомпонентных блюд.<br/>\" +\n" +
//                                "                        \"• <u>Срочно</u> проконсультироваться с аллергологом по вопросу приобретения шприц-ручки с адреналином.\"")
//                        .role(ChatMessageRole.USER)
//                        .build())
//                .build()));
//
//        // 4. Глубокий анализ данных
//        AnalysisResultDto analysis = new AnalysisResultDto(
//                // 10 симптомов
//                List.of("Крапивница", "Ангиоотек", "Абдоминальная боль", "Метеоризм", "Зуд кожных покровов",
//                        "Ринит", "Заложенность носа", "Гиперемия", "Тошнота", "Диарея"),
//
//                // 10 потенциальных продуктов-триггеров
//                List.of("Молочный шоколад (следы орехов)", "Соевый лецитин", "Выпечка из цельнозерновой муки",
//                        "Крабовые палочки", "Специи (смесь карри)", "Энергетический напиток",
//                        "Соус Терияки", "Кунжутное масло", "Белок куриного яйца", "Томаты черри"),
//
//                // 10 белков-аллергенов и маркеров
//                List.of("LTP-белок (Ara h 9)", "Профилин (Ara h 8)", "Глиадин", "Казеин", "Овомукоид",
//                        "Вицилин", "Легумин", "Альбумин", "Глобулин", "Тропомиозин"),
//
//                // 10 микроэлементов / добавок
//                List.of("Никель", "Глутамат натрия (E621)", "Тартразин (E102)", "Диоксид серы",
//                        "Бензоат натрия", "Хром", "Кобальт", "Свинец (следы)", "Кадмий", "Гистамин"),
//
//                // Огромное заключение с HTML-разметкой
//                ai
//        );
//
//        // 5. Сборка и генерация
//        ReportDataDto dto = new ReportDataDto();
//        dto.setUser(user);
//        dto.setMedicine(medicineList);
//        dto.setWellbeing(wellbeingHistory);
//        dto.setAnalysis(analysis);

        ReportDataDto reportDataDto = reportService.fillReport(id, from, to);

        byte[] pdf = reportService.generateMedicalReport(reportDataDto);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header("Content-Disposition", "inline; filename=medical_analysis_full.pdf")
                .body(pdf);
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadReport(ReportDataDto reportData) {
        try {
            byte[] reportBytes = reportService.generateMedicalReport(reportData);

            String fileName = "medical_report.pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(reportBytes.length)
                    .body(reportBytes);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}