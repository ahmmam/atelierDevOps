FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY service ./service
EXPOSE 9000
CMD ["uvicorn", "service.main:app", "--host", "0.0.0.0", "--port", "9000"]

