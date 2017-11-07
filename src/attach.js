import {findComponentRoot} from './util';
import {Controller, Model} from 'ringa';

/**
 * This function attaches a Ringa Controller or Model to a specific React.Component and a selected DOM node within that component.
 *
 * Note that a Ringa controller is attached to a React Component when componentDidMount is called on the component.
 *
 * If you provide a Ringa Model, then a dummy Controller is built and the Model is added to that controller before the Controller is
 * attached to the view.
 *
 * @param component The React Component to attach to.
 * @param controller The Ringa Controller to attach when a DOM node is available.
 * @param refName The React component reference name.
 * @param callback The function to call whenever the controller has been attached.
 */
export default function attach(component, controllerOrModel, { refName = 'ringaRoot', callback = undefined, bus = undefined } = {}) {
  let _componentDidMount, _componentWillUnmount;

  let controller;

  if (controllerOrModel instanceof Model) {
    controller = new Controller();
    controller.addModel(controllerOrModel);
  } else {
    controller = controllerOrModel;
  }

  if (component.componentDidMount) {
    _componentDidMount = component.componentDidMount.bind(component);
  }

  if (component.componentWillUnmount) {
    _componentWillUnmount = component.componentWillUnmount.bind(component);
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

  component.componentWillUnmount = () => {
    let domNode = findComponentRoot(component, refName);
    let ix;

    if (domNode && domNode.$ringaControllers) {
      ix = domNode.$ringaControllers.indexOf(controller);

      domNode.$ringaControllers.splice(ix, 1);
    }

    ix = component.$ringaControllers.indexOf(controller);
    component.$ringaControllers.splice(ix, 1);

    if (_componentWillUnmount) {
      _componentWillUnmount();
    }
  }
}
