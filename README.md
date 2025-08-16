# Elyx Health Journey Visualizer

**A Hackathon Project for Elyx Life (August 2025)**

This project is a solution to the Elyx Hackathon problem statement, which challenged teams to visualize a member's complete health journey and, most importantly, provide a clear way to understand the "why" behind every clinical and lifestyle decision.

Our solution consists of two main parts:
1.  An AI-powered Python script to generate a realistic, 8-month narrative for the member persona, Rohan Patel.
2.  An interactive web application built with React to visualize this journey, trace decisions back to their source, and track internal team metrics.

---

### Features

* **AI-Generated Narrative:** Creates 8 months of detailed, day-by-day communication logs and events following all hackathon constraints.
* **Interactive Timeline:** A scrollable timeline on the left panel provides a high-level overview of the entire 8-month journey.
* **Daily Deep-Dive:** Clicking a day on the timeline displays the full communication log and key events for that specific day.
* **The "Why?" Feature:** A core feature that allows users to click on a key event and see a pop-up modal displaying the exact message that triggered that decision.
* **Internal Metrics Tracking:** A cumulative dashboard that visualizes the hours spent by different Elyx specialists (Doctors, Coaches, Concierge).

---

### Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js, Express.js (for serving the generated data)
* **Data Generation:** Python, OpenRouter AI (using `meta-llama/llama-3.1-405b-instruct`), `openai` library
* **Styling:** Plain CSS

---

### Setup and Installation

Follow these steps to run the project locally.

**Prerequisites:**
* Node.js & npm
* Python 3 & pip

**1. Clone the Repository**
```bash
git clone <your-repo-url>
cd elyx-hackathon
```

**2. Configure the Server**
```bash
cd server

# Create the environment file for your API key
# (you can copy .env.example)
# Add your OPENROUTER_API_KEY to this file
touch .env

# Install Python and Node dependencies
pip install openai python-dotenv
npm install
```

**3. Generate the Journey Data**
This is a one-time step to create the `journeyData.json` file using the AI model.
```bash
# Still inside the server/ directory
python generate_data.py
```
*This will take a few minutes as it generates data month-by-month.*

**4. Start the Backend Server**
```bash
# Still inside the server/ directory
npm start
```
*The server will be running on `http://localhost:3001`.*

**5. Start the Frontend Application**
Open a **new terminal** window.
```bash
cd client
npm install
npm start
```
*The React application will open in your browser at `http://localhost:3000`.*

---

### Project Structure

```
elyx-hackathon/
├── client/         # Contains the React frontend application
├── server/         # Contains the Node.js server and Python data generator
│   ├── data/       # Stores the generated journeyData.json
│   ├── .env        # API Key configuration (you must create this)
│   ├── generate_data.py
│   └── server.js
└── README.md
```