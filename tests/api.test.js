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

test('GET /brands returns empty array initially', async () => {
  const res = await request(app).get('/brands');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(0);
});

test('POST /brands creates brand and GET /brands returns it', async () => {
  const brand = { brand_id: 'b1', brand_name: 'TestBrand' };
  const post = await request(app).post('/brands').send(brand);
  expect(post.status).toBe(201);
  expect(post.body.brand_id).toBe('b1');

  const get = await request(app).get('/brands');
  expect(get.status).toBe(200);
  expect(get.body.length).toBe(1);
  expect(get.body[0].brand_name).toBe('TestBrand');
});

test('POST /models and GET /models and GET /brands/:brand_id/models', async () => {
  // create brand first
  const brand = { brand_id: 'b2', brand_name: 'Brand2' };
  await request(app).post('/brands').send(brand);

  const model = { model_id: 'm1', model_name: 'Model1', brand_id: 'b2', year: 2020 };
  const postModel = await request(app).post('/models').send(model);
  expect(postModel.status).toBe(201);
  expect(postModel.body.model_id).toBe('m1');

  const getModels = await request(app).get('/models');
  expect(getModels.status).toBe(200);
  expect(getModels.body.length).toBe(1);

  const brandModels = await request(app).get('/brands/b2/models');
  expect(brandModels.status).toBe(200);
  expect(brandModels.body.length).toBe(1);
  expect(brandModels.body[0].model_name).toBe('Model1');
});
