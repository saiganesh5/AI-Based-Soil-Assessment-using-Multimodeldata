# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from soil_logic import analyze_soil

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Backend running successfully"

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    location = data.get("location")
    crop = data.get("crop")
    result = analyze_soil(location, crop)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
