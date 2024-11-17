# **Ember** - Photography Skill-Building Platform

**Ember** is a dynamic social media platform designed to inspire and elevate the skills of photography enthusiasts through daily challenges. This application promotes skill improvement, community engagement, and consistent creative practice, enabling users to track and showcase their growth over time. Through interactive features such as themed posts, customisable profiles, ratings, leaderboards, and social connectivity, users can deepen their expertise, receive valuable feedback, and share their artistic journey in an environment centered around creative growth and collaboration.

---

## **Core Features**

### **Sign Up & Log In**
Users can create an account and log in to access all features of the platform. This ensures personalized tracking of their activity, progress, and posts.

### **Daily Skill-Building Themes**
Every day, a new theme is introduced, designed to inspire users and help them explore different aspects of photography. The theme acts as a prompt, encouraging users to try new techniques, explore different subjects, or experiment with unique lighting setups. The daily reset motivates users to engage with the platform and improve their skills over time.

### **Post Once Per Day**
Users can upload one photo per day based on the current theme. The homepage updates daily, showcasing posts that reflect the current challenge. This feature ensures that users stay consistent and engaged while focusing on the daily challenge.

### **Home Page**
The home page displays all the posts made for the current day's theme. It serves as a gallery of inspiration, allowing users to view others' work and get ideas for their own photoshoots. The home page resets every day to display new posts.

### **Profile Page**
Users have a profile page where they can view their post history. This allows them to see how their photography skills have developed over time. The profile serves as a personal gallery and a place to track achievements.

### **Stars for Rating (Implemented, Not Functional Yet)**
The platform has a star rating system, but it is not yet functional. In the future, this feature will allow users to rate others' posts, providing motivation for improvement and recognition within the community. Ratings will be used to inspire users to enhance their skills and compete in a positive and encouraging environment.

### **Leaderboard (Implemented, Not Functional Yet)**
A leaderboard page has been created, but it is not yet functional. This page will eventually highlight top-rated posts, providing additional motivation for users to continue refining their skills. It will showcase the best photos of the day, month, or any other specific time frame, helping users track their progress and gain recognition for their creative work.

### **Friends Page (Implemented, Not Functional Yet)**
The friends page has been set up, but it is not yet functional. When completed, this page will allow users to connect with others and control the visibility of their posts. Users will be able to share their posts privately with friends if they prefer not to share them with the broader community. This feature will help maintain privacy while still engaging with the platform.

---
# Getting Started
Follow these steps to run the project locally.

## Prerequisites (for Windows)
Before running the application, make sure you have the following installed:
1. Download the newest LTS version of Node.js if not already installed:  https://nodejs.org/
2. npm comes bundled with Node.js. You can verify installation by running:
   - bash
   - Copy code
   - node -v
   - npm -v
3. Clone the repository to your local machine:
  - bash
  - Copy code
  - git clone https://github.com/jennieosa/HackSheffield9.git

4. Navigate into the project directory (HackSheffield9)
5. Run the following command to install all necessary dependencies if not already installed:
   - bash
   - Copy code
   - npm install
   - npm install express
   - npm install body-parser
   - npm install bcryptjs
   - npm install cookie-parser
   - npm install multer
   - npm install sqlite3
   - npm install path
   - npm install node-cron
   - npm install ejs
6. Run the Application
  - bash
  - Copy code
  - node server.js
7. This will start the server on port 3000. Open your browser and go to http://localhost:3000/landing to run.
