import type { CommonFeeling, Food } from '../api/diaryApi';

export type FoodRiskItem = {
  foodName: string;
  totalIntakes: number;
  reactions: number;
  riskScore?: number;
  safetyScore?: number;
};

export type ReportDashboard = {
  totalFoodEntries: number;
  totalReactions: number;
  avgWellbeing: number;
  mostRiskyFood: string;
  safestFood: string;
  safeFoods: FoodRiskItem[];
  dangerFoods: FoodRiskItem[];
};

export function buildReportDashboard(foods: Food[], feelings: CommonFeeling[]): ReportDashboard {
  const totalFoodEntries = foods.length;
  const totalReactions = foods.filter((f) => f.reactionOccurred).length;
  const avgWellbeing =
    feelings.length > 0
      ? feelings.reduce((s, f) => s + f.wellbeingScore, 0) / feelings.length
      : 0;
  const grouped = new Map<string, FoodRiskItem>();
  foods.forEach((item) => {
    const key = item.foodName.trim().toLowerCase();
    if (!key) return;
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, {
        foodName: item.foodName,
        totalIntakes: 1,
        reactions: item.reactionOccurred ? 1 : 0,
      });
    } else {
      existing.totalIntakes += 1;
      if (item.reactionOccurred) existing.reactions += 1;
    }
  });

  const products = Array.from(grouped.values());
  const risky = products
    .filter((p) => p.totalIntakes > 0 && p.reactions > 0)
    .map((p) => ({ ...p, riskScore: p.reactions / p.totalIntakes }))
    .sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0));

  const safe = products
    .filter((p) => p.totalIntakes > 0 && p.reactions === 0)
    .map((p) => ({ ...p, safetyScore: 1 }))
    .sort((a, b) => b.totalIntakes - a.totalIntakes);

  return {
    totalFoodEntries,
    totalReactions,
    avgWellbeing,
    mostRiskyFood: risky[0]?.foodName ?? 'Нет данных',
    safestFood: safe[0]?.foodName ?? 'Нет данных',
    safeFoods: safe.slice(0, 5),
    dangerFoods: risky.slice(0, 5),
  };
}
