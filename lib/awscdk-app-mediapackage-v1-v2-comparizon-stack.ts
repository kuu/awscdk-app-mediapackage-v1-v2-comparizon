import { Aws, Stack, StackProps, CfnOutput, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FilePublisher } from 'awscdk-construct-file-publisher';
import { LiveChannelFromMp4 } from 'awscdk-construct-live-channel-from-mp4-file';
import { CloudFront } from './CloudFront'

export class AwscdkAppMediapackageV1V2ComparizonStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Upload all the files in the local folder (./upload) to S3
    const publicFolder = new FilePublisher(this, 'FilePublisher', {
      path: './upload',
    });

    // Create a MediaLive channel with MediaPackage V1/V2 endpoints
    const { eml, empv1, empv2 } = new LiveChannelFromMp4(this, 'LiveChannelFromMp4', {
      source: `${publicFolder.url}/dog.mp4`, // required
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
    new CfnOutput(this, "MediaLiveChannelId", {
      value: eml.channel.ref,
      exportName: Aws.STACK_NAME + "MediaLiveChannelId",
      description: "MediaLive channel ID",
    });

    // Access MediaPackage_v1 endpoints attributes via `empv1.endpoints`
    if (empv1?.endpoints) {
      const cf = new CloudFront(this, 'CloudFrontV1', {
        videoContentSourceUrl: empv1.endpoints.hls?.attrUrl as string,
      });
      const urlPrefix = `https://${cf.distribution.distributionDomainName}/out/v1`;
      let arr = Fn.split('/', empv1.endpoints.hls?.attrUrl as string);
      new CfnOutput(this, "MediaPackageV1HlsEndpoint", {
        value: `${urlPrefix}/${Fn.select(5, arr)}/${Fn.select(6, arr)}`,
        exportName: Aws.STACK_NAME + "MediaPackageV1HlsEndpoint",
        description: "MediaPackage V1 HLS endpoint URL",
      });
      arr = Fn.split('/', empv1.endpoints.dash?.attrUrl as string);
      new CfnOutput(this, "MediaPackageV1DashEndpoint", {
        value: `${urlPrefix}/${Fn.select(5, arr)}/${Fn.select(6, arr)}`,
        exportName: Aws.STACK_NAME + "MediaPackageV1DashEndpoint",
        description: "MediaPackage V1 DASH endpoint URL",
      });
      arr = Fn.split('/', empv1.endpoints.cmaf?.attrUrl as string);
      new CfnOutput(this, "MediaPackageV1CmafEndpoint", {
        value: `${urlPrefix}/${Fn.select(5, arr)}/${Fn.select(6, arr)}`,
        exportName: Aws.STACK_NAME + "MediaPackageV1CmafEndpoint",
        description: "MediaPackage V1 CMAF (HLS with fMP4) endpoint URL",
      });
      arr = Fn.split('/', empv1.endpoints.mss?.attrUrl as string);
      new CfnOutput(this, "MediaPackageV1MssEndpoint", {
        value: `${urlPrefix}/${Fn.select(5, arr)}/${Fn.select(6, arr)}`,
        exportName: Aws.STACK_NAME + "MediaPackageV1MssEndpoint",
        description: "MediaPackage V1 Microsoft Smooth Streaming endpoint URL",
      });
    }

    // Access MediaPackage_v2 endpoint URLs via `empv2.endpointUrls`
    if (empv2?.endpointUrls) {
      const cf = new CloudFront(this, 'CloudFrontV2', {
        videoContentSourceUrl: empv2.endpointUrls.hls as string,
      });
      const urlPrefix = `https://${cf.distribution.distributionDomainName}/out/v1`;
      let arr = Fn.split('/', empv2.endpointUrls.hls as string);
      new CfnOutput(this, "MediaPackageV2HlsEndpoint", {
        value: `${urlPrefix}/${Fn.select(5, arr)}/${Fn.select(6, arr)}/${Fn.select(7, arr)}/${Fn.select(8, arr)}`,
        exportName: Aws.STACK_NAME + "MediaPackageV2HlsEndpoint",
        description: "MediaPackage V2 HLS endpoint URL",
      });
      arr = Fn.split('/', empv2.endpointUrls.llHls as string);
      new CfnOutput(this, "MediaPackageV2LlHlsEndpoint", {
        value: `${urlPrefix}/${Fn.select(5, arr)}/${Fn.select(6, arr)}/${Fn.select(7, arr)}/${Fn.select(8, arr)}`,
        exportName: Aws.STACK_NAME + "MediaPackageV2LlHlsEndpoint",
        description: "MediaPackage V2 Low-Latency HLS endpoint URL",
      });
      arr = Fn.split('/', empv2.endpointUrls.dash as string);
      new CfnOutput(this, "MediaPackageV2DashEndpoint", {
        value: `${urlPrefix}/${Fn.select(5, arr)}/${Fn.select(6, arr)}/${Fn.select(7, arr)}/${Fn.select(8, arr)}`,
        exportName: Aws.STACK_NAME + "MediaPackageV2DashEndpoint",
        description: "MediaPackage V2 DASH endpoint URL",
      });
    }
  }
}
