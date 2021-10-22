import { useEffect, useState } from "react";
import { Route, useParams } from "react-router";
import { NavLink, Switch } from "react-router-dom";
import "./inbox.css";
import { useSelector } from "react-redux";
import Room from "./Room";
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from "@firebase/firestore";
import { db } from "../../firebase";
import { formatDistanceToNowStrict, fromUnixTime } from "date-fns";
import FollowWindow from "../FollowWindow";

const Inbox = () =>
{
	const { roomID } = useParams();
	const currentUser = useSelector(state => state.currentUser);
	const [recentChats, setRecentChats] = useState(null);
	const [isNewMessageBoxOpen, setIsNewMessageBoxOpen] = useState(false);
	const closeNewMessageBox = () => setIsNewMessageBoxOpen(false);

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
			console.log(chats);
			setRecentChats(chats);
		} catch (err)
		{
			console.error(err);
		}
	};

	useEffect(() => document.title = "Instadicey • Chats");
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

	if (!currentUser || !recentChats) return null;
	return(
		<div className="inbox-window outlined">
			{ isNewMessageBoxOpen &&
					<FollowWindow title="New Message" uids={[...currentUser.info.following, ...currentUser.info.followers]} closeFollowListWindow={closeNewMessageBox} newMessage/>
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
						<Route exact path="/direct/inbox">Inbox</Route>
						<Route path="/direct/t/:roomID"><Room roomID={roomID}/></Route>
					</Switch>
				</div>
			</div>
		</div>
	);
};

export default Inbox;
