# EcoScan - Smart Recycling Assistant 🌿

EcoScan is a web application designed to promote environmental awareness and simplify the recycling process. Scan a product's barcode, learn about its environmental impact and recycling category, and find the nearest appropriate recycling bins on an interactive map. 

🏆 **This project was developed for the SWM Hackathon and proudly secured 1st place at the event.** 🏆

## Overview

In today's world, proper waste disposal and recycling are crucial. EcoScan aims to make this process easier and more informative for everyone. By simply scanning a product's barcode using your device's camera, you can:

1.  **Identify the Product:** Get details like name and image.
2.  **Understand its Recyclability:** See the assigned recycling category (e.g., plastic, glass, paper), GreenScore, and carbon footprint.
3.  **Contribute Data:** If a category is missing, you can help improve the database by suggesting one. The app also tracks how many times a product has been verified.
4.  **Find Nearby Bins:** Use the "Navigate" feature to open a map showing your current location and the locations of nearby recycling bins suitable for the scanned product's category.

EcoScan empowers users to make more informed decisions about waste disposal, contributing to a cleaner environment.

## Screenshots

<div align="center">
  
  | Home Screen | Barcode Scanner |
  | :---------: | :-------------: |
  | <img src="https://github.com/user-attachments/assets/571859cc-fcbe-4fcb-a143-394b3de9fa0f" alt="Home" height="600"> | <img src="https://github.com/user-attachments/assets/3183293c-45b7-42d5-a88d-e5ff711164ec" alt="Scanner" height="600"> |
  
  | Product Details | Adding Category | Recycling Bin Map |
  | :-------------: | :-------------: | :---------------: |
  | <img src="https://github.com/user-attachments/assets/b4b6b7a0-2610-4fd3-bb87-2e1faf3f60c3" alt="Details" height="600"> | <img src="https://github.com/user-attachments/assets/5c9c0b77-affd-4a85-b5dd-e1b91f928233" alt="Add Category" height="600"> | <img src="https://github.com/user-attachments/assets/95d5c013-1398-4186-a259-6540c6f59ab7" alt="Map" height="600"> |

</div>

## Features

✨ **Barcode Scanning:** Utilizes the device camera to scan EAN barcodes via `react-qr-barcode-scanner`.

📊 **Product Information:** Displays detailed product information fetched from the backend API, including:
  - Name & Image
  - Recycling Category (e.g., Plastic, Glass, Paper, Metal, Bio)
  - Product Type
  - Barcode Number
  - GreenScore (if available)
  - Carbon Footprint (if available)
  - Verification Count (community contribution indicator)
    
➕ **Category Suggestion:** Allows users to select and assign a recycling category if one is not already present for the product.

🗺️ **Interactive Map:** Integrates with Leaflet (`react-leaflet`) to display:
  - User's current location (obtained via Browser Geolocation API).
  - Nearby recycling bins relevant to the product's category, fetched dynamically based on user location.
  - Custom map markers color-coded by bin type.

↩️ **Navigation:** Uses `react-router-dom` for seamless page transitions between the home screen, product page, and map view.

## Technologies Used

-   **Frontend Framework:** React
-   **Language:** TypeScript
-   **UI Library:** Shadcn/ui (built on Radix UI & Tailwind CSS)
-   **Styling:** Tailwind CSS, Global CSS (`App.css`)
-   **Routing:** React Router (`react-router-dom`)
-   **State Management:** React Hooks (`useState`, `useEffect`)
-   **Mapping:** Leaflet, React Leaflet
-   **Barcode Scanning:** `react-qr-barcode-scanner`
-   **API Communication:** Fetch API
-   **Build Tool:** Vite (Likely, based on typical React/TS setups) or Create React App

## Backend API

This frontend application communicates with a separate backend service responsible for:

1.  **Managing Product Data:** Stores and retrieves product information (name, recycling type, barcode, etc.) using a **Python FastAPI** server connected to a **SQLite** database (`waste.db`). It can fetch existing products by barcode or create new entries if a scanned product is not found.
2.  **Finding Recycling Bins:** Uses the **Overpass API** to fetch locations of nearby recycling bins based on the user's geographic coordinates and the required recycling category (e.g., plastic, glass). The search is currently focused on the **Kraków** area.

### Key Technologies:

*   **Language/Framework:** Python, FastAPI
*   **Database:** SQLite
*   **External APIs:** Overpass API (for map data)

## Usage

1.  Open the application in your browser.
2.  Click the "Skanuj teraz!" button on the home page.
3.  Grant camera permissions if prompted.
4.  Align the product's barcode within the scanner view.
5.  Once scanned, you will be redirected to the Product Page displaying its details.
6.  If the category is missing, click "+ Dodaj kategorię", select the appropriate category from the dialog, and confirm.
7.  Click the "Nawiguj" button.
8.  Grant location permissions if prompted.
9.  The map will load, showing your location and nearby recycling bins suitable for the product.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details (or state it directly if no file exists).
