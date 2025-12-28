
# 🏠 RoomieMatch: AI-Powered Roommate Discovery

RoomieMatch is a full-stack mobile application designed to simplify the stressful process of finding compatible roommates and flatmates. By combining a **Tinder-style swipe interface** with a **Machine Learning recommendation engine**, RoomieMatch moves beyond simple filtering to provide high-compatibility suggestions based on lifestyle, budget, and location.

## 🚀 Key Features

* **Swipe-to-Match:** Intuitive UI for browsing potential roommates or available rooms.
* **Smart Profiles:** Detailed user profiles including education, career, lifestyle habits, and specific roommate requirements.
* **Dynamic Filtering:** Filter by City, University, Utilities, Price Range, and Neighborhood.
* **Google Maps Integration:** Visualize apartment locations and proximity to key landmarks or universities.
* **AI Matching Engine:** A hybrid recommendation system that learns user preferences over time.
* **Real-time Visualization:** Data dashboards for users to see market trends (price averages in specific areas).

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React Native, Expo, Redux Toolkit |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (NoSQL) |
| **Machine Learning** | Python (Scikit-learn, Pandas, NumPy) |
| **Data Visualization** | Matplotlib, Seaborn (for analysis), Victory Native (for in-app charts) |
| **APIs** | Google Maps Platform (Places, Geocoding, Maps SDK) |

---

## 🧠 The Matching Algorithm

To provide "Solid" matching, RoomieMatch uses a **Hybrid Collaborative Filtering & Content-Based Model**.

### 1. Vector Space Modeling (Content-Based)

Each user profile is converted into a feature vector. We use **Cosine Similarity** to calculate the distance between a user's requirements () and a potential roommate's profile ().

### 2. Big Data & Clustering

We utilize **K-Means Clustering** to group users into "Lifestyle Archetypes" (e.g., "The Studious Night Owl," "The Social Professional"). This allows the algorithm to suggest users within the same cluster even if they haven't explicitly "liked" each other yet.

---

## 📊 Data Analysis & Visualization

The project includes a dedicated data pipeline to analyze housing trends:

* **Exploratory Data Analysis (EDA):** Using `Matplotlib` to visualize price distribution across different neighborhoods.
* **Requirement Correlation:** Heatmaps showing the correlation between price points and amenities (e.g., Wi-Fi, Gym, AC).
* **Model Performance:** Confusion matrices and ROC curves to validate the matching algorithm's accuracy.

---

## 🏗 System Architecture

1. **Client Layer:** Expo-based React Native app handling Geolocation and UI interactions.
2. **API Layer:** RESTful API built with Express, managing JWT authentication and CRUD operations.
3. **Intelligence Layer:** A Flask/FastAPI service that hosts the Scikit-learn model. It receives user vectors and returns a list of "High-Probability" matches.
4. **Data Layer:** MongoDB stores flexible user documents, allowing for varied profile attributes without rigid schema constraints.

---

## 🚦 Getting Started

### Prerequisites

* Node.js (v16+)
* Python 3.8+
* Expo CLI
* MongoDB Atlas Account

### Installation

1. **Clone the Repo**
```bash
git clone https://github.com/yourusername/RoomieMatch.git

```


2. **Setup Backend**
```bash
cd backend
npm install
npm start

```


3. **Setup ML Service**
```bash
cd ml-service
pip install -r requirements.txt
python app.py

```


4. **Setup Frontend**
```bash
cd frontend
npm install
npx expo start

```



---

## 🗺 Roadmap

* [ ] Integration of Real-time Chat using Socket.io.
* [ ] In-app Identity Verification (KYC).
* [ ] Deep Learning (Neural Collaborative Filtering) for improved matching.
* [ ] Support for 3D Virtual Room Tours.

---

**Would you like me to generate the Python script for the Scikit-learn Matching Model to get your ML service started?**
