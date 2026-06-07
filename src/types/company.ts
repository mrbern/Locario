export type CompanyAd = {
  title: string;
  description: string;
  cta: string;
};

export type Company = {
  id: string;
  name: string;
  imageUrl: string;

  accessToken?: string;
  plan?: string;

  mainCategory?: string;
  subCategory?: string;
  subCategories?: string[];

  category: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  tags: string[];
  searchTerms: string[];
  ad?: CompanyAd;
};
