# 1) Base OS + Node installed
FROM node:20-alpine

# 2) Create working directory inside container
WORKDIR /app

# 3) Copy dependency files first (important for caching)
COPY package*.json ./

# 4) Install dependencies
RUN npm install

# 5) Copy rest of your backend code
COPY . .

# 6) Tell Docker which port the app uses
EXPOSE 5001

# 7) Start backend
CMD ["npm", "start"]
