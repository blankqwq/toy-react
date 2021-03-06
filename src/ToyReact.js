let childrenSymbol = Symbol("children")

class ElementWrapper {
    constructor(type) {
        this.type = type;
        this[childrenSymbol] = [];
        this.children = [];
        this.range = null;
        this.props = Object.create(null)
    }

    appendChild(child) {
        /*let range = document.createRange();
        if (this.root.children.length) {
            range.setStartAfter(this.root.lastChild);
            range.setEndAfter(this.root.lastChild)
        } else {
            range.setStart(this.root, 0)
            range.setEnd(this.root, 0)
        }*/
        this.children.push(child.vdom);
        this[childrenSymbol].push(child)
        // vchild.mountTo(range)
    }

    get vdom(){
        return this;
    }

    setAttribute(name, value) {
        /*if (name.match(/^on([\s\S]+)$/)) {
            let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase());
            this.root.addEventListener(eventName, value);
        }
        if (name === 'className') {
            name = 'class';
        }
        this.root.setAttribute(name, value)
         */
        this.props[name] = value;
    }

    mountTo(range) {
        this.range = range;
        let placeholder = document.createComment("placeholder")
        let endRange = document.createRange();
        endRange.setStart(range.endContainer,range.endOffset);
        endRange.setEnd(range.endContainer,range.endOffset)
        endRange.insertNode(placeholder)

        range.deleteContents();
        let element = document.createElement(this.render())
        for (let name in this.props) {
            let value = this.props[name];
            if (name.match(/^on([\s\S]+)$/)) {
                let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase());
                element.addEventListener(eventName, value);
            }
            if (name === 'className') {
                name = 'class';
            }
            element.setAttribute(name, value)
        }
        for (let child of this.children) {
            let range = document.createRange()
            if (element.children.length) {
                range.setStartAfter(element.lastChild);
                range.setEndAfter(element.lastChild)
            } else {
                range.setStart(element, 0)
                range.setEnd(element, 0)
            }
            child.mountTo(range)
        }
        range.insertNode(element)
    }

    setState(state) {
        console.log(state)
        let merge = (oldState, newState) => {
            for (let i of oldState) {
                if (typeof newState[i] === 'object') {
                    if (typeof oldState[i] !== 'object') {
                        oldState[i] = {}
                    }
                    if (Array.isArray(newState[i])) {
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
        return this.type;
    }
}

export class Component {

    constructor() {
        this.children = [];
        this.props = Object.create(null)
    }

    get type() {
        return this.constructor.name;
    }

    appendChild(child) {
        this.children.push(child)
    }

    setAttribute(name, value) {
        this[name] = value;
        this.props[name] = value;
    }

    mountTo(range) {
        this.range = range;
        this.update();
    }

    get vdom(){
        return this.render().vdom;
    }

    setState(state) {
        let merge = (oldState, newState) => {
            for (let i in newState) {
                if (typeof newState[i] === 'object') {
                    if (typeof oldState[i] !== 'object') {
                        oldState[i] = {}
                    }
                    if (Array.isArray(newState[i])) {
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
        let vdom = this.vdom;
        if (this.oldVdom) {
            // diff 算法比对
            let isSameNode = (oldNode, newNode) => {
                if (oldNode.type !== newNode.type) {
                    return false;
                }
                for (let name in oldNode.props) {
                    // if (typeof oldNode.props[name] === 'function'
                    //     && typeof newNode.props[name] === 'function'
                    //     && oldNode.props[name].toString() === newNode.props[name].toString())
                    //     continue;
                    if (typeof oldNode.props[name] === 'object'
                        && typeof newNode.props[name] === 'object'
                        && JSON.stringify(oldNode.props[name]) === JSON.stringify(newNode.props[name]))
                        continue;
                    if (oldNode.props[name] !== newNode.props[name]) {
                        console.log('a',name,oldNode.props[name],newNode.props[name])
                        return false;
                    }
                }

                return Object.keys(oldNode.props).length === Object.keys(newNode.props).length;
            }

            let isSameTree = (oldTree, newTree) => {
                if (!isSameNode(oldTree, newTree)) {
                    return false;
                }
                if (oldTree.children.length !== newTree.children.length) {
                    return false;
                }
                for (let i = 0; i < oldTree.children.length; i++) {
                    if (!isSameTree(oldTree.children[i], newTree.children[i])) {
                        return false
                    }
                }
                return true;
            }

            let replace = (newVdom, oldVdom) => {
                if (isSameTree(newVdom, oldVdom)) {
                    return;
                }
                if (!isSameNode(oldVdom, newVdom)) {
                    console.log('replace',oldVdom,newVdom)
                    newVdom.mountTo(oldVdom.range);
                } else {
                    for (let i = 0; i < newVdom.children.length; i++) {
                        replace(newVdom.children[i], oldVdom.children[i]);
                    }
                }
            }
            replace(vdom,this.oldVdom);
        } else {
            vdom.mountTo(this.range);
        }
        this.oldVdom = vdom;
        console.log(vdom)
    }

    render() {

    }
}

class TextWrapper {
    constructor(str) {
        this.children = [];
        this.props = Object.create(null)
        this.type = '#text_' + str;
        this.root = document.createTextNode(str)
    }

    mountTo(range) {
        this.range = range;
        range.deleteContents();
        range.insertNode(this.render());
    }

    get vdom() {
        return this;
    }

    render() {
        return this.root;
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

