import path from "path";
import fs from 'fs';
import { beforeAll } from '@jest/globals'
const req_ = require('supertest');

export let request: any;
beforeAll(async () => {
  const ser_ = await getServer();
  request = req_(ser_);
  return ser_;
});

export const logger = console;

// proxy
const handler = { get: function () { return () => { } } };
const proxy: any = new Proxy({}, handler);
console = proxy;
(process as any).stderr.write = () => { };

(process as any).env.PORT = 30062;
(process as any).env.NODE_ENV = 'dev';
process.env.YUNFLY_UNIT_TEST = 'true';

export const isDev = () => {
  const nodeEnv = process.env.NODE_ENV || 'production';
  return nodeEnv === ('dev' || 'development');
};

export const getRuningFile = () => {
  let appFile = null;
  const buildFile = path.resolve(
    process.cwd(),
    './node_modules/@yunflyjs/yunfly-core/build/index',
  );
  try {
    const runfile = isDev() ? './src/app.ts' : './build/app.js';
    const filepath = path.join(process.cwd(), runfile);
    if (
      fs.existsSync(filepath) &&
      fs.readFileSync(filepath).toString().indexOf('new FlyApp()') > -1
    ) {
      appFile = filepath;
    }
  } catch (err) {
    // do nothing
  }
  const useFile = appFile ? appFile : buildFile;
  return useFile;
};

// run node server
require(getRuningFile())

let server: any;
export function getServer() {
  return new Promise((resolve) => {
    if (server) { resolve(server) };
    const timer = setInterval(() => {
      const { yunfly } = require('@yunflyjs/yunfly-core/build/index');
      if (yunfly) {
        clearInterval(timer);
        resolve(yunfly.server);
      }
    }, 100)
  })
}

