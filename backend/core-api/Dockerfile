FROM python:3.10-slim

WORKDIR /app

# Install build dependencies for libraries like psycopg2 and bcrypt
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python requirements
COPY core-api/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files from the backend context to /app
COPY . .

# Expose the port FastAPI runs on
EXPOSE 8000

# Add /app to pythonpath so that we can import shared modules
ENV PYTHONPATH=/app

# Run uvicorn with hot reload enabled
CMD ["uvicorn", "core-api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
