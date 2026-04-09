db = db.getSiblingDB('health_tracker');

// Коллекции
db.createCollection('user_info');
db.createCollection('common_feelings');
db.createCollection('food_intakes');
db.createCollection('symptoms');
db.createCollection('notes');
// reference_food_categories можно оставить, если хотите хранить там справочник
db.createCollection('reference_food_categories');

// Индексы для user_info
db.user_info.createIndex({ "userId": 1 }, { unique: true });
db.user_info.createIndex({ "fullName": 1 });
db.user_info.createIndex({ "registeredAt": -1 });

// Индексы для common_feelings
db.common_feelings.createIndex({ "userId": 1, "dateTime": -1 });
db.common_feelings.createIndex({ "wellbeingScore": 1 });
db.common_feelings.createIndex({ "dateTime": -1 });

// Индексы для medicines (если коллекция реально используется вашим сервисом)
db.medicines.createIndex({ "userId": 1, "intakeTime": -1 });
db.medicines.createIndex({ "medicineName": 1 });
db.medicines.createIndex({ "medicationType": 1 });
db.medicines.createIndex({ "intakeTime": -1 });

// Индексы для notes (под NoteEntity)
db.notes.createIndex({ "userId": 1, "date": -1 });
db.notes.createIndex({ "date": -1 });
db.notes.createIndex({ "content": "text" });

// Индексы для food_intakes
db.food_intakes.createIndex({ "userId": 1, "intakeTime": -1 });
db.food_intakes.createIndex({ "foodName": 1 });
db.food_intakes.createIndex({ "category": 1 });
db.food_intakes.createIndex({ "reactionOccurred": 1 });
db.food_intakes.createIndex({ "intakeTime": -1 });

// Индексы для symptoms
db.symptoms.createIndex({ "userId": 1, "startTime": -1 });
db.symptoms.createIndex({ "symptomName": 1 });
db.symptoms.createIndex({ "severity": 1 });
db.symptoms.createIndex({ "startTime": 1, "endTime": 1 });

// Сид для reference_food_categories (опционально, если будете читать из БД)
db.reference_food_categories.insertMany([
    { code: "fruit",      name: "Фрукты",           description: "Фрукты и ягоды" },
    { code: "vegetable",  name: "Овощи",            description: "Овощи и зелень" },
    { code: "meat",       name: "Мясо",             description: "Мясные продукты" },
    { code: "fish",       name: "Рыба",             description: "Рыба и морепродукты" },
    { code: "dairy",      name: "Молочные продукты", description: "Молоко, сыры, йогурты" },
    { code: "grains",     name: "Зерновые",         description: "Крупы, хлеб, макароны" },
    { code: "nuts",       name: "Орехи",            description: "Орехи и семена" },
    { code: "legumes",    name: "Бобовые",          description: "Фасоль, горох, чечевица" },
    { code: "fast_food",  name: "Фастфуд",          description: "Фастфуд" },
    { code: "beverages",  name: "Напитки",          description: "Напитки" },
    { code: "sweets",     name: "Сладости",         description: "Кондитерские изделия" },
    { code: "other",      name: "Другое",           description: "Прочие продукты" }
]);