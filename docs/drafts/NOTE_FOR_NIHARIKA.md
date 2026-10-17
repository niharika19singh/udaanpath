# Draft Knowledge-Base Database Note

This is a proposal only. No migration has been applied, and the current API tables and ORM models are unchanged.

The draft uses separate `kb_opportunities`, `kb_careers`, and `kb_learning_resources` tables. Each table includes `status`, `source_url`, `is_sample`, nullable `last_verified_on`, nullable `verified_by`, and a unique `slug`.

`status` shows whether a record still needs review or has expired. `source_url` records the page used to check a fact. `is_sample` keeps demo content out of verified recommendations. `last_verified_on` is nullable because no human verification date should be invented. Opportunity rows also include `eligibility_confirmed` so the rule engine can distinguish reviewed eligibility rules from unknown ones.

Keeping these tables separate avoids changing the current API models and allows career salary and growth fields to remain null when they have no source. Please review the table names, column types, and migration chain before moving this draft into the active Alembic workflow.