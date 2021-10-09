const newPost = (state = null, action) =>
{
	switch (action.type)
	{
		case "SET_NEW_POST":
			return state = action.payload.file;

		default:
			return state;
	}
};

export default newPost;
