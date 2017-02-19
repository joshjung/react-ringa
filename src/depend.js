import queueState from './queueState';

/**
 * Walks the React Components up through the parent heirarchy.
 *
 * @param component A React Component instance.
 * @param callback A callback to call for each component in the ancestors.
 */
export function walkReactParents(component, callback) {
  let ancestors = [];

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

  ancestors.forEach(callback)

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
export function dependency(classOrId, propertyPath, setOnState = true) {
  return {
    classOrId,
    propertyPath,
    setOnState
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
export function find(reactComponent, classOrId, propertyPath = undefined) {
  let controllers = getAllListeningControllers(reactComponent);
  let value;

  for (let i = 0; i < controllers.length; i++) {
    let controller = controllers[i];
    let mw = controller.modelWatcher;

    if (mw) {
      let value = mw.find(classOrId, propertyPath);

      if (value) {
        return value;
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
export function getAllListeningControllers(component) {
  let controllers = [];

  walkReactParents(component, c => {
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
export function depend(component, watches, handler = undefined) {
  let _componentWillMount;

  if (component.componentWillMount) {
    _componentWillMount = component.componentWillMount.bind(component);
  }

  if (component.state === undefined) {
    component.state = {};
  }

  component.componentWillMount = () => {
    let controllers = getAllListeningControllers(component);

    if (!controllers.length) {
      console.error(`react-ringa depend(): could not find any Ringa Controllers in the ancestors of ${component.constructor.name}, the following dependencies will NOT work: `, watches, component);

      return;
    }

    watches = watches instanceof Array ? watches : [watches];

    let notifications = [];

    watches.forEach(watch => {
      controllers.forEach(controller => {
        let mw = controller.modelWatcher;
        if (mw) {
          // TODO aggregate so that we don't call watch twice.
          let model = mw.find(watch.classOrId);
          let value = mw.find(watch.classOrId, watch.propertyPath);

          // Create Change Handler
          let changeHandler = function(watch, changes) {
            let newState = {};

            let skipUpdate = undefined;

            if (handler) {
              skipUpdate = handler(changes);
            }

            if (skipUpdate === undefined && watch.setOnState) {
              changes.forEach(change => {

                let state = {};
                let prop = change.model.name;
                if (change.setProp) {
                  prop = change.setProp;
                } else if (change.watchedPath) {
                  let s = change.watchedPath.split('.');
                  prop = s[s.length - 1];
                }

                state[prop] = change.watchedValue;

                newState = Object.assign(newState, state);
              });

              queueState(component, newState);
            }
          }.bind(undefined, watch);

          // Handle initial property value
          if (model !== undefined && value !== null) {
            notifications.push({
              model,
              value
            });

            changeHandler([{
              model,
              value,
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
