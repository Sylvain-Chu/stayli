/**
 * Centralized logger for the application
 * Provides consistent logging with context and log levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const getCurrentLogLevel = (): LogLevel => {
  const level = process.env.LOG_LEVEL as LogLevel | undefined
  return level && LOG_LEVELS[level] !== undefined ? level : 'info'
}

const shouldLog = (level: LogLevel): boolean => {
  const currentLevel = getCurrentLogLevel()
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

const formatMessage = (level: LogLevel, message: string, context?: LogContext): string => {
  const timestamp = new Date().toISOString()
  const contextStr = context ? ` ${JSON.stringify(context)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
}

/**
 * Logger instance with methods for each log level
 */
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, context))
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message, context))
    }
  },

  warn(message: string, context?: LogContext): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, context))
    }
  },

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (shouldLog('error')) {
      const errorContext =
        error instanceof Error
          ? { ...context, errorName: error.name, errorMessage: error.message, stack: error.stack }
          : { ...context, error }
      console.error(formatMessage('error', message, errorContext))
    }
  },
}

export default logger
