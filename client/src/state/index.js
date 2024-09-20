import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "dark",
  user: null,
  token: null,
  posts: [],
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  // methods to change the state
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    //why are we setting friends list in the state isnt it already stored in the user model?
    setFriends: (state, action) => {
      if (state.user) {
        state.user.friends = action.payload.friends;
      } else {
        console.error("user is non existent");
      }
    },
    setPosts: (state, action) => {
      if (!action.payload.posts) return;
      //console.log(action.payload.posts);
      state.posts = action.payload.posts;
    },
    setPost: (state, action) => {
      if (!state.posts) return;
      const updatedPosts = state.posts.map((post) => {
        //action.payload.post._id is coming from {post:postName} in setPost
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      state.posts = updatedPosts;
    },
  },
});

export const { setMode, setLogin, setLogout, setFriends, setPosts, setPost } =
  authSlice.actions;

export default authSlice.reducer;
