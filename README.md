# Autobahn Infrastructure - README 🚀

---

## 🛠️ **Introduction**

**Autobahn Infrastructure** is a comprehensive cloud-native framework designed to power high-performance, scalable web application deployments. Built for modern development workflows, Autobahn automates infrastructure provisioning, performance auditing, and observability using the **AWS Cloud Development Kit (CDK)** with **TypeScript**.

The infrastructure includes prebuilt integrations for **Google Lighthouse** audits, making it ideal for teams focused on delivering fast, accessible, and reliable applications.

### **Why Autobahn?**

In a fast-paced digital environment, delivering consistent, high-quality web experiences is critical. Autobahn Infrastructure eliminates the complexity of setting up scalable cloud environments and provides the tools necessary to monitor, audit, and optimize web applications.

---

## 🌟 **Key Features**

### **Performance Optimization**

- **Lighthouse Automation**: Run on-demand or scheduled performance audits for web applications.
- **Error Handling**: Automatically detects and handles failed audits with recovery workflows.

### **Scalable Infrastructure**

- **AWS Fargate**: Serverless container orchestration for worker tasks.
- **Global Distribution**: Serve frontend assets with **CloudFront** and **Route 53**.

### **Observability**

- **S3 Buckets for Audit Reports**: Stores detailed Lighthouse reports.
- **Event-Driven Architecture**: Uses **SNS** to trigger workflows for playlist updates or other custom events.

### **Secure and Configurable**

- **DynamoDB Caching**: High-speed, serverless caching for temporary data.
- **GitHub Actions Integration**: Streamlines CI/CD workflows.
- **IAM Role-Based Access Control**: Fine-grained security for your application.

---

## 🛠️ **Use Cases**

1. **Web Performance Monitoring**
   Continuously monitor and improve website performance using Lighthouse metrics like speed, accessibility, and SEO.

2. **Content Delivery at Scale**
   Serve assets globally through CloudFront with domain management via Route 53.

3. **Automated Recovery**
   Automatically handle errors during auditing workflows by triggering recovery processes.

4. **CI/CD Pipelines**
   Enable seamless deployment workflows using GitHub Actions and AWS CDK.

5. **Data-Driven Insights**
   Store and analyze Lighthouse reports for long-term trend analysis and optimization strategies.

---

## 📋 **Requirements**

- **AWS CLI**: Configured with appropriate credentials.
- **Node.js**: Version 20.x or higher.
- **AWS CDK**: Version 2.173.0 or higher.
- **Docker**: To build and run worker images.
- **Environment Variables**: Use a `.env` file for secrets and configurations.

---

## 📦 **Setup & Deployment**

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/gaulatti/autobahn-infrastructure.git
cd autobahn-infrastructure
```

### **Step 2: Install Dependencies**

```bash
npm install
```

### **Step 3: Configure Environment Variables**

Create a `.env` file with the required values:

```env
AWS_ACCOUNT_ID=<your-aws-account-id>
AWS_REGION=<your-aws-region>
HOSTED_ZONE_ID=<your-hosted-zone-id>
HOSTED_ZONE_NAME=<your-hosted-zone-name>
```

### **Step 4: Deploy the Infrastructure**

```bash
npm run deploy
```

This command provisions all resources, including ECS clusters, DynamoDB tables, S3 buckets, and CI/CD pipelines.

---

## 🚀 **Usage**

### **Triggering Lighthouse Audits**

Once deployed, Lighthouse audits can be triggered on-demand by:

1. Sending an SNS message to the worker's topic.
2. Using an HTTP API Gateway endpoint (if configured).

### **Viewing Reports**

Lighthouse reports are uploaded to the specified S3 bucket. Use the AWS Management Console or AWS CLI to access them:

```bash
aws s3 cp s3://<bucket-name>/<report-name>.json ./local-report.json
```

---

## 🔧 **Customization**

### **Configuring Audit Settings**

- Update `lib/worker/assets/entrypoint.sh` to modify Lighthouse flags, throttling settings, or add custom logic.

### **Extending Workflows**

- Add new Lambda functions for custom actions, such as integrating with third-party analytics or sending reports via email.

---

## 🤝 **Contributing**

We welcome contributions to enhance the Autobahn Infrastructure. Here's how to contribute:

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit:
   ```bash
   git commit -m "Describe your changes"
   ```
4. Push to your fork and create a pull request.

---

## 📜 **License**

Licensed under the **MIT License**. Refer to the `LICENSE` file for more details.

---

## 💡 **Additional Notes**

- **Audit Tool**: Utilizes Google Lighthouse for automated performance testing.
- **Framework**: AWS CDK for infrastructure as code.
- **Security**: Implements IAM roles and secrets management via AWS Secrets Manager.

