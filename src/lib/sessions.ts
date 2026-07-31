import type { AppStore } from "./types";
import { bookingAmountReceived, bookingUdhari } from "./udhari";

export interface EndedSessionAlert {
  id: string;
  customerName: string;
  date: string;
  slotLabel: string;
  slotPrice: number;
  received: number;
  udhari: number;
  fullyPaid: boolean;
}

function sessionEndDateTime(date: string, endTime: string): Date {
  const [h, m] = endTime.split(":").map(Number);
  const d = new Date(`${date}T00:00:00`);
  d.setHours(h ?? 23, m ?? 59, 0, 0);
  return d;
}

/** Approved bookings whose slot end time has passed */
export function getEndedSessions(store: AppStore): EndedSessionAlert[] {
  const now = new Date();

  return store.bookings
    .filter((b) => b.status === "approved")
    .map((b) => {
      const slot = store.slots.find((s) => s.id === b.slotId);
      const endTime = slot?.end ?? "23:59";
      const endedAt = sessionEndDateTime(b.date, endTime);
      if (endedAt > now) return null;

      const received = bookingAmountReceived(b);
      const udhari = bookingUdhari(b);

      return {
        id: b.id,
        customerName: b.customerName,
        date: b.date,
        slotLabel: b.slotLabel,
        slotPrice: b.slotPrice,
        received,
        udhari,
        fullyPaid: udhari === 0,
      };
    })
    .filter((x): x is EndedSessionAlert => x !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Ended sessions that still need payment cleared */
export function getEndedSessionsNeedingPayment(store: AppStore): EndedSessionAlert[] {
  return getEndedSessions(store).filter((s) => !s.fullyPaid);
}
