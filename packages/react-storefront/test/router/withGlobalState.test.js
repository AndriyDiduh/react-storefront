/**
 * @license
 * Copyright © 2017-2018 Moov Corporation.  All rights reserved.
 */
import withGlobalState from '../../src/router/withGlobalState'

describe('withGlobalState', () => {
  it('should apply global state when URL does not have a JSON suffix', async () => {
    const result = await withGlobalState({ path: '/c/1/' }, { global: true }, { local: true })
    expect(result).toEqual({ global: true, local: true })
  })

  it('should not apply global state when URL does has a JSON suffix', async () => {
    const result = await withGlobalState({ path: '/c/1.json' }, { global: true }, { local: true })
    expect(result).toEqual({ local: true })
  })

  it('should accept an async function', async () => {
    const request = { path: '/c/1.json' }

    const cb = req => {
      expect(req).toBe(request)
      return Promise.resolve({ global: true })
    }

    const result = await withGlobalState(request, cb, { local: true })
    expect(result).toEqual({ local: true })
  })

  it('should accept an async function when the URL does not have a json suffix', async () => {
    const request = { path: '/c/1' }

    const cb = req => {
      expect(req).toBe(request)
      return Promise.resolve({ global: true })
    }

    const result = await withGlobalState(request, cb, { local: true })
    expect(result).toEqual({ global: true, local: true })
  })
})
