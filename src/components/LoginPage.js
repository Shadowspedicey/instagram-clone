import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { auth } from "../firebase";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../state/actions/isLoading";
import { setUser } from "../state/actions/currentUser";
import nameLogo from "../assets/namelogo.png";
import "../styles/login.css";

const LoginPage = () =>
{
	const emailRef = useRef();
	const passwordRef = useRef();
	const dipsatch = useDispatch();

	const [isInfoValid, setInfoValid] = useState(false);

	const checkEmail = () =>
	{
		const emailValue = emailRef.current.value.trim();
		if (emailValue === "") return false;
		// eslint-disable-next-line no-control-regex
		else if (!emailValue.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))
			return false;
		else return true;
	};

	const checkPassword = () =>
	{
		const passwordValue = passwordRef.current.value;
		return passwordValue.length < 6 ? false : true;
	};

	const checkForm = () =>
	{
		if (checkEmail() && checkPassword()) setInfoValid(true);
		else setInfoValid(false);
	};

	const handleSubmit = async  e =>
	{
		if (!isInfoValid) return e.preventDefault();
		try
		{
			dipsatch(startLoading());
			const user = await signInWithEmailAndPassword(auth, emailRef.current.value, passwordRef.current.value);
			dipsatch(stopLoading());
			dipsatch(setUser(user));
		} catch (err)
		{
			console.error(err);
		}
		e.preventDefault();
	};

	return(
		<div id="login-page">
			<div id="login-window" className="outlined">
				<div className="logo"><img src={nameLogo} alt="Instadicey logo"></img></div>
				<form className="info" onSubmit={handleSubmit}>
					<input placeholder="Email" id="email" ref={emailRef} onChange={checkForm}></input>
					<input type="password" placeholder="Password" id="password" ref={passwordRef} onChange={checkForm}></input>
					<button id="login" className={`${isInfoValid ? null : "disabled"}`}>Log In</button>
				</form>
				<Link to="accounts/password-reset">Forgot password?</Link>
			</div>
			<div id="login-window-create" className="outlined"><span>Don't have an account? <Link to="accounts/create-email" className="signup">Sign Up</Link></span></div>
		</div>
	);
};

export default LoginPage;
