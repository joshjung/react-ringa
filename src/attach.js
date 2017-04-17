import {findComponentRoot} from './util';

/**
 * This function attaches a Ringa Controller to a specific React.Component and a selected DOM node within that component.
 *
 * Note that a Ringa controller is attached to a React Component when componentDidMount is called on the component.
 *
 * @param component The React Component to attach to.
 * @param controller The Ringa Controller to attach when a DOM node is available.
 * @param refName The React component reference name.
 * @param callback The function to call whenever the controller has been attached.
 */
export default function attach(component, controller, { refName = 'ringaRoot', callback = undefined, bus = undefined } = {}) {
  let _componentDidMount;

  if (component.componentDidMount) {
    _componentDidMount = component.componentDidMount.bind(component);
  }

  component.$ringaControllers = component.$ringaControllers || [];
  component.$ringaControllers.push(controller);

  component.componentDidMount = () => {
    let domNode = findComponentRoot(component, refName);

    if (bus) {
      controller.bus = bus;
    } else if (domNode) {
      domNode.$ringaControllers = domNode.$ringaControllers || [];
      domNode.$ringaControllers.push(controller);

      controller.bus = domNode;
    } else {
      console.warn(`attach(): could not find domNode to set as bus for controller ${controller}`);
    }

    if (_componentDidMount) {
      _componentDidMount();
    }

    if (callback) {
      callback();
    }
  };
}
