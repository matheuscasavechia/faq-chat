-- GiST trigram index: supports both similarity filtering and KNN ("<->") ordering,
-- which is what the "closest registered question" lookup relies on.
CREATE INDEX "faqs_normalized_question_trgm_idx" ON "faqs" USING GIST ("normalized_question" gist_trgm_ops);

-- Domain invariants enforced by the database as well as by the domain layer.
ALTER TABLE "faqs"
  ADD CONSTRAINT "faqs_question_not_blank" CHECK (length(btrim("question")) > 0),
  ADD CONSTRAINT "faqs_normalized_question_not_blank" CHECK (length(btrim("normalized_question")) > 0),
  ADD CONSTRAINT "faqs_answer_not_blank" CHECK (length(btrim("answer")) > 0);

ALTER TABLE "interactions"
  ADD CONSTRAINT "interactions_question_not_blank" CHECK (length(btrim("question")) > 0),
  ADD CONSTRAINT "interactions_similarity_score_range" CHECK (
    "similarity_score" IS NULL OR ("similarity_score" >= 0 AND "similarity_score" <= 1)
  ),
  ADD CONSTRAINT "interactions_answered_requires_match" CHECK (
    "answered" = false OR "matched_faq_id" IS NOT NULL
  );
