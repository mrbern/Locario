export type CompanyAd = {
  id?: string;
  title: string;
  description: string;
  cta: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Company = {
  id: string;
  name: string;
  companyName?: string;
  title?: string;
  imageUrl?: string;

  accessToken?: string;
  plan?: string;

  mainCategory?: string;
  subCategory?: string;
  subCategories?: string[];

  category: string;
  city: string;
  address?: string;
  adress?: string;

  latitude?: number | null;
  longitude?: number | null;

  phone?: string;
  email?: string;
  website?: string;
  description: string;
  tags: string[];
  searchTerms: string[];
  ad?: CompanyAd | null;

  createdAt?: string;
  updatedAt?: string;
};
