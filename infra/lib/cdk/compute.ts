import * as cdk from "aws-cdk-lib";
import {
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
  SubnetFilter,
  SubnetType,
  UserData,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

interface ComputeProps extends cdk.StackProps {
  vpc: Vpc;
}

export class Compute extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ComputeProps) {
    super(scope, id, props);
    const sg = new SecurityGroup(this, "SecurityGroup", {
      vpc: props.vpc,
      securityGroupName: "main-instance",
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(22));
    const instanceUserData = UserData.forLinux();
    instanceUserData.addCommands("sudo yum install -y docker");
    instanceUserData.addCommands("sudo service docker start");
    instanceUserData.addCommands(`sudo docker run --detach \
  --hostname gitlab.example.com \
  --publish 443:443 --publish 80:80 --publish 22:22 \
  --name gitlab \
  --restart always \
  --volume ~/gitlab/config:/etc/gitlab \
  --volume ~/gitlab/logs:/var/log/gitlab \
  --volume ~/gitlab/data:/var/opt/gitlab \
  --shm-size 256m \
  gitlab/gitlab-ee:latest
`);

    new Instance(this, "Instance", {
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      machineImage: MachineImage.latestAmazonLinux(),
      vpc: props.vpc,
      instanceName: "main",
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
        onePerAz: true,
      },
      securityGroup: sg,
      userData: instanceUserData,
    });
  }
}
