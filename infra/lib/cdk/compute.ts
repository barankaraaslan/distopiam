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
import {
  NetworkLoadBalancer,
  NetworkTargetGroup,
  Protocol,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { InstanceTarget } from "aws-cdk-lib/aws-elasticloadbalancingv2-targets";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { DatabaseInstance, DatabaseInstanceEngine } from "aws-cdk-lib/aws-rds";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

interface ComputeProps extends cdk.StackProps {
  vpc: Vpc;
  hostedZone: HostedZone;
}

export class Compute extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ComputeProps) {
    super(scope, id, props);
    const sg = new SecurityGroup(this, "common_instance-SecurityGroup", {
      vpc: props.vpc,
      securityGroupName: "common_instance",
    });
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(22));
    sg.addIngressRule(Peer.anyIpv4(), Port.tcp(80));
    const instanceUserData = UserData.forLinux();
    instanceUserData.addCommands("sudo yum install -y docker");
    instanceUserData.addCommands("sudo service docker start");

    instanceUserData.addCommands(`cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-\$basearch
enabled=1
gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF`);
    instanceUserData.addCommands("sudo yum install -y kubectl");

    const instance = new Instance(this, "common-Instance", {
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      machineImage: MachineImage.latestAmazonLinux(),
      vpc: props.vpc,
      instanceName: "common",
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
        onePerAz: true,
      },
      securityGroup: sg,
      userData: instanceUserData,
      role: new Role(this, "common_instance-Role", {
        assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
        roleName: "common_instance",
        managedPolicies: [
          {
            managedPolicyArn:
              "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
          },
        ],
      }),
    });

    const commonDBSG = new SecurityGroup(
      this,
      "common_DatabaseInstance-SecurityGroup",
      {
        vpc: props.vpc,
        securityGroupName: "common_databaseInstance",
      }
    );
    commonDBSG.addIngressRule(
      Peer.ipv4(props.vpc.vpcCidrBlock),
      Port.tcp(3306)
    );
    new DatabaseInstance(this, "common-DatabaseInstance", {
      engine: DatabaseInstanceEngine.MYSQL,
      vpc: props.vpc,
      databaseName: "common",
      allocatedStorage: 20,
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
      instanceIdentifier: "common",
      iamAuthentication: true,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
        onePerAz: true,
      },
      securityGroups: [commonDBSG],
    });

    const instanceTarget = new InstanceTarget(instance, 80);
    const loadBalancer = new NetworkLoadBalancer(
      this,
      "common-NetworkLoadBalancer",
      {
        vpc: props.vpc,
        internetFacing: true,
        loadBalancerName: "common",
        vpcSubnets: {
          subnetType: SubnetType.PUBLIC,
          onePerAz: true,
        },
      }
    );
    // loadBalancer.loadBalancerSecurityGroups.forEach((element) => {
    //   sg.addIngressRule(Peer.securityGroupId(element), Port.tcp(80));
    // });
    const tg = new NetworkTargetGroup(
      this,
      "common_instance-80_NetworkTargetGroup",
      {
        port: 80,
        targetGroupName: "common-instance-80",
        targets: [instanceTarget],
        vpc: props.vpc,
        healthCheck: {},
      }
    );
    const tg443 = new NetworkTargetGroup(
      this,
      "common_instance-80_NetworkTargetGroup",
      {
        port: 80,
        targetGroupName: "common-instance-80",
        targets: [instanceTarget],
        vpc: props.vpc,
        healthCheck: {},
      }
    );
    loadBalancer.addListener(
      "common_instance-common_networkloadbalancer-Listener",
      {
        port: 80,
        defaultTargetGroups: [tg],
      }
    );
    loadBalancer.addListener(
      "common_instance-80_NetworkTargetGroup-443-Listener",
      {
        port: 443,
        defaultTargetGroups: [tg],
      }
    );
  }
}
