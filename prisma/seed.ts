import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create household
  const household = await prisma.household.upsert({
    where: { id: "default-household" },
    update: {},
    create: {
      id: "default-household",
      name: "My Household",
      currency: "USD",
    },
  });

  // Create members
  const member1 = await prisma.member.upsert({
    where: { id: "member-1" },
    update: {},
    create: {
      id: "member-1",
      householdId: household.id,
      name: "You",
      color: "#6366f1",
      emoji: "👤",
      isDefault: true,
    },
  });

  // Seed default expense categories
  const expenseCategories = [
    { name: "Housing", icon: "🏠", color: "#f59e0b" },
    { name: "Food & Dining", icon: "🍽️", color: "#10b981" },
    { name: "Transportation", icon: "🚗", color: "#3b82f6" },
    { name: "Health & Medical", icon: "⚕️", color: "#ef4444" },
    { name: "Entertainment", icon: "🎬", color: "#8b5cf6" },
    { name: "Shopping", icon: "🛍️", color: "#ec4899" },
    { name: "Utilities", icon: "💡", color: "#f97316" },
    { name: "Travel", icon: "✈️", color: "#06b6d4" },
    { name: "Education", icon: "📚", color: "#84cc16" },
    { name: "Personal Care", icon: "💆", color: "#a78bfa" },
    { name: "Gifts & Donations", icon: "🎁", color: "#fb7185" },
    { name: "Insurance", icon: "🛡️", color: "#64748b" },
    { name: "Investments", icon: "📈", color: "#059669" },
    { name: "Taxes", icon: "📋", color: "#dc2626" },
    { name: "Other", icon: "📦", color: "#9ca3af" },
  ];

  const incomeCategories = [
    { name: "Salary", icon: "💼", color: "#10b981" },
    { name: "Freelance", icon: "💻", color: "#3b82f6" },
    { name: "Investment Income", icon: "📈", color: "#6366f1" },
    { name: "Rental Income", icon: "🏢", color: "#f59e0b" },
    { name: "Bonus", icon: "🎉", color: "#ec4899" },
    { name: "Other Income", icon: "💰", color: "#9ca3af" },
  ];

  for (const [i, cat] of expenseCategories.entries()) {
    await prisma.category.upsert({
      where: { id: `cat-expense-${i}` },
      update: {},
      create: {
        id: `cat-expense-${i}`,
        householdId: household.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: "EXPENSE",
        isSystem: true,
        sortOrder: i,
      },
    });
  }

  for (const [i, cat] of incomeCategories.entries()) {
    await prisma.category.upsert({
      where: { id: `cat-income-${i}` },
      update: {},
      create: {
        id: `cat-income-${i}`,
        householdId: household.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: "INCOME",
        isSystem: true,
        sortOrder: i,
      },
    });
  }

  // Sample accounts
  const checkingAccount = await prisma.account.upsert({
    where: { id: "acc-checking" },
    update: {},
    create: {
      id: "acc-checking",
      householdId: household.id,
      name: "Chase Checking",
      type: "CHECKING",
      institution: "Chase",
      balance: 4250.0,
      color: "#3b82f6",
      icon: "🏦",
    },
  });

  const savingsAccount = await prisma.account.upsert({
    where: { id: "acc-savings" },
    update: {},
    create: {
      id: "acc-savings",
      householdId: household.id,
      name: "HYSA Emergency Fund",
      type: "SAVINGS",
      institution: "Marcus by Goldman Sachs",
      balance: 12500.0,
      color: "#10b981",
      icon: "💰",
    },
  });

  const investmentAccount = await prisma.account.upsert({
    where: { id: "acc-investment" },
    update: {},
    create: {
      id: "acc-investment",
      householdId: household.id,
      name: "Brokerage Account",
      type: "INVESTMENT",
      institution: "Fidelity",
      balance: 32000.0,
      color: "#6366f1",
      icon: "📈",
    },
  });

  const creditCard = await prisma.account.upsert({
    where: { id: "acc-credit" },
    update: {},
    create: {
      id: "acc-credit",
      householdId: household.id,
      name: "Chase Sapphire",
      type: "CREDIT",
      institution: "Chase",
      balance: -1850.0,
      color: "#f59e0b",
      icon: "💳",
    },
  });

  // Sample investment holdings
  await prisma.investmentHolding.upsert({
    where: { id: "holding-voo" },
    update: {},
    create: {
      id: "holding-voo",
      accountId: investmentAccount.id,
      ticker: "VOO",
      name: "Vanguard S&P 500 ETF",
      assetClass: "US_STOCK",
      quantity: 45.5,
      costBasis: 18200.0,
      currentPrice: 485.3,
      currentValue: 22081.15,
    },
  });

  await prisma.investmentHolding.upsert({
    where: { id: "holding-bnd" },
    update: {},
    create: {
      id: "holding-bnd",
      accountId: investmentAccount.id,
      ticker: "BND",
      name: "Vanguard Total Bond Market",
      assetClass: "BOND",
      quantity: 80.0,
      costBasis: 6400.0,
      currentPrice: 72.5,
      currentValue: 5800.0,
    },
  });

  await prisma.investmentHolding.upsert({
    where: { id: "holding-vxus" },
    update: {},
    create: {
      id: "holding-vxus",
      accountId: investmentAccount.id,
      ticker: "VXUS",
      name: "Vanguard Total International",
      assetClass: "INTL_STOCK",
      quantity: 100.0,
      costBasis: 5600.0,
      currentPrice: 61.2,
      currentValue: 6120.0,
    },
  });

  // Sample goals
  await prisma.goal.upsert({
    where: { id: "goal-emergency" },
    update: {},
    create: {
      id: "goal-emergency",
      householdId: household.id,
      name: "Emergency Fund",
      description: "6 months of expenses",
      type: "EMERGENCY_FUND",
      targetAmount: 18000.0,
      currentAmount: 12500.0,
      color: "#10b981",
      emoji: "🛡️",
      isShared: false,
    },
  });

  await prisma.goal.upsert({
    where: { id: "goal-vacation" },
    update: {},
    create: {
      id: "goal-vacation",
      householdId: household.id,
      name: "Honeymoon Trip",
      description: "Dream honeymoon to Italy",
      type: "PURCHASE",
      targetAmount: 8000.0,
      currentAmount: 2200.0,
      targetDate: new Date("2026-10-01"),
      color: "#ec4899",
      emoji: "✈️",
      isShared: true,
    },
  });

  await prisma.goal.upsert({
    where: { id: "goal-house" },
    update: {},
    create: {
      id: "goal-house",
      householdId: household.id,
      name: "House Down Payment",
      description: "20% down on a $450k home",
      type: "SAVINGS",
      targetAmount: 90000.0,
      currentAmount: 14500.0,
      targetDate: new Date("2028-06-01"),
      color: "#f59e0b",
      emoji: "🏡",
      isShared: true,
    },
  });

  // Sample recurring rules (subscriptions)
  const subscriptions = [
    { name: "Netflix", amount: 15.49, provider: "Netflix", categoryId: "cat-expense-4" },
    { name: "Spotify", amount: 9.99, provider: "Spotify", categoryId: "cat-expense-4" },
    { name: "Amazon Prime", amount: 14.99, provider: "Amazon", categoryId: "cat-expense-4" },
    { name: "Gym Membership", amount: 45.0, provider: "LA Fitness", categoryId: "cat-expense-9" },
    { name: "iCloud Storage", amount: 2.99, provider: "Apple", categoryId: "cat-expense-14" },
  ];

  for (const [i, sub] of subscriptions.entries()) {
    await prisma.recurringRule.upsert({
      where: { id: `sub-${i}` },
      update: {},
      create: {
        id: `sub-${i}`,
        householdId: household.id,
        name: sub.name,
        amount: sub.amount,
        frequency: "MONTHLY",
        dayOfMonth: i + 1,
        startDate: new Date("2025-01-01"),
        nextDue: new Date("2026-05-01"),
        isSubscription: true,
        provider: sub.provider,
        categoryId: sub.categoryId,
        accountId: creditCard.id,
        isActive: true,
      },
    });
  }

  // Sample budget for current month
  const now = new Date();
  const budget = await prisma.budget.upsert({
    where: { id: "budget-current" },
    update: {},
    create: {
      id: "budget-current",
      householdId: household.id,
      name: `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()} Budget`,
      period: "MONTHLY",
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      isActive: true,
    },
  });

  const budgetLines = [
    { categoryId: "cat-expense-0", allocated: 1800 }, // Housing
    { categoryId: "cat-expense-1", allocated: 600 },  // Food
    { categoryId: "cat-expense-2", allocated: 300 },  // Transportation
    { categoryId: "cat-expense-4", allocated: 100 },  // Entertainment
    { categoryId: "cat-expense-5", allocated: 200 },  // Shopping
    { categoryId: "cat-expense-6", allocated: 150 },  // Utilities
    { categoryId: "cat-expense-9", allocated: 80 },   // Personal Care
  ];

  for (const [i, line] of budgetLines.entries()) {
    await prisma.budgetLine.upsert({
      where: { id: `budget-line-${i}` },
      update: {},
      create: {
        id: `budget-line-${i}`,
        budgetId: budget.id,
        categoryId: line.categoryId,
        allocated: line.allocated,
      },
    });
  }

  // Sample transactions for the past 60 days
  const sampleTransactions = [
    { desc: "Paycheck - Direct Deposit", amount: 4200, type: "INCOME", catId: "cat-income-0", daysAgo: 2 },
    { desc: "Rent", amount: -1800, type: "EXPENSE", catId: "cat-expense-0", daysAgo: 3 },
    { desc: "Whole Foods Market", amount: -127.45, type: "EXPENSE", catId: "cat-expense-1", daysAgo: 1 },
    { desc: "Netflix", amount: -15.49, type: "EXPENSE", catId: "cat-expense-4", daysAgo: 5 },
    { desc: "Gas Station", amount: -52.0, type: "EXPENSE", catId: "cat-expense-2", daysAgo: 4 },
    { desc: "Starbucks", amount: -6.75, type: "EXPENSE", catId: "cat-expense-1", daysAgo: 0 },
    { desc: "Amazon Purchase", amount: -89.99, type: "EXPENSE", catId: "cat-expense-5", daysAgo: 7 },
    { desc: "Electric Bill", amount: -95.0, type: "EXPENSE", catId: "cat-expense-6", daysAgo: 10 },
    { desc: "Gym Membership", amount: -45.0, type: "EXPENSE", catId: "cat-expense-9", daysAgo: 12 },
    { desc: "Restaurant - Date Night", amount: -78.5, type: "EXPENSE", catId: "cat-expense-1", daysAgo: 8 },
    { desc: "Freelance Payment", amount: 1200, type: "INCOME", catId: "cat-income-1", daysAgo: 15 },
    { desc: "Spotify Premium", amount: -9.99, type: "EXPENSE", catId: "cat-expense-4", daysAgo: 5 },
    { desc: "CVS Pharmacy", amount: -23.5, type: "EXPENSE", catId: "cat-expense-3", daysAgo: 6 },
    { desc: "Uber", amount: -18.75, type: "EXPENSE", catId: "cat-expense-2", daysAgo: 3 },
    { desc: "Target", amount: -156.3, type: "EXPENSE", catId: "cat-expense-5", daysAgo: 18 },
  ];

  for (const [i, tx] of sampleTransactions.entries()) {
    const date = new Date();
    date.setDate(date.getDate() - tx.daysAgo);

    const accId = tx.type === "INCOME" ? checkingAccount.id : creditCard.id;

    await prisma.transaction.upsert({
      where: { id: `tx-sample-${i}` },
      update: {},
      create: {
        id: `tx-sample-${i}`,
        date,
        description: tx.desc,
        amount: tx.amount,
        type: tx.type,
        accountId: accId,
        categoryId: tx.catId,
        memberId: member1.id,
        isReviewed: i < 10,
      },
    });
  }

  // Net worth snapshots (last 6 months)
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    date.setDate(1);
    const growth = (5 - i) * 800 + Math.random() * 500;
    const netWorth = 47000 + growth;

    await prisma.netWorthSnapshot.upsert({
      where: { id: `nw-snapshot-${i}` },
      update: {},
      create: {
        id: `nw-snapshot-${i}`,
        householdId: household.id,
        date,
        totalAssets: netWorth + 1850,
        totalLiabilities: 1850,
        netWorth,
        breakdown: JSON.stringify({
          checking: 4250,
          savings: 12500,
          investments: 32000 + growth * 0.4,
          credit: -1850,
        }),
      },
    });
  }

  // Goal milestones
  const milestoneData = [
    { id: "ms-emergency-25", goalId: "goal-emergency", percentage: 25, reachedAt: new Date("2025-08-01"), celebrated: true },
    { id: "ms-emergency-50", goalId: "goal-emergency", percentage: 50, reachedAt: new Date("2025-12-01"), celebrated: true },
    { id: "ms-emergency-75", goalId: "goal-emergency", percentage: 75 },
    { id: "ms-emergency-100", goalId: "goal-emergency", percentage: 100 },
    { id: "ms-vacation-25", goalId: "goal-vacation", percentage: 25, reachedAt: new Date("2026-02-01"), celebrated: true },
    { id: "ms-vacation-50", goalId: "goal-vacation", percentage: 50 },
    { id: "ms-vacation-75", goalId: "goal-vacation", percentage: 75 },
    { id: "ms-vacation-100", goalId: "goal-vacation", percentage: 100 },
    { id: "ms-house-25", goalId: "goal-house", percentage: 25 },
    { id: "ms-house-50", goalId: "goal-house", percentage: 50 },
    { id: "ms-house-75", goalId: "goal-house", percentage: 75 },
    { id: "ms-house-100", goalId: "goal-house", percentage: 100 },
  ];

  for (const ms of milestoneData) {
    await prisma.goalMilestone.upsert({
      where: { id: ms.id },
      update: {},
      create: ms,
    });
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
