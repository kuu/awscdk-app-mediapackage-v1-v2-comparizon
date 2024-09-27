import { Aws, Fn } from 'aws-cdk-lib';
import {
  OriginSslPolicy,
  OriginProtocolPolicy,
  Distribution,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
  CachePolicy,
  AllowedMethods,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export interface CloudFrontProps {
  readonly videoContentSourceUrl: string;
}

export class CloudFront extends Construct {
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, {
    videoContentSourceUrl,
  }: CloudFrontProps) {

    super(scope, id);

    // Create content origin
    const videoContentOrigin = new HttpOrigin(
      Fn.select(2, Fn.split('/', videoContentSourceUrl)),
      {
        originSslProtocols: [OriginSslPolicy.SSL_V3],
        protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
      },
    );

    // Create CloudFront distribution
    const distribution = new Distribution(this, 'Distribution', {
      comment: `${Aws.STACK_NAME} - CloudFront distribution for MediaPackage`,
      defaultRootObject: '',
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2016,
      defaultBehavior: { // HLS/DASH segment
        origin: videoContentOrigin,
        cachePolicy: CachePolicy.ELEMENTAL_MEDIA_PACKAGE,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    this.distribution = distribution;
  }
}