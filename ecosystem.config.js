module.exports = {
  apps: [
    {
      name: 'sigorka-b2c',
      script: 'cmd.exe',
      args: '/c npm start',
      cwd: 'C:/App/sigorka-b2c-main',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};