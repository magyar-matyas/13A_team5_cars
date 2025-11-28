const request = require('supertest');

const serverModule = require('../server');
const CarBrand = require('../models/CarBrand');
const CarModel = require('../models/CarModel');

afterEach(() => jest.restoreAllMocks());

test('server.js az Express alkalmazást exportálja teszt környezetben', async () => {
  expect(typeof serverModule).toBe('function');
  expect(serverModule.use).toBeDefined();
});

test('exportált szerver válaszol az útvonalakra (GET /models üres)', async () => {
  jest.spyOn(CarModel, 'find').mockResolvedValue([]);
  const res = await request(serverModule).get('/models');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(0);
});
