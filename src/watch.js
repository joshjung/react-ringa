import {queueState, unqueueState} from './queueState';

export default function watch(reactComponent, model, signals = [], callback = undefined) {
  if (model) {
    if (!model.watch) {
      throw new Error(`react-ringa watch(): the provided object is not a Ringa Model '${model}'`);
    }

    let _componentWillUnmount = reactComponent.componentWillUnmount ? reactComponent.componentWillUnmount.bind(reactComponent) : undefined;

    reactComponent.$watches = reactComponent.$watches || {};

    let curHandler = reactComponent.$watches[model.id];
    if (curHandler) {
      model.unwatch(curHandler);
    }

    let handler = reactComponent.$watches[model.id] = (signal, item, value, descriptor, path) => {
      let fu;
      let found = false;
      signals.forEach(_signal => {
        let subSignal = _signal.split('*')[0];

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
        let o = {};
        o[model.name] = model;
        queueState(reactComponent, o);
      }
    };

    let unwatch = () => {
      unqueueState(reactComponent);

      model.unwatch(handler);
    };

    reactComponent.componentWillUnmount = () => {
      unwatch();

      if (_componentWillUnmount) {
        _componentWillUnmount();
      }
    };

    model.watch(handler);

    // Initial setup
    let o = {};
    o[model.name] = model;

    queueState(reactComponent, o);

    return unwatch;
  }
}