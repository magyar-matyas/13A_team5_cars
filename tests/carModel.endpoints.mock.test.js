const request = require('supertest');
const app = require('../app');
const CarModel = require('../models/CarModel');

describe('CarModel végpontok — végpontonként mockolt tesztek', () => {
  afterEach(() => jest.restoreAllMocks());

  // GET /models
  test('GET /models - visszaadja a listát', async () => {
    const models = [{ _id: 'M001', model_name: 'A' }];
    jest.spyOn(CarModel, 'find').mockResolvedValue(models);
    const res = await request(app).get('/models');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(models);
  });

  test('GET /models - üres tömböt ad vissza', async () => {
    jest.spyOn(CarModel, 'find').mockResolvedValue([]);
    const res = await request(app).get('/models');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  test('GET /models - kezeli az adatbázis hibát', async () => {
    jest.spyOn(CarModel, 'find').mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/models');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /models - objektumokat ad vissza mezőkkel', async () => {
    const models = [{ _id: 'M002', model_name: 'B', brand_id: 'BR1', year: 2020, car_type: 'Sedan', price: 100 }];
    jest.spyOn(CarModel, 'find').mockResolvedValue(models);
    const res = await request(app).get('/models');
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ _id: 'M002', model_name: 'B' });
  });

  // POST /models
  test('POST /models - létrehoz M001 azonosítóval, ha a számláló 0', async () => {
    jest.spyOn(CarModel, 'countDocuments').mockResolvedValue(0);
    const saved = { _id: 'M001', model_name: 'New', brand_id: 'BR1', year: 2022, car_type: 'Hatch', price: 20000 };
    jest.spyOn(CarModel.prototype, 'save').mockResolvedValue(saved);

    const res = await request(app).post('/models').send({ model_name: 'New', brand_id: 'BR1', year: 2022, car_type: 'Hatch', price: 20000 });
    expect(res.status).toBe(201);
    expect(res.body._id).toBe('M001');
  });

  test('POST /models - létrehoz azonosítót a számláló alapján (M005)', async () => {
    jest.spyOn(CarModel, 'countDocuments').mockResolvedValue(4);
    const saved = { _id: 'M005', model_name: 'N', brand_id: 'BR1', year: 2022, car_type: 'Hatch', price: 100 };
    jest.spyOn(CarModel.prototype, 'save').mockResolvedValue(saved);
    const res = await request(app).post('/models').send({ model_name: 'N', brand_id: 'BR1', year: 2022, car_type: 'Hatch', price: 100 });
    expect(res.status).toBe(201);
    expect(res.body._id).toBe('M005');
  });

  test('POST /models - mentési validáció 400-at ad vissza', async () => {
    jest.spyOn(CarModel, 'countDocuments').mockResolvedValue(0);
    jest.spyOn(CarModel.prototype, 'save').mockRejectedValue(new Error('Validation failed'));
    const res = await request(app).post('/models').send({ model_name: 'Bad' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /models - countDocuments hiba kezelve', async () => {
    jest.spyOn(CarModel, 'countDocuments').mockRejectedValue(new Error('count fail'));
    const res = await request(app).post('/models').send({ model_name: 'Err', brand_id: 'BR1', year: 1, car_type: 'X', price: 1 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // PUT /models/:id
  test('PUT /models/:id - siker, visszaadja a frissített modellt', async () => {
    const updated = { _id: 'MUP', model_name: 'Updated' };
    jest.spyOn(CarModel, 'findByIdAndUpdate').mockResolvedValue(updated);
    const res = await request(app).put('/models/MUP').send({ model_name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(updated);
  });

  test('PUT /models/:id - nem található, 404', async () => {
    jest.spyOn(CarModel, 'findByIdAndUpdate').mockResolvedValue(null);
    const res = await request(app).put('/models/NX').send({ model_name: 'X' });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT /models/:id - adatbázis hiba, 500', async () => {
    jest.spyOn(CarModel, 'findByIdAndUpdate').mockRejectedValue(new Error('fail'));
    const res = await request(app).put('/models/ERR').send({ model_name: 'X' });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT /models/:id - részleges frissítés visszatükrözi a módosított mezőt', async () => {
    const updated = { _id: 'MP', model_name: 'Partial' };
    jest.spyOn(CarModel, 'findByIdAndUpdate').mockResolvedValue(updated);
    const res = await request(app).put('/models/MP').send({ model_name: 'Partial' });
    expect(res.status).toBe(200);
    expect(res.body.model_name).toBe('Partial');
  });

  // DELETE /models/:id
  test('DELETE /models/:id - siker, üzenetet ad vissza', async () => {
    jest.spyOn(CarModel, 'findByIdAndDelete').mockResolvedValue({ _id: 'MD' });
    const res = await request(app).delete('/models/MD');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('DELETE /models/:id - nem található, 404', async () => {
    jest.spyOn(CarModel, 'findByIdAndDelete').mockResolvedValue(null);
    const res = await request(app).delete('/models/NF');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('DELETE /models/:id - adatbázis hiba, 500', async () => {
    jest.spyOn(CarModel, 'findByIdAndDelete').mockRejectedValue(new Error('fail'));
    const res = await request(app).delete('/models/ERR');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('DELETE /models/:id - törlés után GET /models üreset ad', async () => {
    jest.spyOn(CarModel, 'findByIdAndDelete').mockResolvedValue({ _id: 'MD2' });
    jest.spyOn(CarModel, 'find').mockResolvedValue([]);
    const d = await request(app).delete('/models/MD2');
    expect(d.status).toBe(200);
    const g = await request(app).get('/models');
    expect(g.status).toBe(200);
    expect(g.body.length).toBe(0);
  });
});
