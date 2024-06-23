/**
 * Промежуточное ПО для отключения кеширования
 */

class DisableCache {
  static async run(req, res, next) {
    res.set('Cache-Control', 'no-cache');
    next();
  }
}

export default DisableCache;