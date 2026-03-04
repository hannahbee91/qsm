FROM node:20.9.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Next.js bakes NEXT_PUBLIC_* values at build time
ARG NEXT_PUBLIC_APP_NAME=""
ARG NEXT_PUBLIC_KO_FI_USERNAME=""
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_KO_FI_USERNAME=$NEXT_PUBLIC_KO_FI_USERNAME

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Install Prisma CLI with all transitive dependencies for runtime migrations
FROM base AS prisma-cli
WORKDIR /prisma-cli
COPY --from=builder /app/node_modules/@prisma/client/package.json ./ref.json
RUN npm init -y > /dev/null 2>&1 && \
    npm install --no-audit --no-fund prisma@$(node -e "console.log(require('./ref.json').version)")

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema, migrations, and generated client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma CLI and all its transitive dependencies
COPY --from=prisma-cli --chown=nextjs:nodejs /prisma-cli/node_modules ./node_modules_prisma
# Merge prisma CLI modules into app node_modules (overlay, don't overwrite existing @prisma)
RUN cp -rn /app/node_modules_prisma/* /app/node_modules/ 2>/dev/null; \
    cp -rn /app/node_modules_prisma/.prisma/* /app/node_modules/.prisma/ 2>/dev/null; \
    rm -rf /app/node_modules_prisma

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Run migrations and then start Next.js
CMD ["./docker-entrypoint.sh"]
