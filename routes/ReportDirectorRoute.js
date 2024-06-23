/**
 * Роутинг для отчетов директора
 */

import { 
  ReportOrdersVW,
  ReportVolumeWorkStaffVW,
  OrderModel
} from './../database/index.js';

import excel from 'excel4node';
import { XlsxGenerator } from "office-chart";
import tmp from 'tmp';
import fs from 'fs';

class ReportDirectorRoute {
  constructor(app) {
    app.route('/report-director')
      .get(this.indexPage)
      .post(this.checkReport.bind(this))

    app.get('/report-director', this.indexPage);
  }

  async indexPage(req, res) {
    if(req.cookies['role'] != 'директор') {
      return res.redirect('/login');
    }

    res.render('report-director/index');
  }

  async checkReport(req, res) {
    if(req.cookies['role'] != 'директор') {
      return res.redirect('/login');
    }

    const { type_report, date_start, date_end } = req.body;

    switch(type_report) {
      case 'orders': return await this._getReportOrders(res, date_start, date_end);
      case 'volume-work-staff': return await this._getReportVolumeWorkStaff(res);
      case 'volume-services': return await this._getReportVolumeServices(res, date_start, date_end);
      default: res.redirect('/report-director');
    }
  }

  /**
   * Формирования и выдача отчета "Об оказании услуг за период"
   */
  async _getReportOrders(res, date_start, date_end) {
    // Создаем новую рабочую книгу =>
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Оказание услуг за период');

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
    worksheet.column(1).setWidth(30);
    worksheet.column(2).setWidth(60);
    worksheet.column(3).setWidth(60);
    worksheet.column(4).setWidth(15);
    worksheet.column(5).setWidth(15);

    // Заголовки =>
    worksheet.cell(1, 1).string('Услуга').style(style);
    worksheet.cell(1, 2).string('Специалист').style(style);
    worksheet.cell(1, 3).string('Клиент').style(style);
    worksheet.cell(1, 4).string('Дата').style(style);
    worksheet.cell(1, 5).string('Стоимость').style(style);

    // Заполнение данных =>
    const ReportOrders = new ReportOrdersVW();
    const d = await ReportOrders.getDataReport(date_start, date_end);
    const total = await ReportOrders.getTotalSum(date_start, date_end);
    const data = d.map(el => [el.service_name, el.staff_fio, el.client_fio, el.human_date, el.price_string]);

    if(d.length == 0) {
      return res.redirect('/report-director');
    }

    // Записываем данные =>
    data.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        worksheet.cell(rowIndex + 2, cellIndex + 1).string(cell).style(style);
      });
    });

    // Записываем итоги =>
    const row = data.length + 2;
    worksheet.cell(row, 4).string('Итого:').style(style);
    worksheet.cell(row, 5).string(total[0].price).style(style);
    worksheet.cell(row, 1, row, 3).style(style);


    // Сохраняем и выводим данные на фронт =>
    const fileName = `отчет об оказании услуг за период с ${date_start} по ${date_end}.xlsx`;
    const tempFilePath = tmp.tmpNameSync({ name: `отчет об оказании услуг за период с ${date_start} по ${date_end}`, postfix: '.xlsx' });
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
   * Формирования и выдача отчета "Об объеме работ мастеров"
   */
  async _getReportVolumeWorkStaff(res) {
    const xlsx = new XlsxGenerator();
    await xlsx.createWorkbook();
    const worksheet = await xlsx.createWorksheet('Объем работ мастеров');

    // Получение данных =>
    const ReportVolumeWorkStaff = new ReportVolumeWorkStaffVW();
    const d = await ReportVolumeWorkStaff.getDataReport();
    const total = await ReportVolumeWorkStaff.getTotalSum();
    const data = d.map(el => [el.staff_fio, Number(el.count_order), el.price_string]);
    
    if(data.length == 0) {
      return res.redirect('/report-director');
    }

    // Заполняем данные =>
    let table = [];
    
    // Добавляем заголовки =>
    table.push(['ФИО мастера', 'Количество услуг', 'Сумма'])
    // Добавляем данные =>
    data.forEach(arrEl => table.push(arrEl));
    // Добавляем итоги =>
    table.push(['', 'Итого', total[0].price]);
    // Применяем к таблице =>
    await worksheet.addTable(table);

    function generateRandomHexColorsArray(length) {
      const colors = [];
      for (let i = 0; i < length; i++) {
      const color = Math.random().toString(16).slice(2, 8);
      colors.push(color);
      }
      return colors;
    }

    // Строим графики =>
    const opt = {
      title: {
        name: 'Кол-во услуг каждого мастера',
        color: '8ab4f8',
        size: 1000,
      },
      range: `B2:B${data.length + 1}`,
      rgbColors: generateRandomHexColorsArray(data.length),
      type: "bar",
      labels: true,
    }

    await worksheet.addChart(opt);
    const buffer = await xlsx.generate('file.xlsx', 'buffer');
    res.attachment('Объем работ мастеров.xlsx');
    res.send(buffer);
  }

  async _getReportVolumeServices(res, date_start, date_end) {
    const xlsx = new XlsxGenerator();
    await xlsx.createWorkbook();
    const worksheet = await xlsx.createWorksheet('Объем оказанных услуг');

    // Получение данных =>
    const Order = new OrderModel();
    const d = await Order.getReportVolumeServices(date_start, date_end);
    const data = d.map(el => [el.service_name, Number(el.count_service), el.price_string]);

    if(data.length == 0) {
      return res.redirect('/report-director');
    }

    // Заполняем данные =>
    let table = [];
    
    // Добавляем заголовки =>
    table.push(['Услуга', 'Количество', 'Общая стоимость'])
   
    // Добавляем данные =>
    data.forEach(arrEl => table.push(arrEl));

    // Применяем к таблице =>
    await worksheet.addTable(table);

    function generateRandomHexColorsArray(length) {
      const colors = [];
      for (let i = 0; i < length; i++) {
      const color = Math.random().toString(16).slice(2, 8);
      colors.push(color);
      }
      return colors;
    }

    // Строим графики =>
    const opt = {
      title: {
        name: 'Кол-во услуг',
        color: '8ab4f8',
        size: 1000,
      },
      range: `B2:B${data.length + 1}`,
      rgbColors: generateRandomHexColorsArray(data.length),
      type: "bar",
      labels: true,
    }

    await worksheet.addChart(opt);
    const buffer = await xlsx.generate('file.xlsx', 'buffer');
    res.attachment('Объем оказанных услуг.xlsx');
    res.send(buffer);
  }
}

export default ReportDirectorRoute;