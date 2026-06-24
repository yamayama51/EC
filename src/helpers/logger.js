
// |ーーーーーーーーーーーーーーーーーーーーーーーーー
// | ログ出力の補助処理
// |ーーーーーーーーーーーーーーーーーーーーーーーーー

const winston = require('winston');
require('winston-daily-rotate-file');

// ログレベルでフィルタリングする関数
const filterOnly = (level) => winston.format((info) => {
    return info.level === level ? info : false;
})();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [

        // 監査ログ
        new winston.transports.DailyRotateFile({
            filename: 'logs/audit-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'info',
            maxSize: '20m',
            maxFiles: '14d',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),

                // ログのフォーマット設定
                winston.format.printf(({ timestamp, level, message, path, ...meta }) => {
                    const metaString = Object.keys(meta).length > 0
                        ? ` | ${Object.entries(meta).map(([k, v]) => `${k}=${v}`).join(', ')}`
                        : ``;
                    return `[${timestamp}] ${level.toUpperCase()} | Path: ${path || 'N/A'} | Msg: ${message}${metaString}`;
                })
            ),
        }),

        // 注文用ログ
        new winston.transports.DailyRotateFile({
            filename: 'logs/order-%DATE%.log',
            level: 'http',
            maxSize: '20m',
            format: winston.format.combine(
                filterOnly('http'),
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.json()
            )
        }),

        // エラーログ
        new winston.transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),

                // ログのフォーマット設定
                winston.format.printf(({ timestamp, level, message, path, stack }) => {
                    let log = `[${timestamp}] ${level.toUpperCase()} | Path: ${path || 'N/A'} | Msg: ${message}`;
                    if (stack) {
                        log += `\nStack: ${stack}`;
                    }
                    return log;
                })
            ),
        }),
    ]
});

// 注文専用のメソッドを追加
logger.order = (message, meta) => {
    logger.log('http', message, meta);
};

module.exports = logger;