```bash
# Requirements: you must have curl installed and the json module for pretty formatting:
npm install -g json;

# Start our REST API server
npm start;

# Create the pets
curl -s -X POST -H "Content-Type: application/json" http://localhost:3000/api/v1/pets -d "{\"_id\":1,\"type\":\"dog\"}"  | json -i;
curl -s -X POST -H "Content-Type: application/json" http://localhost:3000/api/v1/pets -d "{\"_id\":2,\"type\":\"cat\"}"  | json -i;
curl -s -X POST -H "Content-Type: application/json" http://localhost:3000/api/v1/pets -d "{\"_id\":3,\"type\":\"seabeast\"}"  | json -i;

# View them
curl -s -X GET -H "Accept: application/json" http://localhost:3000/api/v1/pets | json -i;

# Use json patches to name them
curl -s -X PUT -H "Content-Type: application/json" http://localhost:3000/api/v1/pets/1 -d "[{\"op\":\"add\",\"path\":\"/name\",\"value\":\"Arlo\"}]" | json -i;
curl -s -X PUT -H "Content-Type: application/json" http://localhost:3000/api/v1/pets/2 -d "[{\"op\":\"add\",\"path\":\"/name\",\"value\":\"Basil\"}]" | json -i;
curl -s -X PUT -H "Content-Type: application/json" http://localhost:3000/api/v1/pets/3 -d "[{\"op\":\"test\",\"path\":\"/type\",\"value\":\"seabeast\"},{\"op\":\"replace\",\"path\":\"/type\",\"value\":\"cat\"},{\"op\":\"add\",\"path\":\"/name\",\"value\":\"Kochka\"}]" | json -i;

# Now view them again:
curl -s -X GET -H "Accept: application/json" http://localhost:3000/api/v1/pets | json -i;
```
