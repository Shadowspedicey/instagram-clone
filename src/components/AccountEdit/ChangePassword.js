import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "@firebase/auth";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loading from "../../assets/misc/loading.jpg";
import { auth } from "../../firebase";
import { setSnackbar } from "../../state/actions/snackbar";

const ChangePassword = () =>
{
	const currentUser = useSelector(state => state.currentUser);
	const dispatch = useDispatch();
	const [isInfoValid, setIsInfoValid] = useState(null);
	const [isLoading, setIsLoading] = useState(null);

	const oldPasswordRef = useRef();
	const newPasswordRef = useRef();
	const confirmPasswordRef = useRef();

	const handleOnChange = () =>
		oldPasswordRef.current.value.length > 0
		&& newPasswordRef.current.value.length > 0
		&& confirmPasswordRef.current.value.length > 0
			?	setIsInfoValid(true)
			: setIsInfoValid(false);

	const handleSubmit = async e =>
	{
		e.preventDefault();
		if (!isInfoValid) return;
		
		try
		{
			setIsLoading(true);
			const oldPassword = oldPasswordRef.current.value;
			const newPassword = newPasswordRef.current.value;
			const confirmPassword = confirmPasswordRef.current.value;
			if (newPassword !== confirmPassword) throw new Error("Password don't match");
			if (newPassword.length < 6) throw new Error("Password too short");

			try
			{
				const credentials = EmailAuthProvider.credential(currentUser.user.email, oldPassword);
				await reauthenticateWithCredential(auth.currentUser, credentials);
				await updatePassword(auth.currentUser, newPassword);
				dispatch(setSnackbar("Password updated successfully.", "success"));
				window.location.reload(false);
			} catch (err) { throw new Error(err.code); }
			setIsLoading(false);
		} catch(err)
		{
			setIsLoading(false);
			console.error(err.message);
			if (err.message === "Password don't match")
				return dispatch(setSnackbar("Please make sure both password match.", "error"));
			if (err.message === "Password too short")
				return dispatch(setSnackbar("Password is too short. minimum is 6 characters.", "error"));
			if (err.message === "auth/wrong-password")
				return dispatch(setSnackbar("Your old password is not correct.", "error"));
			dispatch(setSnackbar("Oops, please try again later.", "error"));
		}
	};

	if (!currentUser) return null;
	return(
		<div className="account-element change-password">
			<div className="element profile-pic">
				<div className="img-container outlined left">
					<img src={currentUser.info.profilePic} alt={`${currentUser.info.username}'s profile pic'`}></img>
				</div>
				<div className="right">
					{currentUser.info.username}
				</div>
			</div>
			<form onSubmit={handleSubmit}>
				<div className="element">
					<div className="left">
						<label htmlFor="old-password">Old Password</label>
					</div>
					<div className="right">
						<input type="password" id="old-password" className="outlined" ref={oldPasswordRef} onChange={handleOnChange}></input>
					</div>
				</div>
				<div className="element">
					<div className="left">
						<label htmlFor="new-password">New Password</label>
					</div>
					<div className="right">
						<input type="password" id="new-password" className="outlined" ref={newPasswordRef} onChange={handleOnChange}></input>
					</div>
				</div>
				<div className="element">
					<div className="left">
						<label htmlFor="confirm-password">Confirm New Password</label>
					</div>
					<div className="right">
						<input type="password" id="confirm-password" className="outlined" ref={confirmPasswordRef} onChange={handleOnChange}></input>
					</div>
				</div>
				<div className="element">
					<div className="left"></div>
					{
						isLoading
							? <button className="loading"><div><img src={Loading} alt="loading"></img></div></button>
							: <button className={`submit ${isInfoValid ? null : "disabled"}`}>Change Password</button>
					}
				</div>
				<div className="element">
					<div className="left"></div>
					<Link to="/accounts/password/reset" className="forgot-password">Forgot Password?</Link>
				</div>
			</form>
		</div>
	);
};

export default ChangePassword;
