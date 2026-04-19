'use strict';

const config = {
  development: {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000, // 10 seconds
  },
  production: {
    baseURL: 'https://api.groundgear.com',
    timeout: 5000, // 5 seconds
  },
};

module.exports = config;
