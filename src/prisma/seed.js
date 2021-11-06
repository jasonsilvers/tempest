'use strict';
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
exports.__esModule = true;
var client_1 = require('@prisma/client');
var enums_1 = require('../const/enums');
var grants_1 = require('../const/grants');
var faker = require('faker');
var prisma = new client_1.PrismaClient();
var DOD_ID = '2223332221';
function createUser(dodId, firstName, lastName) {
  if (dodId === void 0) {
    dodId = null;
  }
  if (firstName === void 0) {
    firstName = null;
  }
  if (lastName === void 0) {
    lastName = null;
  }
  var gender = faker.datatype.number(1);
  return {
    id: faker.datatype.uuid(),
    firstName: firstName ? firstName : faker.name.firstName(gender),
    lastName: lastName ? lastName : faker.name.lastName(gender),
    dodId: dodId ? dodId : faker.datatype.number({ min: 1000000000, max: 1999999999 }).toString(),
    email: faker.internet.email(),
    dutyTitle: faker.company.bsAdjective() + ' ' + faker.company.bsNoun() + ' ' + faker.company.bsBuzz(),
    afsc:
      faker.datatype.number({ min: 1, max: 7 }).toString() +
      faker.random.alpha().toLocaleUpperCase() +
      faker.datatype.number({ min: 1, max: 7 }).toString() +
      'X' +
      faker.datatype.number({ min: 1, max: 7 }).toString(),
    rank: 'SSgt/E5',
    address: '15 WG/WSA Tron, Bldg 1102',
  };
}
function seedDev() {
  return __awaiter(this, void 0, void 0, function () {
    var organization1,
      organization2,
      trackingItem1,
      trackingItem2,
      trackingItem3,
      user1,
      memberRole,
      adminRole,
      user2,
      user3,
      newMemberTrackingItem1,
      newMemberTrackingItem2,
      newMemberTrackingItem3,
      memberTrackingItem1,
      memberTrackingItem2,
      memberTrackingItem3;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            prisma.organization.create({
              data: {
                name: '15th MDG',
              },
            }),
          ];
        case 1:
          organization1 = _a.sent();
          return [
            4 /*yield*/,
            prisma.organization.create({
              data: {
                name: 'Dental Squadron',
                parent: {
                  connect: { id: organization1.id },
                },
              },
            }),
          ];
        case 2:
          organization2 = _a.sent();
          return [
            4 /*yield*/,
            prisma.organization.create({
              data: {
                id: '67c6657f-0022-48b0-89b3-866dd89831ef',
                name: 'Vaccinations Squadron',
                parent: {
                  connect: { id: organization1.id },
                },
              },
            }),
          ];
        case 3:
          _a.sent();
          return [
            4 /*yield*/,
            prisma.trackingItem.createMany({
              data: [
                {
                  title: 'Fire Extinguisher',
                  description: 'This is a AF yearly requirment',
                  interval: 365,
                },
                {
                  title: 'Supervisor Safety Training',
                  description: 'One time training for new supevisors',
                  interval: 0,
                },
              ],
            }),
          ];
        case 4:
          _a.sent();
          return [
            4 /*yield*/,
            prisma.trackingItem.create({
              data: {
                title: 'Fire Safety',
                description: 'How to be SAFE when using Fire',
                interval: 60,
              },
            }),
          ];
        case 5:
          trackingItem1 = _a.sent();
          return [
            4 /*yield*/,
            prisma.trackingItem.create({
              data: {
                title: 'Big Bug Safety',
                description: 'There are big bugs in Hawaii!  Be careful!',
                interval: 365,
              },
            }),
          ];
        case 6:
          trackingItem2 = _a.sent();
          return [
            4 /*yield*/,
            prisma.trackingItem.create({
              data: {
                title: 'Keyboard Warrior Training',
                description: 'How to be a true keyboard warrior via writing code',
                interval: 180,
              },
            }),
          ];
        case 7:
          trackingItem3 = _a.sent();
          user1 = createUser(DOD_ID, 'Joe', 'Smith');
          return [
            4 /*yield*/,
            prisma.role.findFirst({
              where: {
                name: enums_1.ERole.MEMBER,
              },
            }),
          ];
        case 8:
          memberRole = _a.sent();
          return [
            4 /*yield*/,
            prisma.role.findFirst({
              where: {
                name: enums_1.ERole.MONITOR,
              },
            }),
          ];
        case 9:
          adminRole = _a.sent();
          return [
            4 /*yield*/,
            prisma.user.create({
              data: __assign(__assign({}, user1), { organizationId: organization1.id, roleId: adminRole.id }),
            }),
          ];
        case 10:
          _a.sent();
          user2 = createUser('1143209890', 'Sandra', 'Clark');
          return [
            4 /*yield*/,
            prisma.user.create({
              data: __assign(__assign({}, user2), {
                organization: {
                  connect: {
                    id: organization2.id,
                  },
                },
                role: {
                  connect: {
                    id: memberRole.id,
                  },
                },
              }),
            }),
          ];
        case 11:
          _a.sent();
          user3 = createUser('2143209891', 'Frank', 'Clark');
          return [
            4 /*yield*/,
            prisma.user.create({
              data: __assign(__assign({}, user3), {
                role: {
                  connect: {
                    id: memberRole.id,
                  },
                },
              }),
            }),
          ];
        case 12:
          _a.sent();
          newMemberTrackingItem1 = {
            userId: user1.id,
            isActive: true,
            trackingItemId: trackingItem1.id,
          };
          newMemberTrackingItem2 = {
            userId: user1.id,
            isActive: true,
            trackingItemId: trackingItem2.id,
          };
          newMemberTrackingItem3 = {
            userId: user1.id,
            isActive: true,
            trackingItemId: trackingItem3.id,
          };
          return [
            4 /*yield*/,
            prisma.memberTrackingItem.create({
              data: newMemberTrackingItem1,
            }),
          ];
        case 13:
          memberTrackingItem1 = _a.sent();
          return [
            4 /*yield*/,
            prisma.memberTrackingItem.create({
              data: newMemberTrackingItem2,
            }),
          ];
        case 14:
          memberTrackingItem2 = _a.sent();
          return [
            4 /*yield*/,
            prisma.memberTrackingItem.create({
              data: newMemberTrackingItem3,
            }),
          ];
        case 15:
          memberTrackingItem3 = _a.sent();
          return [
            4 /*yield*/,
            prisma.memberTrackingRecord.create({
              data: {
                order: 2,
                completedDate: faker.date.recent(20).toISOString(),
                authoritySignedDate: faker.date.recent(15).toISOString(),
                traineeSignedDate: faker.date.recent(18).toISOString(),
                authority: { connect: { id: user2.id } },
                memberTrackingItem: {
                  connect: {
                    userId_trackingItemId: {
                      userId: user1.id,
                      trackingItemId: memberTrackingItem1.trackingItemId,
                    },
                  },
                },
              },
            }),
          ];
        case 16:
          _a.sent();
          return [
            4 /*yield*/,
            prisma.memberTrackingRecord.create({
              data: {
                order: 1,
                completedDate: faker.date.recent(20).toISOString(),
                authoritySignedDate: faker.date.recent(15).toISOString(),
                traineeSignedDate: faker.date.recent(18).toISOString(),
                authority: { connect: { id: user2.id } },
                memberTrackingItem: {
                  connect: {
                    userId_trackingItemId: {
                      userId: user1.id,
                      trackingItemId: memberTrackingItem1.trackingItemId,
                    },
                  },
                },
              },
            }),
          ];
        case 17:
          _a.sent();
          return [
            4 /*yield*/,
            prisma.memberTrackingRecord.create({
              data: {
                order: 1,
                memberTrackingItem: {
                  connect: {
                    userId_trackingItemId: {
                      userId: user1.id,
                      trackingItemId: memberTrackingItem2.trackingItemId,
                    },
                  },
                },
              },
            }),
          ];
        case 18:
          _a.sent();
          return [
            4 /*yield*/,
            prisma.memberTrackingRecord.create({
              data: {
                order: 1,
                memberTrackingItem: {
                  connect: {
                    userId_trackingItemId: {
                      userId: user1.id,
                      trackingItemId: memberTrackingItem3.trackingItemId,
                    },
                  },
                },
              },
            }),
          ];
        case 19:
          _a.sent();
          return [
            4 /*yield*/,
            prisma.memberTrackingRecord.create({
              data: {
                order: 3,
                memberTrackingItem: {
                  connect: {
                    userId_trackingItemId: {
                      userId: user1.id,
                      trackingItemId: memberTrackingItem1.trackingItemId,
                    },
                  },
                },
              },
            }),
          ];
        case 20:
          _a.sent();
          return [2 /*return*/];
      }
    });
  });
}
function seedResources() {
  return __awaiter(this, void 0, void 0, function () {
    var resourcesData;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          resourcesData = Object.values(enums_1.EResource).map(function (name) {
            return { name: name };
          });
          return [
            4 /*yield*/,
            prisma.resource.createMany({
              data: resourcesData,
            }),
          ];
        case 1:
          _a.sent();
          return [2 /*return*/];
      }
    });
  });
}
function seedRoles() {
  return __awaiter(this, void 0, void 0, function () {
    var rolesData;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          rolesData = Object.values(enums_1.ERole).map(function (name) {
            return { name: name };
          });
          return [
            4 /*yield*/,
            prisma.role.createMany({
              data: rolesData,
            }),
          ];
        case 1:
          _a.sent();
          return [2 /*return*/];
      }
    });
  });
}
function seedGrants() {
  return __awaiter(this, void 0, void 0, function () {
    var baseGrantsData, adminGrants, adminGrantsData, grantsData;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          baseGrantsData = grants_1.grants.map(function (grant) {
            return {
              action: grant.action,
              attributes: grant.attributes,
              resource: grant.resource,
              role: grant.role,
            };
          });
          adminGrants = Object.values(enums_1.EResource).map(function (resource) {
            return Object.values(enums_1.EAction).map(function (action) {
              return {
                action: action,
                attributes: '*',
                resource: resource,
                role: enums_1.ERole.ADMIN,
              };
            });
          });
          adminGrantsData = adminGrants.flat();
          grantsData = __spreadArray(__spreadArray([], baseGrantsData, true), adminGrantsData, true);
          return [
            4 /*yield*/,
            prisma.grant.createMany({
              data: grantsData,
            }),
          ];
        case 1:
          _a.sent();
          return [2 /*return*/];
      }
    });
  });
}
function main() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, seedResources()];
        case 1:
          _a.sent();
          return [4 /*yield*/, seedRoles()];
        case 2:
          _a.sent();
          return [4 /*yield*/, seedGrants()];
        case 3:
          _a.sent();
          return [4 /*yield*/, seedDev()];
        case 4:
          _a.sent();
          return [2 /*return*/];
      }
    });
  });
}
main()
  ['catch'](function (e) {
    console.error(e);
    process.exit(1);
  })
  ['finally'](function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, prisma.$disconnect()];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
