import {getAllListeningControllers, getAllReactComponentAncestors} from './util';

/**
 * Returns a context object with debugging information starting with a reactComponent.
 *
 * @param domNode
 * @returns {{}}
 */
export function inspectReactComponent(reactComponent) {
  let controllers = getAllListeningControllers(reactComponent);
  let ancestors = getAllReactComponentAncestors(reactComponent);

  return {
    ancestors,
    controllers
  };
}