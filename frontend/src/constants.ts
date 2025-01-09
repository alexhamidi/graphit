import { Size, GraphConfig, BoxActive} from "./interfaces";

export const MODE: string = import.meta.env.VITE_MODE!;


export const OPTIONS_PAGES: string[] = ["Appearance", "Algorithms"];

//Physics

export const NUM_MAX_PHYSICS_ITERS = 0;
export const GRAVITATIONAL_CONSTANT = 0.03;
export const DELTA_TIME = 1.2;
export const DAMPING = 0.6;
export const MOVEMENT_THRESHOLD = .03;
export const REFRESH_RATE = 3

//graph stuff
export const INITIAL_CIRCLE_RADIUS: number = 30;
export const INITIAL_FONT_SIZE: number = 15;
export const INITIAL_LINE_WEIGHT: number = 2;
export const MAIN_COLOR: string = "rgb(248, 249, 250)";
export const DEFAULT_GRAPH_CONFIG: GraphConfig = {
  edgeMode: false,
  directedMode: false,
  gravityMode: false,
  currentChosenColor: null,
  circleRadius: INITIAL_CIRCLE_RADIUS,
  fontSize: INITIAL_FONT_SIZE,
  lineWeight: INITIAL_LINE_WEIGHT,
};
export const DEFAULT_BOX_ACTIVE: BoxActive = {
  aiBox: false,
  newBlankGraphBox: false,
  newTextGraphBox: false
};

export const PIXELS_PER_FONT_SIZE_UNIT = 0.6;

export const TEXT_BOX_ADJUSTMENT: Size = {
  width: 15,
  height: 10,
};

export const EDGE_BOUNDARY : number = 35;
export const INVISIBLE_CHAR: string = "O";




//networking
export const BASE_BACKEND_URL: string = import.meta.env.VITE_BASE_BACKEND_URL! + "/api";

//errors

export const DEFAULT_ERROR: string = "An unknown error occured";

export const DOWNLOAD_NONE_SELECTED_ERROR: string =
  "Must select a graph before saving";

export const CLOUD_SAVE_FAIL_ERROR: string =
  "There was an issue saving the graph to the cloud";

export const CLOUD_FETCH_FAIL_ERROR: string =
  "There was an issue fetching the graphs from the cloud";

export const AI_ERROR: string = "There was an issue making the AI request";

export const EMAIL_IN_USE_ERROR: string = "Email already in use";

export const INCORRECT_PASSWORD_ERROR: string = "Incorrect password";

export const USER_NOT_FOUND_ERROR: string = "User not found";

export const INCOMPLETE_CREDENTIALS_ERROR: string =
  "Please fill out all fields";

export const COLORS: string[] = [
  MAIN_COLOR,
  "#DEDE7E",
  "#7ECD63",
  "#8ECE9E",
  "#8EBEDE",
  "#6E93DE",
  "#E5AD72",
  "#C48D95",
  "#C47DC5",
  "#A47DE5",
  "#8589E5",
];
