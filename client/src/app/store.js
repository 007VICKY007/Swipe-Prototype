import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import interviewReducer from '../features/interview/interviewSlice';

const rootReducer = combineReducers({
  interview: interviewReducer
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
});

export default store;