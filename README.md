# AI-Based Soil Assessment Using Multimodal Data

An AI-powered smart agriculture platform that helps farmers make better decisions using soil data, plant images, weather information, and AI.

The application can analyze soil conditions, recommend fertilizers, classify soil types, detect plant diseases from images, provide weather information, and answer agriculture-related questions through an AI chatbot.

---

## Project Overview

Farmers often need to consider many things before deciding which crop to grow or which fertilizer to use. Soil quality, nutrients, weather conditions, crop type, and plant health all play an important role.

This project brings these different types of information together into one web application.

The system provides:

* Soil health analysis
* Fertilizer recommendations
* Soil type classification using images
* Plant disease detection using leaf images
* Weather information
* AI-powered farming chatbot
* Location-based soil analysis
* Soil and environmental data visualization
* User registration and authentication

The goal is to provide farmers with simple, data-based suggestions instead of requiring them to use multiple separate tools.

---

## Features

### 1. Soil Analysis

The application allows users to provide a location and crop and receive information about the soil.

The soil analysis can include:

* Nitrogen level
* Phosphorus level
* Potassium level
* Soil pH
* Soil moisture
* Soil condition
* Crop suitability
* Location-based information

The results are displayed through an interactive dashboard so that the user can easily understand the soil condition.

---

### 2. Fertilizer Recommendation

The system uses a machine learning model to recommend a suitable fertilizer based on multiple soil, crop, and environmental parameters.

The model uses 19 parameters, including:

* Soil type
* Soil pH
* Soil moisture
* Organic carbon
* Electrical conductivity
* Nitrogen
* Phosphorus
* Potassium
* Temperature
* Humidity
* Rainfall
* Crop type
* Crop growth stage
* Season
* Irrigation type
* Previous crop
* Region
* Fertilizer used in the previous season
* Previous season yield

The trained model is stored as:

```text
fertilizer_model_new.pkl
```

The model is served through a Python API so that the frontend can send the required information and receive the predicted fertilizer.

---

### 3. Soil Type Classification

The project also includes an image-based soil classification model.

A user can provide an image of soil, and the CNN model predicts the soil type.

The soil classification model was trained using a Convolutional Neural Network (CNN).

The trained model is stored as:

```text
Soil_type_CNN_Model.keras
```

The training notebook is available in the repository:

```text
Soil Type Classification Using CNN.ipynb
```

---

### 4. Plant Disease Detection

Users can upload an image of a plant leaf.

The system processes the image and uses a trained deep learning model to predict the possible plant disease.

The prediction service:

1. Receives the uploaded image.
2. Converts it into a suitable image format.
3. Resizes the image to 200 × 200.
4. Passes the image to the trained model.
5. Calculates the prediction scores.
6. Returns the most likely disease.
7. Can also return the top K possible predictions.

The plant disease model is based on EfficientNetB3 and supports multiple disease classes.

The prediction is provided through a FastAPI service.

---

### 5. SoilBot — AI Farming Assistant

The project includes an agriculture-focused AI chatbot called SoilBot.

It uses Google Gemini AI to answer questions related to:

* Soil
* Crops
* Fertilizers
* Plant diseases
* Farming
* Agriculture

This allows users to ask questions in normal language instead of having to search through different resources.

---

### 6. Weather Dashboard

The application provides weather information that can help farmers make decisions.

Weather information can be useful when deciding:

* When to irrigate
* Whether rainfall is expected
* How temperature may affect crops
* General farming conditions

The weather information is displayed through a dedicated dashboard.

---

### 7. Interactive Maps

The application uses interactive maps to display location-based information.

Users can select or search for a location and view the corresponding soil and agricultural information.

The project uses Leaflet and React-Leaflet for map functionality.

---

### 8. User Authentication

The application includes user account functionality.

Users can:

* Create an account
* Log in
* Verify their account using OTP
* Recover their password
* Reset their password
* View their profile
* Update their profile

The newer backend implementation uses JWT-based authentication.

---

## System Architecture

The project was developed in multiple stages.

The application uses a separate frontend, backend, database, and machine learning services.

A simplified architecture looks like this:

