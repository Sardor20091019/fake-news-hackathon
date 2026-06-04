-- CreateTable
CREATE TABLE "AnalysisCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hash" TEXT NOT NULL,
    "url" TEXT,
    "content" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "highlights" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisCache_hash_key" ON "AnalysisCache"("hash");
