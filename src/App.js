import { Route, Switch } from "react-router";
import Navbar from "./components/Navbar";
import "./styles/App.css";

function App() {
	return (
		<div className="App">
			<Route path="/" component={Navbar}></Route>
			<Switch>

			</Switch>
		</div>
	);
};

export default App;
