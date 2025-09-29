// client/src/features/interview/interviewSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const startSession = createAsyncThunk(
  'interview/startSession',
  async ({ candidateId, role }, thunkAPI) => {
    const resp = await axios.post('/api/interview/start', { candidateId, role });
    return resp.data.session;
  }
);

export const submitAnswer = createAsyncThunk(
  'interview/submitAnswer',
  async ({ sessionId, questionIndex, answer, autoSubmitted = false }, thunkAPI) => {
    const resp = await axios.post('/api/interview/answer', { sessionId, questionIndex, answer, autoSubmitted });
    return resp.data.session;
  }
);

const slice = createSlice({
  name: 'interview',
  initialState: {
    currentSession: null,
    currentIndex: 0,
    loading: false,
    error: null
  },
  reducers: {
    restoreSession(state, action) {
      state.currentSession = action.payload.session;
      state.currentIndex = action.payload.currentIndex || 0;
    },
    clearSession(state) {
      state.currentSession = null;
      state.currentIndex = 0;
    },
    setCurrentIndex(state, action) {
      state.currentIndex = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(startSession.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(startSession.fulfilled, (s, a) => { 
        s.loading = false; 
        s.currentSession = a.payload; 
        s.currentIndex = 0; 
      })
      .addCase(startSession.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })
      .addCase(submitAnswer.fulfilled, (s, a) => { 
        s.loading = false; 
        s.currentSession = a.payload; 
      });
  }
});

export const { restoreSession, clearSession, setCurrentIndex } = slice.actions;
export default slice.reducer;
