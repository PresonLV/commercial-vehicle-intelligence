-- Figures taken from a stored report. sample marks preview rows that are not real statistics.
CREATE TABLE metric_points (
  id bigserial PRIMARY KEY,
  metric text NOT NULL,
  segment text NOT NULL,
  period text NOT NULL,
  value numeric(14, 4) NOT NULL,
  unit text NOT NULL,
  source_name text NOT NULL,
  url text NOT NULL,
  article_id text REFERENCES articles (id) ON DELETE CASCADE,
  sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (metric, segment, period, url)
);

CREATE INDEX metric_points_period_idx ON metric_points (metric, period);
