# NachoVPN

Welcome to **NachoVPN**, a desktop application built with **Electron** that provides secure VPN connectivity with user authentication. This project is developed by a team of six first-year students at **Vilnius University**, as part of the **Informational Systems Engineering** course.

> **Note:** This project is currently in **Alpha** stage. The backend has not yet been fully deployed and is intended for development and testing purposes. The final submission deadline is in approximately two weeks, with weekly progress reports.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Team](#team)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Usage](#usage)
  - [Running the Backend](#running-the-backend)
  - [Running the Frontend](#running-the-frontend)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

NachoVPN is a VPN client that not only provides secure connectivity but also incorporates a gamified experience. Users can earn tokens by playing a minigame within the application, which they can redeem for additional VPN access time. The specifics of the minigame are currently under development and will be implemented in the coming weeks.

## Features

- **User Authentication**
  - **Registration:** Create accounts with email and password. Passwords are securely hashed using bcrypt.
  - **Login:** Authenticate users to access the VPN dashboard.

- **VPN Connectivity**
  - Generate OpenVPN configuration files.
  - Save VPN configurations to the user's Documents folder.

- **Gamified Experience**
  - **Minigame:** Earn tokens by playing a minigame. Tokens can be redeemed for extended VPN access time.

- **Responsive UI**
  - Intuitive interface built with HTML, CSS, and JavaScript.
  - Smooth animations and custom styling for enhanced user experience.

- **Cross-Platform Support**
  - Compatible with Windows, macOS, and Linux.
  - Built using Electron for seamless desktop integration.

## Technologies Used

- **Frontend:** Electron, HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** bcrypt
- **Build Tools:** electron-builder, nodemon
- **Styling:** Poppins, Dancing Script fonts

## Team

- **Valentinas Šamatovičius** - Backend, Team Lead
- **Eglė Gurklytė** - Frontend, Jira Management, Weekly Presentations
- **Lukošius Arnas** - Frontend, Documentation
- **Ugnius Pilipavičius** - Backend, Documentation
- **Adomas Lukoševičius** - Server Management, Backend
- **Emilė Kėsaitė** - Frontend
- **Benediktas Juozapaitis** - Consultant (Advisor for Server Management)

## Installation

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MySQL](https://www.mysql.com/) Server

### Backend Setup

1. **Install Dependencies**

    ```bash
    npm install
    ```

2. **Setup Environment Variables**

    Create a `.env` file in the root directory and add the following:

    ```env
    DB_HOST=localhost
    DB_USER=your_mysql_username
    DB_PASSWORD=your_mysql_password
    DB_NAME=login_system
    PORT=3000
    ```

3. **Setup the Database**

    - Ensure MySQL is installed and running.
    - Create a database named `login_system`.
    - Run the necessary SQL scripts to create the required tables. If SQL scripts are not provided, here's a basic example:

      ```sql
      CREATE DATABASE login_system;

      USE login_system;

      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL
      );
      ```

    > **Note:** Update the database schema as needed for the minigame feature.

4. **Server Setup**

    - An OpenVPN Access Server has been configured.
    - The backend code will be manually updated on the server periodically, as this is a minor project.

### Frontend Setup

1. **Install Dependencies**

    The frontend is built with Electron. Ensure all dependencies are installed:

    ```bash
    npm install
    ```

    > **Note:** If the frontend has separate dependencies, navigate to the frontend directory and install them accordingly.

## Usage

### Running the Backend

1. **Start the Backend Server**

    ```bash
    npm run dev
    ```

    This command uses `nodemon` to automatically restart the server on code changes.

    The backend server will run on `http://localhost:3000`.

### Running the Frontend

1. **Start the Electron Application**

    In a new terminal window, run:

    ```bash
    npm start
    ```

    This command launches the Electron app, connecting to the locally running backend server.

2. **Build the Application**

    To build the application for production:

    ```bash
    npm run build
    ```

    The built application will be available in the `dist` folder.

    > **Note:** Ensure the backend is properly deployed and accessible for the frontend to communicate in a production environment.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeature`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/YourFeature`.
5. Open a pull request.

Please ensure your contributions adhere to the project's coding standards and include relevant tests.

## License

This project is licensed under the [MIT License](LICENSE).
