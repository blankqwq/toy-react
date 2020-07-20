class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type)
    }

    appendChild(vchild) {
        vchild.mountTo(this.root)
    }

    setAttribute(name, value) {
        this.root.setAttribute(name, value)
    }

    mountTo(parent) {
        parent.appendChild(this.render());
    }

    render() {
        return this.root;
    }
}

export class Component {

    setAttribute(name, value) {
        this[name] = value;
    }

    mountTo(parent) {
        parent.appendChild(this.render());
    }
}

class TextWrapper {
    constructor(str) {
        this.vdom = document.createTextNode(str)
    }

    mountTo(parent) {
        parent.appendChild(this.render());
    }

    render() {
        return this.vdom;
    }
}


export let ToyReact = {
    createElement(type, attrributes, ...children) {
        let element;
        if (typeof type !== 'string') {
            element = new type();
        } else {
            element = new ElementWrapper(type);
        }
        for (let name in attrributes) {
            element.setAttribute(name, attrributes[name]);
        }
        let insertChildren = (children) => {
            for (let child of children) {
                if (Array.isArray(child)) {
                    insertChildren(child)
                } else {
                    if (!(child instanceof Component) &&
                        !(child instanceof ElementWrapper) &&
                        !(child instanceof TextWrapper)) {
                        child = String(child)
                    }
                    if (typeof child === 'string') {
                        child = new TextWrapper(child)
                    }
                    element.appendChild(child);
                }
            }
        }
        insertChildren(children);
        return element;
    },

    render(compent, element) {
        compent.mountTo(element)
    }
}

