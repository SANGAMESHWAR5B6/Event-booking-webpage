# Smart Event Booking Portal — TechVille (AENEXZ Tech Major Project)

A pure HTML/CSS/JavaScript single-page application for browsing, booking, and managing event tickets.

## Features
- Dynamic events from LocalStorage (Name, Category, Date, Price, Available Seats)
- Filter by category, sort by date/price, and search
- Booking modal with validation and instant seat updates
- My Bookings view with cancellation (restores seats)
- Hidden Admin Panel (Ctrl + Shift + A) for add/edit/delete + Import/Export JSON
- SPA routing with custom 404 for invalid event routes (#/event/:id)
- Light/Dark theme toggle persisted to LocalStorage
- Responsive design, subtle animations, accessible focus states

## Project Structure
.
├─ index.html    # SPA shell, views, modals, dialogs
├─ styles.css    # Theme, layout, animations, responsiveness
└─ script.js     # Routing, state, LocalStorage, UI logic

## How to Run
Open `index.html` in any modern browser. No server required.

## Admin Shortcut
Press **Ctrl + Shift + A** to open the Admin Panel.

## Data Persistence
LocalStorage keys:
- Events:   `sv_events`
- Bookings: `sv_bookings`
- Theme:    `sv_theme`

## Code Quality
- Consistent formatting and naming
- In-code comments for complex logic
- Modular helper functions and clear state management


🎫 Smart Event Booking Portal – TechVille

Welcome to the Smart Event Booking Portal, a frontend-only major project designed for aspiring developers to gain real-world experience in building responsive and dynamic applications.

This project is part of the AENEXZ Tech Major Project Opportunity and showcases essential frontend development skills using only HTML, CSS, and JavaScript.

🌟 Project Overview

The Smart Event Booking Portal allows users to:

Browse events dynamically

Book tickets with real-time seat validation

Manage bookings (view & cancel)

Enjoy a seamless, responsive, and modern user experience

Admins (via a hidden panel) can:

Add, edit, and delete events

Instantly update event details stored in localStorage

👤 Users

General Users → Browse, book, and manage their events

Admin → Manage event listings through a hidden Admin Panel (keyboard shortcut: Ctrl + Shift + A)

⚙️ Core Features
🔹 Dynamic Home Page

Events displayed with details: Name, Category, Date, Price, and Available Seats

Filter events by category

Sort events by date and price

Event list dynamically generated from localStorage

🔹 Booking Experience

"Book Now" button triggers a modal popup

User enters Name & Number of Tickets

Real-time seat validation before confirming

Available seats instantly updated

Bookings stored in localStorage

🔹 Manage Bookings

Centralized "My Bookings" page

Cancel booking option (restores available seats)

No page reload – updates happen instantly

🔹 Admin Panel

Accessible via Ctrl + Shift + A shortcut

Add, edit, or delete events

Updates reflect immediately across the app

🎨 User Experience Enhancements

Dark Mode / Light Mode toggle (preference saved in localStorage)

Smooth animations for modals, buttons, and hover effects

Fully responsive design for desktop and mobile

Custom 404 Page for invalid event URLs

🛠️ Tech Stack

Frontend Only

HTML5

CSS3 (Flexbox & Grid)

JavaScript (DOM, localStorage, SPA-like navigation)

📂 Project Structure
SmartEventBookingPortal/
│
├── index.html        # Main entry point
├── styles.css        # CSS for styling
├── script.js         # Core JavaScript logic
├── 404.html          # Custom error page
└── README.md         # Project documentation

🚀 How to Run Locally

Clone this repository:

git clone https://github.com/your-username/SmartEventBookingPortal.git


Navigate to project folder:

cd SmartEventBookingPortal


Open index.html in any modern browser.

📸 Screenshots (Optional)

Add screenshots of Home Page, Event Modal, My Bookings, and Admin Panel for better presentation.

✨ Learning Outcomes

✔️ Hands-on practice with HTML, CSS, and JavaScript
✔️ Experience building a Single Page Application feel without frameworks
✔️ Skills in localStorage data handling
✔️ Professional project structure & documentation

📌 Future Enhancements

Event search bar

Multiple user logins

Export bookings as PDF

