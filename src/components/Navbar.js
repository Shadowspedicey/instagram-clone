import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import nameLogo from "../assets/namelogo.png";
import { signOut } from "@firebase/auth";
import { auth } from "../firebase";

const Navbar = () =>
{
	const { username, profilePic } = useSelector(state => state.currentUser.info) || "";

	return(
		<nav id="main-navbar">
			<div className="logo"><Link to="/"><img src={nameLogo} alt="Instadicey"></img></Link></div>
			<li><input className="search" placeholder="Search"></input></li>
			<ul>
				<li><Link to="/"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3zm-1-5.907v-5.093h-3v2.093l3 3z"/></svg></Link></li>
				<li><Link to="/inbox"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z"/></svg></Link></li>
				<li><Link to={`${username}`}><div className="profile icon" onClick={() => signOut(auth)}><img src={profilePic} alt="ass"></img></div></Link></li>
			</ul>
		</nav>
	);
};

export default Navbar;
