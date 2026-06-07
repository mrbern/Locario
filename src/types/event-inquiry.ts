export type EventInquiry = {
  id: string;

  eventTitle: string;
  organizerName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  city: string;

  desiredPlan: string;

  category: string;
  locationName: string;
  eventDate: string;

  description: string;
  tags: string[];

  message: string;
  status: string;

  createdAt: string;
  updatedAt: string;
};

