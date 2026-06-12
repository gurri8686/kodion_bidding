-- Indexes to speed up the admin dashboard (/api/admin/job-stats).
-- The dashboard runs GROUP BY / COUNT / SUM aggregations on applied_jobs
-- filtered and grouped by these columns. Without indexes MySQL full-scans
-- the table on every aggregation. Run each once in your MySQL console.
--
-- Safe and non-destructive (indexes only speed up reads; they don't change data).
-- If an index already exists, MySQL will error on that line — just skip it.

CREATE INDEX idx_applied_userid      ON applied_jobs (userId);
CREATE INDEX idx_applied_platform    ON applied_jobs (platformId);
CREATE INDEX idx_applied_profile     ON applied_jobs (profileId);
CREATE INDEX idx_applied_stage       ON applied_jobs (stage);
CREATE INDEX idx_applied_applied_at  ON applied_jobs (applied_at);

-- The dashboard's date filter also touches these two columns (OR'd with applied_at),
-- so indexing them helps the replied/interview date windows too.
CREATE INDEX idx_applied_reply_date     ON applied_jobs (replyDate);
CREATE INDEX idx_applied_interview_date ON applied_jobs (interviewDate);
