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
ENV GDAL_LIBRARY_PATH="/usr/lib/libgdal.so"
ENV PROJ_LIB="/usr/share/proj"
ENV LD_LIBRARY_PATH="/usr/lib"

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
ENV GDAL_LIBRARY_PATH="/usr/lib/libgdal.so"
ENV PROJ_LIB="/usr/share/proj"
ENV LD_LIBRARY_PATH="/usr/lib"

# # Create a non-root user for security
# RUN addgroup -S django && adduser -S django -G django
# USER django

WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy Django application
COPY . .

# Debug GDAL Path Issues
RUN ls -lah /usr/lib/libgdal.so || echo "GDAL library not found!"

ENTRYPOINT ["/bin/sh", "-c", "echo 'Starting application...'; exec sh -c \"$@\""]

# Default command (Can be overridden in CI/CD or Compose)
CMD ["gunicorn", "-b", "0.0.0.0:8000", "washbuddy.wsgi:application", "--workers=3", "--threads=2", "--timeout=120"]
