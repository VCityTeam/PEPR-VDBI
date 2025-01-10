# source ORCiD API secrets
. .env

# get access token
curl -L -k -s \
  -H "Accept: application/json" \
  --data "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&grant_type=client_credentials&scope=/read-public" \
  https://orcid.org/oauth/token 2>&1
