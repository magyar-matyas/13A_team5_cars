const request = require('supertest');
const app = require('../app');
const CarBrand = require('../models/CarBrand');
const CarModel = require('../models/CarModel');

afterEach(() => jest.restoreAllMocks());

describe('CarModel útvonalak', () => {
  test('GET /models kezdetben üres tömböt ad vissza', async () => {
    jest.spyOn(CarModel, 'find').mockResolvedValue([]);
    const res = await request(app).get('/models');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('POST /models létrehoz modellt és GET /models visszaadja azt', async () => {
    jest.spyOn(CarModel, 'countDocuments').mockResolvedValue(0);
    const saved = { _id: 'M001', model_name: 'RouteModel', brand_id: 'rb1', year: 2023, car_type: 'Sedan', price: 25000 };
    jest.spyOn(CarModel.prototype, 'save').mockResolvedValue(saved);

    const post = await request(app).post('/models').send({ model_name: 'RouteModel', brand_id: 'rb1', year: 2023, car_type: 'Sedan', price: 25000 });
    expect(post.status).toBe(201);
    expect(post.body._id).toBe('M001');

    jest.spyOn(CarModel, 'find').mockResolvedValue([saved]);
    const get = await request(app).get('/models');
    expect(get.status).toBe(200);
    expect(get.body.length).toBe(1);
    expect(get.body[0].model_name).toBe('RouteModel');
  });
});
