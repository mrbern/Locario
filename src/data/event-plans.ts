export type EventPlan = {
  value: string;
  label: string;
  price: string;
  description: string;
};

export const eventPlans: EventPlan[] = [
  {
    value: "basic",
    label: "Event Basic",
    price: "CHF 19.– / Woche",
    description: "Normale Event-Kachel auf der Events-Seite.",
  },
  {
    value: "highlight",
    label: "Event Highlight",
    price: "CHF 49.– / Woche",
    description:
      "Hervorgehobene Darstellung, bessere Sichtbarkeit und stärkere Kachel.",
  },
  {
    value: "premium",
    label: "Event Premium",
    price: "CHF 99.– / Woche",
    description:
      "Top-Platzierung, stärkste Darstellung und ideal für wichtige Veranstaltungen.",
  },
];

export function getEventPlanLabel(plan: string | undefined) {
  const eventPlan = eventPlans.find((item) => item.value === plan);

  return eventPlan?.label || "Event Basic";
}

export function getEventPlanDescription(plan: string | undefined) {
  const eventPlan = eventPlans.find((item) => item.value === plan);

  return eventPlan?.description || "Normale Event-Kachel auf der Events-Seite.";
}

export function getEventPlanPrice(plan: string | undefined) {
  const eventPlan = eventPlans.find((item) => item.value === plan);

  return eventPlan?.price || "CHF 19.– / Woche";
}

export function getEventPlanRank(plan: string | undefined) {
  if (plan === "premium") {
    return 3;
  }

  if (plan === "highlight") {
    return 2;
  }

  return 1;
}

export function isHighlightedEventPlan(plan: string | undefined) {
  return plan === "highlight" || plan === "premium";
}
