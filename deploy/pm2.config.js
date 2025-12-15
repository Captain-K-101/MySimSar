module.exports = {
  apps: [
    {
      name: "mysimsar-api",
      cwd: "./backend",
      script: "dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    },
    {
      name: "mysimsar-web",
      cwd: "./frontend",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};

