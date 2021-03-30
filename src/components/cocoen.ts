import { componentName } from '../config';
import { calculateElementWidth } from '../utils/calculate-element-width';
import { calculateOpenRatio } from '../utils/calculate-open-ratio';
import { calculateXfromEvent } from '../utils/calculate-x-from-event';
import { debounce } from '../utils/debounce';
import { formatPercentageAsString } from '../utils/format-percentage-as-string';

const css = `
  :host {
    box-sizing: border-box;
    cursor: pointer;
    display: block;
    overflow: hidden;
    position: relative;
    user-select: none;
  }

  :host *,
  :host *:after,
  :host *:before {
    box-sizing: inherit;
  }

  #before {
    height: 100%;
    left: 0;
    overflow: hidden;
    position: absolute;
    top: 0;
    width: 50%;
  }

  #drag {
    background: var(--color, #fff);
    bottom: 0;
    cursor: ew-resize;
    left: 50%;
    margin-left: -1px;
    position: absolute;
    top: 0;
    width: 2px;
  }

  #drag:before {
    border: 3px solid var(--color, #fff);
    content: '';
    height: 30px;
    left: 50%;
    margin-left: -7px;
    margin-top: -15px;
    position: absolute;
    top: 50%;
    width: 14px;
  }

  ::slotted(img) {
    max-height: 100%;
    object-fit: contain;
  }

  ::slotted(img[slot=before]) {
    max-width: none;
  }

  ::slotted(img[slot=after]) {
    display: block;
    max-width: 100%;
    width: 100%;
  }
`;

type CustomEventPayload = {
  bubbles: boolean;
  composed: boolean;
  detail: {
    elementWidth: number;
    openRatio: number;
    rendered: boolean;
  };
};

export class Cocoen extends HTMLElement {
  private drag: HTMLElement | null;

  private shadowDOM: ShadowRoot;

  private debouncedUpdateDimensions: () => void;

  private onClickHandler: (event: MouseEvent) => void;

  private onDragEndHandler: (event: MouseEvent | TouchEvent) => void;

  private onDragHandler: (event: MouseEvent | TouchEvent) => void;

  private onDragStartHandler: (event: MouseEvent | TouchEvent) => void;

  private colorValue = '#fff';

  private dragElementWidthValue = 0;

  private elementWidthValue = 0;

  private isDraggingValue = false;

  private openRatioValue = 50;

  private rendered = false;

  private xValue = 0;

  constructor() {
    super();

    this.drag = null;
    this.shadowDOM = this.attachShadow({ mode: 'closed' });

    this.onDragStartHandler = () => this.onDragStart();

    this.onDragEndHandler = () => this.onDragEnd();
    this.onDragHandler = (event: MouseEvent | TouchEvent) => this.onDrag(event);
    this.onClickHandler = (event: MouseEvent) => this.onClick(event);

    this.debouncedUpdateDimensions = debounce(() => {
      this.updateDimensions();
    }, 250);
  }

  get x(): number {
    return this.xValue;
  }

  set x(value: number) {
    this.xValue = value;

    window.requestAnimationFrame(() => {
      this.openRatio = calculateOpenRatio({
        x: this.xValue,
        dragElementWidth: this.dragElementWidth,
        hostElementWidth: this.elementWidth,
      });
    });
  }

  get elementWidth(): number {
    return this.elementWidthValue;
  }

  set elementWidth(value: number) {
    this.elementWidthValue = value;
  }

  get dragElementWidth(): number {
    return this.dragElementWidthValue;
  }

  set dragElementWidth(value: number) {
    this.dragElementWidthValue = value;
  }

  get isDragging(): boolean {
    return this.isDraggingValue;
  }

  set isDragging(value: boolean) {
    this.isDraggingValue = value;
  }

  get openRatio(): number {
    return this.openRatioValue;
  }

  set openRatio(value: number) {
    this.openRatioValue = value;

    window.requestAnimationFrame(() => {
      this.updateStyles();
    });
  }

  get color(): string {
    return this.colorValue;
  }

