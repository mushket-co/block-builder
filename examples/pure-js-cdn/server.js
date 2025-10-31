import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3004;
const HOST = 'localhost';

// Статические файлы текущей папки
app.use(express.static(__dirname));

// Статические файлы из examples/static
app.use('/static', express.static(path.join(__dirname, '../static')));

// Раздаем dist пакета
app.use('/dist', express.static(path.join(__dirname, '../../dist')));

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Pure JS CDN Example запущен на http://${HOST}:${PORT}\n`);
  console.log(`📦 localStorage будет изолирован для этого URL`);
  console.log(`⚠️  Порт 3000 зарезервирован для основного dev-сервера (npm run dev)\n`);
});

