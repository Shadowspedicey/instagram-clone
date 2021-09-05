import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./state";
import App from "./App";
import "./styles/index.css";

ReactDOM.render(
	<Router>
		<Provider store={store}>
			<React.StrictMode>
				<App />
			</React.StrictMode>
		</Provider>
	</Router>,
	document.getElementById("root")
);
