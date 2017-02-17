export default function watch(reactComponent, model, callback) {
  if (model) {
    if (!model.watch) {
      throw new Error(`react-ringa watch(): the provided object is not a Ringa Model '${model}'`);
    }

    model.watch((path) => {
      reactComponent.forceUpdate();

      if (callback) {
        callback.apply(undefined, [path]);
      }
    });
  }
}