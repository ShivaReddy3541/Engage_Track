FROM node:20-alpine

WORKDIR /app

# Copy package descriptors
COPY package.json ./

# Install dependencies (ignoring package-lock for developer environment flexibility)
RUN npm install

# Copy all source files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Boot up the Vite dev server binding to 0.0.0.0 for access outside container
CMD ["npm", "run", "dev"]
