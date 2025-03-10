# Use an Alpine-based Python image
FROM python:3.11-alpine

# Install required system dependencies
RUN apk add --no-cache \
    g++ \
    gcc \
    musl-dev \
    make \
    gdal \
    gdal-dev \
    geos \
    geos-dev \
    proj \
    proj-dev \
    postgresql-client \
    libffi-dev \
    openssl-dev \
    py3-numpy \
    py3-pip

# Set environment variables for GDAL
ENV GDAL_LIBRARY_PATH=/usr/lib/libgdal.so
ENV PROJ_LIB=/usr/share/proj

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the Django application
COPY . .

ENTRYPOINT ["/bin/sh", "-c"]

# Default command (Can be overridden in CI/CD or Compose)
CMD ["gunicorn", "--chdir", "/app", "-b", "0.0.0.0:8000", "washbuddy.wsgi:application", "--workers=3", "--threads=2", "--timeout=120"]
