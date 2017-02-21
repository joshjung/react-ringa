import {queueState, unqueueState} from './queueState';

export default function watch(reactComponent, model, callback) {
  if (model) {
    if (!model.watch) {
      throw new Error(`react-ringa watch(): the provided object is not a Ringa Model '${model}'`);
    }

    let _componentWillUnmount = reactComponent.componentWillUnmount ? reactComponent.componentWillUnmount.bind(reactComponent) : undefined;

    let handler = (path) => {
      let fu;

      if (callback) {
        fu = callback.apply(undefined, [path]);
      }

      if (fu === undefined) {
        let o = {};
        o[model.name] = model;
        queueState(reactComponent, o);
      }
    };

    reactComponent.componentWillUnmount = () => {
      unqueueState(reactComponent);

      model.unwatch(handler);

      if (_componentWillUnmount) {
        _componentWillUnmount();
      }
    };

    model.watch(handler);

    // Initial setup
    let o = {};
    o[model.name] = model;

    queueState(reactComponent, o);
  }
}