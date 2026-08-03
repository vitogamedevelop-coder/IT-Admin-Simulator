require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const { initPromise } = require('./db');
const { router: authRouter } = require('./routes/auth');
const { router: modulesRouter } = require('./routes/modules');
const customRouter = require('./routes/custom');
const cheatRouter = require('./routes/cheat');
const patchRouter = require('./routes/patch');
const userRouter = require('./routes/user');
const searchRouter = require('./routes/search');
const { scheduleBackups } = require('./backup');

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const allowedOrigins = new Set((process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((origin) => origin.trim()).filter(Boolean));

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('dev-secret'))) {
  throw new Error('JWT_SECRET muss in Produktion gesetzt und sicher sein.');
}

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(cors((req, callback) => {
  const origin = req.header('Origin');
  const requestOrigin = `${req.protocol}://${req.get('host')}`;
  callback(null, { origin: !origin || origin === requestOrigin || allowedOrigins.has(origin), credentials: true });
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/modules', modulesRouter);
app.use('/api/custom', customRouter);
app.use('/api/cheat', cheatRouter);
app.use('/api/patch', patchRouter);
app.use('/api/user', userRouter);
app.use('/api/search', searchRouter);

const dist = path.join(__dirname, '../frontend/dist');
app.use(express.static(dist));
app.get(/.*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.message === 'Origin ist nicht erlaubt.') return res.status(403).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Interner Serverfehler' });
});

initPromise
  .then(() => {
    scheduleBackups();
    app.listen(PORT, () => console.log(`CyberLearn backend running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Datenbankinitialisierung fehlgeschlagen:', err.message);
    process.exit(1);
  });
