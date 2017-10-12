(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react-dom"));
	else if(typeof define === 'function' && define.amd)
		define(["react-dom"], factory);
	else if(typeof exports === 'object')
		exports["React Ringa"] = factory(require("react-dom"));
	else
		root["React Ringa"] = factory(root["ReactDOM"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_6__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.domNodeToNearestReactComponent = domNodeToNearestReactComponent;
exports.domNodeToNearestReactComponentDomNode = domNodeToNearestReactComponentDomNode;
exports.walkReactParents = walkReactParents;
exports.getAllReactComponentAncestors = getAllReactComponentAncestors;
exports.getAllListeningControllers = getAllListeningControllers;
exports.findComponentRoot = findComponentRoot;

var _reactDom = __webpack_require__(6);

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Walks the dom ancestors until it finds the nearest dom node that has a ref to a React Component and then
 * returns that React Component.
 *
 * @param domNode The DOM node to start with.
 * @returns {*}
 */
function domNodeToNearestReactComponent(domNode) {
  while (domNode) {
    for (var key in domNode) {
      if (key.startsWith('__reactInternalInstance$')) {
        return domNode[key]._currentElement._owner._instance;
      }
    }

    domNode = domNode.parentNode;
  }

  return null;
}

/**
 * Walks the dom ancestors until it finds the nearest dom node that has a ref to a React Component and then returns
 * that dom node.
 *
 * @param domNode The DOM node to start with.
 * @returns {*}
 */
function domNodeToNearestReactComponentDomNode(domNode) {
  while (domNode) {
    for (var key in domNode) {
      if (key.startsWith('__reactInternalInstance$')) {
        return domNode;
      }
    }

    domNode = domNode.parentNode;
  }

  return null;
}

/**
 * Walks the React Components up through the parent heirarchy.
 *
 * @param component A React Component instance.
 * @param callback A callback to call for each component in the ancestors.
 */
function walkReactParents(component, callback) {
  var ancestors = [];

  component = component._reactInternalInstance;

  while (component) {
    var item = component._instance || component._currentElement._owner._instance;

    if (ancestors.indexOf(item) === -1) {
      ancestors.push(item);
    }

    if (item.$ringaAlternateParentComponent) {
      component = item.$ringaAlternateParentComponent._reactInternalInstance;
    } else {
      component = component._hostParent;
    }
  }

  if (callback) {
    ancestors.forEach(callback);
  }

  return ancestors;
}

/**
 * Returns all Ringa.Controller instances that exist in the ancestor tree.
 *
 * @param component A React Component instance.
 * @returns {Array}
 */
function getAllReactComponentAncestors(component) {
  return walkReactParents(component);
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
  var parents = [];

  walkReactParents(component, function (c) {
    parents.push(c);
    if (c.$ringaControllers && c.$ringaControllers.length) {
      controllers = controllers.concat(c.$ringaControllers);
    }
  });

  return controllers;
}

function findComponentRoot(component, refName) {
  var domNode = void 0;

  // First look for a ref to attach to...
  if (!component.refs || !component.refs[refName]) {
    // Second use react-dom to find the root node for the component...

    domNode = _reactDom2.default.findDOMNode(component);

    if (!domNode) {
      console.warn('attach(): Error finding root DOM node for React Component ' + component.constructor.name + '. Component ref named \'' + refName + '\' does not exist and ReactDOM findDomNode(component) did not return anything. This can happen if the render() method returns null or undefined.');
    }

    return domNode;
  } else {
    domNode = component.refs[refName];
  }

  return domNode;
}

/***/ }),
/* 1 */
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

  delete reactComponent.__ringaStateQueue;
}

function queueState(reactComponent, newState) {
  if (!reactComponent.state) {
    reactComponent.state = newState;
    return;
  }

  if (!reactComponent.updater.isMounted(reactComponent)) {
    reactComponent.state = Object.assign(newState, reactComponent.state);
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
    if (true) {
      try {
        reactComponent.$ringaTriggerProperties = Object.keys(reactComponent.__ringaStateQueue);
      } catch (error) {/* TODO this was crashing... sometimes. don't really care about an error for a debugging feature too much. */}
    }
    delete reactComponent.__ringaStateQueue;
  }, 0);
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = attach;

