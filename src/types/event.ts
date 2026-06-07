export type LocarioEvent = {
  id: string;

  title: string;
  imageUrl: string;

  organizerName: string;
  category: string;
  plan: string;

  city: string;
  locationName: string;
  address: string;

  description: string;

  startsAt: string;
  endsAt: string;

  website: string;
  ticketUrl: string;

  isActive: boolean;
  highlightUntil: string;

  createdAt: string;
  updatedAt: string;
};
