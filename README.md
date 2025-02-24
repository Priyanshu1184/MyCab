# Clone

## Introduction
This project consists of both client and server components. Follow the instructions below to get started with each part.

## Getting Started

### Prerequisites
Make sure you have the following installed:
- Node.js
- npm (Node Package Manager)
- Any other dependencies specific to your project

### Client Setup
1. Navigate to the client directory:
    ```sh
    cd path/to/client
    ```
2. Install the dependencies:
    ```sh
    npm install
    ```
3. Start the client:
    ```sh
    npm start
    ```

### Server Setup
1. Navigate to the server directory:
    ```sh
    cd path/to/server
    ```
2. Install the dependencies:
    ```sh
    npm install
    ```
3. Start the server:
    ```sh
    npm start
    ```

### Environment Variables
Create a `.env` file in both the client and server directories with the following variables:

#### Client
```
VITE_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

#### Server
```
PORT=4000
DB_CONNECT=mongodb://localhost:27017/your-database
JWT_SECRET=your_jwt_secret
GOOGLE_MAPS_API=your_google_maps_api_key
```

## Project Structure
The project consists of the following main directories and files:

- `client/`: Contains the client-side code.
- `server/`: Contains the server-side code.
- `README.md`: This file, which provides an overview of the project and instructions for getting started.

## Additional Information
- Ensure that both the client and server are running simultaneously for the project to function correctly.
- Refer to the documentation within each directory for more detailed information on the code and its functionality.

## License
This project is licensed under the MIT License.

## Contact
For any questions or issues, please contact [Your Name] at [your.email@example.com].
