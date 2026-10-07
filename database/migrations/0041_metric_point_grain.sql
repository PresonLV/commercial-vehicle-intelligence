-- A period can be one month, a full year, or a cited cumulative (1-8月). August and 1-8月 share 2026-08.
ALTER TABLE metric_points ADD COLUMN grain text NOT NULL DEFAULT 'month';

ALTER TABLE metric_points DROP CONSTRAINT metric_points_identity;
ALTER TABLE metric_points ADD CONSTRAINT metric_points_identity UNIQUE (metric, segment, brand, period, grain, url);
ALTER TABLE metric_points ADD CONSTRAINT metric_points_grain_chk CHECK (grain IN ('month', 'year', 'ytd'));
