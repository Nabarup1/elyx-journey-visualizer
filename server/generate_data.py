import os
import json
import calendar
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime
from dateutil.relativedelta import relativedelta
import time

# --- Configuration ---
load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL_TO_USE = "meta-llama/llama-3.1-405b-instruct:free"
NUM_MONTHS = 8
START_DATE = datetime(2025, 8, 1)
TOKEN_LIMIT = 8000 # Hard limit

# --- OpenAI Client Setup ---
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=API_KEY,
)

def get_base_prompt():
    """
    Returns the foundational prompt with a new, much stricter schema definition
    to prevent the AI from deviating.
    """
    return """
    You are an AI data generator for a hackathon. Your task is to create a detailed health journey for a fictional character named Rohan Patel, formatted as a single, valid JSON object that adheres strictly to the schema below.

    **--- Persona: Rohan Patel ---**
    - Age: 46
    - Occupation: Regional Head of Sales (FinTech), high stress, frequent travel.
    - Residence: Singapore
    - Goals: Reduce heart disease risk, enhance cognitive function.
    - Chronic Condition: High ApoB (a key marker for cardiovascular risk).
    - Tech: Uses a Garmin watch, then switches to a Whoop. Also uses a CGM later.

    **--- The Elyx Team (use these personas in messages) ---**
    - Ruby (Concierge)
    - Dr. Warren (Medical Strategist)
    - Advik (Performance Scientist)
    - Carla (Nutritionist)
    - Rachel (PT/Physiotherapist)
    - Neel (Concierge Lead)

    **--- JSON Schema Definition (CRITICAL: ADHERE STRICTLY TO THIS) ---**
    The root object MUST have a single key "journey", which is an array of DayObjects.

    **1. DayObject:**
    {
      "date": (string, "YYYY-MM-DD", required),
      "dayOfWeek": (string, "Monday", required),
      "month": (string, "MonthName", required),
      "summary": (string, "One-sentence summary of the day.", required),
      "events": (array of EventObjects, can be empty, required),
      "messages": (array of MessageObjects, can be empty, required),
      "internalMetrics": (object, contains coach/doctor hours, required)
    }

    **2. EventObject:**
    {
      "type": (string, e.g., "DIAGNOSTIC", "TRAVEL", "EXERCISE_UPDATE", required),
      "title": (string, "A descriptive title for the event.", required),
      "details": (string, "More details about the event.", required),
      "triggeredByMessageId": (string, ID of the message that caused this event, can be null)
    }

    **3. MessageObject:**
    {
      "id": (string, "msg_XXX", required),
      "timestamp": (string, "HH:MM AM/PM", required),
      "sender": (string, "Rohan Patel" or one of the Elyx team members, required),
      "text": (string, The content of the message, required)
    }

    **--- Rules of Generation ---**
    1.  **Timeline:** Generate events and messages ONLY for the specified date range.
    2.  **Schema Compliance:** You MUST follow the JSON Schema Definition perfectly. Do not add, remove, or rename any keys from the defined objects.
    3.  **Content:** Create a rich narrative showing progress, setbacks, travel, and interactions based on Rohan's persona. Plan adherence should be ~50%.
    4.  **Diagnostics:** A "Full Diagnostic Panel" event should occur once every 3 months.
    5.  **Travel:** Rohan must travel for business (UK, US, South Korea, Jakarta) for about 1 week every 4 weeks.
    6.  **Output Format:** Your entire response must be ONLY the raw JSON object, starting with `{` and ending with `}`. No explanations, no markdown.

    **CRITICAL:** The validity of the entire project depends on your strict compliance with this schema. Do not invent new structures.
    """

