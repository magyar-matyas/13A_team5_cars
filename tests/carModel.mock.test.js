const request = require('supertest');
const app = require('../app');
const CarModel = require('../models/CarModel');

describe('CarModel útvonalak (mockolt)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /models visszaad egy tömböt', async () => {
    const models = [{ _id: 'm1', model_name: 'X', brand_id: 'b1', year: 2020, car_type: 'Sedan', price: 1000 }];
    jest.spyOn(CarModel, 'find').mockResolvedValue(models);

    const res = await request(app).get('/models');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(models);
  });

  test('POST /models létrehoz egy modellt (generált azonosító)', async () => {
    jest.spyOn(CarModel, 'countDocuments').mockResolvedValue(0);
    const saved = { _id: 'M001', model_name: 'NewM', brand_id: 'b1', year: 2021, car_type: 'Hatch', price: 15000 };
    jest.spyOn(CarModel.prototype, 'save').mockResolvedValue(saved);

    const res = await request(app).post('/models').send({ model_name: 'NewM', brand_id: 'b1', year: 2021, car_type: 'Hatch', price: 15000 });
    expect(res.status).toBe(201);
    expect(res.body._id).toBe('M001');
  });

  test('POST /models 400-at ad vissza validációs/mentési hiba esetén', async () => {
    jest.spyOn(CarModel, 'countDocuments').mockResolvedValue(1);
    jest.spyOn(CarModel.prototype, 'save').mockRejectedValue(new Error('Validation failed'));

    const res = await request(app).post('/models').send({ model_name: 'Bad', brand_id: 'b1', year: 2021 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT /models/:id 404-at ad vissza, ha a modell nem található', async () => {
    jest.spyOn(CarModel, 'findByIdAndUpdate').mockResolvedValue(null);

    const res = await request(app).put('/models/nonexistent').send({ model_name: 'X' });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('DELETE /models/:id siker, ha megtalálható', async () => {
    jest.spyOn(CarModel, 'findByIdAndDelete').mockResolvedValue({ _id: 'mdel' });

    const res = await request(app).delete('/models/mdel');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