  set color(value: string) {
    this.colorValue = value;

    window.requestAnimationFrame(() => {
      this.style.setProperty('--color', this.color);
    });
  }

  static get observedAttributes(): Array<string> {
    return ['start', 'color'];
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string,
  ): void {
    if (oldValue === newValue) {
      return;
    }

    if (name === 'start') {
      this.openRatio = Number.parseInt(String(this.getAttribute('start')), 10);
    }

    if (name === 'color') {
      this.color = String(this.getAttribute('color'));
    }
  }

  connectedCallback(): void {
    if (this.rendered) {
      return;
    }

    this.render();
    this.rendered = true;

    this.dispatchEvent(
      new CustomEvent(`${componentName}:rendered`, this.customEventPayload()),
    );

    this.drag = this.shadowDOM.querySelector('#drag');

    this.updateDimensions();

    this.addEventListener('mousedown', this.onDragStartHandler, {
      passive: true,
    });
    this.addEventListener('touchstart', this.onDragStartHandler, {
      passive: true,
    });
    this.addEventListener('mousemove', this.onDragHandler, { passive: true });
    this.addEventListener('touchmove', this.onDragHandler, { passive: true });
    this.addEventListener('click', this.onClickHandler, { passive: true });

    window.addEventListener('resize', this.debouncedUpdateDimensions, {
      passive: true,
    });
    window.addEventListener('mouseup', this.onDragEndHandler, {
      passive: true,
    });
    window.addEventListener('touchend', this.onDragEndHandler, {
      passive: true,
    });
  }

  disconnectedCallback(): void {
    this.removeEventListener('mousedown', this.onDragStartHandler);
    this.removeEventListener('touchstart', this.onDragStartHandler);
    this.removeEventListener('mousemove', this.onDragHandler);
    this.removeEventListener('touchmove', this.onDragHandler);
    this.removeEventListener('click', this.onClickHandler);

    window.removeEventListener('resize', this.debouncedUpdateDimensions);
    window.removeEventListener('mouseup', this.onDragEndHandler);
    window.removeEventListener('touchend', this.onDragEndHandler);
  }

  render(): void {
    this.shadowDOM.innerHTML = `
      <style>${css}</style>
      <div id="before">
        <slot name="before"></slot>
      </div>
      <slot name="after"></slot>
      <div id="drag" part="drag"></div>
    `;
  }

  updateDimensions(): void {
    this.elementWidth = calculateElementWidth(this);

    if (this.drag) {
      this.dragElementWidth = calculateElementWidth(this.drag);
    }

    this.dispatchEvent(
      new CustomEvent(`${componentName}:resized`, this.customEventPayload()),
    );
  }

  updateStyles(): void {
    const before = this.shadowDOM.querySelector('#before') as HTMLElement;
    const drag = this.shadowDOM.querySelector('#drag') as HTMLElement;
    const openRatio = formatPercentageAsString(this.openRatio);

    before.style.width = openRatio;
    drag.style.left = openRatio;

    this.dispatchEvent(
      new CustomEvent(`${componentName}:updated`, this.customEventPayload()),
    );
  }

  onDragStart(): void {
    this.isDragging = true;
  }

  onDrag(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) {
      return;
    }

    this.x = calculateXfromEvent(event, this);
  }

  onDragEnd(): void {
    this.isDragging = false;
  }

  onClick(event: MouseEvent): void {
    this.x = calculateXfromEvent(event, this);
  }

  calculateOpenRatio(activeX: number): string {
    let value = activeX;
    if (activeX < 0) {
      value = this.dragElementWidth;
    } else if (activeX >= this.elementWidth) {
      value = this.elementWidth - this.dragElementWidth;
    }

    let ratio = value + this.dragElementWidth / 2;
    ratio /= this.elementWidth;
    return `${ratio * 100}%`;
  }

  customEventPayload(): CustomEventPayload {
    return {
      bubbles: true,
      composed: true,
      detail: {
        elementWidth: this.elementWidth,
        openRatio: this.openRatio,
        rendered: this.rendered,
      },
    };
  }
}

// Define our custom Cocoen web component
customElements.define(componentName, Cocoen);
