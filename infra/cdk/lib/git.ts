import * as cdk from "aws-cdk-lib";
import { Code, Repository } from "aws-cdk-lib/aws-codecommit";
import { Construct } from "constructs";
import { join } from "path";

export class Git extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new Repository(this, "Repository", {
      repositoryName: "distopiam",
    });
  }
}
