import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { parseAppDateTime, toAppDayKey } from '../utils/datetime';

const STORAGE_KEY = 'report_period_v1';

export type ReportPeriod = {
  from: string;
  to: string;
};

type ReportPeriodContextValue = {
  hydrated: boolean;
  draftFrom: string;
  draftTo: string;
  activeFrom: string;
  activeTo: string;
  activePeriodLabel: string;
  draftPeriodLabel: string;
  setDraftFrom: (value: string) => void;
  setDraftTo: (value: string) => void;
  setQuickPeriodDays: (days: number) => Promise<void>;
  validatePeriod: (from: string, to: string) => string;
  applyPeriod: () => Promise<ReportPeriod>;
};

const ReportPeriodContext = createContext<ReportPeriodContextValue | null>(null);

function periodEndingToday(daysInclusive: number): ReportPeriod {
  const to = toAppDayKey(new Date());
  const start = parseAppDateTime(`${to}T12:00:00`);
  start.setTime(start.getTime() - (daysInclusive - 1) * 24 * 60 * 60 * 1000);
  return {
    from: toAppDayKey(start),
    to,
  };
}

function createDefaultPeriod(): ReportPeriod {
  return periodEndingToday(30);
}

export function formatReportPeriodLabel(from: string, to: string) {
  const formatDay = (value: string) => {
    const [year, month, day] = value.split('-');
    if (!year || !month || !day) return value;
    return `${day}.${month}.${year}`;
  };
  return `${formatDay(from)} — ${formatDay(to)}`;
}

function isValidDateValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
}

export function ReportPeriodProvider({ children }: { children: ReactNode }) {
  const defaults = useMemo(() => createDefaultPeriod(), []);
  const [hydrated, setHydrated] = useState(false);
  const [draftFrom, setDraftFrom] = useState(defaults.from);
  const [draftTo, setDraftTo] = useState(defaults.to);
  const [activeFrom, setActiveFrom] = useState(defaults.from);
  const [activeTo, setActiveTo] = useState(defaults.to);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ReportPeriod;
          if (isValidDateValue(parsed.from) && isValidDateValue(parsed.to)) {
            if (!cancelled) {
              setDraftFrom(parsed.from);
              setDraftTo(parsed.to);
              setActiveFrom(parsed.from);
              setActiveTo(parsed.to);
            }
          }
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const validatePeriod = useCallback((from: string, to: string) => {
    if (!isValidDateValue(from) || !isValidDateValue(to)) {
      return 'Введите период в формате YYYY-MM-DD.';
    }
    if (from > to) {
      return 'Дата начала не может быть позже даты окончания.';
    }
    const today = toAppDayKey(new Date());
    if (from > today || to > today) {
      return 'Период не может быть в будущем.';
    }
    return '';
  }, []);

  const applyPeriod = useCallback(async (): Promise<ReportPeriod> => {
    const error = validatePeriod(draftFrom, draftTo);
    if (error) {
      throw new Error(error);
    }
    const period = { from: draftFrom, to: draftTo };
    setActiveFrom(period.from);
    setActiveTo(period.to);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(period));
    return period;
  }, [draftFrom, draftTo, validatePeriod]);

  const setQuickPeriodDays = useCallback(async (days: number) => {
    const { from, to } = periodEndingToday(days);
    setDraftFrom(from);
    setDraftTo(to);
    setActiveFrom(from);
    setActiveTo(to);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ from, to } satisfies ReportPeriod));
  }, []);

  const value = useMemo<ReportPeriodContextValue>(
    () => ({
      hydrated,
      draftFrom,
      draftTo,
      activeFrom,
      activeTo,
      activePeriodLabel: formatReportPeriodLabel(activeFrom, activeTo),
      draftPeriodLabel: formatReportPeriodLabel(draftFrom, draftTo),
      setDraftFrom,
      setDraftTo,
      setQuickPeriodDays,
      validatePeriod,
      applyPeriod,
    }),
    [
      activeFrom,
      activeTo,
      applyPeriod,
      draftFrom,
      draftTo,
      hydrated,
      setQuickPeriodDays,
      validatePeriod,
    ],
  );

  return <ReportPeriodContext.Provider value={value}>{children}</ReportPeriodContext.Provider>;
}

export function useReportPeriod() {
  const context = useContext(ReportPeriodContext);
  if (!context) {
    throw new Error('useReportPeriod must be used within ReportPeriodProvider');
  }
  return context;
}

export function useReportPeriodBounds() {
  const { activeFrom, activeTo, hydrated } = useReportPeriod();
  return {
    hydrated,
    fromIso: `${activeFrom}T00:00:00`,
    toIso: `${activeTo}T23:59:59`,
    activeFrom,
    activeTo,
  };
}
