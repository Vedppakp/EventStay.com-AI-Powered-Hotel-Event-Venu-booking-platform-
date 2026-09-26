# EventStay — Hotel, Venue & Event Booking Platform

An all-in-one MERN marketplace combining **Booking.com + Airbnb + Eventbrite**, tailored for hotels, event venues (banquets, wedding lawns, palaces), and event vendors (catering, decoration, photography, DJ sound, guest rooms).

---

## 💻 Running in VS Code (Quick Guide)

### Method 1: Automatic 1-Click Startup (Recommended)
1. Open this project folder in **VS Code**:
   - `File` → `Open Folder...` → Select `D:\Hotel & Event Booking Platform`
2. Press **`Ctrl + Shift + B`** (or go to menu **Terminal** → **Run Build Task...**)
3. Choose **`Start EventStay (Full Stack)`**
   - This automatically launches both the **Backend API (port 5000)** and **Frontend (port 3000)** in parallel dedicated terminal panels.
4. Open your browser to **[http://localhost:3000](http://localhost:3000)**.

---

### Method 2: Manual Integrated Terminals in VS Code

Open VS Code's integrated terminal (`Ctrl + ~`) and open two tabs:

#### Tab 1: Backend Server
```powershell
cd backend
node server.js
```
*API will run on `http://localhost:5000` with connected MongoDB.*

#### Tab 2: Frontend Client
```powershell
cd frontend
npm.cmd run dev
```
*(or `node node_modules/vite/bin/vite.js`)*
*Web App will run on `http://localhost:3000`.*

---

## 🗄️ Re-seeding Database (Optional)
If you ever want to reset the database back to clean realistic demo data:
```powershell
cd backend
node seed/seedData.js
```

---

## 👥 Demo User Accounts (1-Click Switcher Available in UI)
You can switch roles directly from the top bar in the app:
- **👤 Customer**: `customer@eventstay.com` / `password123`
- **🏨 Venue Owner**: `owner@eventstay.com` / `password123`
- **👨‍💼 Admin**: `admin@eventstay.com` / `password123`
