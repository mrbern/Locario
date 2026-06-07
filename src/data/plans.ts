export type CompanyPlan = "pilot" | "starter" | "pro" | "premium";

export type CompanyPlanOption = {
  value: CompanyPlan;
  label: string;
  description: string;
  publicPlan: boolean;
  canReceiveLeads: boolean;
  canEditProfile: boolean;
  canUsePartnerDashboard: boolean;
  canUseAdvertising: boolean;
  hasPriorityPlacement: boolean;
  hasPremiumPlacement: boolean;
};

export const companyPlans: CompanyPlanOption[] = [
  {
    value: "pilot",
    label: "Pilot",
    description: "Interner Testkunde / Einführungsphase",
    publicPlan: false,
    canReceiveLeads: true,
    canEditProfile: true,
    canUsePartnerDashboard: true,
    canUseAdvertising: true,
    hasPriorityPlacement: false,
    hasPremiumPlacement: false,
  },
  {
    value: "starter",
    label: "Starter",
    description: "Einfaches Firmenprofil ohne Leads und ohne Dashboard",
    publicPlan: true,
    canReceiveLeads: false,
    canEditProfile: false,
    canUsePartnerDashboard: false,
    canUseAdvertising: false,
    hasPriorityPlacement: false,
    hasPremiumPlacement: false,
  },
  {
    value: "pro",
    label: "Pro",
    description:
      "Firmenprofil, Partner-Dashboard, Leads, Werbeangebot und stärkere Darstellung",
    publicPlan: true,
    canReceiveLeads: true,
    canEditProfile: true,
    canUsePartnerDashboard: true,
    canUseAdvertising: true,
    hasPriorityPlacement: true,
    hasPremiumPlacement: false,
  },
  {
    value: "premium",
    label: "Premium",
    description:
      "Maximale Sichtbarkeit, Partner-Dashboard, Leads und bevorzugte Platzierung",
    publicPlan: true,
    canReceiveLeads: true,
    canEditProfile: true,
    canUsePartnerDashboard: true,
    canUseAdvertising: true,
    hasPriorityPlacement: true,
    hasPremiumPlacement: true,
  },
];

export function getCompanyPlan(plan: string | undefined) {
  const matchingPlan = companyPlans.find((companyPlan) => {
    return companyPlan.value === plan;
  });

  return matchingPlan ?? companyPlans[0];
}

export function getCompanyPlanLabel(plan: string | undefined) {
  return getCompanyPlan(plan).label;
}

export function getCompanyPlanDescription(plan: string | undefined) {
  return getCompanyPlan(plan).description;
}

export function isPublicCompanyPlan(plan: string | undefined) {
  return getCompanyPlan(plan).publicPlan;
}

export function canCompanyReceiveLeads(plan: string | undefined) {
  return getCompanyPlan(plan).canReceiveLeads;
}

export function canCompanyEditProfile(plan: string | undefined) {
  return getCompanyPlan(plan).canEditProfile;
}

export function canCompanyUsePartnerDashboard(plan: string | undefined) {
  return getCompanyPlan(plan).canUsePartnerDashboard;
}

export function canCompanyUseAdvertising(plan: string | undefined) {
  return getCompanyPlan(plan).canUseAdvertising;
}

export function hasCompanyPriorityPlacement(plan: string | undefined) {
  return getCompanyPlan(plan).hasPriorityPlacement;
}

export function hasCompanyPremiumPlacement(plan: string | undefined) {
  return getCompanyPlan(plan).hasPremiumPlacement;
}

