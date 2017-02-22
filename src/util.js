/**
 * Walks the dom ancestors until it finds the nearest dom node that has a ref to a React Component and then
 * returns that React Component.
 *
 * @param domNode The DOM node to start with.
 * @returns {*}
 */
export function domNodeToNearestReactComponent(domNode) {
  while (domNode) {
    for (let key in domNode) {
      if (key.startsWith('__reactInternalInstance$')) {
        return domNode[key]._currentElement._owner._instance;
      }
    }

    domNode = domNode.parentNode;
  }

  return null;
}

/**
 * Walks the dom ancestors until it finds the nearest dom node that has a ref to a React Component and then returns
 * that dom node.
 *
 * @param domNode The DOM node to start with.
 * @returns {*}
 */
export function domNodeToNearestReactComponentDomNode(domNode) {
  while (domNode) {
    for (let key in domNode) {
      if (key.startsWith('__reactInternalInstance$')) {
        return domNode;
      }
    }

    domNode = domNode.parentNode;
  }

  return null;
}

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

  if (callback) {
    ancestors.forEach(callback);
  }

  return ancestors;
};

/**
 * Returns all Ringa.Controller instances that exist in the ancestor tree.
 *
 * @param component A React Component instance.
 * @returns {Array}
 */
export function getAllReactComponentAncestors(component) {
  return walkReactParents(component);
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