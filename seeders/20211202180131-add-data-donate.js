"use strict";
const faker = require("faker");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (let i = 1; i < 80; i++) {
      await queryInterface.bulkInsert("donates", [
        {
          amount: faker.lorem.words(),
          userId: 1,
          campaignId: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          comment: faker.lorem.words(),
          userId: 2,
          campaignId: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          comment: faker.lorem.words(),
          userId: 3,
          campaignId: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          comment: faker.lorem.words(),
          userId: 4,
          campaignId: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          comment: faker.lorem.words(),
          userId: 5,
          campaignId: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          comment: faker.lorem.words(),
          userId: 6,
          campaignId: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          comment: faker.lorem.words(),
          userId: 7,
          campaignId: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          comment: faker.lorem.words(),
          userId: 8,
          campaignId: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          comment: faker.lorem.words(),
          userId: 9,
          campaignId: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          comment: faker.lorem.words(),
          userId: 10,
          campaignId: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          comment: faker.lorem.words(),
          userId: 11,
          campaignId: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          comment: faker.lorem.words(),
          userId: 12,
          campaignId: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          comment: faker.lorem.words(),
          userId: 13,
          campaignId: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("donates", null, {});
  },
};
