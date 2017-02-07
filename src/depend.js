/**
 * Walks the React Components up through the parent heirarchy.
 *
 * @param component A React Component instance.
 * @param callback A callback to call for each component in the ancestors.
 */
export let walkReactParents = function(component, callback) {
  while (component) {
    callback(component);

    try {
      component = component._currentElement._owner._instance;
    } catch (e) {
      component = null;
    }
  }
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
 * @param component A React Component instance.
 * @param classOrId A Class that extends Ringa.Model or a string id of a model you are looking for.
 * @param propertyPath A dot-delimited path into a property on the model. Or undefined if you want the model itself.
 * @returns {*}
 */
export function find(component, classOrId, propertyPath = undefined) {
  let controllers = getAllListeningControllers(component);
  let value;

  for (let i = 0; i < controllers.length; i++) {
    let controller = controllers[i];
    let mw = controller.modelWatcher;

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
  let controllers = getAllListeningControllers(component);

  watches = watches instanceof Array ? watches : [watches];

  let notifications = [];

  watches.forEach(watch => {
    controllers.forEach(controller => {
      let mw = controller.modelWatcher;
      if (mw) {
        let model = mw.find(watch.classOrId);
        let value = mw.find(watch.classOrId, watch.propertyPath);

        if (model && value) {
          notifications.push({
            model,
            value
          });
        }

        let changeHandler = function(watch, change) {
          change = change[0];

          if (watch.setOnState) {
            let state = {};
            let prop = change.model.id;
            if (change.watchedPath) {
              let s = change.watchedPath.split('.');
              prop = s[s.length-1];
            }
            state[prop] = change.watchedValue;
            component.setState(state);
          }
        }.bind(undefined, watch);

        mw.watch(watch.classOrId, watch.propertyPath, changeHandler);
      }
    });
  });

  if (notifications && notifications.length && handler) {
    handler(notifications);
  }

  return notifications;
}
