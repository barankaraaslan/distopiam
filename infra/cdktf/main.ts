import { Construct } from "constructs";
import { App, S3Backend, TerraformStack } from "cdktf";
import * as aws from "@cdktf/provider-aws";

class TerraformBackend extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new aws.provider.AwsProvider(this, "provider");

    const callerId = new aws.dataAwsCallerIdentity.DataAwsCallerIdentity(
      this,
      "current"
    );
    new aws.s3Bucket.S3Bucket(this, "terraform-backend", {
      bucket: `terraform-backend-${callerId.accountId}`,
    });

    new S3Backend(this, {
      bucket: "terraform-backend-322343128595",
      key: id,
      region: "eu-west-1",
    });
  }
}

const app = new App();
new TerraformBackend(app, "TerraformBackend");

app.synth();
