/**
 * @license
 * Copyright © 2017-2019 Moov Corporation.  All rights reserved.
 */
/**
 * Returns the manifest object.  Will return a stub in development that matches the structure of the object
 * that will be returned when running in the cloud.
 * @private
 * @return {Object}
 */
function getMoovManifest() {
  return global.moovManifest
}

/**
 * Gets the name of the current mode
 * @private
 * @return {String}
 */
function getModeName() {
  return global.env.moov_mode_name || 'default' // always return default in development
}

/**
 * Returns the ID of the current mode
 * @return {String}
 */
export function getMode() {
  const name = getModeName()
  const modes = getMoovManifest().Modes

  for (let id in modes) {
    const mode = modes[id]

    if (mode.Name === name) {
      return { id, name }
    }
  }

  // We'll really only get here in development, where the moovManifest doesn't
  // match the format we see in the cloud.  So it will never yield a match using the
  // code above.
  return { id: 'default', name: 'default' }
}
