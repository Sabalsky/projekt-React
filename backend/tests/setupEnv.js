// Ustawienia srodowiska dla testow - cicha baza w pamieci i staly sekret JWT.
process.env.NODE_ENV = 'test';
process.env.DB_FILE = ':memory:';
process.env.JWT_SECRET = 'test-secret';
process.env.LOG_LEVEL = 'error';
