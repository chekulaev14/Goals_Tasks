const fs = require('fs').promises;
const path = require('path');

// Путь к JSON файлам
// В Lambda используем переменную окружения LAMBDA_TASK_ROOT для нахождения корня
const DATA_DIR = process.env.LAMBDA_TASK_ROOT
  ? path.resolve(process.env.LAMBDA_TASK_ROOT, '../../goals/data')
  : path.resolve(process.cwd(), 'goals/data');

// Вспомогательная функция для чтения JSON
async function readJSON(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
}

// Вспомогательная функция для записи JSON
async function writeJSON(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  const { httpMethod, path: requestPath } = event;

  try {
    // GET /api/dreams
    if (httpMethod === 'GET' && requestPath.includes('dreams')) {
      const dreams = await readJSON('dreams.json');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(dreams),
      };
    }

    // GET /api/goals
    if (httpMethod === 'GET' && requestPath.includes('goals') && !requestPath.includes('dreams')) {
      const goals = await readJSON('goals.json');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(goals),
      };
    }

    // GET /api/tasks
    if (httpMethod === 'GET' && requestPath.includes('tasks')) {
      const tasks = await readJSON('tasks.json');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(tasks),
      };
    }

    // POST /api/dreams
    if (httpMethod === 'POST' && requestPath.includes('dreams')) {
      const data = JSON.parse(event.body);
      const success = await writeJSON('dreams.json', data);
      return {
        statusCode: success ? 200 : 500,
        headers,
        body: JSON.stringify({ success }),
      };
    }

    // POST /api/goals
    if (httpMethod === 'POST' && requestPath.includes('goals') && !requestPath.includes('dreams')) {
      const data = JSON.parse(event.body);
      const success = await writeJSON('goals.json', data);
      return {
        statusCode: success ? 200 : 500,
        headers,
        body: JSON.stringify({ success }),
      };
    }

    // POST /api/tasks
    if (httpMethod === 'POST' && requestPath.includes('tasks')) {
      const data = JSON.parse(event.body);
      const success = await writeJSON('tasks.json', data);
      return {
        statusCode: success ? 200 : 500,
        headers,
        body: JSON.stringify({ success }),
      };
    }

    // 404
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
