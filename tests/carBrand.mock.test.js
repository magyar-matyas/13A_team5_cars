const request = require('supertest');
const app = require('../app');
const CarBrand = require('../models/CarBrand');

describe('CarBrand útvonalak (mockolt)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /brands visszaad egy tömböt', async () => {
    const brands = [{ _id: 'b1', brand_name: 'A', country_of_origin: 'X', founded_year: 1, website: 'w' }];
    jest.spyOn(CarBrand, 'find').mockResolvedValue(brands);

    const res = await request(app).get('/brands');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(brands);
  });

  test('GET /brands kezeli az adatbázis hibát', async () => {
    jest.spyOn(CarBrand, 'find').mockRejectedValue(new Error('DB fail'));

    const res = await request(app).get('/brands');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /brands létrehoz egy márkát (generált azonosító)', async () => {
    // simulate no existing brands so chained findOne().sort(...) resolves to null
    jest.spyOn(CarBrand, 'findOne').mockImplementation(() => ({ sort: () => Promise.resolve(null) }));
    const saved = { _id: 'BR001', brand_name: 'New', country_of_origin: 'Y', founded_year: 2000, website: 'w' };
    jest.spyOn(CarBrand.prototype, 'save').mockResolvedValue(saved);

    const res = await request(app).post('/brands').send({ brand_name: 'New', country_of_origin: 'Y', founded_year: 2000, website: 'w' });
    expect(res.status).toBe(201);
    expect(res.body._id).toBe('BR001');
  });

  test('PUT /brands/:id 404-at ad vissza, ha a márka nem található', async () => {
    jest.spyOn(CarBrand, 'findByIdAndUpdate').mockResolvedValue(null);

    const res = await request(app).put('/brands/nonexistent').send({ brand_name: 'X' });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('DELETE /brands/:id siker, ha megtalálható', async () => {
    jest.spyOn(CarBrand, 'findByIdAndDelete').mockResolvedValue({ _id: 'bdel' });

    const res = await request(app).delete('/brands/bdel');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
