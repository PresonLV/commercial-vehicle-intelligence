-- Original brand wording and the filing page. Charts may use a canonical brand; the source text stays.
ALTER TABLE metric_points ADD COLUMN brand_text text NOT NULL DEFAULT '';
ALTER TABLE metric_points ADD COLUMN page text NOT NULL DEFAULT '';

UPDATE metric_points SET brand_text = brand WHERE brand_text = '';
