import { useEffect } from "react";
import { Route } from "react-router";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "@firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { stopLoading } from "./state/actions/isLoading";
import { setUser } from "./state/actions/currentUser";
import LoadingPage from "./components/LoadingPage";
import LoginPage from "./components/LoginPage";
import Logged from "./components/Logged";
import "./styles/App.css";

const App = () =>
{
	const isLoggedIn = useSelector(state => state.currentUser);
	const isLoading = useSelector(state => state.loading);
	const dispatch = useDispatch();

	const checkIfLoggedIn = () =>
	{
		onAuthStateChanged(auth, user =>
		{
			if (user)
			{
				dispatch(setUser(user));
				dispatch(stopLoading());
			}
			else
			{
				dispatch(setUser(null));
				dispatch(stopLoading());
			}
		});
	};
	useEffect(() => signOut(auth), []);
	useEffect(checkIfLoggedIn, [dispatch]);

	return (
		<div className="App">
			<Route exact path="/">
				{
					isLoading
						? <LoadingPage/>
						: isLoggedIn
							? <Logged/>
							: <LoginPage/>
				}
			</Route>
		</div>
	);
};

export default App;
