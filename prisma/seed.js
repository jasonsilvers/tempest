const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.role.create({
    data: {
      name: 'Admin',
      resources: {
        create: [
          {
            name: 'Record',
            permissions: {
              create: [
                {
                  name: 'create:any',
                  attributes: ['*'],
                },
                {
                  name: 'update:any',
                  attributes: ['*'],
                },
                {
                  name: 'delete:any',
                  attributes: ['*'],
                },
                {
                  name: 'read:any',
                  attributes: ['*'],
                },
              ],
            },
          },
          {
            name: 'Member',
            permissions: {
              create: [
                {
                  name: 'create:any',
                  attributes: ['*'],
                },
                {
                  name: 'update:any',
                  attributes: ['*'],
                },
                {
                  name: 'delete:any',
                  attributes: ['*'],
                },
                {
                  name: 'read:any',
                  attributes: ['*'],
                },
              ],
            },
          },
        ],
      },
    },
  });

  // const user = await prisma.role.create({
  //   data: {
  //     name: 'User',
  //     resources: {
  //       update: [
  //         {
  //           name: 'Record',
  //           permissions: {
  //             create: [
  //               {
  //                 name: 'create:own',
  //                 attributes: ['*'],
  //               },
  //               {
  //                 name: 'update:own',
  //                 attributes: ['*'],
  //               },
  //               {
  //                 name: 'read:own',
  //                 attributes: ['*'],
  //               },
  //             ],
  //           },
  //         },
  //         {
  //           name: 'Member',
  //           permissions: {
  //             create: [
  //               {
  //                 name: 'update:own',
  //                 attributes: ['*'],
  //               },
  //               {
  //                 name: 'read:own',
  //                 attributes: ['*'],
  //               },
  //             ],
  //           },
  //         },
  //       ],
  //     },
  //   },
  // });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
