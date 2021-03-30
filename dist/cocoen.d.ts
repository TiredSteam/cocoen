// Generated by dts-bundle-generator v5.8.0

export declare type CustomEventPayload = {
	bubbles: boolean;
	composed: boolean;
	detail: {
		elementWidth: number;
		openRatio: number;
		rendered: boolean;
	};
};
declare class Cocoen extends HTMLElement {
	private drag;
	private shadowDOM;
	private debouncedUpdateDimensions;
	private onClickHandler;
	private onDragEndHandler;
	private onDragHandler;
	private onDragStartHandler;
	private colorValue;
	private dragElementWidthValue;
	private elementWidthValue;
	private isDraggingValue;
	private openRatioValue;
	private rendered;
	private xValue;
	constructor();
	get x(): number;
	set x(value: number);
	get elementWidth(): number;
	set elementWidth(value: number);
	get dragElementWidth(): number;
	set dragElementWidth(value: number);
	get isDragging(): boolean;
	set isDragging(value: boolean);
	get openRatio(): number;
	set openRatio(value: number);
	get color(): string;
	set color(value: string);
	static get observedAttributes(): Array<string>;
	attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
	connectedCallback(): void;
	disconnectedCallback(): void;
	render(): void;
	updateDimensions(): void;
	updateStyles(): void;
	onDragStart(): void;
	onDrag(event: MouseEvent | TouchEvent): void;
	onDragEnd(): void;
	onClick(event: MouseEvent): void;
	calculateOpenRatio(activeX: number): string;
	customEventPayload(): CustomEventPayload;
}
export declare const create: (element: Element) => Cocoen;
export declare const parse: (context: HTMLElement) => void;

export {};
