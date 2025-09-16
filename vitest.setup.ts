import '@testing-library/jest-dom';

// Polyfills that some components might expect in jsdom
class ResizeObserver {
    callback: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
        this.callback = cb;
    }
    observe() { }
    unobserve() { }
    disconnect() { }
}

// Assign polyfill on jsdom global without using `any`
declare global {
    interface Window {
        ResizeObserver: typeof ResizeObserver;
    }
}

// Cast window to allow assignment in jsdom
(window as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = ResizeObserver;
