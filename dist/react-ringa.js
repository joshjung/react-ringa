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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.walkReactParents = walkReactParents;
exports.dependency = dependency;
exports.find = find;
exports.getAllListeningControllers = getAllListeningControllers;
exports.depend = depend;
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

  console.log(ancestors);
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
function dependency(classOrId, propertyPath) {
  var setOnState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  return {
    classOrId: classOrId,
    propertyPath: propertyPath,
    setOnState: setOnState
  };
}

/**
 * Finds a Ringa.Model or a specific property, given the context of the provided React Component.
 *
 * @param component A React Component instance.
 * @param classOrId A Class that extends Ringa.Model or a string id of a model you are looking for.
 * @param propertyPath A dot-delimited path into a property on the model. Or undefined if you want the model itself.
 * @returns {*}
 */
function find(component, classOrId) {
  var propertyPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

  var controllers = getAllListeningControllers(component);
  var value = void 0;

  for (var i = 0; i < controllers.length; i++) {
    var controller = controllers[i];
    var mw = controller.modelWatcher;

    if (mw) {
      return mw.find(classOrId, propertyPath);
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

  var _componentWillMount = void 0;

  if (component.componentWillMount) {
    _componentWillMount = component.componentWillMount.bind(component);
  }

  component.componentWillMount = function () {
    var controllers = getAllListeningControllers(component);

    if (!controllers.length) {
      console.error('react-ringa depend(): could not find any Ringa Controllers in the ancestors of ' + component.constructor.name + ', the following dependencies will NOT work: ', watches, component);

      return;
    }

    watches = watches instanceof Array ? watches : [watches];

    var notifications = [];

    watches.forEach(function (watch) {
      controllers.forEach(function (controller) {
        var mw = controller.modelWatcher;
        if (mw) {
          // TODO aggregate so that we don't call watch twice.
          var model = mw.find(watch.classOrId);
          var value = mw.find(watch.classOrId, watch.propertyPath);

          // Create Change Handler
          var changeHandler = function (watch, changes) {
            var newState = {};

            var skipUpdate = component.dependencyDidChange ? component.dependencyDidChange(change, watch) : undefined;

            if (skipUpdate === undefined && watch.setOnState) {
              changes.forEach(function (change) {

                var state = {};
                var prop = change.model.name;
                if (change.setProp) {
                  prop = change.setProp;
                } else if (change.watchedPath) {
                  var s = change.watchedPath.split('.');
                  prop = s[s.length - 1];
                }

                state[prop] = change.watchedValue;

                newState = Object.assign(newState, state);
              });

              component.setState(newState);
            }
          }.bind(undefined, watch);

          // Handle initial property value
          if (model !== undefined && value !== null) {
            notifications.push({
              model: model,
              value: value
            });

            changeHandler([{
              model: model,
              value: value,
              watchedPath: watch.propertyPath,
              watchedValue: value
            }]);
          }

          mw.watch(watch.classOrId, watch.propertyPath, changeHandler);
        }
      });
    });

    if (notifications && notifications.length && handler) {
      handler(notifications);
    }

    if (_componentWillMount) {
      _componentWillMount();
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
exports.default = watch;
function watch(reactComponent, model, callback) {
  if (model) {
    if (!model.watch) {
      throw new Error("react-ringa watch(): the provided object is not a Ringa Model '" + model + "'");
    }

    model.watch(function (path) {
      reactComponent.forceUpdate();

      if (callback) {
        callback.apply(undefined, [path]);
      }
    });
  }
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.watch = exports.getAllListeningControllers = exports.find = exports.walkReactParents = exports.dependency = exports.depend = exports.attach = undefined;

var _attach = __webpack_require__(0);

var _attach2 = _interopRequireDefault(_attach);

var _watch = __webpack_require__(2);

var _watch2 = _interopRequireDefault(_watch);

var _depend = __webpack_require__(1);

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