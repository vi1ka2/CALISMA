# CALISMA – Smart Interview Preparation Platform

A full-stack AI-powered interview preparation platform that helps users practice interviews with dynamic, role-specific questions and receive real-time feedback. CALISMA also provides performance analytics, a community forum, and personalized practice recommendations to boost interview readiness.

## ✨ Features
- **User Authentication**: Secure registration and login using JWT.
- **AI-Powered Interview Practice**: Generate interview questions dynamically based on job role, interview level, and company type.
- **Video Interview Simulation**: View your live camera feed (without recording) to simulate a real interview environment.
- **Speech Recognition**: Optional speech-to-text functionality for transcribing spoken answers.
- **Real-Time Feedback**: Get AI-generated feedback and scores for your answers.
- **Performance Analytics**: Visual performance charts, interview history, and an activity calendar to track your progress.
- **Community Forum**: Engage with peers via a dedicated forum with threads, replies, and real-time updates.
- **Profile Management**: View and update your profile, including profile picture uploads.
- **Recommended Practice Topics**: Personalized suggestions based on your interview history.

## 💻 Tech Stack & Architecture
**Frontend:**
- **React.js** – For building the interactive UI.
- **Material UI** – For responsive, creative design components.
- **React Router** – For client-side routing.
- **Axios** – For HTTP requests.
- **Socket.io-client** – For real-time communication (used in the Community Forum).

**Backend:**
- **Node.js & Express.js** – For building RESTful API endpoints.
- **MongoDB** – For data storage (users, answers, threads, etc.).
- **Mongoose** – For modeling MongoDB data.
- **Socket.io** – For real-time messaging (community forum chat).
- **JWT (JSON Web Tokens)** – For securing API endpoints and authentication.

## 🗂️ Project Structure
                                        ┌────────────────────────┐
                                        │    Client (Web/Mobile) │
                                        │────────────────────────│
                                        │ React.js (UI)          │
                                        │ React Router, Context  │
                                        │ Axios for API Calls    │
                                        │ Socket.io-client       │
                                        └────────────┬───────────┘
                                                     │
                                                     ▼
                                        ┌────────────────────────┐
                                        │  API Gateway (Express) │
                                        │────────────────────────│
                                        │  Auth Routes (/api/auth)   │
                                        │  Interview Routes          │
                                        │    - Question Generation   │
                                        │    - Answer Analysis       │
                                        │  Forum Routes (/api/forum) │
                                        │  Friend Management         │
                                        │  Scheduling (Node-cron)    │
                                        │  Socket.io for Real-Time   │
                                        └────────────┬───────────┘
                                                     │
                                                     ▼
                                        ┌────────────────────────┐
                                        │   Business Logic Layer │
                                        │  (Controllers & Models)│
                                        │────────────────────────│
                                        │ - JWT Authentication   │
                                        │ - AI Question Generation│
                                        │ - Performance Analytics │
                                        │ - Data Aggregation      │
                                        └────────────┬───────────┘
                                                     │
                                                     ▼
                                        ┌────────────────────────┐
                                        │       Database         │
                                        │    (MongoDB Atlas)     │
                                        │────────────────────────│
                                        │ Collections:           │
                                        │ - Users                │
                                        │ - Questions            │
                                        │ - Answers              │
                                        │ - Conversations/Messages│
                                        │ - Forum Threads & Replies│
                                        └────────────────────────┘

## 🌐 Deployment
**Frontend:**  
- Deployed on **Netlify**.  

**Backend:**  
- Deployed on **Render**.  
- Environment variables (e.g., `MONGO_URI`, `JWT_SECRET`, etc.) are configured in the deployment dashboard.

**Database:**  
- Using **MongoDB Atlas** free tier for cloud-hosted MongoDB.

## 📡 API Endpoints

**Auth (/api/auth)**
- `POST /register` – Register a new user.
- `POST /login` – Log in and receive a JWT.
- `GET /profile` – Get the authenticated user’s profile.
- `PUT /profile` – Update user profile.

**Interview (/api/questions, /api/answers)**
- `POST /api/questions/generate` – Generate interview questions based on filters.
- `POST /api/answers/analyze` – Submit an answer for AI analysis and feedback.
- `GET /api/answers/user` – Retrieve the user's interview history.

**Forum (/api/forum)**
- `GET /api/forum/threads` – Retrieve all forum threads.
- `GET /api/forum/threads/:id` – Get a specific thread with its messages.
- `POST /api/forum/threads` – Create a new forum thread.
- `POST /api/forum/threads/:id/replies` – Post a reply in a forum thread.

## 📸 Screenshots
![image](https://github.com/user-attachments/assets/f90b7e26-db91-4033-a5aa-76c4fcb2fa4e)
![image](https://github.com/user-attachments/assets/05027efc-29c7-4da7-bd96-cdf8467cbbe0)
![image](https://github.com/user-attachments/assets/b6b3ad27-05fd-48d7-a627-ea5dc8338163)




## 📝 License
This project is licensed under the [MIT License](LICENSE).

## Link 
https://peppy-pony-23cbb4.netlify.app


