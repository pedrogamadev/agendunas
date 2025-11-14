import { describe, expect, it, beforeEach, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { errorHandler } from '../../src/middlewares/error-handler.js'

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockRequest = {
      path: '/api/test',
      method: 'GET',
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('test-agent'),
    }
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      headersSent: false,
    }
    mockNext = vi.fn()
  })

  it('deve tratar erros Zod corretamente', () => {
    const zodError = new ZodError([
      {
        path: ['field'],
        message: 'Invalid field',
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
      },
    ])

    errorHandler(zodError, mockRequest as Request, mockResponse as Response, mockNext)

    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Dados inválidos enviados para a API.',
      issues: [
        {
          path: 'field',
          message: 'Invalid field',
        },
      ],
    })
  })

  it('deve tratar erros com statusCode', () => {
    const error = Object.assign(new Error('Not found'), { statusCode: 404 })

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

    expect(mockResponse.status).toHaveBeenCalledWith(404)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Not found',
    })
  })

  it('deve tratar erros 500 com mensagem genérica', () => {
    const error = new Error('Internal error')

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

    expect(mockResponse.status).toHaveBeenCalledWith(500)
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Erro inesperado ao processar a solicitação.',
    })
  })

  it('deve tratar erros não-Error', () => {
    const error = 'String error'

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

    expect(mockResponse.status).toHaveBeenCalledWith(500)
  })

  it('deve passar erro adiante se headers já foram enviados', () => {
    mockResponse.headersSent = true
    const error = new Error('Test error')

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext)

    expect(mockNext).toHaveBeenCalledWith(error)
    expect(mockResponse.status).not.toHaveBeenCalled()
  })
})

