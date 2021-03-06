export function unqueueState(reactComponent) {
  if (reactComponent.__ringaStateQueueTimeout) {
    clearTimeout(reactComponent.__ringaStateQueueTimeout);
    delete reactComponent.__ringaStateQueueTimeout;
  }

  delete reactComponent.__ringaStateQueue;
}

export function queueState(reactComponent, newState, inComponentWillMount = false) {
  if (!reactComponent.state) {
    reactComponent.state = newState;
    return;
  }

  if (!reactComponent.updater.isMounted(reactComponent)) {
    if (inComponentWillMount) {
      for (let key in newState) {
        reactComponent.state[key] = newState[key];
      }
    } else {
      let ns = Object.assign(newState, reactComponent.state);
      reactComponent.state = ns;
    }

    return;
  }

  reactComponent.__ringaStateQueue = reactComponent.__ringaStateQueue || {};
  reactComponent.__ringaStateQueue = Object.assign(reactComponent.__ringaStateQueue, newState);

  if (reactComponent.__ringaStateQueueTimeout) {
    return;
  }

  reactComponent.__ringaStateQueueTimeout = setTimeout(() => {
    let before;
    if (__DEV__) {
      before = new Date().getTime();
    }
    reactComponent.__ringaStateQueueTimeout = 0;
    reactComponent.setState(reactComponent.__ringaStateQueue);
    if (__DEV__) {
      if (new Date().getTime() - before > 100) {
        console.warn('react-ringa __DEV__: component update took longer than 100 milliseconds, consider improving the following component:', reactComponent, 'newState being assigned was: ', newState);
      }
      try {
        reactComponent.$ringaTriggerProperties = Object.keys(reactComponent.__ringaStateQueue);
      } catch (error) { /* TODO this was crashing... sometimes. don't really care about an error for a debugging feature too much. */}
    }
    delete reactComponent.__ringaStateQueue;
  }, 0);
}