import os
import requests

FAST2SMS_API_KEY = "bLIhJVH3P2WKiYCZTrGnD9ct74a6FAgvoqSEMOXeszNd0BpQl5kpO9SsW3hvHtJTe2Cijy7V1Klg4YxG"

def send_sms(phone_number: str, message: str) -> bool:
    """Sends an SMS using Fast2SMS API."""
    url = "https://www.fast2sms.com/dev/bulkV2"
    
    # Clean the phone number to get 10 digits
    clean_number = "".join(filter(str.isdigit, phone_number))
    if clean_number.startswith("91") and len(clean_number) == 12:
        clean_number = clean_number[2:]
    
    payload = {
        "route": "q",
        "sender_id": "FSTSMS",
        "message": message,
        "language": "english",
        "flash": 0,
        "numbers": clean_number
    }
    
    headers = {
        "authorization": FAST2SMS_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        response = requests.post(url, data=payload, headers=headers)
        if response.status_code == 200:
            print(f"SMS Sent successfully to {clean_number}")
            return True
        else:
            print(f"Failed to send SMS: {response.text}")
            return False
    except Exception as e:
        print(f"Exception sending SMS: {e}")
        return False
