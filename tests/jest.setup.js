process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1/__tests__';
process.env.PORT = process.env.PORT || '3001';
if (process.env.MONGO_URI.includes('mongodb+srv')) {
  process.env.MONGO_URI = 'mongodb://127.0.0.1/__tests__';
}