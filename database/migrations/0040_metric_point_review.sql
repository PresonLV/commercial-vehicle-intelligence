-- Brand, how the number was read, and whether a reader should see it.
-- Older rows are sentence extracts already checked against the source text.
ALTER TABLE metric_points ADD COLUMN brand text NOT NULL DEFAULT '';
ALTER TABLE metric_points ADD COLUMN method text NOT NULL DEFAULT 'sentence';
ALTER TABLE metric_points ADD COLUMN confidence text NOT NULL DEFAULT 'high';

ALTER TABLE metric_points DROP CONSTRAINT metric_points_metric_segment_period_url_key;
ALTER TABLE metric_points ADD CONSTRAINT metric_points_identity UNIQUE (metric, segment, brand, period, url);

CREATE INDEX metric_points_review_idx ON metric_points (confidence) WHERE confidence <> 'high';