def generate_chunk_data(prompt):
    """Sends a request to the API to generate data for a small chunk of time."""
    print(f"Sending request to OpenRouter with model: {MODEL_TO_USE}...")
    try:
        response = client.chat.completions.create(
            model=MODEL_TO_USE,
            messages=[
                {"role": "system", "content": "You are a JSON data generation expert. You only output valid, raw JSON that strictly adheres to the user's provided schema. Do not provide any commentary or markdown formatting."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=TOKEN_LIMIT,
            extra_headers={
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "Elyx Hackathon Data Generator"
            }
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"An error occurred during API call: {e}")
        return None

def create_context_summary(chunk_data):
    """Creates a summary of the data chunk to feed into the next prompt."""
    if not chunk_data:
        return "No data was generated for the previous period."
    
    summary_points = []
    last_day = chunk_data[-1]
    date_obj = datetime.strptime(last_day['date'], '%Y-%m-%d')
    summary_points.append(f"Summary of events up to {date_obj.strftime('%B %d, %Y')}:")

    key_events = [event.get('title') for day in chunk_data for event in day.get('events', []) if event and event.get('title')]
    if key_events:
        summary_points.append(f"- Key Events: {'; '.join(list(set(key_events)))}")
    else:
        summary_points.append("- No major events occurred.")

    last_message_text = "No messages in this period."
    for day in reversed(chunk_data):
        if day.get('messages'):
            last_message_text = day['messages'][-1].get('text', 'N/A')
            break
    summary_points.append(f"- The last conversation was about: '{last_message_text[:100]}...'")
    return "\n".join(summary_points)


def generate_full_journey():
    """
    Generates the 8-month journey data in 15-day chunks to stay under strict token limits.
    """
    if not API_KEY:
        print("ERROR: OPENROUTER_API_KEY not found in .env file.")
        return

    base_prompt = get_base_prompt()
    full_journey = []
    context_summary = "This is the very beginning of Rohan's journey. Start with his onboarding for the first half of August 2025."

    for i in range(NUM_MONTHS):
        current_month_date = START_DATE + relativedelta(months=i)
        month_name = current_month_date.strftime("%B")
        year = current_month_date.year
        _, num_days_in_month = calendar.monthrange(year, current_month_date.month)

        for part in [1, 2]:
            if part == 1:
                start_day, end_day = 1, 15
            else:
                start_day, end_day = 16, num_days_in_month

            print(f"\n--- Generating data for {month_name} {start_day}-{end_day}, {year} ---")

            instruction = f"""
            **Current Task:**
            Generate the JSON data ONLY for the period: **{month_name} {start_day} to {end_day}, {year}**.

            **Previous Context (Read this to ensure continuity):**
            {context_summary}

            Your entire response MUST be the JSON object for this specific period, strictly following the schema.
            """
            chunk_prompt = base_prompt + instruction
            
            generated_text = generate_chunk_data(chunk_prompt)

            if not generated_text:
                print(f"Failed to generate data for this period. Aborting.")
                return

            try:
                if generated_text.strip().startswith("```json"):
                    generated_text = generated_text.strip()[7:-3].strip()

                chunk_json = json.loads(generated_text)
                chunk_days_data = chunk_json.get("journey", [])
                
                if not chunk_days_data:
                    print(f"Warning: No 'journey' data found for this period.")
                    continue

                full_journey.extend(chunk_days_data)
                print(f"Successfully parsed {len(chunk_days_data)} days for this period.")
                
                context_summary = create_context_summary(chunk_days_data)

            except json.JSONDecodeError as e:
                print(f"ERROR: Failed to decode JSON for {month_name} part {part}. Error: {e}")
                print("--- Model Output Start ---")
                print(generated_text)
                print("--- Model Output End ---")
                print("Aborting generation.")
                return
            
            time.sleep(5)

    output_path = os.path.join("data", "journeyData.json")
    os.makedirs("data", exist_ok=True)
    final_output = {"journey": full_journey}
    with open(output_path, 'w') as f:
        json.dump(final_output, f, indent=2)
    
    print(f"\n Successfully generated and saved a full {NUM_MONTHS}-month journey to {output_path}")


if __name__ == "__main__":
    generate_full_journey()