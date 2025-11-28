const mongoose = require('mongoose');
const request = require("supertest");
const app = require("../server");
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

if (process.env.NODE_ENV === 'test') {
  afterEach(async () => {
    await CarBrand.deleteMany({});
  });
}

describe('CarBrand modell', () => {
  test('elmenti a márkát a kötelező mezőkkel', async () => {
    const brand = new CarBrand({
      _id: 'b_unit_1',
      brand_name: 'UnitBrand',
      country_of_origin: 'USA',
      founded_year: 1903,
      website: 'https://unitbrand.com'
    });
    const saved = await brand.save();
    expect(saved._id).toBe('b_unit_1');
    expect(saved.brand_name).toBe('UnitBrand');
  });

  test('sikertelen mentés _id nélkül', async () => {
    const brand = new CarBrand({ brand_name: 'NoId' });
    await expect(brand.save()).rejects.toThrow();
  });

  test('megköveteli az egyedi _id-t', async () => {
    await new CarBrand({
      _id: 'dup',
      brand_name: 'A',
      country_of_origin: 'USA',
      founded_year: 1903,
      website: 'https://brandA.com'
    }).save();

    const dup = new CarBrand({
      _id: 'dup',
      brand_name: 'B',
      country_of_origin: 'Germany',
      founded_year: 1920,
      website: 'https://brandB.com'
    });

    await expect(dup.save()).rejects.toThrow();
  });
});
