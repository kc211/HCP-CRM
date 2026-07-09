import { createSlice } from '@reduxjs/toolkit'

const initialFormState = {
  id: null,
  hcp_name: '',
  interaction_type: 'Meeting',
  date: '',
  time: '',
  attendees: '',
  topics_discussed: '',
  materials_shared: '',
  samples_distributed: '',
  sentiment: 'Neutral',
  outcomes: '',
  follow_up_actions: '',
}

const interactionSlice = createSlice({
  name: 'interaction',
  initialState: {
    form: initialFormState,
    messages: [
      {
        role: 'assistant',
        content:
          "Hi! Describe your HCP interaction here (e.g. \"Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure\") and I'll fill out the form for you.",
      },
    ],
    suggestions: [],
    loading: false,
  },
  reducers: {
    addMessage(state, action) {
      state.messages.push(action.payload)
    },
    setFormData(state, action) {
      state.form = { ...state.form, ...action.payload }
    },
    setSuggestions(state, action) {
      state.suggestions = action.payload || []
    },
    setLoading(state, action) {
      state.loading = action.payload
    },
    resetForm(state) {
      state.form = initialFormState
    },
  },
})

export const { addMessage, setFormData, setSuggestions, setLoading, resetForm } = interactionSlice.actions
export default interactionSlice.reducer
