import json
import os
import logging
from dotenv import load_dotenv
import google.generativeai as genai
from flask import Flask, jsonify, request, send_file, send_from_directory, render_template
from flask_cors import CORS

# Load environment variables
load_dotenv()
API_KEY = os.getenv("API_KEY_GEMINI")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info("Logging configured.")

# Check if API key is available
if not API_KEY or API_KEY == 'your_api_key_here':
    logger.warning("API key not set or is placeholder. Please check Railway Variables.")
else:
    logger.info("API key loaded successfully.")

# Configure Gemini API
try:
    genai.configure(api_key=API_KEY)
    logger.info("Gemini API configured successfully.")
except Exception as e:
    logger.error(f"Error configuring Gemini API: {str(e)}")

# Initialize Flask app
app = Flask(__name__)
logger.info("Flask app initialized.")
CORS(app)  # Enable CORS for all routes
logger.info("CORS enabled.")


@app.route("/")
def index():
    """Serve the main HTML page"""
    logger.info("Index route '/' accessed.")
    try:
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Error rendering index.html: {str(e)}")
        return "Error rendering page.", 500


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


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5001))
    logger.info(f"Starting server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
