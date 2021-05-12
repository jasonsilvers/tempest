const Prisma = require('@prisma/client');
const prisma = new Prisma.PrismaClient();

// things that are needed:
// update table to record change for each event type

(async () => {
  const user = await prisma.user.findFirst();
  console.log(user);
})();
