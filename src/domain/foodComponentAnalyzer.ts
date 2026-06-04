import type { FoodComponentSymptomsResponse } from '../api/diaryApi';
import * as local from '../db/localRepository';

const SYMPTOM_WINDOW_HOURS = 24;

export async function analyzeFoodAndSymptomsLocal(
  from: string,
  to: string,
): Promise<FoodComponentSymptomsResponse[]> {
  const foods = await local.getFoodInRangeLocal(from, to);
  const symptoms = await local.getSymptomsByDateRangeLocal(from, to);

  const symptomTimes = symptoms
    .map((s) => ({
      time: new Date(s.startTime ?? '').getTime(),
      name: s.symptomName,
    }))
    .filter((s) => !Number.isNaN(s.time));

  const map = new Map<string, Set<string>>();

  for (const food of foods) {
    const intakeMs = new Date(food.intakeTime).getTime();
    if (Number.isNaN(intakeMs)) continue;
    const components = food.components?.length ? food.components : [food.foodName];
    for (const component of components) {
      const key = component.trim();
      if (!key) continue;
      for (const symptom of symptomTimes) {
        const hours = (symptom.time - intakeMs) / (1000 * 60 * 60);
        if (hours >= 0 && hours <= SYMPTOM_WINDOW_HOURS) {
          if (!map.has(key)) map.set(key, new Set());
          map.get(key)!.add(symptom.name);
        }
      }
    }
  }

  return Array.from(map.entries())
    .map(([foodComponentName, set]) => ({
      foodComponentName,
      symptomsName: Array.from(set).sort(),
    }))
    .sort((a, b) => b.symptomsName.length - a.symptomsName.length);
}
