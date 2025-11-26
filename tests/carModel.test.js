const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
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

describe('CarModel model', () => {
  test('saves model with required fields', async () => {
    await new CarBrand({ brand_id: 'brand_for_model', brand_name: 'BrandX' }).save();
    const model = new CarModel({ model_id: 'mm1', model_name: 'MUnit', brand_id: 'brand_for_model', year: 2022, price: 19999 });
    const saved = await model.save();
    expect(saved.model_id).toBe('mm1');
    expect(saved.brand_id).toBe('brand_for_model');
    expect(saved.price).toBe(19999);
  });

  test('fails saving model without required model_id', async () => {
    const model = new CarModel({ model_name: 'NoIdModel', brand_id: 'b_x' });
    await expect(model.save()).rejects.toThrow();
  });

  test('fails saving model without required brand_id', async () => {
    const model = new CarModel({ model_id: 'mm2', model_name: 'NoBrand' });
    await expect(model.save()).rejects.toThrow();
  });

  test('enforces unique model_id', async () => {
    await new CarModel({ model_id: 'm_dup', model_name: 'A', brand_id: 'b1' }).save();
    const dup = new CarModel({ model_id: 'm_dup', model_name: 'B', brand_id: 'b1' });
    await expect(dup.save()).rejects.toThrow();
  });
});
