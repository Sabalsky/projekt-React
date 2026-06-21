# node:sqlite jest wbudowane od Node 22.5 - uzywamy Node 22 LTS (slim).
FROM node:22-slim

WORKDIR /app

# Najpierw zaleznosci (lepsze cache warstw)
COPY package*.json ./
RUN npm install --omit=dev

# Kod aplikacji
COPY . .

# Katalogi na dane i logi
RUN mkdir -p data logs

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "src/server.js"]
