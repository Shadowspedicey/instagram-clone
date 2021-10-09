import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../firebase";
import { collection, collectionGroup, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from "@firebase/firestore";
import { nanoid } from "nanoid";
import { format, fromUnixTime, getYear } from "date-fns";
import { startLoading, stopLoading } from "../../state/actions/isLoading";
import { setSnackbar } from "../../state/actions/snackbar";
import FollowButton from "../FollowButton";
import FollowWindow from "../FollowWindow";
import Like from "./Like";
import Comment from "./Comment";
import Save from "./Save";

const PostWindow = ({postID}) =>
{
	const addComment = useRef();
	const dispatch = useDispatch();
	const currentUser = useSelector(state => state.currentUser);
	const [dataLoaded, setDataLoaded] = useState(false);
	const [userInfo, setUserInfo] = useState(null);
	const [postPath, setPostPath] = useState("");
	const [postData, setPostData] = useState(null);
	const [comments, setComments] = useState(null);
	const [isInfoValid, setIsInfoValid] = useState(false);
	const [commentLoading, setCommentLoading] = useState(false);
	const [likesWindow, setLikesWindow] = useState(null);

	const getUserData = async uid =>
	{
		const userData = await getDoc(doc(db, "users", uid)).then(doc => doc.data());
		setUserInfo(userData);
	};

	const getPostComments = async (path = postPath) =>
	{
		const comments = await getDocs(collection(db, `${path}/comments`))
			.then(querySnapshot => querySnapshot.docs.map(doc => doc.data()));
		setComments(comments);
	};

	const handleAddComment = async e =>
	{
		e.preventDefault();
		if (!isInfoValid) return;

		try
		{
			setCommentLoading(true);
			const comment = addComment.current.value;
			const id = nanoid(32);
			if (comment.trim().length < 1)
				throw new Error("Comment is empty");
			if (comment.length > 2200)
				throw new Error("Comment too long");
			await setDoc(doc(db, `${postPath}/comments/${id}`),
				{
					comment,
					likes: [],
					user: currentUser.user.uid,
					id,
					timestamp: serverTimestamp(),
				});
			await getPostComments(postPath);
			setCommentLoading(false);
			addComment.current.value = "";
		} catch (err)
		{
			console.error(err);
			if (err.message === "Comment is empty")
				return dispatch(setSnackbar("Please enter a password.", "error"));
			else if (err.message === "Comment too long")
				return dispatch(setSnackbar("Comment too long. max is 2200 characters.", "error"));
			else dispatch(setSnackbar("Oops, try again later.", "error"));
		}
	};

	const handleTextareaEnter = e =>
	{
		if(e.keyCode === 13 && e.shiftKey === false)
		{
			e.preventDefault();
			handleAddComment(e);
		}
	};

	useEffect(() =>
	{
		const getData = async () =>
		{
			dispatch(startLoading());
			const postDoc = await getDocs(query(collectionGroup(db, "user_posts"), where("id", "==", `${postID}`)))
				.then(querySnapshot => querySnapshot.docs[0]);
			setPostData(postDoc.data());
			await getUserData(postDoc.data().user);
			const path = postDoc.ref.path;
			setPostPath(path);
			await getPostComments(path);
		};
		getData();
	}, []);

	useEffect(() =>
	{
		if (currentUser && postData && comments)
		{
			setDataLoaded(true);
			dispatch(stopLoading());
		} else dispatch(startLoading());
	}, [currentUser, postData, comments]);

	if (!dataLoaded) return null;
	return(
		<div className="post-window outlined">
			{ likesWindow
				? <FollowWindow title="Likes" uids={likesWindow} closeFollowListWindow={() => setLikesWindow(null)}/>
				: null
			}
			<img src={postData.photo} alt={postData.caption}></img>
			<div className="side">
				<div className="poster">
					<Link to={`/${userInfo.username}`}><div className="profile-pic outlined round"><img src={userInfo.profilePic} alt="Profile Pic"></img></div></Link>
					<Link to={`/${userInfo.username}`} className="username">{userInfo.username}</Link>
					{currentUser.info.uid === userInfo.uid ? null : <FollowButton target={userInfo}></FollowButton>}
				</div>
				<div className="comments">
					<Comment
						commentData={{user: postData.user, comment: postData.caption, timestamp: postData.timestamp}}
						noLike
						isCaption
					/>
					{
						comments.map(comment =>
							<Comment
								commentData={comment}
								postPath={postPath}
								key={comment.id}
								setLikesWindow={setLikesWindow}
								refreshComments={getPostComments}
							/>)
					}
				</div>
				<div className="info">
					<div className="interactions">
						<div style={{display: "flex"}}>
							<Like target={postData} postPath={postPath}/>
							<button className="comment-bubble icon"><svg width="25" height="25" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"><path d="M12 1c-6.338 0-12 4.226-12 10.007 0 2.05.739 4.063 2.047 5.625l-1.993 6.368 6.946-3c1.705.439 3.334.641 4.864.641 7.174 0 12.136-4.439 12.136-9.634 0-5.812-5.701-10.007-12-10.007m0 1c6.065 0 11 4.041 11 9.007 0 4.922-4.787 8.634-11.136 8.634-1.881 0-3.401-.299-4.946-.695l-5.258 2.271 1.505-4.808c-1.308-1.564-2.165-3.128-2.165-5.402 0-4.966 4.935-9.007 11-9.007"/></svg></button>
						</div>
						<Save target={postData}/>
					</div>
					<span className="likes" onClick={() => setLikesWindow(postData.likes)}><span className="number">{postData.likes.length}</span> likes</span>
					<span className="timestamp" title={format(fromUnixTime(postData.timestamp.seconds), "d MMM, yyyy")}>
						{
							getYear(fromUnixTime(postData.timestamp.seconds)) === getYear(new Date())
								? format(fromUnixTime(postData.timestamp.seconds), "d MMMM")
								: format(fromUnixTime(postData.timestamp.seconds), "d MMMM, yyyy")
						}
					</span>
				</div>
				<form className="add-comment-container" onSubmit={handleAddComment}>
					<textarea className={commentLoading ? "add-comment disabled" : "add-comment"} placeholder="Add a comment..." ref={addComment} onChange={() => addComment.current.value.length > 0 ? setIsInfoValid(true) : setIsInfoValid(false)} onKeyDown={handleTextareaEnter}/>
					<button className={`${isInfoValid ? "text" : "text disabled"}`}>Post</button>
				</form>
			</div>
		</div>
	);
};

export default PostWindow;
