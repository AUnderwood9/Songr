# User Stories — Analyze Song Mood

## 1. Land on the home page

**As a** user
**I want to** see a song input form when I visit the app
**So that** I know what to do

### Acceptance Criteria

- The page displays a song name field, an artist field, and an Analyze button
- Song name field has placeholder text
- Artist field has placeholder text
- The Analyze button is disabled by default (no song entered)
- No results or errors are visible on first load

---

## 2. Prevent empty submissions

**As a** user
**I want** the form to prevent submission when no song name is provided
**So that** I don't waste time on a request that will fail

### Acceptance Criteria

- The Analyze button is disabled when the song name field is empty
- The Analyze button is disabled when the song name is whitespace only
- The Analyze button is enabled when the song name has content
- The artist field is optional and does not affect button state

---

## 3. Submit a song for analysis

**As a** user
**I want to** submit a song name and optionally an artist
**So that** I can see the emotional mood of the song

### Acceptance Criteria

- Submitting a song name and artist returns 5 mood results ranked 1–5, each with a mood, score, and reason
- Submitting a song name without an artist still returns 5 mood results
- Previous results are cleared when a new submission starts
- Previous errors are cleared when a new submission starts

---

## 4. See loading state during analysis

**As a** user
**I want to** see a loading indicator while my song is being analyzed
**So that** I know the request is in progress

### Acceptance Criteria

- Skeleton placeholders appear where results will be shown
- The button shows "Analyzing..." and is disabled
- The form inputs remain visible with the submitted values

---

## 5. View mood results

**As a** user
**I want to** see a ranked breakdown of my song's moods
**So that** I understand its emotional profile

### Acceptance Criteria

- Each result displays rank, mood name, score out of 10, and a one-sentence reason
- Results are ordered by rank (1 = strongest match)
- Moods come from the allowed vocabulary — no invented moods appear
- Submitting a new song replaces the previous results

---

## 6. See an error when analysis fails

**As a** user
**I want to** see a clear error message if something goes wrong
**So that** I know to try again

### Acceptance Criteria

- An error message appears below the form when the API returns an error
- No mood results are shown alongside the error
- The form is re-enabled so the user can try again
- The error clears when the user submits again

---

## 7. Server rejects invalid input

**As a** system
**I want to** reject malformed or missing input at the API level
**So that** invalid requests never reach the AI

### Acceptance Criteria

- POST with no body returns 400 with an error message
- POST with non-JSON body returns 400
- POST with an empty songName returns 400
- POST with songName longer than 200 characters returns 400
- POST with artist longer than 200 characters returns 400
- POST with non-string songName (e.g. number) returns 400

---

## 8. Load mood vocabulary from database

**As a** system
**I want to** load active moods from DynamoDB at request time
**So that** the mood vocabulary can be updated without redeploying

### Acceptance Criteria

- Active moods are fetched from the DynamoDB table
- The "MOOD#" key prefix is stripped from mood names
- Moods are returned sorted alphabetically
- Results are cached for 5 minutes to reduce database calls
- A second request within 5 minutes uses the cache instead of querying DynamoDB
- A request after 5 minutes fetches fresh data from DynamoDB
- An empty table returns an empty mood list

---

## 9. Analyze song mood with AI

**As a** system
**I want to** send the song to Claude AI with a structured tool schema
**So that** the response is always a consistent, parseable format

### Acceptance Criteria

- The prompt includes the song name, artist, and allowed mood list
- When no custom mood list is provided, the default vocabulary is used
- The AI is called with temperature 0 for deterministic results
- The AI is forced to respond via tool use (tool_choice)
- The response is parsed from the tool_use content block
- If the AI response has no tool_use block, an error is thrown

---

## 10. Process analysis request end-to-end

**As a** system
**I want to** orchestrate validation, mood loading, and AI analysis in a single request
**So that** the client receives a complete mood breakdown or a clear error

### Acceptance Criteria

- A valid request returns 200 with song name, artist, and 5 mood results
- A request with only song name (no artist) returns 200
- If mood loading fails, the API returns 500
- If AI analysis fails, the API returns 500
- The error response does not leak internal error details to the client
