class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type)
    }

    appendChild(vchild) {
        let range = document.createRange();
        if (this.root.children.length) {
            range.setStartAfter(this.root.lastChild);
            range.setEndAfter(this.root.lastChild)
        } else {
            range.setStart(this.root, 0)
            range.setEnd(this.root, 0)
        }
        vchild.mountTo(range)
    }

    setAttribute(name, value) {
        if (name.match(/^on([\s\S]+)$/)) {
            let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase());
            this.root.addEventListener(eventName, value);
        }
        if (name === 'className') {
            name = 'class';
        }
        this.root.setAttribute(name, value)
    }

    mountTo(range) {
        this.range = range;
        range.insertNode(this.render())
    }

    setState(state) {
        console.log(state)
        let merge = (oldState, newState) => {
            for (let i of oldState) {
                if (typeof newState[i] === 'object') {
                    if (typeof oldState[i] !== 'object') {
                        oldState[i] = {}
                    }
                    if (Array.isArray(newState[i])){
                        oldState[i] = newState[i];
                    }
                    merge(oldState[i], newState[i])
                } else {
                    oldState[i] = newState[i]
                }
            }
        }
        if (!this.state) {
            this.state = {}
        }
        merge(this.state, state)
        this.update();
    }

    update() {

    }

    render() {
        return this.root;
    }
}

export class Component {

    constructor() {
        this.children = [];
        this.props = Object.create(null)
    }

    appendChildren(child) {
        this.children.push(child)
    }

    setAttribute(name, value) {
        this[name] = value;
        this.props[name] = value;
    }

    mountTo(range) {
        this.range = range;
        this.update();
        // range.insertNode(this.render())
    }

    setState(state) {
        let merge = (oldState, newState) => {
            for (let i in newState) {
                if (typeof newState[i] === 'object') {
                    if (typeof oldState[i] !== 'object') {
                        oldState[i] = {}
                    }
                    if (Array.isArray(newState[i])){
                        oldState[i] = newState[i];
                    }
                    merge(oldState[i], newState[i])
                } else {
                    oldState[i] = newState[i]
                }
            }
        }
        if (!this.state && state) {
            this.state = {}
        }
        merge(this.state, state)
        this.update();
    }

    update() {
        let placeholder = document.createElement('placeholder');
        let range = document.createRange();
        range.setStart(this.range.endContainer, this.range.endOffset);
        range.setEnd(this.range.endContainer, this.range.endOffset);
        range.insertNode(placeholder);

        this.range.deleteContents();

        let vdom = this.render();
        vdom.mountTo(this.range);
    }

    render() {

    }
}

class TextWrapper {
    constructor(str) {
        this.vdom = document.createTextNode(str)
    }

    mountTo(range) {
        range.deleteContents();
        range.insertNode(this.render());
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
        let range = document.createRange();
        if (element.children.length) {
            range.setStartAfter(element.lastChild);
            range.setEndAfter(element.lastChild)
        } else {
            range.setStart(element, 0)
            range.setEnd(element, 0)
        }
        compent.mountTo(range)
    }
}

