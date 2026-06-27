const express = require('express');
const path = require('path');
const app = express();
const DEFAULT_PORT = 3000;

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`🚀 Сервер разработки запущен на http://localhost:${port}`);
    console.log(`📋 Доступные примеры:`);
    console.log(`   - http://localhost:${port}/examples/vue3/index.html`);
    console.log(`   - http://localhost:${port}/examples/react19/index.html`);
    console.log(`   - http://localhost:${port}/examples/api-usage/index.html`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`⚠️  Порт ${port} занят. Пробую порт ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

app.use(express.static('dist'));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/examples', express.static(path.join(__dirname, 'examples')));
app.use('/src', express.static(path.join(__dirname, 'src')));

app.use((req, res, next) => {
  console.log(`📥 Запрос: ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BlockBuilder - Примеры</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
            }
            .container {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                padding: 40px;
                text-align: center;
                max-width: 700px;
            }
            h1 { color: #333; margin-bottom: 20px; font-size: 2.5rem; }
            p { color: #666; margin-bottom: 30px; font-size: 1.2rem; }
            .examples {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 20px;
                margin-top: 30px;
            }
            .example-card {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 24px;
                text-decoration: none;
                color: #333;
                transition: all 0.3s ease;
                border: 2px solid transparent;
                text-align: left;
            }
            .example-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                border-color: #4facfe;
            }
            .example-card h3 { margin-bottom: 12px; font-size: 1.25rem; }
            .example-card p { margin: 0; font-size: 0.95rem; color: #666; }
            .vue-card { border-left: 4px solid #42b883; }
            .react-card { border-left: 4px solid #61dafb; }
            .api-card { border-left: 4px solid #ff6b35; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏗️ BlockBuilder</h1>
            <p>Блочный конструктор — Vue, React, Nuxt, Next</p>

            <div class="examples">
                <a href="/examples/vue3/index.html" class="example-card vue-card">
                    <h3>🎨 Vue3 Demo</h3>
                    <p>Готовый UI с Vue-компонентами блоков.</p>
                </a>

                <a href="/examples/react19/index.html" class="example-card react-card">
                    <h3>⚛️ React Demo</h3>
                    <p>Готовый UI с React-компонентами блоков.</p>
                </a>

                <a href="/examples/api-usage/index.html" class="example-card api-card">
                    <h3>🔧 Core API</h3>
                    <p>Программный API без готового UI пакета.</p>
                </a>
            </div>
        </div>
    </body>
    </html>
  `);
});

app.get('/api/blocks', (req, res) => {
  res.json({
    blocks: [],
    message: 'API для разработки BlockBuilder'
  });
});

startServer(DEFAULT_PORT);
