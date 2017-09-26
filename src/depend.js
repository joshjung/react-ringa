import {queueState, unqueueState} from './queueState';
import {getAllListeningControllers} from './util';

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
export function depend(component, watches, handler = undefined, debug = false) {
  let _componentWillMount, _componentWillUnmount, _componentDidMount;

  if (component.componentWillMount) {
    _componentWillMount = component.componentWillMount.bind(component);
  }

  if (component.componentWillUnmount) {
    _componentWillUnmount = component.componentWillUnmount.bind(component);
  }

  if (component.state === undefined) {
    component.state = {};
  }

  let controllers;
  let mws = [];

  component.componentWillUnmount = () => {
    unqueueState(component);

    /**
     * When the component unmounts we want to unwatch everything.
     */
    mws.forEach(mwGroup => {
      mwGroup.mw.unwatch(mwGroup.classOrId, mwGroup.propertyPath, mwGroup.changeHandler);
    });

    if (_componentWillUnmount) {
      _componentWillUnmount();
    }
  };

  component.componentWillMount = () => {
    controllers = getAllListeningControllers(component);

    if (!controllers.length) {
      console.error(`react-ringa depend(): could not find any Ringa Controllers in the ancestors of ${component.constructor.name}, the following dependencies will NOT work: `, watches, component);

      return;
    }

    if (__DEV__ && debug) {
      console.log(`depend(${component}, ${watches}) found controllers:`, controllers);
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

            return;
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

            // Create Change Handler. Note we do not use an arrow function here to save memory.
            changeHandler = function (watch, changes) {
              let skipUpdate = handler ? handler(changes) : undefined;

              if (skipUpdate === undefined && watch.setOnState) {
                let newState = {};

                changes.forEach(change => {
                  let state = {};
                  let prop = change.watchedModel.name;

                  if (watch.setProperty) {
                    prop = watch.setProperty; // Can specify a custom property in the dependency to set on the state for each change.
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

            pp.forEach(propertyPath => {
              value = mw.find(watch.classOrId, propertyPath);

              mws.push({
                mw,
                classOrId: watch.classOrId,
                propertyPath,
                changeHandler
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
          console.error(`depend(): could not the model as it was not specified!`);
        } else {
          console.error(`depend(): could not find the model`, watch.classOrId.name, `in any ancestor Controllers of React component`, component.constructor.name, component, `during the componentDidMount() phase. Found these instantiated and attached controllers`, controllers);
        }
      }
    });

    if (_componentWillMount) {
      _componentWillMount();
    }
  };
}
