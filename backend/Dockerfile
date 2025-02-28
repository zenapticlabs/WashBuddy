# Use an official Python image
FROM python:3.11-slim

# Install required system packages (PostGIS support)
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Start Django with `watchfiles`
CMD ["watchfiles", "python", "manage.py", "runserver", "0.0.0.0:8000"]
