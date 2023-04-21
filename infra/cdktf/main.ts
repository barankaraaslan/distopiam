import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import * as aws from "@cdktf/provider-aws";

class UserManagment extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new aws.provider.AwsProvider(this, "provider");
  }
}

const app = new App();
new UserManagment(app, "UserManagment");
app.synth();