```text
                    React Frontend
                  TypeScript + Vite
                         |
                    REST APIs
                         |
                Spring Boot Backend
                         |
              +----------+----------+
              |                     |
         PostgreSQL           Python ML Services
                                    |
                         +----------+----------+
                         |          |           |
                    Soil CNN   Fertilizer   Disease
                                Model        Model
```

The repository also contains an earlier Flask/FastAPI implementation of some backend functionality.

---

## Technologies Used

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* Chart.js
* React-Chartjs-2
* Leaflet
* React-Leaflet
* Lucide React

### Backend

* Java 21
* Spring Boot
* Maven
* Python
* Flask
* FastAPI
* REST APIs

### Database

* PostgreSQL

### Machine Learning

* Python
* TensorFlow
* Keras
* Scikit-learn
* Joblib
* Pandas
* NumPy
* Pillow

### AI

* Google Gemini API

### Authentication

* JWT
* Email OTP

---

## Project Structure

The project has been developed through different stages, so some components are available in different branches.

A simplified structure of the main application is:

```text
AI-Based-Soil-Assessment-using-Multimodeldata/
|
├── src/
│   └── main/
│       └── java/
│           └── ...
|
├── python-service/
│   ├── main.py
│   ├── class_names.json
│   └── ...
|
├── ModelPredictor.py
├── app.py
├── soil_logic.py
|
├── fertilizer_model_new.pkl
├── fertilizer_recommendation.csv
|
├── Soil_type_CNN_Model.keras
├── Soil Type Classification Using CNN.ipynb
|
├── class_names.json
├── class_names.txt
|
├── package.json
├── pom.xml
├── Dockerfile
├── README.md
└── ...
```

---

## Important Branches

The repository contains different branches representing different stages and parts of the project.

### master

Contains the earlier full-stack implementation with:

* React frontend
* Flask soil analysis backend
* FastAPI fertilizer prediction service
* Fertilizer recommendation model
* Agriculture dashboard
* Gemini chatbot
* Weather features

### test-backend

Contains the newer backend architecture based on:

* Spring Boot
* Java 21
* PostgreSQL
* JWT authentication
* Email OTP
* FastAPI ML service
* Plant disease prediction

### Disease-prediction-model-run

Contains the plant disease prediction implementation, including:

* FastAPI service
* TensorFlow/Keras model
* Image preprocessing
* Disease class labels
* Prediction API

### soil-classification-model-run

Contains the soil classification model, including:

* CNN training notebook
* Trained Keras model
* Soil labels
* Python prediction API

---

## API Overview

### Soil Analysis API

#### `GET /`

Used as a basic health check.

#### `POST /analyze`

Analyzes soil based on location and crop.

Example:

```json
{
  "location": "Mumbai",
  "crop": "Wheat"
}
```

---

### Fertilizer Prediction API

#### `POST /predict`

Predicts the recommended fertilizer.

Example request:

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

### Plant Disease Prediction API

#### `POST /api/plant/predict`

Accepts a plant or leaf image and returns the predicted disease.

The request uses a multipart file upload.

Example:

```bash
curl -X POST "http://localhost:8080/api/plant/predict?top_k=5" \
  -F "file=@leaf.jpg"
```

The response contains:

* Predicted class
* Prediction score
* Top prediction indices
* Top prediction scores
* Top predicted labels

---

## Authentication

The Spring Boot backend provides authentication APIs such as:

```text
POST /auth/send-otp
POST /auth/verify-otp
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/forgot-password
POST /auth/reset-password
```

JWT tokens are used to protect authenticated requests.

Example:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

## Machine Learning Workflow

### Fertilizer Recommendation

The general workflow is:

```text
Soil + Crop + Weather Data
          |
          v
    Data Processing
          |
          v
    Trained ML Model
          |
          v
  Fertilizer Prediction
          |
          v
     User Dashboard
```

The trained model is loaded using `joblib` and exposed through an API.

---

### Soil Classification

The soil classification workflow is:

```text
Soil Image
    |
    v
Image Preprocessing
    |
    v
CNN Model
    |
    v
Soil Type Prediction
    |
    v
Result on Website
```

---

### Plant Disease Detection

The plant disease workflow is:

