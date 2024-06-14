# Use Ubuntu as the base image
FROM public.ecr.aws/ubuntu/ubuntu:latest

# Update Package List and install dependencies
RUN apt-get update && \
    apt-get install -y wget software-properties-common curl gnupg

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install Lighthouse CI CLI
RUN npm install -g http-server

# Create directory for Lighthouse CI configuration and set it as the working directory
WORKDIR /usr/src/app

# Add entrypoint script
COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]