/**
 * model won't dispatch events
 * view will dispatch events named "controller"
 * controller will dispatch events named "model" or "view"
 */
import Dict from "../interfaces/Dict";
import ee from "../util/ee";

export type Message = Dict & { _method: string };
export type MessageDispatcher = (method: string, arg?: Dict) => void;

export const model: Dict = {};

export const view: Dict & { dispatch: MessageDispatcher } = {
  dispatch(method: string, arg?: Dict) {
    ee.emit("controller", { ...arg, _method: method });
  }
};

export const controller: Dict & {
  mutate: MessageDispatcher;
  render: MessageDispatcher;
} = {
  mutate(method: string, arg?: Dict) {
    ee.emit("model", { ...arg, _method: method });
  },

  render(method: string, arg?: Dict) {
    ee.emit("view", { ...arg, _method: method });
  }
};

const mvc: {
  model: Dict;
  view: Dict & { dispatch: MessageDispatcher };
  controller: Dict & {
    mutate: MessageDispatcher;
    render: MessageDispatcher;
  };
} = { model, view, controller };

export default mvc;

for (let k in mvc) {
  if (mvc.hasOwnProperty(k)) {
    const layer = k as "model" | "view" | "controller";
    ee.on(layer, function (arg: Message) {
      const { _method } = arg;
      if (typeof mvc[layer][_method] == "function") {
        mvc[layer][_method](arg);
      }
    });
  }
}
