import * as cdk from "aws-cdk-lib";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class Network extends cdk.Stack {
  readonly vpc: Vpc;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.vpc = new Vpc(this, "Vpc", {
      natGateways: 0,
      vpcName: "main",
    });
  }
}
