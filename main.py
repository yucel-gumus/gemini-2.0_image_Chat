import json
import os
import logging
from dotenv import load_dotenv
import google.generativeai as genai
from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS

# Load environment variables
load_dotenv()
API_KEY = os.getenv("API_KEY_GEMINI")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Check if API key is available
if not API_KEY or API_KEY == 'your_api_key_here':
    logger.warning("API key not set. Please add your Gemini API key to the .env file.")

# Configure Gemini API
genai.configure(api_key=API_KEY)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route("/")
def index():
    """Serve the main HTML page"""
    return send_file('web/index.html')


@app.route("/api/generate", methods=["POST"])
def generate_api():
    """Process image upload and generate response from Gemini"""
    if request.method == "POST":
        if not API_KEY or API_KEY == 'your_api_key_here':
            return jsonify({ 
                "error": "API key not configured. Get your API key at https://g.co/ai/idxGetGeminiKey and add it to the .env file."
            })
        
        try:
            req_body = request.get_json()
            content = req_body.get("contents")
            model_name = req_body.get("model", "gemini-2.0-flash")
            
            # Create Gemini model instance
            model = genai.GenerativeModel(model_name=model_name)
            
            # Generate content with streaming
            response = model.generate_content(content, stream=True)
            
            def stream():
                for chunk in response:
                    yield 'data: %s\n\n' % json.dumps({ "text": chunk.text })

            return stream(), {'Content-Type': 'text/event-stream'}

        except Exception as e:
            logger.error(f"Error generating content: {str(e)}")
            return jsonify({ "error": str(e) })


@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from the web directory"""
    return send_from_directory('web', path)


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5001))
    logger.info(f"Starting server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
