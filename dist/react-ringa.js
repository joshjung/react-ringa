(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["React Ringa"] = factory();
	else
		root["React Ringa"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unqueueState = unqueueState;
exports.queueState = queueState;
function unqueueState(reactComponent) {
  if (reactComponent.__ringaStateQueueTimeout) {
    clearTimeout(reactComponent.__ringaStateQueueTimeout);
    delete reactComponent.__ringaStateQueueTimeout;
  }
}

function queueState(reactComponent, newState) {
  if (!reactComponent.state) {
    reactComponent.state = newState;
    return;
  }

  reactComponent.__ringaStateQueue = reactComponent.__ringaStateQueue || {};
  reactComponent.__ringaStateQueue = Object.assign(reactComponent.__ringaStateQueue, newState);

  if (reactComponent.__ringaStateQueueTimeout) {
    return;
  }

  reactComponent.__ringaStateQueueTimeout = setTimeout(function () {
    reactComponent.__ringaStateQueueTimeout = 0;
    reactComponent.setState(reactComponent.__ringaStateQueue);
  }, 0);
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = attach;
/**
 * This function attaches a Ringa Controller to a specific React.Component and a selected DOM node within that component.
 *
 * Note that a Ringa controller is attached to a React Component when componentDidMount is called on the component.
 *
 * @param component The React Component to attach to.
 * @param controller The Ringa Controller to attach when a DOM node is available.
 * @param refName The React component reference name.
 * @param callback The function to call whenever the controller has been attached.
 */
function attach(component, controller) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$refName = _ref.refName,
      refName = _ref$refName === undefined ? 'ringaComponent' : _ref$refName,
      _ref$callback = _ref.callback,
      callback = _ref$callback === undefined ? undefined : _ref$callback;

  var _componentDidMount = void 0;

  if (component.componentDidMount) {
    _componentDidMount = component.componentDidMount.bind(component);
  }

  component.$ringaControllers = component.$ringaControllers || [];
  component.$ringaControllers.push(controller);

  component.componentDidMount = function () {
    if (!component.refs || !component.refs[refName]) {
      console.warn('attach(): Error attaching Ringa Controller to React Component ' + component.constructor.name + '. Component reference named \'' + refName + '\' does not exist.');

      return;
    }

    controller.bus = component.refs[refName];

    if (_componentDidMount) {
      _componentDidMount();
    }

    if (callback) {
      callback();
    }
  };
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.walkReactParents = walkReactParents;
exports.dependency = dependency;
exports.find = find;
exports.getAllListeningControllers = getAllListeningControllers;
exports.depend = depend;

var _queueState = __webpack_require__(0);

/**
 * Walks the React Components up through the parent heirarchy.
 *
 * @param component A React Component instance.
 * @param callback A callback to call for each component in the ancestors.
 */
function walkReactParents(component, callback) {
  var ancestors = [];

  if (component._reactInternalInstance) {
    ancestors.push(component);

    component = component._reactInternalInstance;
  }

  while (component) {
    ancestors.push(component);

    if (component._reactInternalInstance) {
      component = component._reactInternalInstance;
    }

    try {
      component = component._currentElement._owner._instance;
    } catch (e) {
      component = null;
    }
  }

  ancestors.forEach(callback);

  return ancestors;
};

/**
 * Builds a dependency object for use with the depend function.
 *
 * @param classOrId A Class that extends Ringa.Model or a string id of a model you are looking for.
 * @param propertyPath A dot-delimited path into a property on the model. Or undefined if you want the model itself.
 * @param setOnState When true (default), the property will be set on the state of the component, forcing an update.
 *
 * @returns {{classOrId: *, propertyPath: *, setOnState: boolean}}
 */
function dependency(classOrId) {
  var propertyPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  var setOnState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var setOnComponent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  return {
    classOrId: classOrId,
    propertyPath: propertyPath,
    setOnState: setOnState,
    setOnComponent: setOnComponent
  };
}

/**
 * Finds a Ringa.Model or a specific property, given the context of the provided React Component.
 *
 * @param reactComponent A React Component instance.
 * @param classOrId A Class that extends Ringa.Model or a string id of a model you are looking for.
 * @param propertyPath A dot-delimited path into a property on the model. Or undefined if you want the model itself.
 * @returns {*}
 */
function find(reactComponent, classOrId) {
  var propertyPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

  var controllers = getAllListeningControllers(reactComponent);
  var value = void 0;

  for (var i = 0; i < controllers.length; i++) {
    var controller = controllers[i];
    var mw = controller.modelWatcher;

    if (mw) {
      var _value = mw.find(classOrId, propertyPath);

      if (_value) {
        return _value;
      }
    }
  }

  return null;
}

/**
 * Returns all Ringa.Controller instances that will hear when you dispatch an event from any of the provided React component's
 * DOM nodes or its descendants.
 *
 * @param component A React Component instance.
 * @returns {Array}
 */
function getAllListeningControllers(component) {
  var controllers = [];

  walkReactParents(component, function (c) {
    if (c.$ringaControllers && c.$ringaControllers.length) {
      controllers = controllers.concat(c.$ringaControllers);
    }
  });

  return controllers;
}

/**
 * Listens for changes on the provided React Component anywhere in its ancestor tree of Controllers for the requested Ringa.Model and,
 * if desired specific property path, changes. See getAllListeningControllers for information on the controllers and their models
 * that this will depend upon.
 *
 * Example:
 *
 * import {depend, dependency} from 'react-ringa';
 *
 * class MyComponent extends React.Component {
 *   constructor() {
 *     super();
 *
 *     depend(this, dependency('myModelId', 'some.property'));
 *   }
 * }
 *
 * @param component A React Component instance.
 * @param watches An individual or Array of dependency objects. See
 * @param handler A function to callback immediately with all the dependencies that are found right now.
 *
 * @returns {Array}
 */
function depend(component, watches) {
  var handler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

  var _componentWillMount = void 0,
      _componentWillUnmount = void 0;

  if (component.componentWillMount) {
    _componentWillMount = component.componentWillMount.bind(component);
  }

  if (component.componentWillUnmount) {
    _componentWillUnmount = component.componentWillUnmount.bind(component);
  }

  if (component.state === undefined) {
    component.state = {};
  }

  var controllers = void 0;
  var mws = [];

  component.componentWillUnmount = function () {
    (0, _queueState.unqueueState)(component);

    /**
     * When the component unmounts we want to unwatch everything.
     */
    mws.forEach(function (mwGroup) {
      mwGroup.mw.unwatch(mwGroup.classOrId, mwGroup.propertyPath, mwGroup.changeHandler);
    });

    if (_componentWillUnmount) {
      _componentWillUnmount();
    }
  };

  component.componentWillMount = function () {
    controllers = getAllListeningControllers(component);

    if (!controllers.length) {
      console.error('react-ringa depend(): could not find any Ringa Controllers in the ancestors of ' + component.constructor.name + ', the following dependencies will NOT work: ', watches, component);

      return;
    }

    watches = watches instanceof Array ? watches : [watches];

    watches.forEach(function (watch) {
      var foundModels = [];

      controllers.forEach(function (controller) {
        var mw = controller.modelWatcher;

        if (mw) {
          var _ret = function () {
            var model = mw.find(watch.classOrId);

            if (!model) {
              return {
                v: void 0
              };
            }

            foundModels.push(model);

            if (foundModels.length > 1) {
              console.warn('depend(): found two models while looking for a dependency on \'' + component.constructor.name + '\'! Watch is:\n', watch, 'found these models:\n', foundModels, 'depend() looks for the closest model it can find that matches the watch criteria. This means you might have a serious error in your stack. Proceeding as normal.');
            }

            // By default the model we are requesting automatically gets set on the state no matter what for
            // easy access. However, we don't watch the entire model because that would be silliness. Each view
            // component should request the specific signals it wants to watch.
            var s = {};
            s[watch.setProperty || model.name] = model;
            (0, _queueState.queueState)(component, s);

            var value = void 0,
                changeHandler = void 0;

            // If the user is just asking for the model (no propertyPath), we can skip all the watching jargon.
            if (watch.propertyPath) {

              var pp = watch.propertyPath instanceof Array ? watch.propertyPath : [watch.propertyPath];

              // Create Change Handler. Note we do not use an arrow function here to save memory.
              changeHandler = function (watch, changes) {
                var skipUpdate = handler ? handler(changes) : undefined;

                if (skipUpdate === undefined && watch.setOnState) {
                  (function () {
                    var newState = {};

                    changes.forEach(function (change) {
                      var state = {};
                      var prop = change.model.name;

                      if (watch.setProperty) {
                        prop = watch.setProperty; // Can specify a custom property in the dependency to set on the state for each change.
                      }if (change.watchedPath) {
                        try {
                          var _s = change.watchedPath.split('.');
                          prop = _s[_s.length - 1];
                        } catch (error) {
                          console.error('depend(): property was updated but watched path was invalid. watchedPath was:', change.watchedPath);
                        }
                      }

                      state[prop] = change.watchedValue;

                      newState = Object.assign(newState, state);
                    });

                    (0, _queueState.queueState)(component, newState);
                  })();
                }
              }.bind(undefined, watch);

              pp.forEach(function (propertyPath) {
                value = mw.find(watch.classOrId, propertyPath);

                mws.push({
                  mw: mw,
                  classOrId: watch.classOrId,
                  propertyPath: propertyPath,
                  changeHandler: changeHandler
                });

                mw.watch(watch.classOrId, propertyPath, changeHandler);

                if (changeHandler) {
                  changeHandler([{
                    model: model,
                    value: value,
                    watchedPath: propertyPath,
                    watchedValue: value
                  }]);
                }
              });
            }
          }();

          if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }
      });

      if (!foundModels.length) {
        console.error('depend(): could not find the model', watch.classOrId.name, 'in any ancestor Controllers of React component', component.constructor.name, component, 'during the componentDidMount() phase. Found these instantiated and attached controllers', controllers);
      }
    });

    if (_componentWillMount) {
      _componentWillMount();
    }
  };
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = watch;

var _queueState = __webpack_require__(0);

function watch(reactComponent, model, callback) {
  if (model) {
    (function () {
      if (!model.watch) {
        throw new Error('react-ringa watch(): the provided object is not a Ringa Model \'' + model + '\'');
      }

      var _componentWillUnmount = reactComponent.componentWillUnmount ? reactComponent.componentWillUnmount.bind(reactComponent) : undefined;

      reactComponent.componentWillUnmount = function () {
        (0, _queueState.unqueueState)(reactComponent);

        if (_componentWillUnmount) {
          _componentWillUnmount();
        }
      };
      model.watch(function (path) {
        var fu = void 0;

        if (callback) {
          fu = callback.apply(undefined, [path]);
        }

        if (fu === undefined) {
          var _o = {};
          _o[model.name] = model;
          (0, _queueState.queueState)(reactComponent, _o);
        }
      });

      // Initial setup
      var o = {};
      o[model.name] = model;

      (0, _queueState.queueState)(reactComponent, o);
    })();
  }
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.watch = exports.getAllListeningControllers = exports.find = exports.walkReactParents = exports.dependency = exports.depend = exports.attach = undefined;

var _attach = __webpack_require__(1);

var _attach2 = _interopRequireDefault(_attach);

var _watch = __webpack_require__(3);

var _watch2 = _interopRequireDefault(_watch);

var _depend = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.attach = _attach2.default;
exports.depend = _depend.depend;
exports.dependency = _depend.dependency;
exports.walkReactParents = _depend.walkReactParents;
exports.find = _depend.find;
exports.getAllListeningControllers = _depend.getAllListeningControllers;
exports.watch = _watch2.default;
exports.default = {
  attach: _attach2.default,
  depend: _depend.depend,
  dependency: _depend.dependency,
  walkReactParents: _depend.walkReactParents,
  find: _depend.find,
  getAllListeningControllers: _depend.getAllListeningControllers,
  watch: _watch2.default
};

/***/ })
/******/ ]);
});
//# sourceMappingURL=react-ringa.js.map