var _util = __webpack_require__(0);

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
      refName = _ref$refName === undefined ? 'ringaRoot' : _ref$refName,
      _ref$callback = _ref.callback,
      callback = _ref$callback === undefined ? undefined : _ref$callback,
      _ref$bus = _ref.bus,
      bus = _ref$bus === undefined ? undefined : _ref$bus;

  var _componentDidMount = void 0,
      _componentWillUnmount = void 0;

  if (component.componentDidMount) {
    _componentDidMount = component.componentDidMount.bind(component);
  }

  if (component.componentWillUnmount) {
    _componentWillUnmount = component.componentWillUnmount.bind(component);
  }

  component.$ringaControllers = component.$ringaControllers || [];
  component.$ringaControllers.push(controller);

  component.componentDidMount = function () {
    var domNode = (0, _util.findComponentRoot)(component, refName);

    if (bus) {
      controller.bus = bus;
    } else if (domNode) {
      domNode.$ringaControllers = domNode.$ringaControllers || [];
      domNode.$ringaControllers.push(controller);

      controller.bus = domNode;
    } else {
      console.warn('attach(): could not find domNode to set as bus for controller ' + controller);
    }

    if (_componentDidMount) {
      _componentDidMount();
    }

    if (callback) {
      callback();
    }
  };

  component.componentWillUnmount = function () {
    var domNode = (0, _util.findComponentRoot)(component, refName);
    var ix = void 0;

    if (domNode && domNode.$ringaControllers) {
      ix = domNode.$ringaControllers.indexOf(controller);

      domNode.$ringaControllers.splice(ix, 1);
    }

    ix = component.$ringaControllers.indexOf(controller);
    component.$ringaControllers.splice(ix, 1);

    if (_componentWillUnmount) {
      _componentWillUnmount();
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
exports.dependency = dependency;
exports.find = find;
exports.depend = depend;

var _queueState = __webpack_require__(1);

var _util = __webpack_require__(0);

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

  var controllers = (0, _util.getAllListeningControllers)(reactComponent);
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
  var debug = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  var _componentWillMount = void 0,
      _componentWillUnmount = void 0,
      _componentDidMount = void 0;

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
    controllers = (0, _util.getAllListeningControllers)(component);

    if (!controllers.length) {
      console.error('react-ringa depend(): could not find any Ringa Controllers in the ancestors of ' + component.constructor.name + ', the following dependencies will NOT work: ', watches, component);

      return;
    }

    if (true && debug) {
      console.log('depend(' + component + ', ' + watches + ') found controllers:', controllers);
    }

    watches = watches instanceof Array ? watches : [watches];

    watches.forEach(function (watch) {
      var foundModels = [];

      controllers.forEach(function (controller) {
        var mw = controller.modelWatcher;

        if (mw) {
          var model = mw.find(watch.classOrId);

          if (!model) {
            return;
          }

          foundModels.push(model);

          if (foundModels.length > 1) {
            console.warn('depend(): found two models while looking for a dependency on \'' + component.constructor.name + '\'! Watch is:\n', watch, 'found these models:\n', foundModels, 'depend() looks for the closest model it can find that matches the watch criteria. This means you might have a serious error in your stack. Proceeding as normal.');

            return;
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
                var newState = {};

                changes.forEach(function (change) {
                  var state = {};
                  var prop = change.watchedModel.name;

                  if (watch.setProperty) {
                    prop = watch.setProperty; // Can specify a custom property in the dependency to set on the state for each change.
                  } else if (change.watchedPath) {
                    var _s = change.watchedPath.split('.');
                    prop = _s[_s.length - 1];
                  }

                  state[prop] = change.watchedValue;

                  newState = Object.assign(newState, state);
                });

                (0, _queueState.queueState)(component, newState);
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
                  watchedModel: model,
                  signalValue: value,
                  watchedPath: propertyPath,
                  watchedValue: value
                }]);
              }
            });
          }
        }
      });

      if (!foundModels.length) {
        if (!watch.classOrId) {
          console.error('depend(): could not the model as it was not specified!');
        } else {
          console.error('depend(): could not find the model', watch.classOrId.name, 'in any ancestor Controllers of React component', component.constructor.name, component, 'during the componentDidMount() phase. Found these instantiated and attached controllers', controllers);
        }
      }
    });

    if (_componentWillMount) {
      _componentWillMount();
    }
  };
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = watch;

