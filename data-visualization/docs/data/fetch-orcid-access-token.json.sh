CLIENT_ID='APP-JYXHEML7DYQIA0R0'
CLIENT_SECRET='a2c72289-0e1f-4611-b16a-3b91f14b3206'

curl -L -k -s \
  -H "Accept: application/json" \
  --data "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&grant_type=client_credentials&scope=/read-public" \
  https://orcid.org/oauth/token 2>&1
