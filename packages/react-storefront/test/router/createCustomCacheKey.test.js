import createCustomCacheKey from '../../src/router/createCustomCacheKey'

describe('createCustomCacheKey', () => {
  it('should support toJSON', () => {
    const key = createCustomCacheKey()
      .addHeader('user-agent')
      .addHeader('host')
      .excludeQueryParameters(['uid', 'gclid'])
      .addCookie('currency')
      .addCookie('location', cookie => {
        cookie.partition('na').byPattern('us|ca')
        cookie.partition('eur').byPattern('de|fr|ee')
      })

    expect(key.toJSON()).toEqual({
      add_headers: ['user-agent', 'host'],
      query_parameters_list: ['uid', 'gclid'],
      query_parameters_mode: 'blacklist',
      add_cookies: {
        currency: null,
        location: [
          { partition: 'na', partitioning_regex: 'us|ca' },
          { partition: 'eur', partitioning_regex: 'de|fr|ee' }
        ]
      }
    })
  })

  it('should support header partitioning', () => {
    const key = createCustomCacheKey()
      .addHeader('x-moov-xdn-device')
      .addHeader('country', header => {
        header.partition('na').byPattern('us|ca')
        header.partition('eur').byPattern('.*')
      })

    expect(key.toJSON()).toEqual({
      query_parameters_list: [],
      query_parameters_mode: 'blacklist',
      add_cookies: {},
      add_headers: [
        'x-moov-xdn-device',
        {
          name: 'country',
          partitions: [
            { partition: 'na', partitioning_regex: 'us|ca' },
            { partition: 'eur', partitioning_regex: '.*' }
          ]
        }
      ]
    })
  })

  describe('query parameters exclusion', () => {
    it('can exclude all query parameters', () => {
      const key = createCustomCacheKey().excludeAllQueryParameters()

      expect(key.toJSON().query_parameters_list).toEqual([])
      expect(key.toJSON().query_parameters_mode).toEqual('whitelist')
    })

    it('can exclude some query parameters', () => {
      const key = createCustomCacheKey().excludeQueryParameters(['uid', 'gclid'])

      expect(key.toJSON().query_parameters_list).toEqual(['uid', 'gclid'])
      expect(key.toJSON().query_parameters_mode).toEqual('blacklist')
    })

    it('can exclude all query parameters with some exceptions', () => {
      const key = createCustomCacheKey().excludeAllQueryParametersExcept(['page_id'])
      expect(key.toJSON().query_parameters_list).toEqual(['page_id'])
      expect(key.toJSON().query_parameters_mode).toEqual('whitelist')
    })

    it('can pass query parameters as spread arguments', () => {
      expect(
        createCustomCacheKey()
          .excludeQueryParameters('uid', 'gclid')
          .toJSON().query_parameters_list
      ).toEqual(['uid', 'gclid'])

      expect(
        createCustomCacheKey()
          .excludeAllQueryParametersExcept('page_id', 'track')
          .toJSON().query_parameters_list
      ).toEqual(['page_id', 'track'])
    })

    it('prevents applying excludeQueryParameters multiple times', () => {
      // As the param is an array it could be confusing: does it append or override,
      // so we just forbid mutliple calls
      expect(() => {
        createCustomCacheKey()
          .excludeQueryParameters(['uid', 'gclid'])
          .excludeQueryParameters(['another'])
      }).toThrowError(
        'You cannot combine multiple query params exclusion in a single custom cache key definition'
      )
    })

    it('prevents applying multiple exlusion methods', () => {
      expect(() => {
        createCustomCacheKey()
          .excludeQueryParameters(['uid', 'gclid'])
          .excludeAllQueryParametersExcept(['page_id'])
      }).toThrowError(
        'You cannot combine multiple query params exclusion in a single custom cache key definition'
      )

      expect(() => {
        createCustomCacheKey()
          .excludeAllQueryParametersExcept(['page_id'])
          .excludeQueryParameters(['uid', 'gclid'])
      }).toThrowError(
        'You cannot combine multiple query params exclusion in a single custom cache key definition'
      )
    })
  })
})
