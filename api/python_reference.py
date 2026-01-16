
import os
from google import genai

# DO NOT hardcode your API key here for security.
# Set it in your environment: export GEMINI_API_KEY='your_actual_key'
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY environment variable not set.")
else:
    client = genai.Client(api_key=api_key)

    # Example: Simple hello test
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents="Hello from AeroCast Pro Backend Python Reference"
    )

    print(response.text)

    # Example: Weather Logic equivalent
    def get_weather_ref(location):
        prompt = f"Current weather in {location}, India in JSON format."
        res = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config={"tools": [{"google_search": {}}]}
        )
        return res.text
