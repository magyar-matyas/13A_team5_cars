const request = require('supertest');
const app = require('../app');
const CarModel = require('../models/CarModel');

const _origCarModelFind = CarModel.find;
const _origCarModelCountDocuments = CarModel.countDocuments;
const _origCarModelProtoSave = CarModel.prototype.save;
const _origCarModelFindByIdAndUpdate = CarModel.findByIdAndUpdate;
const _origCarModelFindByIdAndDelete = CarModel.findByIdAndDelete;

describe('CarModel útvonalak (mockolt)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    CarModel.find = _origCarModelFind;
    CarModel.countDocuments = _origCarModelCountDocuments;
    CarModel.prototype.save = _origCarModelProtoSave;
    CarModel.findByIdAndUpdate = _origCarModelFindByIdAndUpdate;
    CarModel.findByIdAndDelete = _origCarModelFindByIdAndDelete;
  });

  test('GET /models visszaad egy tömböt', async () => {
    const models = [{ _id: 'm1', model_name: 'X', brand_id: 'b1', year: 2020, car_type: 'Sedan', price: 1000 }];
    CarModel.find = jest.fn().mockResolvedValue(models);

    const res = await request(app).get('/models');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(models);
  });

  test('POST /models létrehoz egy modellt (generált azonosító)', async () => {
    CarModel.countDocuments = jest.fn().mockResolvedValue(0);
    const saved = { _id: 'M001', model_name: 'NewM', brand_id: 'b1', year: 2021, car_type: 'Hatch', price: 15000 };
    CarModel.prototype.save = jest.fn().mockResolvedValue(saved);

    const res = await request(app).post('/models').send({ model_name: 'NewM', brand_id: 'b1', year: 2021, car_type: 'Hatch', price: 15000 });
    expect(res.status).toBe(201);
    expect(res.body._id).toBe('M001');
  });

  test('POST /models 400-at ad vissza validációs/mentési hiba esetén', async () => {
    CarModel.countDocuments = jest.fn().mockResolvedValue(1);
    CarModel.prototype.save = jest.fn().mockRejectedValue(new Error('Validation failed'));

    const res = await request(app).post('/models').send({ model_name: 'Bad', brand_id: 'b1', year: 2021 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT /models/:id 404-at ad vissza, ha a modell nem található', async () => {
    CarModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

    const res = await request(app).put('/models/nonexistent').send({ model_name: 'X' });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('DELETE /models/:id siker, ha megtalálható', async () => {
    CarModel.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'mdel' });

    const res = await request(app).delete('/models/mdel');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
