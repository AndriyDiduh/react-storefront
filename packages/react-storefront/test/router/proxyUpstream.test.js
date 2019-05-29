/**
 * @license
 * Copyright © 2017-2018 Moov Corporation.  All rights reserved.
 */
import { proxyUpstream } from '../../src/router'
import Response from '../../../react-storefront-moov-xdn/src/Response'

describe('proxyUpstream', () => {
  describe('on the client', () => {
    beforeEach(() => {
      process.env.MOOV_RUNTIME = 'client'
      global.env = {}
      window.location.reload = jest.fn()
    })

    it('should reload from the server', async () => {
      await proxyUpstream().fn()
      expect(window.location.reload).toHaveBeenCalled()
    })
  })

  describe('on the server', () => {
    beforeEach(() => {
      process.env.MOOV_RUNTIME = 'server'
    })

    it('should return from the server', async () => {
      const handler = jest.fn()
      const params = {}
      const request = {}
      const response = new Response(request)
      expect(await proxyUpstream(handler).fn(params, request, response)).toEqual({
        proxyUpstream: true
      })
      expect(handler).toHaveBeenCalledWith(params, request, response)
    })

    it('work without a callback', async () => {
      const params = {}
      const request = {}
      const response = new Response(request)
      response.send = jest.fn()
      await proxyUpstream().fn(params, request, response)
      expect(response.send).toHaveBeenCalledWith()
    })

    it('should throw an error when a handler is not provided', async () => {
      const params = {}
      const request = {}
      const response = new Response(request)
      response.send = jest.fn()

      let error

      try {
        await proxyUpstream(null).fn(params, request, response)
      } catch (e) {
        error = e
      }

      expect(error.message).toBe(
        'You must provide a path to a handler in proxyUpstream().  Please check your routes.'
      )
    })
  })
})
