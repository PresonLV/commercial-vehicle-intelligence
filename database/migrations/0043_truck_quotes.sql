-- Manufacturer and dealer truck prices. One row is one observation.
-- price_date is a date printed next to the price. observed_on is the day the page was read.
-- Readers only see confidence = 'high'. sample rows are labeled 【样例】.
CREATE TABLE truck_quotes (
  id bigserial PRIMARY KEY,
  brand text NOT NULL,
  series text NOT NULL DEFAULT '',
  model_name text NOT NULL,
  segment text NOT NULL,
  drive text NOT NULL DEFAULT '',
  engine_brand text NOT NULL DEFAULT '',
  horsepower integer,
  gearbox text NOT NULL DEFAULT '',
  power_type text NOT NULL DEFAULT '',
  emission text NOT NULL DEFAULT '',
  kind text NOT NULL,
  price_wan numeric(12, 2) NOT NULL,
  price_date date,
  observed_on date NOT NULL,
  source_name text NOT NULL,
  url text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  confidence text NOT NULL DEFAULT 'high',
  method text NOT NULL DEFAULT 'manual',
  sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT truck_quotes_kind CHECK (kind IN ('msrp', 'dealer')),
  CONSTRAINT truck_quotes_confidence CHECK (confidence IN ('high', 'review')),
  UNIQUE (url, kind, observed_on)
);

CREATE INDEX truck_quotes_public_idx ON truck_quotes (brand, series, observed_on) WHERE confidence = 'high';
CREATE INDEX truck_quotes_review_idx ON truck_quotes (confidence) WHERE confidence <> 'high';
