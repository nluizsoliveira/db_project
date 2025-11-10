FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . /app

ENV FLASK_APP=wsgi.py \
    FLASK_ENV=development

CMD ["flask", "run", "--host=0.0.0.0"]
