import type { Profile } from '../api/profileApi';

import allergenKeywords from '../constants/allergen_keywords.json';

export type SafetyLevel = 'SAFE' | 'CAUTION' | 'UNSAFE';

export type ScanAnalysisResult = {
  productName: string;
  ingredients: string[];
  problematic: string[];
  score: number;
  riskLabel: 'Низкий риск' | 'Средний риск' | 'Высокий риск';
  riskColor: string;
  recommendation: string;
};

const KEYWORDS = allergenKeywords as Record<string, string[]>;

export function analyzeIngredients(
  ingredients: string[],
  profile: Profile | null,
): ScanAnalysisResult {
  const allergies = (profile?.allergies ?? []).map((a) => a.toLowerCase());
  const chronic = (profile?.chronicDiseases ?? []).map((c) => c.toLowerCase());
  const predisposition = profile?.predisposition ?? 'NONE';

  const problematic: string[] = [];
  let unsafeCount = 0;
  let cautionCount = 0;

  for (const ingredient of ingredients) {
    const lower = ingredient.toLowerCase();
    let level: SafetyLevel = 'SAFE';

    for (const allergy of allergies) {
      if (allergy && lower.includes(allergy)) {
        level = 'UNSAFE';
        break;
      }
    }

    if (level === 'SAFE') {
      for (const list of Object.values(KEYWORDS)) {
        for (const keyword of list) {
          if (!lower.includes(keyword)) continue;
          const allergyHit = allergies.some((a) => keyword.includes(a) || a.includes(keyword));
          if (allergyHit || predisposition === 'HIGH' || predisposition === 'MEDIUM') {
            level = 'UNSAFE';
          } else if (chronic.some((c) => lower.includes(c) || keyword.includes(c))) {
            level = 'CAUTION';
          } else {
            level = 'CAUTION';
          }
          break;
        }
        if (level !== 'SAFE') break;
      }
    }

    if (level === 'UNSAFE') {
      unsafeCount += 1;
      problematic.push(ingredient);
    } else if (level === 'CAUTION') {
      cautionCount += 1;
      problematic.push(ingredient);
    }
  }

  const score =
    ingredients.length === 0
      ? 0
      : Math.round(
          Math.max(
            0,
            Math.min(100, (1 - (unsafeCount * 0.35 + cautionCount * 0.15) / ingredients.length) * 100),
          ),
        );

  let riskLabel: ScanAnalysisResult['riskLabel'] = 'Высокий риск';
  let riskColor = '#E11D48';
  if (score >= 75) {
    riskLabel = 'Низкий риск';
    riskColor = '#22C55E';
  } else if (score >= 45) {
    riskLabel = 'Средний риск';
    riskColor = '#F59E0B';
  }

  const recommendation =
    problematic.length === 0
      ? 'По вашему профилю явных аллергенов в составе не обнаружено. При симптомах добавьте запись в дневник.'
      : `В составе найдены: ${problematic.join(', ')}. Рекомендуется ограничить продукт или выбрать альтернативу без этих компонентов.`;

  return {
    productName: 'Продукт по этикетке',
    ingredients,
    problematic,
    score,
    riskLabel,
    riskColor,
    recommendation,
  };
}
