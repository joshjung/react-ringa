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
export default function attach(component, controller, { refName = 'ringaComponent', callback = undefined } = {}) {

  let _componentDidMount;

  if (component.componentDidMount) {
    _componentDidMount = component.componentDidMount.bind(component);
  }

  component.$ringaControllers = component.$ringaControllers || [];
  component.$ringaControllers.push(controller);

  component.componentDidMount = () => {
    if (!component.refs || !component.refs[refName]) {
      console.warn(`attach(): Error attaching Ringa Controller to React Component ${component.constructor.name}. Component reference named '${refName}' does not exist.`);

      return;
    }

    controller.bus = component.refs[refName];

    if (_componentDidMount) {
      _componentDidMount();
    }

    if (callback) {
      callback();
    }
  };
}
