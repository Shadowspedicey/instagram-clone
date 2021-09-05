import Logo from "../assets/logo.png";

const LoadingPage = () =>
{
	return(
		<div className="loading-page">
			<div className="loading"><img src={Logo} alt="Logo"></img></div>
		</div>
	);
};

export default LoadingPage;
