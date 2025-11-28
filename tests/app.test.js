const request = require('supertest');
const app = require('../app');
const CarBrand = require('../models/CarBrand');
const CarModel = require('../models/CarModel');

afterEach(() => {
  jest.restoreAllMocks();
});

test('GET /brands kezdetben üres tömböt ad vissza', async () => {
  jest.spyOn(CarBrand, 'find').mockResolvedValue([]);
  const res = await request(app).get('/brands');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(0);
});

test('POST /brands létrehoz márkát és GET /brands visszaadja azt', async () => {
  
  jest.spyOn(CarBrand, 'findOne').mockImplementation(() => ({ sort: () => Promise.resolve(null) }));
  const saved = { _id: 'BR001', brand_name: 'TestBrand', country_of_origin: 'Germany', founded_year: 1937, website: 'https://testbrand.com' };
  jest.spyOn(CarBrand.prototype, 'save').mockResolvedValue(saved);

  const post = await request(app).post('/brands').send({ brand_name: 'TestBrand', country_of_origin: 'Germany', founded_year: 1937, website: 'https://testbrand.com' });
  expect(post.status).toBe(201);
  expect(post.body._id).toBe('BR001');

  jest.spyOn(CarBrand, 'find').mockResolvedValue([saved]);
  const get = await request(app).get('/brands');
  expect(get.status).toBe(200);
  expect(get.body.length).toBe(1);
  expect(get.body[0].brand_name).toBe('TestBrand');
});

test('POST /models és GET /models és GET /brands/:brand_id/models', async () => {
  // mock model id generation: countDocuments -> 0
  jest.spyOn(CarModel, 'countDocuments').mockResolvedValue(0);
  const savedModel = { _id: 'M001', model_name: 'Model1', brand_id: 'b2', year: 2020, car_type: 'SUV', price: 30000 };
  jest.spyOn(CarModel.prototype, 'save').mockResolvedValue(savedModel);

  const postModel = await request(app).post('/models').send({ model_name: 'Model1', brand_id: 'b2', year: 2020, car_type: 'SUV', price: 30000 });
  expect(postModel.status).toBe(201);
  expect(postModel.body._id).toBe('M001');

  jest.spyOn(CarModel, 'find').mockResolvedValue([savedModel]);
  const getModels = await request(app).get('/models');
  expect(getModels.status).toBe(200);
  expect(getModels.body.length).toBe(1);

  jest.spyOn(CarModel, 'find').mockImplementation((query) => Promise.resolve([savedModel]));
  const brandModels = await request(app).get('/brands/b2/models');
  expect(brandModels.status).toBe(200);
  expect(brandModels.body.length).toBe(1);
  expect(brandModels.body[0].model_name).toBe('Model1');
});

test('POST /brands _id nélkül 400-at ad vissza', async () => {
  // simulate save throwing validation error
  jest.spyOn(CarBrand, 'findOne').mockImplementation(() => ({ sort: () => Promise.resolve(null) }));
  jest.spyOn(CarBrand.prototype, 'save').mockRejectedValue(new Error('Validation failed'));
  const badBrand = { brand_name: 'NoIdBrand' };
  const res = await request(app).post('/brands').send(badBrand);
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('error');
});

test('POST /models brand_id nélkül 400-at ad vissza', async () => {
  // simulate save throwing validation error
  jest.spyOn(CarModel, 'countDocuments').mockResolvedValue(1);
  jest.spyOn(CarModel.prototype, 'save').mockRejectedValue(new Error('Validation failed'));
  const badModel = { model_name: 'NoBrandModel', year: 2021 };
  const res = await request(app).post('/models').send(badModel);
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('error');
});

test('Több modell létrehozása márkák között, majd listázás és szűrés ellenőrzése', async () => {
  const m2 = { _id: 'm2', model_name: 'Model2', brand_id: 'b3', year: 2019, car_type: 'SUV', price: 25000 };
  const m3 = { _id: 'm3', model_name: 'Model3', brand_id: 'b4', year: 2020, car_type: 'Sedan', price: 30000 };
  const m4 = { _id: 'm4', model_name: 'Model4', brand_id: 'b3', year: 2021, car_type: 'Coupe', price: 35000 };
  jest.spyOn(CarModel, 'find').mockImplementation((query) => {
    if (query && query.brand_id === 'b3') return Promise.resolve([m2, m4]);
    return Promise.resolve([m2, m3, m4]);
  });

  const allModels = await request(app).get('/models');
  expect(allModels.status).toBe(200);
  expect(Array.isArray(allModels.body)).toBe(true);
  expect(allModels.body.length).toBe(3);

  const b3Models = await request(app).get('/brands/b3/models');
  expect(b3Models.status).toBe(200);
  expect(b3Models.body.length).toBe(2);
});

