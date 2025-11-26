const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const CarBrand = require('../models/CarBrand');

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
});

describe('CarBrand model', () => {
  test('saves a brand with required fields', async () => {
    const brand = new CarBrand({ brand_id: 'b_unit_1', brand_name: 'UnitBrand' });
    const saved = await brand.save();
    expect(saved.brand_id).toBe('b_unit_1');
    expect(saved.brand_name).toBe('UnitBrand');
  });

  test('fails saving brand without required brand_id', async () => {
    const brand = new CarBrand({ brand_name: 'NoId' });
    await expect(brand.save()).rejects.toThrow();
  });

  test('enforces unique brand_id', async () => {
    await new CarBrand({ brand_id: 'dup', brand_name: 'A' }).save();
    const dup = new CarBrand({ brand_id: 'dup', brand_name: 'B' });
    await expect(dup.save()).rejects.toThrow();
  });
});
