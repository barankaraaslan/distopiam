import * as cdk from "aws-cdk-lib";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

export class DNS extends cdk.Stack {
  readonly hostedZone: HostedZone;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.hostedZone = new HostedZone(this, "distopiam.info-HostedZone", {
      zoneName: "distopiam.info",
    });
  }
}
