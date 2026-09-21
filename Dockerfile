FROM oven/bun:1 as development

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies (disable frozen lockfile to avoid cache integrity issues)
RUN bun install --no-frozen-lockfile

# Copy project files
COPY . .

# Expose express/Vite dev server port
EXPOSE 3000

# Start development server
CMD ["bun", "run", "dev"]
