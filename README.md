# AI-Based Soil Assessment Using Multimodal Data

A full-stack web application that uses machine learning and AI to analyze soil health, recommend crops and fertilizers, detect plant diseases, and provide real-time weather data. Built to help farmers make informed, data-driven decisions for sustainable agriculture.

---

## Features

- **Soil Analysis Dashboard** — Interactive map-based analysis with NPK nutrient levels, pH, moisture, and crop suitability checks.
- **Fertilizer Recommendation** — ML model predicts the optimal fertilizer based on 19 soil, crop, and environmental parameters.
- **Plant Disease Detection** — Upload a leaf or plant image to identify diseases using AI-based image classification.
- **AI Chatbot (SoilBot)** — Agriculture-focused chatbot powered by Google Gemini for real-time farming Q&A.
- **Weather Dashboard** — Live weather data and forecasts to support farming decisions.
- **User Authentication** — Signup, login, password recovery, and profile management.
- **Dark / Light Theme** — Toggle between dark and light modes across the application.

---

## Tech Stack

### Frontend

- React 19 with TypeScript
- Vite (dev server and bundler)
- Tailwind CSS
- React Router (client-side routing with protected routes)
- Chart.js and react-chartjs-2 (data visualization)
- Leaflet and react-leaflet (interactive maps)
- Lucide React (icons)
- Axios (HTTP client)

### Backend

- Flask — REST API for soil analysis (`/analyze`)
- FastAPI — ML model serving API (`/predict`)
- scikit-learn and joblib — trained fertilizer recommendation model
- Pandas — data processing

### AI / ML

- Google Gemini AI — powers the SoilBot chatbot
- Trained ML model (`fertilizer_model_new.pkl`) — fertilizer prediction based on soil and crop data

---

## Project Structure

```
src/
  components/          Navbar, Footer, ChatBot, WeatherDashboard, PrivateRoute
  pages/               Home, Dashboard, Login, Register, Profile,
                       About, Contact, Weather, DiseasePrediction
  context/             AuthContext, ThemeContext
  services/            API client (api.ts)
  assets/              Images and icons

app.py                 Flask backend (soil analysis API)
soil_logic.py          Soil analysis logic and database
ModelPredictor.py      FastAPI backend (ML fertilizer prediction API)
fertilizer_model_new.pkl   Trained ML model
fertilizer_recommendation.csv   Reference dataset

index.html             Vite entry point
vite.config.ts         Vite configuration
tailwind.config.js     Tailwind CSS configuration
tsconfig.json          TypeScript configuration
package.json           Node.js dependencies and scripts
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Python 3.9 or higher
- pip

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/AI-Based-Soil-Assessment-using-Multimodeldata.git
cd AI-Based-Soil-Assessment-using-Multimodeldata
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
pip install flask flask-cors fastapi uvicorn joblib pandas scikit-learn
```

### 4. Set Up Environment Variables

Create a `.env` file in the project root:

```
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

### 5. Start the Backend Servers

Flask (soil analysis), runs on port 5000:

```bash
python app.py
```

FastAPI (fertilizer prediction), runs on port 8000:

```bash
python ModelPredictor.py
```

### 6. Start the Frontend

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## API Endpoints

### Flask — Soil Analysis

| Method | Endpoint   | Description                      |
|--------|------------|----------------------------------|
| GET    | /          | Health check                     |
| POST   | /analyze   | Analyze soil by location and crop |

Request body for `/analyze`:

```json
{
  "location": "Mumbai",
  "crop": "Wheat"
}
```

### FastAPI — Fertilizer Prediction

| Method | Endpoint   | Description                      |
|--------|------------|----------------------------------|
| POST   | /predict   | Predict recommended fertilizer   |

Request body for `/predict`:

```json
{
  "Soil_Type": "Loamy",
  "Soil_pH": 6.5,
  "Soil_Moisture": 40.0,
  "Organic_Carbon": 0.8,
  "Electrical_Conductivity": 1.2,
  "Nitrogen_Level": 120.0,
  "Phosphorus_Level": 30.0,
  "Potassium_Level": 200.0,
  "Temperature": 28.0,
  "Humidity": 65.0,
  "Rainfall": 800.0,
  "Crop_Type": "Wheat",
  "Crop_Growth_Stage": "Vegetative",
  "Season": "Rabi",
  "Irrigation_Type": "Drip",
  "Previous_Crop": "Rice",
  "Region": "North",
  "Fertilizer_Used_Last_Season": 50.0,
  "Yield_Last_Season": 3.5
}
```

---

## Available Scripts

| Command           | Description                            |
|-------------------|----------------------------------------|
| `npm run dev`     | Start the Vite development server      |
| `npm run build`   | Build the frontend for production      |
| `npm run preview` | Preview the production build locally   |
| `npm run lint`    | Run ESLint on the codebase             |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).