var _queueState = __webpack_require__(1);

function watch(reactComponent, model) {
  var signals = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

  if (model) {
    if (!model.watch) {
      throw new Error('react-ringa watch(): the provided object is not a Ringa Model \'' + model + '\'');
    }

    var _componentWillUnmount = reactComponent.componentWillUnmount ? reactComponent.componentWillUnmount.bind(reactComponent) : undefined;

    reactComponent.$watches = reactComponent.$watches || {};

    var curHandler = reactComponent.$watches[model.id];
    if (curHandler) {
      model.unwatch(curHandler);
    }

    var handler = reactComponent.$watches[model.id] = function (signal, item, value, descriptor, path) {
      var fu = void 0;
      var found = false;
      signals.forEach(function (_signal) {
        var subSignal = _signal.split('*')[0];

        if (signal.startsWith(subSignal)) {
          found = true;
        }
      });

      if (!found && signals.length !== 0) {
        return;
      }

      if (callback) {
        fu = callback.apply(undefined, [signal, item, value, descriptor, path]);
      }

      if (fu === undefined) {
        var _o = {};
        _o[model.name] = model;
        (0, _queueState.queueState)(reactComponent, _o);
      }
    };

    var unwatch = function unwatch() {
      (0, _queueState.unqueueState)(reactComponent);

      model.unwatch(handler);
    };

    reactComponent.componentWillUnmount = function () {
      unwatch();

      if (_componentWillUnmount) {
        _componentWillUnmount();
      }
    };

    model.watch(handler);

    // Initial setup
    var o = {};
    o[model.name] = model;

    (0, _queueState.queueState)(reactComponent, o);

    return unwatch;
  }
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.domNodeToNearestReactComponentDomNode = exports.getAllReactComponentAncestors = exports.domNodeToNearestReactComponent = exports.watch = exports.getAllListeningControllers = exports.find = exports.walkReactParents = exports.dependency = exports.depend = exports.attach = undefined;

var _attach = __webpack_require__(2);

var _attach2 = _interopRequireDefault(_attach);

var _watch = __webpack_require__(4);

var _watch2 = _interopRequireDefault(_watch);

var _depend = __webpack_require__(3);

var _util = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.attach = _attach2.default;
exports.depend = _depend.depend;
exports.dependency = _depend.dependency;
exports.walkReactParents = _util.walkReactParents;
exports.find = _depend.find;
exports.getAllListeningControllers = _util.getAllListeningControllers;
exports.watch = _watch2.default;
exports.domNodeToNearestReactComponent = _util.domNodeToNearestReactComponent;
exports.getAllReactComponentAncestors = _util.getAllReactComponentAncestors;
exports.domNodeToNearestReactComponentDomNode = _util.domNodeToNearestReactComponentDomNode;
exports.default = {
  attach: _attach2.default,
  depend: _depend.depend,
  dependency: _depend.dependency,
  walkReactParents: _util.walkReactParents,
  find: _depend.find,
  getAllListeningControllers: _util.getAllListeningControllers,
  watch: _watch2.default,
  domNodeToNearestReactComponent: _util.domNodeToNearestReactComponent,
  getAllReactComponentAncestors: _util.getAllReactComponentAncestors,
  domNodeToNearestReactComponentDomNode: _util.domNodeToNearestReactComponentDomNode
};

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ })
/******/ ]);
});
//# sourceMappingURL=react-ringa.js.map