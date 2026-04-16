// Shared mock Prisma instance — imported in every test file
const prismaMock = {
  admin: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    create: jest.fn(),
  },
  project: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  page: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  linkTracker: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  clickLog: {
    create: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  $transaction: jest.fn(),
};

module.exports = { PrismaClient: jest.fn(() => prismaMock), prismaMock };
