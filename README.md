# AWS Amplify DataStore Demo

This repository shows how to build a simple to-do list application which uses [AWS Amplify DataStore](https://aws-amplify.github.io/docs/js/datastore) to sync the data between the multiple concurrent users.

## Instructions

Step 0 - Install the required CLI tools.
```
yarn global add create-react-app
yarn global add @aws-amplify/cli
yarn global add amplify-app
```

Step 1 - Setup new React app.
```
create-react-app amplify-datastore-app
cd amplify-datastore-app
code .

yarn start
# Then open another terminal

git init
git add -A
git commit -a -m 'Setup new React app.'

# Open http://localhost:3000
```

Step 2 - Add Amplify DataStore to the project. This step will setup Amplify on the project and then add the required dependencies (Amplify DataStore and Semantic UI).
```
amplify-app
yarn add @aws-amplify/core @aws-amplify/datastore semantic-ui-css

git add -A
git commit -a -m 'Add Amplify DataStore to the project.'
```

Step 3 - Add GraphQL schema and then generate the Amplify DataStore model(s).
```
curl -o amplify/backend/api/amplifyDatasource/schema.graphql \
  https://raw.githubusercontent.com/aonz/amplify-datastore-demo/master/schema.graphql

yarn amplify-modelgen

git add -A
git commit -a -m 'Add GraphQL schema and then generate the Amplify DataStore model(s).'
```

Step 4 - Use Amplify DataStore in the local mode. This step will copy the to-do list app code to the project. The app now works without the backend services on AWS.
```
curl -o src/App.js \
  https://raw.githubusercontent.com/aonz/amplify-datastore-demo/master/App.js
curl -o src/App.css \
  https://raw.githubusercontent.com/aonz/amplify-datastore-demo/master/App.css

git add -A
git commit -a -m 'Use Amplify DataStore in the local mode.'

# Test the local version.
```

Step 5 - Deploy the backend on AWS. This step will generate the AWS CloudFormation template to deploy the AWS services including Amazon DynamoDB and AWS AppSync. The app now works with the backend services on AWS to share the data between the multiple users.
```
yarn amplify-push
# Will take about 5 mins. 

# Uncomment 3 lines below in src/App.js
# // import Amplify from '@aws-amplify/core';
# // import awsConfig from './aws-exports';
# // Amplify.configure(awsConfig);

git add -A
git commit -a -m 'Deploy the backend on AWS.'

# Test the online version with the backend on AWS.
# - Sync with multiple clients.
# - Online/offline sync.
```

Step 6 - Deploy the frontend on AWS. This step will update the AWS CloudFormation template to deploy the React app to AWS Amplify Console.
```
aws codecommit create-repository --repository-name amplify-datastore-app \
  --repository-description 'AWS Amplify DataStore App'
git remote add origin \
  ssh://git-codecommit.ap-southeast-1.amazonaws.com/v1/repos/amplify-datastore-app
git push --set-upstream origin master

amplify add hosting
# Choose `Hosting with Amplify Console` and then `Continuous deployment`
# Will take about 5 mins. 

git add -A
git commit -a -m 'Deploy the frontend on AWS.'

# Test the version with both the frontend and backend on AWS.
```

Step 7 - Cleanup
```
amplify delete
aws codecommit delete-repository --repository-name amplify-datastore-app
```
