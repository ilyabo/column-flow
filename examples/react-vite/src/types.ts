export type Stage = {
  id: string;
  label: string;
  color: string;
};

export type CompanyNode = {
  id: string;
  stage: string;
  name: string;
  country: string;
  summary: string;
  tone?: "muted" | "accent";
};

export type TradeLink = {
  id: string;
  source: string;
  target: string;
  commodity: string;
};
