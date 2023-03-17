-- CreateTable
CREATE TABLE "Dataset"
(
    "id"          TEXT     NOT NULL PRIMARY KEY,
    "name"        TEXT     NOT NULL,
    "type"        TEXT     NOT NULL,
    "connection"  TEXT     NOT NULL,
    "workspaceId" TEXT,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL,
    CONSTRAINT "Dataset_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "Workspace"
(
    "id"        TEXT     NOT NULL PRIMARY KEY,
    "name"      TEXT     NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Query"
(
    "id"        TEXT     NOT NULL PRIMARY KEY,
    "name"      TEXT,
    "query"     TEXT     NOT NULL,
    "datasetId" TEXT     NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Query_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChartConfig"
(
    "id"         TEXT     NOT NULL PRIMARY KEY,
    "configJson" TEXT     NOT NULL,
    "type"       TEXT     NOT NULL,
    "queryId"    TEXT     NOT NULL,
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  DATETIME NOT NULL,
    CONSTRAINT "ChartConfig_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
