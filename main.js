import {ToyReact, Component} from "./src/ToyReact";

class MyElement extends Component {
    render() {
        return 'as';
    }
}

var a = <a id="ss">
    <span>
        <p>hello</p>
    </span>
    <span>world</span>
    <span>!</span>
    <span>!</span>
</a>


ToyReact.render(a,document.body)