import { useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { auth, db } from "../firebase";
import { signOut } from "@firebase/auth";
import { collection, deleteField, doc, getDoc, getDocs, serverTimestamp,  updateDoc } from "@firebase/firestore";
import OutsideClickHandler from "react-outside-click-handler";
import { useMediaQuery } from "react-responsive";
import { startLoading, stopLoading } from "../state/actions/isLoading";
import { setSnackbar } from "../state/actions/snackbar";
import { setNewPost } from "../state/actions/newPost";
import nameLogo from "../assets/namelogo.png";
import Logo from "../assets/logo.png";
import Loading from "../assets/misc/loading.jpg";

const Navbar = () =>
{
	const history = useHistory();
	const dispatch = useDispatch();
	const addPostButton = useRef();
	const { username, profilePic } = useSelector(state => state.currentUser.info) || "";
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [playDropdownClose, setPlayDropdownClose] = useState(false);
	const phoneQuery = useMediaQuery({query: "(max-width: 600px)"});

	const handleNewPostChange = input =>
	{
		const postPhoto = input.target.files[0];
		addPostButton.current.value = null;
		dispatch(setNewPost(postPhoto));
		history.push("/create/style");
	};

	const openDropdown = () => setIsDropdownOpen(true);
	const closeDropdown = e =>
	{
		e.stopPropagation();
		setPlayDropdownClose(true);
		setTimeout(() => { setIsDropdownOpen(false); setPlayDropdownClose(false); }, 125);
	};
	
	const logOut = async () =>
	{
		dispatch(startLoading());
		await signOut(auth);
		history.push("/");
		dispatch(stopLoading());
	};

	return(
		<nav id="main-navbar">
			<div className="logo"><Link to="/"><img src={phoneQuery ? Logo : nameLogo} alt="Instadicey"></img></Link></div>
			<li><Searchbar/></li>
			<ul>
				<li><button className="add-post icon" onClick={() => addPostButton.current.click()}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"/></svg></button></li>
				<input accept="image/png, image/jpg, image/jpeg, image/pjpeg, image/jfif, image/pjp" type="file" ref={addPostButton} onChange={handleNewPostChange}></input>
				<li><Link to="/" className="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3zm-1-5.907v-5.093h-3v2.093l3 3z"/></svg></Link></li>
				<li><Link to="/direct/inbox" className="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z"/></svg></Link></li>
				<li className="profile" onClick={openDropdown}>
					<div className="icon"><img src={profilePic} alt="Profile Pic"></img></div>
					{ isDropdownOpen &&
						<div>
							<div className="dropdown-container" onClick={closeDropdown}></div>
							<div className={`dropdown outlined ${playDropdownClose ? "closed" : ""}`}>
								<span className="arrow"></span>
								<ul>
									<li>
										<Link to={`/${username}`} onClick={closeDropdown}>
											<svg className="icon" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm8.127 19.41c-.282-.401-.772-.654-1.624-.85-3.848-.906-4.097-1.501-4.352-2.059-.259-.565-.19-1.23.205-1.977 1.726-3.257 2.09-6.024 1.027-7.79-.674-1.119-1.875-1.734-3.383-1.734-1.521 0-2.732.626-3.409 1.763-1.066 1.789-.693 4.544 1.049 7.757.402.742.476 1.406.22 1.974-.265.586-.611 1.19-4.365 2.066-.852.196-1.342.449-1.623.848 2.012 2.207 4.91 3.592 8.128 3.592s6.115-1.385 8.127-3.59zm.65-.782c1.395-1.844 2.223-4.14 2.223-6.628 0-6.071-4.929-11-11-11s-11 4.929-11 11c0 2.487.827 4.783 2.222 6.626.409-.452 1.049-.81 2.049-1.041 2.025-.462 3.376-.836 3.678-1.502.122-.272.061-.628-.188-1.087-1.917-3.535-2.282-6.641-1.03-8.745.853-1.431 2.408-2.251 4.269-2.251 1.845 0 3.391.808 4.24 2.218 1.251 2.079.896 5.195-1 8.774-.245.463-.304.821-.179 1.094.305.668 1.644 1.038 3.667 1.499 1 .23 1.64.59 2.049 1.043z"/></svg>
											Profile
										</Link>
									</li>
									<li>
										<Link to={`/${username}/saved`} onClick={closeDropdown}>
											<svg className="icon" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M5 0v24l7-6 7 6v-24h-14zm1 1h12v20.827l-6-5.144-6 5.144v-20.827z"/></svg>
											Saved
										</Link>
									</li>
									<li>
										<Link to="/accounts/edit" onClick={closeDropdown}>
											<svg className="icon" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M12 8.666c-1.838 0-3.333 1.496-3.333 3.334s1.495 3.333 3.333 3.333 3.333-1.495 3.333-3.333-1.495-3.334-3.333-3.334m0 7.667c-2.39 0-4.333-1.943-4.333-4.333s1.943-4.334 4.333-4.334 4.333 1.944 4.333 4.334c0 2.39-1.943 4.333-4.333 4.333m-1.193 6.667h2.386c.379-1.104.668-2.451 2.107-3.05 1.496-.617 2.666.196 3.635.672l1.686-1.688c-.508-1.047-1.266-2.199-.669-3.641.567-1.369 1.739-1.663 3.048-2.099v-2.388c-1.235-.421-2.471-.708-3.047-2.098-.572-1.38.057-2.395.669-3.643l-1.687-1.686c-1.117.547-2.221 1.257-3.642.668-1.374-.571-1.656-1.734-2.1-3.047h-2.386c-.424 1.231-.704 2.468-2.099 3.046-.365.153-.718.226-1.077.226-.843 0-1.539-.392-2.566-.893l-1.687 1.686c.574 1.175 1.251 2.237.669 3.643-.571 1.375-1.734 1.654-3.047 2.098v2.388c1.226.418 2.468.705 3.047 2.098.581 1.403-.075 2.432-.669 3.643l1.687 1.687c1.45-.725 2.355-1.204 3.642-.669 1.378.572 1.655 1.738 2.1 3.047m3.094 1h-3.803c-.681-1.918-.785-2.713-1.773-3.123-1.005-.419-1.731.132-3.466.952l-2.689-2.689c.873-1.837 1.367-2.465.953-3.465-.412-.991-1.192-1.087-3.123-1.773v-3.804c1.906-.678 2.712-.782 3.123-1.773.411-.991-.071-1.613-.953-3.466l2.689-2.688c1.741.828 2.466 1.365 3.465.953.992-.412 1.082-1.185 1.775-3.124h3.802c.682 1.918.788 2.714 1.774 3.123 1.001.416 1.709-.119 3.467-.952l2.687 2.688c-.878 1.847-1.361 2.477-.952 3.465.411.992 1.192 1.087 3.123 1.774v3.805c-1.906.677-2.713.782-3.124 1.773-.403.975.044 1.561.954 3.464l-2.688 2.689c-1.728-.82-2.467-1.37-3.456-.955-.988.41-1.08 1.146-1.785 3.126"/></svg>
											Settings
										</Link>
									</li>
									<li className="log-out" onClick={() => { logOut(); }}>
										Log Out
									</li>
								</ul>
							</div>
						</div>
					}
				</li>
			</ul>
		</nav>
	);
};

const Searchbar = () =>
{
	const dispatch = useDispatch();
	const currentUser = useSelector(state => state.currentUser);
	const [isLoading, setIsLoading] = useState(false);
	const [usersCache, setUsersCache] = useState(null);
	const [options, setOptions] = useState([]);
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");

	const addToRecentSearches = async uid =>
	{
		await updateDoc(doc(db, "users", currentUser.user.uid),
			{
				["recentSearches." + uid]: {uid, timestamp: serverTimestamp()},
			});
	};

	const showRecentSearches = async () =>
	{
		try
		{
			setIsLoading(true);
			const unformattedRecentSearches = await getDoc(doc(db, "users", currentUser.user.uid)).then(doc => Object.values(doc.data().recentSearches));
			unformattedRecentSearches.sort((a, b) => a.timestamp.seconds < b.timestamp.seconds ? 1 : -1);
			const recentSearches = await Promise.all(unformattedRecentSearches.map(async user => await getDoc(doc(db, "users", user.uid)).then(doc => doc.data())));
			setOptions(recentSearches);
			setIsLoading(false);
		} catch (err)
		{
			console.error(err);
			dispatch(setSnackbar("Oops, try again later.", "error"));
		}
	};
	
	const removeFromRecentSearches = async (e, uid) =>
	{
		e.stopPropagation();
		e.preventDefault();
		
		try
		{
			setOptions(options.filter(option => option.uid !== uid));
			await updateDoc(doc(db, "users", currentUser.user.uid),
				{
					["recentSearches." + uid]: deleteField(),
				});
		} catch (err)
		{
			console.error(err);
		}
	};
	
	const clearRecentSearches = () =>
	{
		try
		{
			setOptions([]);
			updateDoc(doc(db, "users", currentUser.user.uid), {recentSearches: []});
		} catch (err)
		{
			console.error(err);
			dispatch(setSnackbar("Oops, try again later.", "error"));
		}
	};
	
	const handleInputChange = async (e) =>
	{
		const newInput = e.target.value;
		setInputValue(newInput);
		if (newInput === "") return showRecentSearches();
		
		setIsLoading(true);
		let users = usersCache || [];
		if (users.length === 0)
		{
			try
			{
				const querySnapshot = await getDocs(collection(db, "users"));
				querySnapshot.docs.forEach(doc => users.push(doc.data()));
				setUsersCache(users);
			} catch (err)
			{
				console.error(err);
				dispatch(setSnackbar("Oops, try again later.", "error"));
			}
		}
		users = users.filter(user => user.username.includes(newInput)).slice(0, 15);
		setOptions(users);
		setIsLoading(false);
	};

	const handleOnOpen = () =>
	{
		setOpen(true);
		if (inputValue !== "") return;
		showRecentSearches();
	};
	const handleOnClose = () => setOpen(false);

	const handleElementClick = uid =>
	{
		setOpen(false);
		setInputValue("");
		addToRecentSearches(uid);
	};

	return (
		<OutsideClickHandler onOutsideClick={handleOnClose}>
			<div className="searchbar-container">
				<input 
					className="search"
					placeholder="Search"
					onFocus={handleOnOpen}
					onChange={handleInputChange}
					value={inputValue}
				/>
				{
					open
						?
						<div>
							<span className="arrow"></span>
							<ul className="search-list outlined">
								{inputValue === "" && !isLoading ? <div className="recent">Recent<button className="text" onClick={clearRecentSearches}>Clear All</button></div> : null}
								{
									isLoading
										? <div className="loading"><img src={Loading} alt="loading..."></img></div>
										:
										options.map(option =>
											(
												<li key={option.username}>
													<Link to={`/${option.username}`} onClick={() => handleElementClick(option.uid)}>
														<div className="img-container outlined round"><img src={option.profilePic} alt={`${option.username}'s Profile Pic'`}></img></div>
														<div className="info">
															<div style={{display: "flex"}}><span className="username">{option.username}</span> {option.verified ? <div className="verified" title="Verified"></div> : null}</div>
															<span className="real-name">{option.realName}</span>
														</div>
														<div className="remove" onClick={e => removeFromRecentSearches(e, option.uid)}><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16"><path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/></svg></div>
													</Link>
												</li>
											))
								}
							</ul>
						</div>
						: null
				}
			</div>
		</OutsideClickHandler>
	);
};

export default Navbar;
