import { Link } from "react-router-dom";

const Message = ({messageInfo, userInfo, noPhoto, isSent}) =>
{
	return(
		<div className={`message ${isSent ? "sent" : ""}`}>
			{ noPhoto
				? <span className="dummy" style={{width: 32, height: 32}}></span>
				: <Link to={`/${userInfo.username}`} className="profile-pic"><img src={userInfo.profilePic} alt={`${userInfo.username}'s profile pic`}></img></Link>
			}
			<span className="text outlined round">{messageInfo.message}</span>
		</div>
	);
};

export default Message;
