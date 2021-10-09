export const setNewPost = file =>
{
	return {
		type: "SET_NEW_POST",
		payload:
		{
			file,
		}
	};
};
