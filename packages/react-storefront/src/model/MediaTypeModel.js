/**
 * @license
 * Copyright © 2017-2019 Moov Corporation.  All rights reserved.
 */

import { types } from 'mobx-state-tree'

/**
 * Represents an image or a video.
 * @class MediaTypeModel
 */
export default types.model('MediaType', {
  /**
   * The URL for the full size image displayed on the PDP
   */
  src: types.string,
  /**
   * The URL for the high resolution image displayed in the lightbox.
   * Note that this is not supported when rendering AMP.  The `src` property
   * will always be used.
   */
  zoomSrc: types.maybeNull(types.string),
  /**
   * The width for the high resolution image displayed in the lightbox. This
   * property is required for the hover-to-zoom functionality to work on the PDP.
   */
  zoomWidth: types.maybeNull(types.number),
  /**
   * The height for the high resolution image displayed in the lightbox. This
   * property is required for the hover-to-zoom functionality to work on the PDP.
   */
  zoomHeight: types.maybeNull(types.number),
  /**
   * Alt text for the image
   */
  alt: types.maybeNull(types.string),
  /**
   * A video URL
   */
  video: types.optional(types.boolean, false),
  /**
   * Poster attribute for a video
   */
  poster: types.maybeNull(types.string)
})
