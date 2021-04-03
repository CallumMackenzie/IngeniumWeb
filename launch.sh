port=8080
echo Server started on port $port: http://localhost:$port
python3 -m http.server $port
