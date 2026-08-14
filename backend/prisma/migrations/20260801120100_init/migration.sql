-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL,
    "question" VARCHAR(500) NOT NULL,
    "normalized_question" VARCHAR(500) NOT NULL,
    "answer" TEXT NOT NULL,
    "category_id" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interactions" (
    "id" UUID NOT NULL,
    "question" VARCHAR(500) NOT NULL,
    "normalized_question" VARCHAR(500) NOT NULL,
    "matched_faq_id" UUID,
    "similarity_score" DECIMAL(5,4),
    "answered" BOOLEAN NOT NULL,
    "category_id" UUID,
    "session_id" VARCHAR(64),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_normalized_question_key" ON "faqs"("normalized_question");

-- CreateIndex
CREATE INDEX "faqs_category_id_idx" ON "faqs"("category_id");

-- CreateIndex
CREATE INDEX "faqs_active_idx" ON "faqs"("active");

-- CreateIndex
CREATE INDEX "interactions_created_at_idx" ON "interactions"("created_at");

-- CreateIndex
CREATE INDEX "interactions_answered_created_at_idx" ON "interactions"("answered", "created_at");

-- CreateIndex
CREATE INDEX "interactions_category_id_created_at_idx" ON "interactions"("category_id", "created_at");

-- CreateIndex
CREATE INDEX "interactions_matched_faq_id_idx" ON "interactions"("matched_faq_id");

-- CreateIndex
CREATE INDEX "interactions_normalized_question_idx" ON "interactions"("normalized_question");

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_matched_faq_id_fkey" FOREIGN KEY ("matched_faq_id") REFERENCES "faqs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
