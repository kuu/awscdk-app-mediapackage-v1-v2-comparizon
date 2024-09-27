import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FilePublisher } from 'awscdk-construct-file-publisher';
import { LiveChannelFromMp4 } from 'awscdk-construct-live-channel-from-mp4-file';

export class AwscdkAppMediapackageV1V2ComparizonStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Upload all the files in the local folder (./upload) to S3
    const publicFolder = new FilePublisher(this, 'FilePublisher', {
      path: './upload',
    });

    // Create a MediaLive channel with MediaPackage V1/V2 endpoints
    const { eml, empv1, empv2 } = new LiveChannelFromMp4(this, 'LiveChannelFromMp4', {
      source: `${publicFolder.url}/test.mp4`, // required
      channelClass: 'STANDARD', // optional: default = 'SINGLE_PIPELINE'
      encoderSpec: {
        gopLengthInSeconds: 1, // optional: default = 3
        timecodeBurninPrefix: 'Ch1', // optional: default = no timecode overlay
      },
      mediaPackageVersionSpec: 'V1_AND_V2', // optional: default = 'V1_AND_V2'
      packagerSpec: {
        segmentDurationSeconds: 4, // optional: default = 6
        manifestWindowSeconds: 30, // optional: default = 60
        startoverWindowSeconds: 300, // optional: default = 0
      },
    });

    // Access MediaLive channel attributes via `eml.channel`
    new cdk.CfnOutput(this, "MediaLiveChannelId", {
      value: eml.channel.ref,
      exportName: cdk.Aws.STACK_NAME + "MediaLiveChannelId",
      description: "MediaLive channel ID",
    });

    // Access MediaPackage_v1 endpoints attributes via `empv1.endpoints`
    if (empv1?.endpoints) {
      new cdk.CfnOutput(this, "MediaPackageV1HlsEndpoint", {
        value: empv1.endpoints.hls?.attrUrl as string,
        exportName: cdk.Aws.STACK_NAME + "MediaPackageV1HlsEndpoint",
        description: "MediaPackage V1 HLS endpoint URL",
      });
      new cdk.CfnOutput(this, "MediaPackageV1DashEndpoint", {
        value: empv1.endpoints.dash?.attrUrl as string,
        exportName: cdk.Aws.STACK_NAME + "MediaPackageV1DashEndpoint",
        description: "MediaPackage V1 DASH endpoint URL",
      });
      new cdk.CfnOutput(this, "MediaPackageV1CmafEndpoint", {
        value: empv1.endpoints.cmaf?.attrUrl as string,
        exportName: cdk.Aws.STACK_NAME + "MediaPackageV1CmafEndpoint",
        description: "MediaPackage V1 CMAF (HLS with fMP4) endpoint URL",
      });
      new cdk.CfnOutput(this, "MediaPackageV1MssEndpoint", {
        value: empv1.endpoints.mss?.attrUrl as string,
        exportName: cdk.Aws.STACK_NAME + "MediaPackageV1MssEndpoint",
        description: "MediaPackage V1 Microsoft Smooth Streaming endpoint URL",
      });
    }

    // Access MediaPackage_v2 endpoint URLs via `empv2.endpointUrls`
    if (empv2?.endpointUrls) {
      new cdk.CfnOutput(this, "MediaPackageV2HlsEndpoint", {
        value: empv2.endpointUrls.hls as string,
        exportName: cdk.Aws.STACK_NAME + "MediaPackageV2HlsEndpoint",
        description: "MediaPackage V2 HLS endpoint URL",
      });
      new cdk.CfnOutput(this, "MediaPackageV2LlHlsEndpoint", {
        value: empv2.endpointUrls.llHls as string,
        exportName: cdk.Aws.STACK_NAME + "MediaPackageV2LlHlsEndpoint",
        description: "MediaPackage V2 Low-Latency HLS endpoint URL",
      });
      new cdk.CfnOutput(this, "MediaPackageV2DashEndpoint", {
        value: empv2.endpointUrls.dash as string,
        exportName: cdk.Aws.STACK_NAME + "MediaPackageV2DashEndpoint",
        description: "MediaPackage V2 DASH endpoint URL",
      });
    }
  }
}
