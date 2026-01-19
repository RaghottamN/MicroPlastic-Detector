FROM python:3.10

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

# Install system dependencies
RUN apt-get update && apt-get install -y \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY . .

CMD ["python", "app.py"]
