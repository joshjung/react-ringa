import attach from './attach';
import watch from './watch';
import {depend, dependency, walkReactParents, find, getAllListeningControllers} from './depend';

export {attach, depend, dependency, walkReactParents, find, getAllListeningControllers, watch};

export default {
  attach,
  depend,
  dependency,
  walkReactParents,
  find,
  getAllListeningControllers,
  watch
};
