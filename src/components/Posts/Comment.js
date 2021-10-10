import { deleteDoc, doc, getDoc } from "@firebase/firestore";
import { format, formatDistanceToNowStrict, fromUnixTime } from "date-fns";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import VerifiedTick from "../Verified";
import Like from "./Like";

const Comment = ({ commentData, postPath, noPhoto, noTimestamp, noLike, isCaption, setLikesWindow, refreshComments}) =>
{
	const currentUser = useSelector(state => state.currentUser);
	const [commenterInfo, setCommenterInfo] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const getCommenterInfo = async () =>
	{
		const commenterUid = commentData.user;
		const commenterInfo = await getDoc(doc(db, "users", commenterUid)).then(doc => doc.data());
		return commenterInfo;
	};

	const removeComment = async () =>
	{
		try
		{
			if (currentUser.user.uid !== commentData.user) throw new Error("Fuck off");
			setIsLoading(true);
			await deleteDoc(doc(db, `${postPath}/comments/${commentData.id}`));
			await refreshComments();
		} catch (err)
		{
			setIsLoading(false);
			console.error(err);
		}
	};

	useEffect(() =>
	{
		const setInfo = async () =>
		{
			const info = await getCommenterInfo();
			setCommenterInfo(info);
		};
		setInfo();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!commenterInfo || !currentUser) return null;
	return(
		<div className={`comment ${isLoading ? "disabled" : null}`} style={noLike ? null : {paddingRight: "25px"}}>
			{noPhoto || <Link to={`/${commenterInfo.username}`}><div className="profile-pic"><img src={commenterInfo.profilePic} alt={`${commenterInfo.username}'s profile pic`}></img></div></Link>}
			<div className="info">
				<div style={{display: "inline-block"}}>
					<Link to={`/${commenterInfo.username}`} className="username">{commenterInfo.username}</Link>
					<VerifiedTick size={12.5} user={commenterInfo} marginLeft={0} marginRight={7.5}/>
					<span className="text">{commentData.comment}</span>
				</div>
				<div>
					{noTimestamp || <span className="timestamp" title={format(fromUnixTime(commentData.timestamp.seconds), "d MMM, yyyy")}>{formatDistanceToNowStrict(fromUnixTime(commentData.timestamp.seconds))}</span>}
					{ isCaption || commentData.likes.length === 0 ||
						<span className="likes" onClick={() => setLikesWindow(commentData.likes)}>{commentData.likes.length} likes</span>
					}
					{(commentData.user === currentUser.user.uid && !isCaption) && <button className="icon" style={{width: 15, height: 15}} onClick={removeComment}><svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M9 3h6v-1.75c0-.066-.026-.13-.073-.177-.047-.047-.111-.073-.177-.073h-5.5c-.066 0-.13.026-.177.073-.047.047-.073.111-.073.177v1.75zm11 1h-16v18c0 .552.448 1 1 1h14c.552 0 1-.448 1-1v-18zm-10 3.5c0-.276-.224-.5-.5-.5s-.5.224-.5.5v12c0 .276.224.5.5.5s.5-.224.5-.5v-12zm5 0c0-.276-.224-.5-.5-.5s-.5.224-.5.5v12c0 .276.224.5.5.5s.5-.224.5-.5v-12zm8-4.5v1h-2v18c0 1.105-.895 2-2 2h-14c-1.105 0-2-.895-2-2v-18h-2v-1h7v-2c0-.552.448-1 1-1h6c.552 0 1 .448 1 1v2h7z"/></svg></button>}
				</div>
			</div>
			{noLike || <Like size={15} target={commentData} postPath={postPath} isComment/>}
		</div>
	);
};

export default Comment;
