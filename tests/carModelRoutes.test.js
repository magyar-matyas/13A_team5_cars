const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../app');
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

describe('CarModel routes', () => {
  test('GET /models returns empty array initially', async () => {
    const res = await request(app).get('/models');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('POST /models creates a model and GET /models returns it', async () => {
    await request(app).post('/brands').send({ brand_id: 'rb1', brand_name: 'RouteBrand' });

    const model = {
      _id: 'rm1',
      model_name: 'RouteModel',
      brand_id: 'rb1',
      year: 2023,
      car_type: 'Sedan',
      price: 25000
    };
    const post = await request(app).post('/models').send(model);
    expect(post.status).toBe(201);
    expect(post.body._id).toBe('rm1');

    const get = await request(app).get('/models');
    expect(get.status).toBe(200);
    expect(get.body.length).toBe(1);
    expect(get.body[0].model_name).toBe('RouteModel');
  });
});
