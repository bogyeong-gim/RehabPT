import { create } from 'zustand';
import { Schedule } from '../types';

interface ScheduleState {
  schedules: Schedule[];
  isLoading: boolean;
  setSchedules: (schedules: Schedule[]) => void;
  setLoading: (loading: boolean) => void;
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, data: Partial<Schedule>) => void;
  removeSchedule: (id: string) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedules: [],
  isLoading: false,
  setSchedules: (schedules) => set({ schedules, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  addSchedule: (schedule) =>
    set((state) => ({ schedules: [schedule, ...state.schedules] })),
  updateSchedule: (id, data) =>
    set((state) => ({
      schedules: state.schedules.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),
  removeSchedule: (id) =>
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
    })),
}));
