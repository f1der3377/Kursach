import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import handlebars from 'express-handlebars';
import bodyParser from 'body-parser';
import { DateTime } from 'luxon';
import { fileURLToPath } from 'url';

import {
  DisableCache,
  AuthChecker,
  HandlebarsHelp
} from './middlewares/index.js';

import {
  MainRoute,
  LoginRoute,
  ServiceRoute,
  TypeServiceRoute,
  StaffRoute,
  ClientRoute,
  OrderRoute,
  ReportRoute,
  ReportDirectorRoute
} from './routes/index.js';

import { DataBase } from './database/index.js';

class Main {
  app = null;

  constructor() {
    this.init();
  }

  async init() {
    await this.initSystem();
    await this.configRouter();
    await this.listenServer();
  }

  async initSystem() {
    // Прописываем глобальные пути (Необходимо из за режима "module") =>
    global.__filename = fileURLToPath(import.meta.url);
    global.__dirname = path.dirname(__filename);

    // Инцилизируем env =>
    dotenv.config();

    // Инцилизируем БД =>
    let db = new DataBase();
    await db.initConnect();
    global.db = db.db;
    await db.createTables();
    await db.createVW();

    // Инцилизируем сервис =>
    this.app = express();

    // Задаю новый хелпер для шаблонизатора
    const hbs = handlebars.create({
      helpers: {
        isEqual: function (value1, value2, options) {
          return value1 == value2 ? options.fn(this) : options.inverse(this);
        }
      }
    });

    // Инцилизируем шаблонизатор =>
    this.app.engine(
      'handlebars',
      hbs.engine
    );
    this.app.set('views', './views');
    this.app.set('view engine', 'handlebars');

    // Промежуточное ПО (статичные файлы (HTML/JS/CSS)) =>
    this.app.use('/static', express.static(path.join(__dirname, 'public')));
    
    // Промежуточное ПО (удобное чтение данных с запросов в формате JSON) =>
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    
    // Промежуточное ПО (удобное чтение кук) =>
    this.app.use(cookieParser(process.env.SECRET_COOKIE));
    
    // Промежуточное ПО (самописное) =>
    this.app.use(DisableCache.run); // Отключение кеширования
    this.app.use(AuthChecker.run); // Проверка авторизации пользователя
    this.app.use(HandlebarsHelp.run); // Функции помошники для вызова их в шаблоне
  }

  configRouter() {
    new MainRoute(this.app);
    new LoginRoute(this.app);
    new TypeServiceRoute(this.app);
    new ServiceRoute(this.app);
    new StaffRoute(this.app);
    new ClientRoute(this.app);
    new OrderRoute(this.app);
    new ReportRoute(this.app);
    new ReportDirectorRoute(this.app);
  }

  listenServer() {
    this.app.listen(process.env.PORT, () => {
      console.log('Run application')
    });
  }
}

new Main();