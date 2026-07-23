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
};

export type TradeLink = {
  id: string;
  source: string;
  target: string;
  commodity: string;
};
