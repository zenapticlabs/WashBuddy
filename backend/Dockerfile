# ==== BASE IMAGE (Build Dependencies) ====
FROM python:3.11-alpine AS builder

# Install system dependencies (GDAL, GEOS, PROJ, PostgreSQL)
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
    postgresql-dev \
    libffi-dev \
    openssl-dev \
    py3-numpy \
    py3-pip

# Set environment variables for GDAL
ENV GDAL_LIBRARY_PATH=/usr/lib/libgdal.so
ENV PROJ_LIB=/usr/share/proj

# Create a virtual environment
RUN python3 -m venv /opt/venv

# Set the virtual environment as default Python
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ==== FINAL IMAGE (Production-Optimized) ====
FROM python:3.11-alpine

# Install only runtime dependencies (No compilers)
RUN apk add --no-cache \
    gdal \
    geos \
    proj \
    postgresql-client \
    libffi \
    openssl

# Copy GDAL and PROJ environment variables
ENV GDAL_LIBRARY_PATH=/usr/lib/libgdal.so
ENV PROJ_LIB=/usr/share/proj

# Create a non-root user for security
RUN addgroup -S django && adduser -S django -G django
USER django

# Set working directory
WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy Django application
COPY . .

# Set Entrypoint to only wait for database, NO migrations inside container
ENTRYPOINT ["/bin/sh", "-c", \
    "until pg_isready -h db -p 5432; do echo 'Waiting for database...'; sleep 2; done; \
    echo 'Database is ready. Starting application...'; \
    exec \"$@\""]

# Default command (Can be overridden in CI/CD or Compose)
CMD ["gunicorn", "-b", "0.0.0.0:8000", "myproject.wsgi:application", "--workers=3", "--threads=2", "--timeout=120"]
