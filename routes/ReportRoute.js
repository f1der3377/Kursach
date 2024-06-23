/**
 * Роутинг для отчетов администратора
 */

import {
  StaffModel,
  ReportEmploymentStaffVW,
  ReportOrdersStaffVW
} from './../database/index.js';

import excel from 'excel4node';
import tmp from 'tmp';
import fs from 'fs';


class ReportRoute {
  constructor(app) {
    app.route('/reports')
      .get(this.indexPage)
      .post(this.checkReport.bind(this))

    app.get('/reports', this.indexPage);
  }

  async indexPage(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const Staff = new StaffModel();
    const staff = await Staff.getAll();

    res.render('reports/index', { staff });
  }

  async checkReport(req, res) {
    if(req.cookies['role'] != 'администратор') {
      return res.redirect('/login');
    }

    const { type_report, staff_id, date } = req.body;

    switch(type_report) {
      case 'employment-specialist': return await this._getReportEmploymentSpecialist(res, staff_id, date);
      case 'order-staff': return await this._getReportOrders(res, staff_id);
      default: res.redirect('/reports');
    }
  }

  /**
   * Формирования и выдача отчета "Занятость специалиста на дату"
   */
  async _getReportEmploymentSpecialist(res, staff_id, date) {
    // Создаем новую рабочую книгу =>
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Мои Данные');

    // Обводка =>
    const style = workbook.createStyle({
      border: {
        left: {
          style: 'thin',
        },
        right: {
          style: 'thin',
        },
        top: {
          style: 'thin',
        },
        bottom: {
          style: 'thin',
        },
      },
    });

    // Ширина колонок =>
    worksheet.column(1).setWidth(60);
    worksheet.column(2).setWidth(30);
    worksheet.column(3).setWidth(15);
    worksheet.column(4).setWidth(15);
    worksheet.column(5).setWidth(15);

    // Заголовки =>
    worksheet.cell(1, 1).string('Клиент').style(style);
    worksheet.cell(1, 2).string('Услуга').style(style);
    worksheet.cell(1, 3).string('Дата').style(style);
    worksheet.cell(1, 4).string('Время').style(style);
    worksheet.cell(1, 5).string('Статус').style(style);

    // Заполнение данных =>
    const ReportEmploymentStaff = new ReportEmploymentStaffVW();
    const d = await ReportEmploymentStaff.getDataReport(staff_id, date);
    const data = d.map(el => [el.client_fio, el.service_name, el.human_date, el.hour, el.status_order_name]);

    if(d.length == 0) {
      return res.redirect('/reports');
    }

    // Записываем данные =>
    data.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        worksheet.cell(rowIndex + 2, cellIndex + 1).string(cell).style(style);
      });
    });

    // Сохраняем и выводим данные на фронт =>
    const fileName = `отчет занятости специалиста ${d[0]?.staff_fio} на ${date}.xlsx`;
    const tempFilePath = tmp.tmpNameSync({ name: `отчет занятости специалиста ${d[0]?.staff_fio} на ${date}`, postfix: '.xlsx' });
    workbook.write(tempFilePath, function (err, stats) {
      if (err) {
        console.error(err);
        res.status(500).send('Произошла ошибка при генерации файла Excel');
      } else {
        res.download(tempFilePath, fileName, function (err) {
          if (err) {
            console.error(err);
            res.status(500).send('Произошла ошибка при отправке файла Excel');
          }
          // Удаляем временный файл после отправки
          fs.unlink(tempFilePath, (err) => {
            if (err) {
              console.error(err);
            }
          });
        });
      }
    });
  }

  /**
   * Формирования и выдача отчета "Сведенья об оказании услуг мастером "
   */
  async _getReportOrders(res, staff_id) {
    // Создаем новую рабочую книгу =>
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Мои Данные');

    // Обводка =>
    const style = workbook.createStyle({
      border: {
        left: {
          style: 'thin',
        },
        right: {
          style: 'thin',
        },
        top: {
          style: 'thin',
        },
        bottom: {
          style: 'thin',
        },
      },
    });

    // Ширина колонок =>
    worksheet.column(1).setWidth(15);
    worksheet.column(2).setWidth(30);
    worksheet.column(3).setWidth(60);
    worksheet.column(4).setWidth(30);

    // Заголовки =>
    worksheet.cell(1, 1).string('Дата').style(style);
    worksheet.cell(1, 2).string('Наименование услуги').style(style);
    worksheet.cell(1, 3).string('ФИО клиента').style(style);
    worksheet.cell(1, 4).string('Стоимость').style(style);

    // Заполнение данных =>
    const ReportOrdersStaff = new ReportOrdersStaffVW();
    const d = await ReportOrdersStaff.getDataReport(staff_id);
    const data = d.map(el => [el.human_date, el.service_name, el.client_fio, el.price]);

    if(d.length == 0) {
      return res.redirect('/reports');
    }

    // Записываем данные =>
    data.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        worksheet.cell(rowIndex + 2, cellIndex + 1).string(cell).style(style);
      });
    });

    // Сохраняем и выводим данные на фронт =>
    const fileName = `отчет об оказании услуг мастером ${d[0]?.staff_fio}.xlsx`;
    const tempFilePath = tmp.tmpNameSync({ name: `отчет об оказании услуг мастером ${d[0]?.staff_fio}`, postfix: '.xlsx' });
    workbook.write(tempFilePath, function (err, stats) {
      if (err) {
        console.error(err);
        res.status(500).send('Произошла ошибка при генерации файла Excel');
      } else {
        res.download(tempFilePath, fileName, function (err) {
          if (err) {
            console.error(err);
            res.status(500).send('Произошла ошибка при отправке файла Excel');
          }
          // Удаляем временный файл после отправки
          fs.unlink(tempFilePath, (err) => {
            if (err) {
              console.error(err);
            }
          });
        });
      }
    });
  }
}

export default ReportRoute;