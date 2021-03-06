const currentUser = (state = null, action) =>
{
	switch (action.type)
	{
		case "SET_CURRENT_USER":
			return state = action.payload;

		case "SIGN_OUT":
			return state = null;
		
		default:
			return state;
	}
};

export default currentUser;