test('PUT és DELETE /brands/:id folyamat', async () => {
  // mock brand creation (id generation and save)
  jest.spyOn(CarBrand, 'findOne').mockImplementation(() => ({ sort: () => Promise.resolve(null) }));
  const saved = { _id: 'BR001', brand_name: 'ToUpdateBrand', country_of_origin: 'TestLand', founded_year: 1990, website: 'https://toupdate.example' };
  jest.spyOn(CarBrand.prototype, 'save').mockResolvedValue(saved);

  // create a brand and capture returned id
  const post = await request(app).post('/brands').send({ brand_name: 'ToUpdateBrand', country_of_origin: 'TestLand', founded_year: 1990, website: 'https://toupdate.example' });
  expect(post.status).toBe(201);
  const id = post.body._id;

  // mock update and delete operations
  const updatedBrand = { _id: id, brand_name: 'UpdatedBrand', country_of_origin: 'TestLand', founded_year: 1990, website: 'https://toupdate.example' };
  jest.spyOn(CarBrand, 'findByIdAndUpdate').mockResolvedValue(updatedBrand);
  jest.spyOn(CarBrand, 'findByIdAndDelete').mockResolvedValue({ _id: id });

  // update the brand
  const updated = await request(app).put(`/brands/${id}`).send({ brand_name: 'UpdatedBrand' });
  expect(updated.status).toBe(200);
  expect(updated.body.brand_name).toBe('UpdatedBrand');

  // delete the brand
  const deleted = await request(app).delete(`/brands/${id}`);
  expect(deleted.status).toBe(200);
  expect(deleted.body).toHaveProperty('message');

  // verify it's gone (mock find to return empty)
  jest.spyOn(CarBrand, 'find').mockResolvedValue([]);
  const get = await request(app).get('/brands');
  expect(get.status).toBe(200);
  expect(get.body.find(b => b._id === id)).toBeUndefined();
});

test('PUT és DELETE /models/:id folyamat', async () => {
  // mock brand creation
  jest.spyOn(CarBrand, 'findOne').mockImplementation(() => ({ sort: () => Promise.resolve(null) }));
  const savedBrand = { _id: 'BR002', brand_name: 'BrandForModel', country_of_origin: 'TestLand', founded_year: 2000, website: 'https://brandformodel.example' };
  jest.spyOn(CarBrand.prototype, 'save').mockResolvedValue(savedBrand);
  // create brand to reference
  const brandPost = await request(app).post('/brands').send({ brand_name: 'BrandForModel', country_of_origin: 'TestLand', founded_year: 2000, website: 'https://brandformodel.example' });
  expect(brandPost.status).toBe(201);
  const brandId = brandPost.body._id;

  // mock model creation
  jest.spyOn(CarModel, 'countDocuments').mockResolvedValue(0);
  const savedModel = { _id: 'M002', model_name: 'ToUpdateModel', brand_id: brandId, year: 2022, car_type: 'Hatchback', price: 22000 };
  jest.spyOn(CarModel.prototype, 'save').mockResolvedValue(savedModel);
  // create model and capture id
  const modelPost = await request(app).post('/models').send({ model_name: 'ToUpdateModel', brand_id: brandId, year: 2022, car_type: 'Hatchback', price: 22000 });
  expect(modelPost.status).toBe(201);
  const modelId = modelPost.body._id;

  // mock update and delete for model
  const updatedModel = { _id: modelId, model_name: 'UpdatedModel', brand_id: brandId, year: 2022, car_type: 'Hatchback', price: 22000 };
  jest.spyOn(CarModel, 'findByIdAndUpdate').mockResolvedValue(updatedModel);
  jest.spyOn(CarModel, 'findByIdAndDelete').mockResolvedValue({ _id: modelId });

  // update the model
  const modelUpdated = await request(app).put(`/models/${modelId}`).send({ model_name: 'UpdatedModel' });
  expect(modelUpdated.status).toBe(200);
  expect(modelUpdated.body.model_name).toBe('UpdatedModel');

  // delete the model
  const modelDeleted = await request(app).delete(`/models/${modelId}`);
  expect(modelDeleted.status).toBe(200);
  expect(modelDeleted.body).toHaveProperty('message');

  // verify it's gone
  jest.spyOn(CarModel, 'find').mockResolvedValue([]);
  const allModels = await request(app).get('/models');
  expect(allModels.status).toBe(200);
  expect(allModels.body.find(m => m._id === modelId)).toBeUndefined();
});
