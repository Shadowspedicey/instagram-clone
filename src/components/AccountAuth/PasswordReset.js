import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "@firebase/auth";
import ErrorMsg from "./ErrorMsg";
import Lock from "../../assets/misc/lock.png";
import greenCheckmark from "../../assets/misc/green-checkmark.png";
import { useSelector } from "react-redux";

const PasswordReset = () =>
{
	const currentUser = useSelector(state => state.currentUser);
	const emailRef = useRef();
	const [isInfoValid, setIsInfoValid] = useState(false);
	const [isEmailSent, setIsEmailSent] = useState(false);
	const [errorMsg, setErrorMsg] = useState(null);

	useEffect(() => document.title = "Reset Password • Instadicey", []);

	const checkEmail = () =>
	{
		const emailValue = emailRef.current.value;
		if (emailValue === "") return setIsInfoValid(false);
		// eslint-disable-next-line no-control-regex
		else if (!emailValue.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))
			return setIsInfoValid(false);
		else return setIsInfoValid(true);
	};

	const handleSubmit = async e =>
	{
		e.preventDefault();
		if (!isInfoValid) return;

		const email = emailRef.current.value;
		try
		{
			setErrorMsg(null);
			await sendPasswordResetEmail(auth, email);
			setIsEmailSent(true);
		}
		catch (err)
		{
			if (err.code === "auth/user-not-found")
				setErrorMsg("User not found");
			console.error("Error with password reset", err);
		}
	};

	if (isEmailSent)
	{
		return(
			<div className="password-reset-window success outlined">
				<div className="icon"><img src={greenCheckmark} alt="Success"></img></div>
				<h1>Email sent</h1>
				<p>Check your inbox and spam and follow the instructions</p>
				<div className="extra">
					<Link to="/">Back To Login</Link>
				</div>
			</div>
		);
	} else
	{
		return(
			<div className="password-reset-window outlined">
				<div className="icon"><img src={Lock} alt="locked out"></img></div>
				<h1>Can't Log In?</h1>
				<p>It's all good, mate. just enter your email and we'll send you an email to reset your password right away!</p>
				{ errorMsg ? <ErrorMsg text={errorMsg}/> : null }
				<form onSubmit={handleSubmit}>
					<input type="text" id="email" placeholder="Email" ref={emailRef} onChange={checkEmail}></input>
					<button id="reset" className={`${isInfoValid ? null : "disabled"}`}>Send Email</button>
				</form>
				{ !currentUser &&
					<div className="extra outlined">
						<Link to="/">Back To Login</Link>
					</div>
				}
			</div>
		);
	}
};

export default PasswordReset;
