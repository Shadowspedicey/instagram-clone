const defaultState =
{
	message: "Empty", 
	severity: "success",
	open: false,
};

const snackbar = (state = defaultState, action) =>
{
	switch (action.type)
	{
		case "SET_SNACKBAR":
			return state =
			{
				message: action.payload.message,
				severity: action.payload.severity,
				open: true,
			};

		case "OPEN_SNACKBAR":
			return state = {...state, open: true};

		case "CLOSE_SNACKBAR":
			return state = {...state, open: false};
			
		default:
			return state;
	}
};

export default snackbar;
