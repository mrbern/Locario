export type CompanyInquiryStatus =
  | "new"
  | "contacted"
  | "converted"
  | "rejected";

export type CompanyInquiry = {
  id: string;

  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  city: string;

  desiredPlan: string;

  mainCategory: string;
  subCategory: string;
  subCategories: string[];
  category: string;

  description: string;
  tags: string[];
  searchTerms: string[];

  adTitle: string;
  adDescription: string;
  adCta: string;

  message: string;
  status: CompanyInquiryStatus | string;

  createdAt: string;
  updatedAt: string;
};
