
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | ログ出力の補助処理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const winston = require('winston');
require('winston-daily-rotate-file');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [

        // 監査ログ
        new winston.transports.DailyRotateFile({
            filename: 'logs/audit-%DATE%.log',
            datePattern: 'YYYY=MM=DD',
            level: 'info',
            maxSize: '20m',
            maxFiles: '14d'
        }),

        // エラーログ
        new winston.transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY=MM=DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d'
        }),
    ]
});

module.exports = logger;