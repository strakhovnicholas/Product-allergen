import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { FoodComponentSymptomsResponse } from '../api/diaryApi';
import type { Profile } from '../api/profileApi';
import type { ReportDashboard } from '../domain/reportDashboard';

export async function exportLocalReportPdf(options: {
  profile: Profile | null;
  dateFrom: string;
  dateTo: string;
  dashboard: ReportDashboard;
  analyzer: FoodComponentSymptomsResponse[];
}) {
  const { profile, dateFrom, dateTo, dashboard, analyzer } = options;
  const html = `
    <html><head><meta charset="utf-8" />
    <style>
      body { font-family: sans-serif; padding: 24px; color: #233142; }
      h1 { color: #1D4ED8; }
      .box { border: 1px solid #E5EAF3; border-radius: 12px; padding: 16px; margin: 12px 0; }
    </style></head><body>
    <h1>Отчёт Product-allergen</h1>
    <p><b>Пациент:</b> ${profile?.fullName ?? '—'}</p>
    <p><b>Период:</b> ${dateFrom} — ${dateTo}</p>
    <p><b>Аллергены:</b> ${(profile?.allergies ?? []).join(', ') || '—'}</p>
    <div class="box">
      <h2>Сводка (без ИИ)</h2>
      <p>Записей еды: ${dashboard.totalFoodEntries}</p>
      <p>Реакций: ${dashboard.totalReactions}</p>
      <p>Среднее самочувствие: ${dashboard.avgWellbeing.toFixed(1)}</p>
      <p>Рискованный продукт: ${dashboard.mostRiskyFood}</p>
    </div>
    <div class="box">
      <h2>Пищевой анализ</h2>
      ${
        analyzer.length
          ? analyzer
              .map(
                (a) =>
                  `<p><b>${a.foodComponentName}</b>: ${a.symptomsName.join(', ') || 'симптомы не обнаружены'}</p>`,
              )
              .join('')
          : '<p>Недостаточно данных за период.</p>'
      }
    </div>
    <p><i>Заключение сформировано локально на устройстве, без GigaChat.</i></p>
    </body></html>`;

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Поделиться отчётом',
    });
  }
  return uri;
}
