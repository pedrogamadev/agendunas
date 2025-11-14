import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cache } from '../../src/lib/cache.js'

describe('Cache', () => {
  beforeEach(() => {
    cache.clear()
  })

  it('deve armazenar e recuperar valores', () => {
    cache.set('test-key', 'test-value')
    const value = cache.get<string>('test-key')

    expect(value).toBe('test-value')
  })

  it('deve retornar null para chaves inexistentes', () => {
    const value = cache.get('non-existent-key')
    expect(value).toBeNull()
  })

  it('deve expirar valores após TTL', async () => {
    cache.set('expiring-key', 'value', 100) // 100ms TTL

    expect(cache.get('expiring-key')).toBe('value')

    await new Promise((resolve) => setTimeout(resolve, 150))

    expect(cache.get('expiring-key')).toBeNull()
  })

  it('deve permitir deletar valores', () => {
    cache.set('delete-key', 'value')
    expect(cache.get('delete-key')).toBe('value')

    cache.delete('delete-key')
    expect(cache.get('delete-key')).toBeNull()
  })

  it('deve limpar todo o cache', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')

    cache.clear()

    expect(cache.get('key1')).toBeNull()
    expect(cache.get('key2')).toBeNull()
  })

  it('deve manter tipos corretos', () => {
    cache.set('string-key', 'string-value')
    cache.set('number-key', 42)
    cache.set('object-key', { foo: 'bar' })

    expect(typeof cache.get<string>('string-key')).toBe('string')
    expect(typeof cache.get<number>('number-key')).toBe('number')
    expect(cache.get<{ foo: string }>('object-key')).toEqual({ foo: 'bar' })
  })
})

