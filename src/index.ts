import { Cocoen } from './components/cocoen';

const name = 'cocoen';
const componentName = `${name}-component`;

// Define our custom Cocoen web component
customElements.define(componentName, Cocoen);

type State = {
  cocoens: Array<Cocoen>;
};
const state: State = {
  cocoens: [],
};

const onDOMContentLoaded = () => {
  document.removeEventListener('DOMContentLoaded', onDOMContentLoaded);
};
document.addEventListener('DOMContentLoaded', onDOMContentLoaded);

export const create = (element: Element): void => {
  const component = document.createElement(componentName) as Cocoen;
  const before = element.querySelectorAll('img')[0];
  const after = element.querySelectorAll('img')[1];
  before.setAttribute('slot', 'before');
  after.setAttribute('slot', 'after');
  component.append(before.cloneNode(true));
  component.append(after.cloneNode(true));
  element.replaceWith(component);

  state.cocoens.push(component);
};

export const parse = (context: HTMLElement): void => {
  const elements = [...context.querySelectorAll(`.${name}`)];
  elements.map((element) => create(element));
};
