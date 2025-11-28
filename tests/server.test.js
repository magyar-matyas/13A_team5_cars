const request = require('supertest');

const serverModule = require('../server');
const CarBrand = require('../models/CarBrand');
const CarModel = require('../models/CarModel');

const _origCarModelFind = CarModel.find;

afterEach(() => {
  jest.restoreAllMocks();
  CarModel.find = _origCarModelFind;
});

test('server.js az Express alkalmazást exportálja teszt környezetben', async () => {
  expect(typeof serverModule).toBe('function');
  expect(serverModule.use).toBeDefined();
});

test('exportált szerver válaszol az útvonalakra (GET /models üres)', async () => {
  CarModel.find = jest.fn().mockResolvedValue([]);
  const res = await request(serverModule).get('/models');
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/application\/json/);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(0);
});
