const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

const serverModule = require('../server');
const CarBrand = require('../models/CarBrand');
const CarModel = require('../models/CarModel');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await CarBrand.deleteMany({});
  await CarModel.deleteMany({});
});

test('server.js exports the Express app in test environment', async () => {
  expect(typeof serverModule).toBe('function');
  expect(serverModule.use).toBeDefined();
});

test('server exported app responds to routes (GET /models empty)', async () => {
  const res = await request(serverModule).get('/models');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(0);
});
