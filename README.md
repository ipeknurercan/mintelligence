
# 🧠 Mintelligence

**Mintelligence** is a Web3-powered **learn-to-earn** platform where users solve quizzes to earn **tokens**, mint **NFT certificates**, and track progress using their **Stellar Freighter Wallet**.

---

## 📌 Project Description

Mintelligence aims to make learning more engaging and rewarding by leveraging blockchain technology.  
Users are rewarded with tokens and NFTs for successfully answering quiz questions.  
The system is built with **React/Next.js** on the frontend and **Soroban smart contracts** deployed to the **Stellar Testnet**.

---

## ⚙️ Tech Stack

- **Frontend**: React, Next.js, TailwindCSS, Freighter Wallet Integration
- **Blockchain**: Stellar Soroban SDK, Testnet Deployment
- **Auth & Identity**: Freighter Wallet, Passkeys (Prototype)
- **Optional Backend**: Node.js or Serverless Functions (API layer)

---

## 🚀 Getting Started

### 1. Clone the Project

```bash
git clone https://github.com/your-org/mintelligence.git
cd mintelligence
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

> Then visit: [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Available NPM Scripts

| Command           | Description                          |
|------------------|--------------------------------------|
| `npm run dev`     | Runs the app in development mode     |
| `npm run build`   | Builds the app for production        |
| `npm run start`   | Starts the production server         |
| `npm run lint`    | Lints the code using ESLint          |
| `npm run format`  | (If configured) Formats codebase     |

---

## 🔗 Freighter Wallet Integration

We integrated **Freighter Wallet** to enable users to interact with the Stellar blockchain.

- Users securely connect their wallet from the frontend.
- All quiz rewards (token/NFT) are sent directly to their wallet.
- Wallet must be switched to **Testnet Mode**.
- Transactions are executed using **Soroban smart contracts**.

> 🔗 [Download Freighter Wallet](https://freighter.stellar.org)

---

## 📦 Smart Contracts (Soroban)

Smart contracts are located in the `/contracts` folder.

### 🧪 Deploy a Contract

```bash
# 1. Build the contract
cargo build --target wasm32-unknown-unknown --release

# 2. Deploy to Stellar Testnet
soroban contract deploy   --wasm target/wasm32-unknown-unknown/release/your_contract.wasm   --network testnet
```

### 🔧 Invoke a Contract Method

```bash
soroban contract invoke   --id <CONTRACT_ID>   --fn <METHOD_NAME>   --network testnet   --arg1 <value> ...
```

> Make sure Soroban CLI is installed and the testnet is configured using:
> 
```bash
soroban config network add testnet   --rpc-url https://rpc-futurenet.stellar.org   --network-passphrase "Test SDF Future Network ; October 2022"
```

---

## 📊 Features

- 🔐 Freighter Wallet connection
- 🧠 Interactive quiz system
- 💰 Token rewards through Soroban smart contracts
- 🖼 NFT certificate minting per course
- 📈 Real-time token/NFT updates on UI
- 📱 Fully responsive & mobile-friendly design
- 🔒 Prototype support for Passkeys (WebAuthn)

---

## 👥 Project Team

| Name   | Role & Contributions |
|--------|----------------------|
| **İpek**   | Frontend development, Freighter Wallet integration, UI/UX design, Passkeys R&D, deployment |
| **Nur**    | Smart contract development using Soroban SDK, Stellar testnet deployment, blockchain logic |
| **Zeynep** | Backend setup, GitHub repo organization, documentation, project narrative & presentation |

---

## 🌍 Live Demo

🔗 [https://mintelligence.vercel.app](https://mintelligence.vercel.app) *(replace with actual URL if needed)*

---

## 🎯 Why Mintelligence?

> Mintelligence combines education, gamification, and blockchain to make learning measurable and rewarding.

### Benefits for Users:
- Learn by doing — and get rewarded!
- NFTs act as proof-of-completion certificates.
- Wallet-based login introduces users to Web3 in a safe and practical context.

### Benefits for Stellar:
- Showcases real-world use of **Soroban smart contracts** in education.
- Demonstrates how **Freighter Wallet** and **Passkeys** can improve onboarding.
- Expands Stellar’s utility beyond finance into **learn-to-earn** models.

---

## 📄 License

This project is licensed under the **MIT License**.  
See the [`LICENSE`](./LICENSE) file for more information.

---

## 🤝 Contributing

We welcome contributions!

```bash
# 1. Fork the repo
# 2. Create your branch
git checkout -b feature/your-feature-name

# 3. Make changes and commit
git commit -m "Add your message"

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

Please open an issue first for major changes or discussions.

---

## 📬 Contact

📧 Email: `team@mintelligence.xyz`  
🌐 GitHub: [github.com/your-org/mintelligence](https://github.com/your-org/mintelligence)

---
