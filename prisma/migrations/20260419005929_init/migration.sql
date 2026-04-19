-- CreateTable
CREATE TABLE "households" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "emoji" TEXT NOT NULL DEFAULT '👤',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "members_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT,
    "institution" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "balance" REAL NOT NULL DEFAULT 0,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT,
    "icon" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "accounts_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "type" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "categories_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "notes" TEXT,
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT,
    "memberId" TEXT,
    "transferLinkId" TEXT,
    "splitType" TEXT,
    "splitData" TEXT,
    "recurringRuleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_recurringRuleId_fkey" FOREIGN KEY ("recurringRuleId") REFERENCES "recurring_rules" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recurring_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "frequency" TEXT NOT NULL,
    "dayOfMonth" INTEGER,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "nextDue" DATETIME NOT NULL,
    "lastTriggered" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSubscription" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT,
    "categoryId" TEXT,
    "accountId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "recurring_rules_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "month" INTEGER,
    "year" INTEGER,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "budgets_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "budget_lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "allocated" REAL NOT NULL,
    "rollover" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    CONSTRAINT "budget_lines_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "budget_lines_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "targetAmount" REAL NOT NULL,
    "currentAmount" REAL NOT NULL DEFAULT 0,
    "targetDate" DATETIME,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "emoji" TEXT NOT NULL DEFAULT '🎯',
    "celebrationSeen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "goals_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goal_account_links" (
    "goalId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    PRIMARY KEY ("goalId", "accountId"),
    CONSTRAINT "goal_account_links_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "goal_account_links_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goal_contributions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "goal_contributions_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goal_milestones" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,
    "reachedAt" DATETIME,
    "celebrated" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "goal_milestones_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "investment_holdings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "ticker" TEXT,
    "name" TEXT NOT NULL,
    "assetClass" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 0,
    "costBasis" REAL NOT NULL DEFAULT 0,
    "currentPrice" REAL NOT NULL DEFAULT 0,
    "currentValue" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "priceUpdatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "investment_holdings_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "holding_price_points" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "holdingId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "price" REAL NOT NULL,
    "value" REAL NOT NULL,
    CONSTRAINT "holding_price_points_holdingId_fkey" FOREIGN KEY ("holdingId") REFERENCES "investment_holdings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "investment_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "ticker" TEXT,
    "name" TEXT,
    "quantity" REAL,
    "price" REAL,
    "amount" REAL NOT NULL,
    "fees" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    CONSTRAINT "investment_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "net_worth_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "householdId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "totalAssets" REAL NOT NULL,
    "totalLiabilities" REAL NOT NULL,
    "netWorth" REAL NOT NULL,
    "breakdown" TEXT NOT NULL,
    CONSTRAINT "net_worth_snapshots_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "account_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "balance" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "account_snapshots_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "householdId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduledFor" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "netWorth" REAL,
    "mood" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "check_ins_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "check_in_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checkInId" TEXT NOT NULL,
    "promptKey" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "memberId" TEXT,
    CONSTRAINT "check_in_responses_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "check_ins" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "check_in_responses_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "money_dates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "householdId" TEXT NOT NULL,
    "scheduledFor" DATETIME NOT NULL,
    "agenda" TEXT NOT NULL,
    "completedAt" DATETIME,
    "notes" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "money_dates_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE INDEX "transactions_accountId_idx" ON "transactions"("accountId");

-- CreateIndex
CREATE INDEX "transactions_categoryId_idx" ON "transactions"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "budget_lines_budgetId_categoryId_key" ON "budget_lines"("budgetId", "categoryId");

-- CreateIndex
CREATE INDEX "holding_price_points_holdingId_date_idx" ON "holding_price_points"("holdingId", "date");

-- CreateIndex
CREATE INDEX "investment_transactions_accountId_date_idx" ON "investment_transactions"("accountId", "date");

-- CreateIndex
CREATE INDEX "net_worth_snapshots_householdId_date_idx" ON "net_worth_snapshots"("householdId", "date");

-- CreateIndex
CREATE INDEX "account_snapshots_accountId_date_idx" ON "account_snapshots"("accountId", "date");
