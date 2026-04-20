module.exports = {
  apps: [
    {
      name: "pagecraft",
      script: "apps/backend/src/server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
