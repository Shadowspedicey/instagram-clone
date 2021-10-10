import { collection, getDocs, query, where } from "@firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useParams } from "react-router";
import { Link, NavLink } from "react-router-dom";
import { db } from "../firebase";
import { startLoading, stopLoading } from "../state/actions/isLoading";
import FollowButton from "./FollowButton";
import FollowWindow from "./FollowWindow";
import PostCard from "./Posts/PostCard";
import "./user-profile.css";
import VerifiedTick from "./Verified";

const UserProfile = () =>
{
	const { username } = useParams();

	const dispatch = useDispatch();
	const currentUser = useSelector(state => state.currentUser);
	const [userInfo, setUserInfo] = useState(null);
	const [userPosts, setUserPosts] = useState([]);
	const [isFollowingListWindowOpen, setIsFollowingListWindowOpen] = useState(false);
	const [isFollowersListWindowOpen, setIsFollowersListWindowOpen] = useState(false);
	const closeFollowListWindow = () =>
	{
		setIsFollowingListWindowOpen(false);
		setIsFollowersListWindowOpen(false);
	};

	const getUserInfo = async () =>
	{
		const usersRef = collection(db, "users");
		const q = query(usersRef, where("username", "==", username));
		const querySnapshot = await getDocs(q);
		return querySnapshot;
	};

	const getUsersPosts = async uid =>
	{
		const querySnapshot = await getDocs(collection(db, "users", uid, "user_posts"));
		const posts = querySnapshot.docs.map(doc => doc.data());
		return posts;
	};

	useEffect(() =>
	{
		closeFollowListWindow();

		const fetchUserInfo = async () =>
		{
			dispatch(startLoading());
			const querySnapshot = await getUserInfo();
			const userData = querySnapshot.docs[0].data();
			if (querySnapshot.size === 1) setUserInfo(userData);
			else setUserInfo(null);
			const posts = await getUsersPosts(userData.uid);
			setUserPosts(posts);
			dispatch(stopLoading());
		};
		fetchUserInfo();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [username]);
	useEffect(() =>
	{
		if (!userInfo) return;
		userInfo.realName
			?	document.title = `${userInfo.realName} (@${userInfo.username}) • Instadicey`
			: document.title = `@${userInfo.username} • Instadicey`;
	}, [userInfo]);

	if (!userInfo || !currentUser) return <div>not found</div>;
	else return(
		<div className="user-profile">
			{ isFollowingListWindowOpen
				? <FollowWindow title="Following" uids={userInfo.following} closeFollowListWindow={closeFollowListWindow}/>
				: isFollowersListWindowOpen
					? <FollowWindow title="Followers" uids={userInfo.followers} closeFollowListWindow={closeFollowListWindow}/>
					: null
			}
			<div className="upper">
				<div className="personal-info">
					<div className="profile-pic"><img src={userInfo.profilePic} alt={`${username}'s profile pic`}></img></div>
					<div className="info">
						<div className="name">
							{userInfo.username}
							<VerifiedTick user={userInfo}/>
							{ currentUser
								? userInfo.uid === currentUser.info.uid
									? <Link to="/accounts/edit" className="edit-profile-btn outlined">Edit Profile</Link>
									: <FollowButton target={userInfo}/>
								: <FollowButton target={userInfo}/>
							}
						</div>
						<div className="follow">
							<span className="posts"><span className="number">{userPosts.length}</span> posts</span>
							<span className="followers" onClick={() => setIsFollowersListWindowOpen(true)}><span className="number">{userInfo.followers.length}</span> followers</span>
							<span className="following" onClick={() => setIsFollowingListWindowOpen(true)}><span className="number">{userInfo.following.length}</span> following</span>
						</div>
						<div className="bio">
							<span className="real-name">{userInfo.realName}</span>
							<div className="bio-text">{userInfo.bio}</div>
						</div>
					</div>
				</div>
			</div>
			<nav>
				<ul>
					<li><NavLink exact to={`/${userInfo.username}`} activeClassName="selected"><svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24"><path d="M6 6h-6v-6h6v6zm9-6h-6v6h6v-6zm9 0h-6v6h6v-6zm-18 9h-6v6h6v-6zm9 0h-6v6h6v-6zm9 0h-6v6h6v-6zm-18 9h-6v6h6v-6zm9 0h-6v6h6v-6zm9 0h-6v6h6v-6z"/></svg> POSTS</NavLink></li>
					{currentUser.user.uid === userInfo.uid && <li><NavLink exact to={`/${userInfo.username}/saved`} activeClassName="selected"><svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24"><path d="M16 2v17.582l-4-3.512-4 3.512v-17.582h8zm2-2h-12v24l6-5.269 6 5.269v-24z"/></svg> SAVED</NavLink></li>}
				</ul>
			</nav>
			<Switch>
				<Route exact path="/:username">
					<div className="post-cards-container">
						{
							userPosts.map(post =>
								<PostCard postID={post.id} key={post.id}/>)
						}
					</div>
				</Route>
				<Route exact path="/:username/saved">
					<div className="posts-cards-container">
						{ currentUser.user.uid === userInfo.uid &&
							userInfo.saved.map(post =>
								<PostCard postID={post} key={post}/>)
						}
					</div>
				</Route>
			</Switch>
		</div>
	);
};

export default UserProfile;
