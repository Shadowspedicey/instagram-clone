import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "@firebase/auth";
import { auth } from "../firebase";
import { startLoading, stopLoading } from "../state/actions/isLoading";
import nameLogo from "../assets/namelogo.png";
import emailVerificationIcon from "../assets/misc/email-verification.png";

const SignUpPage = () =>
{
	const emailRef = useRef();
	const passwordRef = useRef();
	const usernameRef = useRef();
	const dispatch = useDispatch();

	const [isInfoValid, setInfoValid] = useState(false);
	const [emailVerificationTime, setEmailVerificationTime] = useState(false);

	useEffect(() =>
	{
		let verificationCheck;
		if (emailVerificationTime)
		{
			verificationCheck = setInterval(async () =>
			{
				await auth.currentUser.reload();
				console.log(auth.currentUser.emailVerified);
			}, 5000);
		}
		return () => clearInterval(verificationCheck);
	}, [emailVerificationTime]);

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
		if (checkEmail() && checkPassword() && usernameRef.current.value.length > 0) setInfoValid(true);
		else setInfoValid(false);
	};

	const handleSubmit = async  e =>
	{
		if (!isInfoValid) return e.preventDefault();
		try
		{
			dispatch(startLoading());
			const { user } = await createUserWithEmailAndPassword(auth, emailRef.current.value, passwordRef.current.value);
			sendEmailVerification(user);
			setEmailVerificationTime(true);
			dispatch(stopLoading());
		} catch (err)
		{
			console.error("Error with login", err);
		}
		e.preventDefault();
	};
	useEffect(() => signOut(auth), []);

	if (!emailVerificationTime)
		return(
			<div id="signup-page">
				<div id="signup-window" className="outlined">
					<div className="logo"><img src={nameLogo} alt="Instadicey logo"></img></div>
					<span style={{fontWeight: "bold", color: "rgba(50, 50, 50, 0.5)"}}>Sign up now!</span>
					<form className="info" onSubmit={handleSubmit}>
						<input type="text" placeholder="Email" id="email" ref={emailRef} onChange={checkForm}></input>
						<input type="text" placeholder="Full Name" id="name"></input>
						<input type="text" placeholder="Username" id="username" ref={usernameRef} onChange={checkForm}></input>
						<input type="password" placeholder="Password" id="password" ref={passwordRef} onChange={checkForm}></input>
						<button id="signup" className={`${isInfoValid ? null : "disabled"}`}>Sign Up</button>
					</form>
				</div>
				<div className="extra outlined"><span>Have an account? <Link to="/" className="button">Log In</Link></span></div>
			</div>
		);
	else
		return(
			<div id="email-verification-window" className="outlined">
				<div className="icon"><img src={emailVerificationIcon} alt="email verification icon"></img></div>
				<p className="header">A verification link has been sent to your email</p>
				<p>Please click on the link sent to your email address and come back here to continue.</p>
			</div>
		);
};

export default SignUpPage;
