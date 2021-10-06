import { doc, getDoc } from "@firebase/firestore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import FollowButton from "./FollowButton";

const FollowWindow = props =>
{
	const { following, uids, closeFollowListWindow } = props;
	const [list, setList] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() =>
	{
		const getUidsInfo = async () =>
		{
			const data = await Promise.all(uids.map(uid => getDoc(doc(db, "users", uid)).then(doc => doc.data())));
			setList(data);
			setIsLoading(false);
		};
		getUidsInfo();
	}, [uids]);

	return(
		<div className="backdrop container" onClick={closeFollowListWindow}>
			<div className="follow-list-window" onClick={e => e.stopPropagation()}>
				<div className="header">
					<h1>{following ? "Following" : "Followers"}</h1>
					<span className="close" onClick={closeFollowListWindow}>X</span>
				</div>
				{ isLoading
					? 
					<ul className="loading">
						{
							[0,1,2,3,4,5,6,7,8].map(() =>
								<li className="person">
									<div className="profile">
										<div className="pic"></div>
										<div className="info">
											<span className="real-name"></span>
											<span className="username"></span>
										</div>
									</div>
								</li>
							)
						}
					</ul>
					:
					<ul>
						{
							list.map(person => 
								<li className="person" key={person.uid}>
									<div className="profile">
										<Link to={`${person.username}`}><div className="pic"><img src={person.profilePic} alt={`${person.username}'s Pic`}></img></div></Link>
										<div className="info">
											<div style={{display: "flex"}}><Link to={`/${person.username}`} className="username">{person.username}</Link> {person.verified ? <div className="verified" title="Verified"></div> : null}</div>
											<span className="real-name">{person.realName}</span>
										</div>
									</div>
									<FollowButton target={person} startLoading={() => setIsLoading(true)} stopLoading={() => setIsLoading(false)}/>
								</li>)
						}
					</ul>
				}
			</div>
		</div>
	);
};

export default FollowWindow;
