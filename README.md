# awscdk-app-mediapackage-v1-v2-comparizon

CDK app for deploying MediaLive channel + MediaPackage V1 and V2 endpoints

## Install
1. Setup [CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) environment (including Node.js, Docker)

2. Install this CDK app
```
$ git clone https://github.com/kuu/awscdk-app-mediapackage-v1-v2-comparizon.git
$ cd awscdk-app-mediapackage-v1-v2-comparizon
$ npm i
```

## Deploy
```
$ npx cdk deploy
```

### Outputs
After the deployment, the following output will be printed:
* InputBucket: S3 bucket to upload the input file to
* OutputBucket: S3 bucket to store the output files
* EventBridgeRuleName: The EventBridge Rule to recieve S3 notifications and trigger the StepFunction state machine
* PlaybackUrl1: HLS playlist transcoded with the original caption
* PlaybackUrl2: HLS playlist transcoded with the styled caption

## Cleanup
```
$ npx cdk destroy
```