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
export function dependency(classOrId, propertyPath = undefined, setOnState = true, setOnComponent = false) {
  return {
    classOrId,
    propertyPath,
    setOnState,
    setOnComponent
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

    watches.forEach(watch => {
      let foundModels = [];

      controllers.forEach(controller => {
        let mw = controller.modelWatcher;

        if (mw) {
          let model = mw.find(watch.classOrId);

          if (!model) {
            return;
          }

          foundModels.push(model);

          if (foundModels.length > 1) {
            console.warn(`depend(): found two models while looking for a dependency on '${component.constructor.name}'! Watch is:\n`, watch, `found these models:\n`, foundModels, `depend() looks for the closest model it can find that matches the watch criteria. This means you might have a serious error in your stack. Proceeding as normal.`);
          }

          // By default the model we are requesting automatically gets set on the state no matter what for
          // easy access. However, we don't watch the entire model because that would be silliness. Each view
          // component should request the specific signals it wants to watch.
          let s = {};
          s[watch.setProperty || model.name] = model;
          queueState(component, s);

          let value, changeHandler;

          // If the user is just asking for the model (no propertyPath), we can skip all the watching jargon.
          if (watch.propertyPath) {

            let pp = watch.propertyPath instanceof Array ? watch.propertyPath : [watch.propertyPath];

            pp.forEach(propertyPath => {
              value = mw.find(watch.classOrId, propertyPath);

              // Create Change Handler. Note we do not use an arrow function here to save memory.
              changeHandler = function (watch, changes) {
                let skipUpdate = handler ? handler(changes) : undefined;

                if (skipUpdate === undefined && watch.setOnState) {
                  let newState = {};

                  changes.forEach(change => {
                    let state = {};
                    let prop = change.model.name;

                    if (watch.setProperty) {
                      prop = watch.setProperty; // Can specify a custom property in the dependency to set on the state for each change.
                    } if (change.watchedPath) {
                      try {
                        let s = change.watchedPath.split('.');
                        prop = s[s.length - 1];
                      } catch (error) {
                        console.error(`depend(): property was updated but watched path was invalid. watchedPath was:`, change.watchedPath);
                      }
                    }

                    state[prop] = change.watchedValue;

                    newState = Object.assign(newState, state);
                  });

                  queueState(component, newState);
                }
              }.bind(undefined, watch);

              mw.watch(watch.classOrId, propertyPath, changeHandler);

              if (changeHandler) {
                changeHandler([{
                  model,
                  value,
                  watchedPath: propertyPath,
                  watchedValue: value
                }]);
              }
            });
          }
        }
      });

      if (!foundModels.length) {
        console.error(`depend(): could not find the model`, watch.classOrIdOrArray.name, `in any ancestor Controllers of React component`, component.constructor.name, component, `during the componentDidMount() phase. Found these instantiated and attached controllers`, controllers);
      }
    });

    if (_componentWillMount) {
      _componentWillMount();
    }
  };
}
