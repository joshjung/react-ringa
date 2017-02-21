import {queueState, unqueueState} from './queueState';

export default function watch(reactComponent, model, callback) {
  if (model) {
    if (!model.watch) {
      throw new Error(`react-ringa watch(): the provided object is not a Ringa Model '${model}'`);
    }

    let _componentWillUnmount = reactComponent.componentWillUnmount ? reactComponent.componentWillUnmount.bind(reactComponent) : undefined;

    reactComponent.componentWillUnmount = () => {
      unqueueState(reactComponent);

      if (_componentWillUnmount) {
        _componentWillUnmount();
      }
    };
    model.watch((path) => {
      let fu;

      if (callback) {
        fu = callback.apply(undefined, [path]);
      }

      if (fu === undefined) {
        let o = {};
        o[model.name] = model;
        queueState(reactComponent, o);
      }
    });

    // Initial setup
    let o = {};
    o[model.name] = model;

    queueState(reactComponent, o);
  }
}