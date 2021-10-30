import { useEffect, useState } from "react";
import { Route, useParams } from "react-router";
import { NavLink, Switch } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { useSelector } from "react-redux";
import { db } from "../../firebase";
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from "@firebase/firestore";
import { formatDistanceToNowStrict, fromUnixTime } from "date-fns";
import Room from "./Room";
import FollowWindow from "../FollowWindow";
import LoadingPage from "../LoadingPage";
import SendMessage from "../../assets/misc/send-message.png";
import "./inbox.css";

const Inbox = () =>
{
	const { roomID } = useParams();
	const currentUser = useSelector(state => state.currentUser);
	const [currentUserFollows, setCurrentUserFollows] = useState(null);
	const [recentChats, setRecentChats] = useState(null);
	const [isNewMessageBoxOpen, setIsNewMessageBoxOpen] = useState(false);
	const closeNewMessageBox = () => setIsNewMessageBoxOpen(false);
	const phoneQuery = useMediaQuery({query: "(max-width: 600px)"});

	const formatDate = date =>
	{
		let dateStringArray = date.split(" ");
		dateStringArray[1] = dateStringArray[1].slice(0, 1);
		const dateString = dateStringArray.join(" ");
		return dateString;
	};

	const getChats = async () =>
	{
		if (!currentUser) return;
		try
		{
			const q = query(collection(db, "chats"), where("members", "array-contains", currentUser.user.uid));
			let chats = await getDocs(q)
				.then(querySnapshot => querySnapshot.docs.map(doc => doc.data()))
				.then(chats => chats.filter(chat => chat.lastMessage ? chat : false))
				.then(chats => chats.sort((a,b) => a.lastUpdated < b.lastUpdated ? 1 : -1))
				.then(chats => Promise.all(chats.map(async chat =>
				{
					const otherUser = await getDoc(doc(db, "users", chat.members.filter(user => user !== currentUser.user.uid)[0])).then(doc => doc.data());
					return {
						...chat,
						otherUser,
					};
				})));
			setRecentChats(chats);
		} catch (err)
		{
			console.error(err);
		}
	};

	const getUsersFollows = async () =>
	{
		if (!currentUser) return;
		try
		{
			const currentUserFollows = await getDocs(collection(db, "users", currentUser.user.uid, "user_follows")).then(querySnapshot => Object.assign({}, ...querySnapshot.docs.map(doc => doc.data())));
			if (!currentUserFollows.following)
				currentUserFollows.following = [];
			if (!currentUserFollows.followers)
				currentUserFollows.followers = [];
			setCurrentUserFollows(currentUserFollows);
		} catch (err)
		{
			console.error(err);
		}
	};
	
	useEffect(() => document.title = "Inbox • Chats");
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => getUsersFollows(), [currentUser]);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => getChats(), [currentUser]);

	useEffect(() =>
	{
		if (!currentUser) return;
		const q = query(collection(db, "chats"), where("members", "array-contains", currentUser.user.uid));
		const unsubscribe = onSnapshot(q, async querySnapshot =>
		{
			const chats = querySnapshot.docs.map(doc => doc.data()).filter(chat => chat.lastMessage ? chat : false).sort((a, b) => a.lastUpdated < b.lastUpdated ? 1 : -1);
			const recentChats = await Promise.all(chats.map(async chat =>
			{
				const otherUser = await getDoc(doc(db, "users", chat.members.filter(user => user !== currentUser.user.uid)[0])).then(doc => doc.data());
				return {
					...chat,
					otherUser,
				};
			}));
			setRecentChats(recentChats);
		});

		return () => unsubscribe();
	}, [currentUser]);

	if (!currentUser || !recentChats) return <LoadingPage/>;
	if (phoneQuery)
		return(
			<div className="inbox-window outlined">
				{ isNewMessageBoxOpen &&
						<FollowWindow title="New Message" uids={[...currentUserFollows.following, ...currentUserFollows.followers]} closeFollowListWindow={closeNewMessageBox} newMessage/>
				}
				<div className="container">
					<Switch>
						<Route exact path="/direct/inbox">
							<div className="recent-chats left">
								<header>{currentUser.info.username}<button className="icon" onClick={() => setIsNewMessageBoxOpen(true)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fillRule="evenodd" clipRule="evenodd"><path d="M8.071 21.586l-7.071 1.414 1.414-7.071 14.929-14.929 5.657 5.657-14.929 14.929zm-.493-.921l-4.243-4.243-1.06 5.303 5.303-1.06zm9.765-18.251l-13.3 13.301 4.242 4.242 13.301-13.3-4.243-4.243z"/></svg></button></header>
								<ul>
									{
										recentChats.map(chat =>
											<NavLink to={`/direct/t/${chat.id}`} activeClassName="selected" key={chat.id}>
												<li key={chat.otherUser.uid}>
													<span className="profile-pic"><img src={chat.otherUser.profilePic} alt={`${chat.otherUser.currentUser}'s profile pic`}></img></span>
													<div className="info">
														<span className="username">{chat.otherUser.username}</span>
														<div className="message">
															<div>{chat.lastMessage.message}</div>
															<span>• {formatDate(formatDistanceToNowStrict(fromUnixTime(chat.lastUpdated ? chat.lastUpdated.seconds : 0)))}</span>
														</div>
													</div>
												</li>
											</NavLink>
										)
									}
								</ul>
							</div>
						</Route>
						<Route path="/direct/t/:roomID">
							<Room roomID={roomID}/>
						</Route>
					</Switch>
				</div>
			</div>
		);
	else return(
		<div className="inbox-window outlined">
			{ isNewMessageBoxOpen &&
					<FollowWindow title="New Message" uids={[...currentUserFollows.following, ...currentUserFollows.followers]} closeFollowListWindow={closeNewMessageBox} newMessage/>
			}
			<div className="container">
				<div className="recent-chats left">
					<header>{currentUser.info.username}<button className="icon" onClick={() => setIsNewMessageBoxOpen(true)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fillRule="evenodd" clipRule="evenodd"><path d="M8.071 21.586l-7.071 1.414 1.414-7.071 14.929-14.929 5.657 5.657-14.929 14.929zm-.493-.921l-4.243-4.243-1.06 5.303 5.303-1.06zm9.765-18.251l-13.3 13.301 4.242 4.242 13.301-13.3-4.243-4.243z"/></svg></button></header>
					<ul>
						{
							recentChats.map(chat =>
								<NavLink to={`/direct/t/${chat.id}`} activeClassName="selected" key={chat.id}>
									<li key={chat.otherUser.uid}>
										<span className="profile-pic"><img src={chat.otherUser.profilePic} alt={`${chat.otherUser.currentUser}'s profile pic`}></img></span>
										<div className="info">
											<span className="username">{chat.otherUser.username}</span>
											<div className="message">
												<div>{chat.lastMessage.message}</div>
												<span>• {formatDate(formatDistanceToNowStrict(fromUnixTime(chat.lastUpdated ? chat.lastUpdated.seconds : 0)))}</span>
											</div>
										</div>
									</li>
								</NavLink>
							)
						}
					</ul>
				</div>
				<div className="chat-window right">
					<Switch>
						<Route exact path="/direct/inbox">
							<div style={{height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "0.75rem"}}>
								<div style={{height: 175}}><img src={SendMessage} alt="Send a message"/></div>
								<span style={{fontWeight: 500, fontSize: "1.25em"}}>Your Messages</span>
								<span style={{color: "#8e8e8e", fontSize: "0.95em"}}>Send private photos and messages to a friend or group.</span>
								<button style={{width: "initial"}} onClick={() => setIsNewMessageBoxOpen(true)}>Send Message</button>
							</div>
						</Route>
						<Route path="/direct/t/:roomID"><Room roomID={roomID}/></Route>
					</Switch>
				</div>
			</div>
		</div>
	);
};

export default Inbox;
