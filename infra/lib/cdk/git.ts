import * as cdk from "aws-cdk-lib";
import { Repository } from "aws-cdk-lib/aws-codecommit";
import { Construct } from "constructs";

export class Git extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new Repository(this, "Repository", {
      repositoryName: "main",
    });
  }
}