```text
Leaf Image
    |
    v
Resize to 200 x 200
    |
    v
TensorFlow Model
    |
    v
Prediction Scores
    |
    v
Top Disease Prediction
```

---

## Running the Project

### Prerequisites

Install the following:

* Node.js 18+
* Java 21
* Maven
* Python 3.10+
* PostgreSQL
* pip

---

### 1. Clone the Repository

```bash
git clone https://github.com/saiganesh5/AI-Based-Soil-Assessment-using-Multimodeldata.git

cd AI-Based-Soil-Assessment-using-Multimodeldata
```

---

### 2. Frontend Setup

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The Vite development server normally runs at:

```text
http://localhost:5173
```

---

### 3. Spring Boot Backend

Create a `secrets.env` file in the backend project root.

Example:

```env
DB_URL=jdbc:postgresql://localhost:5432/AiSoilHealthAssessment
DB_USERNAME=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_long_random_secret

EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password

SENDBRIDGE_API_TOKEN=your_sendbridge_token
```

Then run:

#### Windows

```bash
mvnw.cmd spring-boot:run
```

#### Linux / macOS

```bash
./mvnw spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

---

### 4. FastAPI ML Service

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it.

#### Windows

```bash
.venv\Scripts\activate
```

Install the required packages:

```bash
pip install fastapi uvicorn tensorflow pillow numpy
```

Run the ML service:

```bash
python main.py
```

The service runs on:

```text
http://localhost:8000
```

---

## Environment Variables

Do not commit real passwords, API keys, database credentials, or JWT secrets to GitHub.

For example:

```env
DB_URL=your_database_url
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret

VITE_GEMINI_API_KEY=your_gemini_api_key
```

Keep sensitive values in local environment files.

---

## Docker

The backend also contains a Dockerfile for containerized deployment.

Example:

```bash
docker build -t ai-soil-assessment .
```

Then run the container according to the required environment variables and service configuration.

---

## Example Use Case

A farmer wants to grow wheat.

The user can:

1. Log into the application.
2. Select their location.
3. Select wheat as the crop.
4. Check soil information.
5. View nutrient and soil conditions.
6. Get a fertilizer recommendation.
7. Check the current weather.
8. Upload a leaf image if the plant shows signs of disease.
9. Get a possible disease prediction.
10. Ask SoilBot questions about wheat cultivation.

This gives the user several useful farming tools in one application.

---

## Project Goals

The main goals of this project are:

* Make agricultural information easier to access.
* Help farmers make decisions using data.
* Reduce the need to use multiple separate applications.
* Use machine learning for fertilizer and image-based predictions.
* Provide an easy-to-use interface for agricultural information.
* Combine traditional software development with AI and machine learning.

---

## What I Learned

Working on this project helped me gain practical experience in:

* Building a full-stack web application.
* Creating and consuming REST APIs.
* Connecting React with backend services.
* Working with Spring Boot.
* Working with Python and FastAPI.
* Training and using machine learning models.
* Working with CNN-based image classification.
* Connecting ML models to web applications.
* Working with PostgreSQL.
* Implementing JWT authentication.
* Implementing OTP-based user verification.
* Integrating Google Gemini AI.
* Working with multiple services in one application.
* Debugging communication problems between frontend, backend, and ML services.

---

## Future Improvements

Some possible improvements include:

* Add more soil and crop datasets.
* Improve model accuracy with more training data.
* Add more plant diseases.
* Add region-specific fertilizer recommendations.
* Add historical weather data.
* Add farmer-specific recommendations based on previous crops.
* Add mobile support.
* Deploy all services using Docker.
* Add automated model retraining.
* Add more detailed explanations for ML predictions.
* Add multilingual support for farmers.

---

## Project Type

**Academic / Personal Project**

### Main Areas

* Full-Stack Development
* Machine Learning
* Deep Learning
* Computer Vision
* Generative AI
* REST APIs
* Smart Agriculture

---

## Project Summary

AI-Based Soil Assessment Using Multimodal Data combines web development, machine learning, computer vision, and generative AI into a single smart agriculture platform.

It allows users to analyze soil, receive fertilizer recommendations, classify soil types, detect plant diseases, check weather information, and interact with an AI farming assistant.
