export const maybeClassName = (className?: string) =>
  className ? ` ${className}` : "";

export const silence_event: EventListener = e => {
  e.preventDefault();
  e.stopPropagation();
};
