module.exports = {
  apps: [
    {
      name: 'lorkerp-backend',
      cwd: '/var/www/lorkerp/backend',
      script: 'venv/bin/uvicorn',
      args: 'server:app --host 0.0.0.0 --port 8000',
      interpreter: 'none',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      env: {
        FRONTEND_URL: 'http://SERVER_IP:3023',
        JWT_SECRET: 'CHANGE_ME',
        DB_NAME: 'lorkerp',
        MONGO_URL: 'mongodb://127.0.0.1:27017'
      }
    },
    {
      name: 'lorkerp-frontend',
      cwd: '/var/www/lorkerp/frontend',
      script: 'npx',
      args: 'serve -s build -l 3023',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
