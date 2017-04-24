import ReactDOM from 'react-dom';

export function unqueueState(reactComponent) {
  if (reactComponent.__ringaStateQueueTimeout) {
    clearTimeout(reactComponent.__ringaStateQueueTimeout);
    delete reactComponent.__ringaStateQueueTimeout;
  }

  delete reactComponent.__ringaStateQueue;
}

export function queueState(reactComponent, newState) {
  if (!reactComponent.state) {
    reactComponent.state = newState;
    return;
  }

  try {
    if (!reactComponent.updater.isMounted(reactComponent)) {
      reactComponent.state = Object.assign({}, newState, reactComponent.state);
      return;
    }
  } catch(error) {}

  reactComponent.__ringaStateQueue = reactComponent.__ringaStateQueue || {};
  reactComponent.__ringaStateQueue = Object.assign(reactComponent.__ringaStateQueue, newState);

  if (reactComponent.__ringaStateQueueTimeout) {
    return;
  }

  reactComponent.__ringaStateQueueTimeout = setTimeout(() => {
    reactComponent.__ringaStateQueueTimeout = 0;
    reactComponent.setState(reactComponent.__ringaStateQueue);
    delete reactComponent.__ringaStateQueue;
  }, 0);
}