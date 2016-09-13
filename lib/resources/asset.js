/**
 * node-bizweb-api
 *
 * Copyright (c) 2016 Codeteria, contributors.
 * Licensed under the MIT license.
 * https://github.com/Codeteria/my-bizweb-api/blob/master/LICENSE-MIT
 */

 var Resource = require('../resource');

 module.exports = Resource.extend({
  path: '/admin/themes/',

  create: Resource.method({
    method: 'PUT',
    path: '/{themeid}/assets.json',
    urlParams: ['themeid']
  }),

  destroy: Resource.method({
    method: 'DELETE',
    path: '/{themeid}/assets.json?key={key}',
    urlParams: ['themeid', 'key']
  }),

  list: Resource.method({
    method: 'GET',
    path: '/{themeid}/assets.json',
    urlParams: ['themeid']
  }),

  retrieve: Resource.method({
    method: 'GET',
    path: '/{themeid}/assets.json?key={key}&theme_id={themeid}',
    urlParams: ['themeid', 'key']
  }),

  update: Resource.method({
    method: 'PUT',
    path: '/{themeid}/assets.json',
    urlParams: ['themeid']
  }),
});