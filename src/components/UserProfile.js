import { collection, getDocs, query, where } from "@firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { startLoading, stopLoading } from "../state/actions/isLoading";
import FollowButton from "./FollowButton";
import "./user-profile.css";

//TODO: titles and loading titles
const UserProfile = () =>
{
	const { username } = useParams();

	const currentUser = useSelector(state => state.currentUser);
	const [userInfo, setUserInfo] = useState(null);
	const [isFollowing, setIsFollowing] = useState(false);
	useEffect(() =>
	{
		if (userInfo)
			if (currentUser && userInfo.followers.includes(currentUser.info.username)) setIsFollowing(true);
			else setIsFollowing(false);
	}, [currentUser, userInfo]);

	const dispatch = useDispatch();

	const getUserInfo = async () =>
	{
		const usersRef = collection(db, "users");
		const q = query(usersRef, where("username", "==", username));
		const querySnapshot = await getDocs(q);
		return querySnapshot;
	};

	useEffect(() =>
	{
		const fetchUserInfo = async () =>
		{
			dispatch(startLoading());
			const querySnapshot = await getUserInfo();
			console.log(querySnapshot);
			if (querySnapshot.size === 1) setUserInfo(querySnapshot.docs[0].data());
			else setUserInfo(null);
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

	if (userInfo === null) return <div>not found</div>;
	else return(
		<div className="user-profile">
			<div className="upper">
				<div className="personal-info">
					<div className="profile-pic"><img src={userInfo.profilePic} alt={`${username}'s profile pic`}></img></div>
					<div className="info">
						<div className="name">
							{userInfo.username}
							{ currentUser
								? userInfo.uid === currentUser.info.uid
									? <Link to="/accounts/edit" className="edit-profile-btn outlined">Edit Profile</Link>
									: <FollowButton target={userInfo} setIsFollowing={setIsFollowing} following={isFollowing}/>
								: <FollowButton target={userInfo}/>
							}
						</div>
						<div className="follow">
							<span className="posts"><span className="number">{userInfo.posts.length}</span> posts</span>
							<span className="followers"><span className="number">{userInfo.followers.length}</span> followers</span>
							<span className="following"><span className="number">{userInfo.following.length}</span> following</span>
						</div>
						<div className="bio">
							<span className="real-name">{userInfo.realName}</span>
							<div className="bio-text">{userInfo.bio}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserProfile;
