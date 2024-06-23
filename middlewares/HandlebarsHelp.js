/**
 * Промежуточное ПО внедрение во все роуты функций помошников (для шаблонизатора handlebars)
 */

class HandlebarsHelp {
  static run(req, res, next) {

    res.locals.defaultData = {
      isCurrentUserRoleAdmin: () => req.cookies['role'] == 'администратор',
      isCurrentUserRoleDirector: () => req.cookies['role'] == 'директор',
      getUserRole: () => req.cookies['role'] || 'NULL',

      getHeaderTitle: () => {
        let part = 'Выбранный раздел: ';
        const path = req.path.split('/');

        switch (path[1]) {
          case 'type_service': part += 'Виды выполняемых услуг'; break;
          case 'services': part += 'Перечень услуг'; break;
          case 'staff': part += 'Мастера'; break;
          case 'clients': part += 'Клиенты'; break;
          case 'orders': part += 'Заказы'; break;
          case 'reports': 
          case 'report-director':
            part += 'Отчеты'; 
          break;
          default: part = 'Выберите раздел'; break;
        }

        switch (path[2]) {
          case 'show': part += ' (просмотр элемента)'; break;
          case 'create': part += ' (создание элемента)'; break;
          case 'edit': part += ' (редактирование элемента)'; break;
        }

        return part;
      }
    };

    next();
  }
}

export default HandlebarsHelp;