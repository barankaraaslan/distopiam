import { Construct } from "constructs";
import { App, Fn, S3Backend, TerraformStack } from "cdktf";
import * as aws from "@cdktf/provider-aws";

class DefaultTerraformStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new S3Backend(this, {
      bucket: "terraform-backend-322343128595",
      key: id,
      region: "eu-west-1",
    });
  }
}

class TerraformBackend extends DefaultTerraformStack {
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
  }
}

// before deploying this stack, iam identity center must be enabled
class WorkforceManagement extends DefaultTerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new aws.provider.AwsProvider(this, "provider");
    const ids = new aws.dataAwsSsoadminInstances.DataAwsSsoadminInstances(
      this,
      "intances"
    ).identityStoreIds;
    new aws.identitystoreUser.IdentitystoreUser(this, "baran", {
      displayName: "baran",
      identityStoreId: Fn.element(ids, 0),
      name: {
        familyName: "Karaaslan",
        givenName: "Baran",
      },
      userName: "baran",
      emails: {
        primary: true,
        value: "barankaraaslan@protonmail.com",
      },
    });
    new aws.identitystoreGroup.IdentitystoreGroup(this, "PlatformEngineers", {
      displayName: "Platform Engineers",
      identityStoreId: Fn.element(ids, 1),
    });
  }
}

const app = new App();
new TerraformBackend(app, "TerraformBackend");
new WorkforceManagement(app, "WorkforceManagement");
app.synth();
