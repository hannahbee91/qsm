# Queer Speed Meet

A custom, responsive speed meet platform built with Next.js App Router.

## Project Structure

| Directory | Description |
|---|---|
| `/app` | Next.js App Router — Registrant UI, Admin UI, Event Feedback |
| `/app/api` | API routes — Auth, User Management, Matchmaking, Events |
| `/prisma` | PostgreSQL schema and migrations |
| `docker-compose.yml` | Full-stack deployment (PostgreSQL + app) |

---

## 💻 Local Development

### Prerequisites

- Node.js v20.9.0+
- Docker & Docker Compose

### 1. Configure Environment

```bash
cp .env.example .env
```

Fill in your `.env` — see `.env.example` for all available variables.

### 2. Start the Database

```bash
docker compose up -d db
```

> The database runs on port **5433** to avoid conflicts with a local PostgreSQL install.

### 3. Install Dependencies & Migrate

```bash
npm install
npx prisma migrate dev
```

### 4. Run the Dev Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). On first run you'll be prompted to create an admin user.

---

## 🧪 Testing

### Production Build Check

Verify the app compiles without type errors:

```bash
npm run build
```

### Full-Stack Docker Test

Run the entire stack locally (database + app) to validate the Docker image:

```bash
docker compose up --build
```

This builds the app image with the values in your `.env` and starts both the database and the app at [http://localhost:3000](http://localhost:3000).

---

## 🚀 Production Deployment (Docker Compose)

Deploy on any machine with Docker and Docker Compose installed.

### 1. Clone & Configure

```bash
git clone <your-repo-url>
cd qsm
cp .env.example .env
```

Edit `.env` with your production values:

- Set `POSTGRES_PASSWORD` to a strong random password
- Set `NEXTAUTH_SECRET` to a random secret (e.g. `openssl rand -base64 32`)
- Set `NEXTAUTH_URL` and `AUTH_URL` to your production domain
- Configure SMTP credentials for email
- Set `NEXT_PUBLIC_APP_NAME` to your event name

### 2. Start

```bash
docker compose up -d --build
```

The app will:

1. Build the Next.js production image (baking in `NEXT_PUBLIC_*` values)
2. Start PostgreSQL and wait for it to be healthy
3. Run Prisma migrations automatically
4. Start the app on port 3000

### 3. Updates

Pull the latest code and rebuild:

```bash
git pull
docker compose up -d --build
```

Migrations run automatically on each container start.

---

## ☁️ Production Deployment (AWS ECS + Fargate)

A fully managed, scalable deployment to AWS using ECS Fargate and EFS. A single task will run both the app and database.

### 1. Prerequisite Infrastructure

You will need the following information from your AWS environment:
- **VPC ID** and two **Subnet IDs** (ideally public subnets to reduce NAT gateway costs)
- A **Hosted Zone ID** for your domain in Route 53
- A valid **Domain Name** managed in the hosted zone

### 2. Deploy CloudFormation Template

Using the AWS CLI, deploy the included CloudFormation template. Remember to override the parameters as necessary:

```bash
aws cloudformation deploy \
  --template-file aws/cloudformation.yml \
  --stack-name qsm-prod \
  --parameter-overrides \
      VpcId=vpc-xxxxxx \
      Subnet1Id=subnet-xxxxxx \
      Subnet2Id=subnet-yyyyyy \
      DomainName=qsm.example.com \
      HostedZoneId=Zxxxxxx \
      ContainerImage=qsm/qsm:latest \
      PostgresPassword=changeme \
      NextAuthSecret=your-generated-secret \
      SmtpHost=email-smtp.us-east-1.amazonaws.com \
      SmtpPort=465 \
      SmtpUser=user \
      SmtpPass=pass \
      EmailFrom="App Name <you@example.com>" \
      SupportEmail="[EMAIL_ADDRESS]" \
  --capabilities CAPABILITY_IAM
```

### 3. Placing CloudFront in Front of ALB (Optional but Recommended)

For improved performance, caching of static assets, and Web Application Firewall (WAF) integration, place a CloudFront Web Distribution in front of your ALB:
1. Go to AWS CloudFront and click **Create Distribution**.
2. **Origin Domain**: Select the Application Load Balancer created by the stack.
3. **Viewer Protocol Policy**: `Redirect HTTP to HTTPS`.
4. **Allowed HTTP Methods**: `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`.
5. **Cache Policy**: Create a policy to forward `Host`, `Authorization`, and `Cookie` headers, or use the `CachingDisabled` managed policy to avoid caching dynamic API/SSR responses. Alternatively, use a custom policy to cache static assets (`/_next/static/*`) and forward everything else.
6. **Alternate Domain Names (CNAME)**: Add your application domain name.
7. **Custom SSL Certificate**: Assign an ACM Certificate issued in `us-east-1`.

> **Note**: Update your Route 53 A-Record to point to the CloudFront distribution domain instead of the ALB domain if you do this.

### 4. Updates on ECS

The GitHub Actions workflow automatically builds new Docker images and pushes them to Docker Hub. To update your ECS deployment after a push to `main`:

```bash
aws ecs update-service \
  --cluster qsm-prod \
  --service <Service-Name-From-CF-Outputs> \
  --force-new-deployment
```

This will spin up a new Fargate task using the new `latest` tag and seamlessly drain connections from the old task.
