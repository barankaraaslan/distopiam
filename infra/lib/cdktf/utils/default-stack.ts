import { S3Backend, TerraformStack } from "cdktf";
import { Construct } from "constructs";

export class DefaultTerraformStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new S3Backend(this, {
      bucket: "terraform-backend-322343128595",
      key: id,
      region: "eu-west-1",
    });
  }
}
