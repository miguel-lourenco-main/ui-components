export function getElementById(id: string): HTMLElement | null {
  return document.getElementById(id);
}

export function querySelector(selector: string): Element | null {
  return document.querySelector(selector);
}

export function querySelectorAll(selector: string): NodeListOf<Element> {
  return document.querySelectorAll(selector);
}

export function addClass(element: HTMLElement, className: string): void {
  element.classList.add(className);
}

export function removeClass(element: HTMLElement, className: string): void {
  element.classList.remove(className);
}

export function toggleClass(element: HTMLElement, className: string): void {
  element.classList.toggle(className);
}

export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className);
}

export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop,
  };
}

export function scrollToTop(smooth: boolean = true): void {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

export function scrollToElement(element: HTMLElement, smooth: boolean = true): void {
  element.scrollIntoView({
    behavior: smooth ? 'smooth' : 'auto',
    block: 'start',
  });
}

export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export function getElementOffset(element: HTMLElement): { top: number; left: number } {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset,
  };
}

