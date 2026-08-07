export function createElement(tag, attrs = {}, children = null) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') el.className = value;
    else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
    else el.setAttribute(key, value);
  }
  if (children !== null && children !== undefined) {
    if (typeof children === 'string' || typeof children === 'number') {
      el.textContent = String(children);
    } else if (Array.isArray(children)) {
      children.forEach(c => {
        if (c instanceof Node) el.appendChild(c);
        else if (c !== null) el.appendChild(document.createTextNode(String(c)));
      });
    } else if (children instanceof Node) {
      el.appendChild(children);
    } else {
      el.textContent = String(children);
    }
  }
  return el;
}

export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}