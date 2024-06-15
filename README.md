# Dress You Up
This is a CDK blueprint to deploy a Lighthouse CI Server with periodic Lighthouse workers which hit a designated endpoint every minute to collect performance metrics.

Even when we can use [Lighthouse PageSpeed Insights](http://pagespeed.web.dev), in that situation we need the target endpoint to be visible from any public traffic such as Google's Servers. That can't be done if we have lower stages such as Alpha or Beta which aren't publicly visible, mostly because they're private in a VPN or the Security Group does not allow them to be seen from outside.

For this usecase, this CDK repo also contains a "Target" which is a simulation of that kind of target. In this scenario, what this repo does is to allowlist in the Security Group the traffic coming from the Lighthouse VPC through a NAT which is attached to a Elastic IP address so we can manage it easily.

<img width="2368" alt="diagram" src="https://github.com/gaulatti/dress-you-up/assets/4602751/dbd3b549-a46e-4478-8108-fa445fe5cb8e">


## About the Name?
It's just because when I created this package, this was the song being played on the radio at that time. 
https://www.youtube.com/watch?v=SOhJHS7Rvrg


## CDK Original README

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
