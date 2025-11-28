const request = require('supertest');
const app = require('../app');
const CarBrand = require('../models/CarBrand');
const CarModel = require('../models/CarModel');
const _origCarBrandFind = CarBrand.find;
const _origCarBrandFindOne = CarBrand.findOne;
const _origCarBrandProtoSave = CarBrand.prototype.save;
const _origCarBrandFindByIdAndUpdate = CarBrand.findByIdAndUpdate;
const _origCarBrandFindByIdAndDelete = CarBrand.findByIdAndDelete;
const _origCarModelFind = CarModel.find;

describe('CarBrand végpontok — végpontonként mockolt tesztek', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    CarBrand.find = _origCarBrandFind;
    CarBrand.findOne = _origCarBrandFindOne;
    CarBrand.prototype.save = _origCarBrandProtoSave;
    CarBrand.findByIdAndUpdate = _origCarBrandFindByIdAndUpdate;
    CarBrand.findByIdAndDelete = _origCarBrandFindByIdAndDelete;
    CarModel.find = _origCarModelFind;
  });

  test('GET /brands - visszaadja a márkák listáját', async () => {
    const brands = [{ _id: 'BR001', brand_name: 'A' }];
    CarBrand.find = jest.fn().mockResolvedValue(brands);

    const res = await request(app).get('/brands');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toEqual(brands);
  });

  test('GET /brands - üres tömböt ad vissza, ha nincs', async () => {
    CarBrand.find = jest.fn().mockResolvedValue([]);
    const res = await request(app).get('/brands');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('GET /brands - kezeli az adatbázis hibát', async () => {
    CarBrand.find = jest.fn().mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/brands');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /brands - objektumokat ad vissza a szükséges mezőkkel', async () => {
    const brands = [{ _id: 'BR002', brand_name: 'B', country_of_origin: 'X', founded_year: 1990, website: 'w' }];
    CarBrand.find = jest.fn().mockResolvedValue(brands);
    const res = await request(app).get('/brands');
    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ _id: 'BR002', brand_name: 'B' });
  });

  test('POST /brands - létrehoz márkát, ha nincs korábbi', async () => {
    CarBrand.findOne = jest.fn().mockImplementation(() => ({ sort: () => Promise.resolve(null) }));
    const saved = { _id: 'BR001', brand_name: 'New', country_of_origin: 'Y', founded_year: 2000, website: 'w' };
    CarBrand.prototype.save = jest.fn().mockResolvedValue(saved);

    const res = await request(app).post('/brands').send({ brand_name: 'New', country_of_origin: 'Y', founded_year: 2000, website: 'w' });
    expect(res.status).toBe(201);
    expect(res.body._id).toBe('BR001');
  });

  test('POST /brands - növelt azonosítóval hozza létre a márkát (lastBrand alapján)', async () => {
    const last = { _id: 'BR005' };
    CarBrand.findOne = jest.fn().mockImplementation(() => ({ sort: () => Promise.resolve(last) }));
    const saved = { _id: 'BR006', brand_name: 'Inc', country_of_origin: 'Y', founded_year: 2001, website: 'w' };
    CarBrand.prototype.save = jest.fn().mockResolvedValue(saved);

    const res = await request(app).post('/brands').send({ brand_name: 'Inc', country_of_origin: 'Y', founded_year: 2001, website: 'w' });
    expect(res.status).toBe(201);
    expect(res.body._id).toBe('BR006');
  });

  test('POST /brands - validációs/mentési hiba 400-at ad vissza', async () => {
    CarBrand.findOne = jest.fn().mockImplementation(() => ({ sort: () => Promise.resolve(null) }));
    CarBrand.prototype.save = jest.fn().mockRejectedValue(new Error('Validation failed'));
    const res = await request(app).post('/brands').send({ brand_name: 'Bad' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /brands - findOne hiba kezelve', async () => {
    CarBrand.findOne = jest.fn().mockImplementation(() => ({ sort: () => Promise.reject(new Error('find fail')) }));
    const res = await request(app).post('/brands').send({ brand_name: 'Err', country_of_origin: 'X', founded_year: 1, website: 'x' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /brands/:brand_id/models - visszaadja a márkához tartozó modelleket', async () => {
    const models = [{ _id: 'm1', brand_id: 'BRX' }];
    CarModel.find = jest.fn().mockImplementation((query) => Promise.resolve(models));
    const res = await request(app).get('/brands/BRX/models');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toEqual(models);
  });

  test('GET /brands/:brand_id/models - üres tömböt ad vissza, ha nincs', async () => {
    CarModel.find = jest.fn().mockResolvedValue([]);
    const res = await request(app).get('/brands/NO/models');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  test('GET /brands/:brand_id/models - adatbázis hiba, 500', async () => {
    CarModel.find = jest.fn().mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/brands/ERR/models');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('GET /brands/:brand_id/models - szűr a brand_id szerint', async () => {
    const all = [{ _id: 'm1', brand_id: 'b1' }, { _id: 'm2', brand_id: 'b2' }];
    CarModel.find = jest.fn().mockImplementation((query) => Promise.resolve(all.filter(m => m.brand_id === query.brand_id)));
    const res = await request(app).get('/brands/b1/models');
    expect(res.status).toBe(200);
    expect(res.body.every(m => m.brand_id === 'b1')).toBe(true);
  });

  test('PUT /brands/:id - siker, visszaadja a frissített objektumot', async () => {
    const updated = { _id: 'BRX', brand_name: 'Updated' };
    CarBrand.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);
    const res = await request(app).put('/brands/BRX').send({ brand_name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(updated);
  });

  test('PUT /brands/:id - nem található, 404', async () => {
    CarBrand.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
    const res = await request(app).put('/brands/NX').send({ brand_name: 'X' });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT /brands/:id - adatbázis hiba, 500', async () => {
    CarBrand.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('fail'));
    const res = await request(app).put('/brands/ERR').send({ brand_name: 'X' });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('PUT /brands/:id - részleges frissítés visszatükrözi a módosított mezőt', async () => {
    const updated = { _id: 'BRP', brand_name: 'Part' };
    CarBrand.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);
    const res = await request(app).put('/brands/BRP').send({ brand_name: 'Part' });
    expect(res.status).toBe(200);
    expect(res.body.brand_name).toBe('Part');
  });

  test('DELETE /brands/:id - siker, üzenetet ad vissza', async () => {
    CarBrand.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'BRD' });
    const res = await request(app).delete('/brands/BRD');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('DELETE /brands/:id - nem található, 404', async () => {
    CarBrand.findByIdAndDelete = jest.fn().mockResolvedValue(null);
    const res = await request(app).delete('/brands/NOPE');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('DELETE /brands/:id - adatbázis hiba, 500', async () => {
    CarBrand.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('fail'));
    const res = await request(app).delete('/brands/ERR');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('DELETE /brands/:id - törlés után a find üreset ad vissza', async () => {
    CarBrand.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'BRX' });
    CarBrand.find = jest.fn().mockResolvedValue([]);
    const del = await request(app).delete('/brands/BRX');
    expect(del.status).toBe(200);
    const get = await request(app).get('/brands');
    expect(get.status).toBe(200);
    expect(get.body.length).toBe(0);
  });
});
