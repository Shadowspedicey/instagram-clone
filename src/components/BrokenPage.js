import { useEffect } from "react";

const BrokenPage = () =>
{
	useEffect(() => document.title = "Page Not Found • Instadicey", []);

	return(
		<div id="broken-page">
			<h1>Sorry, this page isn't available.</h1>
			<h2>The link you followed may be broken, or the page may have been removed.</h2>
		</div>
	);
};

export default BrokenPage;
