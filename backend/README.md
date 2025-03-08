# WashBuddy - Django + PostGIS (Dockerized)

WashBuddy is a Django + PostGIS application for geospatial data, running in a Dockerized environment with automatic database migrations and live reloading

## 📌 Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/compose/install/)

## 📦 Setup & Run Locally

2. **Create a `.env` file in the project root:**
   ```ini
   DATABASE_URL=postgresql://washbuddy_user:washbuddy_pass@db:5432/washbuddy
   DEBUG=True
   ```

3. **Start the application:**
    This will build and start containers, and also watch for file changes.
    Dockerfile.dev is being used for local development
   ```sh
   docker-compose up --build
   ```

4. **Access the application:**
   - **Django App:** [http://localhost:8000](http://localhost:8000)
   - **Admin Panel:** [http://localhost:8000/admin](http://localhost:8000/admin)

## 🛠 Useful Commands
- **Stop containers:** `docker-compose down`
- **Remove database volume:** `docker-compose down -v`
- **Run migrations:** `docker-compose exec django python manage.py migrate`
- **Create superuser:** `docker-compose exec django python manage.py createsuperuser`
- **Check logs:** `docker-compose logs -f django`

## 📬 Need Help?
- **Django Docs:** [https://docs.djangoproject.com/](https://docs.djangoproject.com/)
- **Docker Docs:** [https://docs.docker.com/](https://docs.docker.com/)