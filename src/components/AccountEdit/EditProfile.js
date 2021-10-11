import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { auth, db, storage } from "../../firebase";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "@firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "@firebase/storage";
import { setSnackbar } from "../../state/actions/snackbar";
import Loading from "../../assets/misc/loading.jpg";
import { EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification, updateEmail } from "@firebase/auth";
import { setUser } from "../../state/actions/currentUser";

const EditProfile = () =>
{
	const dispatch = useDispatch();
	const currentUser = useSelector(state => state.currentUser);
	const [isInfoValid, setIsInfoValid] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isPhotoLoading, setIsPhotoLoading] = useState(false);
	const [isPhotoChangerBoxOpen, setIsPhotoChangerBoxOpen] = useState(false);

	const uploadRef = useRef();
	const nameRef = useRef();
	const usernameRef = useRef();
	const bioRef = useRef();
	const emailRef = useRef();
	const confirmPasswordRef = useRef();

	const openPhotoBox = () => currentUser.info.defaultProfilePic ? openPhotoUpload() : setIsPhotoChangerBoxOpen(true);
	const closePhotoBox = () => setIsPhotoChangerBoxOpen(false);
	const removePhoto = async () =>
	{
		closePhotoBox();
		setIsPhotoLoading(true);
		await updateDoc(doc(db, "users", currentUser.user.uid), { profilePic: "https://firebasestorage.googleapis.com/v0/b/instadicey.appspot.com/o/default%2FprofilePic.jpg?alt=media&token=3ac835a3-016e-470a-b7b3-f898d82cdbde", defaultProfilePic: true });
		await updateUserLocally();
		setIsPhotoLoading(false);
	};
	const openPhotoUpload = () => uploadRef.current.click();
	const uploadPhoto = async input =>
	{
		try
		{
			const uploadedPhoto = input.target.files[0];
			if (!uploadedPhoto)
				throw new Error("No photo uploaded");
			const acceptedFormats = uploadRef.current.accept.split(", ");
			if (!acceptedFormats.includes(uploadedPhoto.type))
			  throw new Error("Not a supported photo format");
			closePhotoBox();
			setIsPhotoLoading(true);
			const photoRef = ref(storage, `users/${currentUser.user.uid}/profilePic`);
			await uploadBytes(photoRef, uploadedPhoto);
			const uploadedPhotoURL = await getDownloadURL(photoRef);
			await updateDoc(doc(db, "users", currentUser.user.uid), { profilePic: uploadedPhotoURL, defaultProfilePic: false });
			await updateUserLocally();
			uploadRef.current.value = "";
			setIsPhotoLoading(false);
			dispatch(setSnackbar("Photo updated successfully", "success"));
		} catch (err)
		{
			console.error(err);
			if (err.message === "No photo uploaded")
				return null;
			if (err.message === "Not a supported photo format")
				return dispatch(setSnackbar("Not a supported photo format.", "error"));
			dispatch(setSnackbar("Oops, please try again later.", "error"));
		}
	};

	const handleChange = () => isInfoValid ? null : setIsInfoValid(true);

	const handleNameChange = async realName =>
	{
		return realName;
	};

	const handleUsernameChange = async username =>
	{
		if (username.length > 20) throw new Error("Username too long");
		if (username.trim() === "") throw new Error("Username not entered");
		if (!username.match(/^[A-Za-z0-9]*$/)) throw new Error("Username not English");
		const usersRef = collection(db, "users");
		const q = query(usersRef, where("username", "==", username));
		const querySnapshot = await getDocs(q);
		if (querySnapshot.docs.length !== 0)
			throw new Error("Username already taken");
		return username;
	};

	const handleBioChange = async bio =>
	{
		if (bio.length > 150) throw new Error("Bio too long");
		return bio;
	};

	const handleEmailChange = async (email, password) =>
	{
		if (email.trim() === "") throw new Error("Email can't be empty");
		// eslint-disable-next-line no-control-regex
		if (!email.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))
			throw new Error("Email is invalid");
		if (password.trim() === "") throw new Error("Password can't be empty");
		const credentials = EmailAuthProvider.credential(currentUser.user.email, password);
		try
		{
			await reauthenticateWithCredential(auth.currentUser, credentials);
		} catch (err)
		{
			throw new Error(err.code);
		}
		return email;
	};

	const handleSubmit = async e =>
	{
		e.preventDefault();
		if (!isInfoValid) return;
		setIsLoading(true);
		try
		{
			let realName = currentUser.info.realName;
			let username = currentUser.info.username;
			let bio = currentUser.info.bio;
			let email = currentUser.user.email;

			if (realName !== nameRef.current.value) realName = await handleNameChange(nameRef.current.value);
			if (username !== usernameRef.current.value) username = await handleUsernameChange(usernameRef.current.value);
			if (bio !== bioRef.current.value) bio = await handleBioChange(bioRef.current.value);
			if (email !== emailRef.current.value) email = await handleEmailChange(emailRef.current.value, confirmPasswordRef.current.value);

			await updateDoc(doc(db, "users", currentUser.user.uid),
				{
					realName,
					username,
					bio,
				});
			if (currentUser.user.email !== email)
			{
				try
				{
					await updateEmail(auth.currentUser, email);
					await updateDoc(doc(db, "users", currentUser.user.uid), { email });
					await sendEmailVerification(auth.currentUser);
				} catch (err) { throw new Error(err.code); }
			}
			dispatch(setSnackbar("Info updated.", "success"));
			window.location.reload(false);
		} catch (err)
		{
			console.error(err.message);
			setIsLoading(false);
			if (err.message === "Username not entered")
				return dispatch(setSnackbar("Username can't be empty.", "error"));
			if (err.message === "Username too long")
				return dispatch(setSnackbar("Username too long. max is 20 characters.", "error"));
			if (err.message === "Username not English")
				return dispatch(setSnackbar("English letters only.", "error"));
			if (err.message === "Username already taken")
				return dispatch(setSnackbar("Username already taken.", "error"));
			if (err.message === "Bio too long")
				return dispatch(setSnackbar("Bio is too long. max is 150 characters.", "error"));
			if (err.message === "Email can't be empty")
				return dispatch(setSnackbar("Email can't be empty.", "error"));
			if (err.message === "Email is invalid")
				return dispatch(setSnackbar("Email is invalid.", "error"));
			if (err.message === "Password can't be empty")
				return dispatch(setSnackbar("Please confirm your password.", "error"));
			if (err.message === "auth/email-already-in-use")
				return dispatch(setSnackbar("Email already in use."));
			if (err.message === "auth/wrong-password")
				return dispatch(setSnackbar("Wrong password.", "error"));
			dispatch(setSnackbar("Oops, please try again later.", "error"));
		}
		setIsLoading(false);
	};

	const updateUserLocally = async () =>
	{
		const info = await getDoc(doc(db, "users", currentUser.user.uid)).then(doc => doc.data());
		dispatch(setUser({ user: auth.currentUser, info }));
	};

	if (!currentUser) return null;
	return(
		<div className="account-element edit-profile">
			{ isPhotoChangerBoxOpen &&
					<div className="dialog-box-container" onClick={closePhotoBox}>
						<div className="dialog-box" onClick={e => e.stopPropagation()}>
							<h2>Change Profile Photo</h2>
							<button className="upload text" onClick={openPhotoUpload}>Upload Photo</button>
							<button className="remove text" onClick={removePhoto}>Remove Current Photo</button>
							<button className="cancel text" onClick={closePhotoBox}>Cancel</button>
						</div>
					</div>
			}
			<div className="element profile-pic-container">
				<div className="img-container outlined left" onClick={openPhotoBox}>
					{ isPhotoLoading && <div className="loading"><img src={Loading} alt="loading"></img></div>}
					<img src={currentUser.info.profilePic} alt={`${currentUser.info.username}'s profile pic'`}></img>
					<input id="photo" type="file" accept="image/png, image/jpg, image/jpeg, image/pjpeg, image/jfif, image/pjp" style={{display: "none"}} ref={uploadRef} onChange={uploadPhoto}></input>
				</div>
				<div className="right">
					{currentUser.info.username}
					<button className="text" onClick={openPhotoBox}>Change Profile Photo</button>
				</div>
			</div>
			<form onSubmit={handleSubmit}>
				<div className="element">
					<label htmlFor="name" className="left">Name</label>
					<div className="right">
						<input type="text" id="name" defaultValue={currentUser.info.realName} placeholder="Name" ref={nameRef} className="outlined" onChange={handleChange}></input>
						<p>Help people discover your account by using the name you're known by: either your full name, nickname, or business name.</p>
					</div>
				</div>
				<div className="element">
					<label htmlFor="username" className="left">Username</label>
					<div className="right">
						<input type="text" id="username" defaultValue={currentUser.info.username} placeholder="Username" ref={usernameRef} className="outlined" onChange={handleChange}></input>
					</div>
				</div>
				<div className="element">
					<label htmlFor="bio" className="left">Bio</label>
					<div className="right">
						<textarea id="bio" defaultValue={currentUser.info.bio} ref={bioRef} className="outlined" onChange={handleChange}></textarea>
					</div>
				</div>
				<div className="element info">
					<span className="left"></span>
					<div className="right">
						<p className="header">Personal Information</p>
						<p>Provide your personal information, even if the account is used for a business, a pet or something else. This won't be a part of your public profile.</p>
					</div>
				</div>
				<div className="element">
					<label htmlFor="email" className="left">Email</label>
					<div className="right">
						<input type="text" id="email" defaultValue={currentUser.user.email} placeholder="Email" ref={emailRef} className="outlined" onChange={handleChange}></input>
						{ !emailRef.current || currentUser.user.email === emailRef.current.value
							? null 
							: <input type="password" id="password" placeholder="Confirm Password" ref={confirmPasswordRef} className="outlined"></input>
						}
					</div>
				</div>
				<div className="element">
					<div className="left"></div>
					{
						isLoading
							? <button className="loading"><div><img src={Loading} alt="loading"></img></div></button>
							: <button className={`submit ${isInfoValid ? null : "disabled"}`}>Submit</button>
					}
				</div>
			</form>
		</div>
	);
};

export default EditProfile;
