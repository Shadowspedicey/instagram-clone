import { Route, Switch } from "react-router";
import Navbar from "./Navbar";

const Logged = () =>
{
	return(
		<div>
			<Route path="/" component={Navbar}></Route>
			<Switch>

			</Switch>
		</div>
	);
};

export default Logged;
