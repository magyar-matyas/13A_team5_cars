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
  const brand = {
    _id: 'b1',
    brand_name: 'TestBrand',
    country_of_origin: 'Germany',
    founded_year: 1937,
    website: 'https://testbrand.com'
  };
  const post = await request(app).post('/brands').send(brand);
  expect(post.status).toBe(201);
  expect(post.body._id).toBe('b1');

  const get = await request(app).get('/brands');
  expect(get.status).toBe(200);
  expect(get.body.length).toBe(1);
  expect(get.body[0].brand_name).toBe('TestBrand');
});

test('POST /models and GET /models and GET /brands/:brand_id/models', async () => {
  const brand = { _id: 'b2', brand_name: 'Brand2' };
  await request(app).post('/brands').send(brand);

  const model = {
    _id: 'm1',
    model_name: 'Model1',
    brand_id: 'b2',
    year: 2020,
    car_type: 'SUV',
    price: 30000
  };
  const postModel = await request(app).post('/models').send(model);
  expect(postModel.status).toBe(201);
  expect(postModel.body._id).toBe('m1');

  const getModels = await request(app).get('/models');
  expect(getModels.status).toBe(200);
  expect(getModels.body.length).toBe(1);

  const brandModels = await request(app).get('/brands/b2/models');
  expect(brandModels.status).toBe(200);
  expect(brandModels.body.length).toBe(1);
  expect(brandModels.body[0].model_name).toBe('Model1');
});

test('POST /brands without required _id returns 400', async () => {
  const badBrand = { brand_name: 'NoIdBrand' };
  const res = await request(app).post('/brands').send(badBrand);
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('error');
});

test('POST /models without required brand_id returns 400', async () => {
  const badModel = { _id: 'm_bad', model_name: 'NoBrandModel', year: 2021 };
  const res = await request(app).post('/models').send(badModel);
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('error');
});

test('Create multiple models across brands and verify listing and filtering', async () => {
  await request(app).post('/brands').send({
    _id: 'b3',
    brand_name: 'Brand3',
    country_of_origin: 'Japan',
    founded_year: 1950,
    website: 'https://brand3.com'
  });

  await request(app).post('/brands').send({
    _id: 'b4',
    brand_name: 'Brand4',
    country_of_origin: 'Italy',
    founded_year: 1960,
    website: 'https://brand4.com'
  });

  await request(app).post('/models').send({
    _id: 'm2',
    model_name: 'Model2',
    brand_id: 'b3',
    year: 2019,
    car_type: 'SUV',
    price: 25000
  });

  await request(app).post('/models').send({
    _id: 'm3',
    model_name: 'Model3',
    brand_id: 'b4',
    year: 2020,
    car_type: 'Sedan',
    price: 30000
  });

  await request(app).post('/models').send({
    _id: 'm4',
    model_name: 'Model4',
    brand_id: 'b3',
    year: 2021,
    car_type: 'Coupe',
    price: 35000
  });

  const allModels = await request(app).get('/models');
  expect(allModels.status).toBe(200);
  expect(Array.isArray(allModels.body)).toBe(true);
  expect(allModels.body.length).toBe(3);

  const b3Models = await request(app).get('/brands/b3/models');
  expect(b3Models.status).toBe(200);
  expect(b3Models.body.length).toBe(2);
});
