# Demo1108

This folder contains a simple Express.js server that interacts with a SQLite database to manage feedback for assignments. Below is a description of each file and instructions on how to set up and run the server.

## Files

- [`prompt/demo1108/server_sql.js`](prompt/demo1108/server_sql.js): The main server file that sets up the Express.js server and defines the endpoints for retrieving and updating feedback.
- [`prompt/demo1108/database.js`](prompt/demo1108/database.js): This file contains the code to set up and connect to the SQLite database.
- `public/`: This folder contains static files that are served by the Express.js server.

## Usage

### Prerequisites

- Node.js installed on your machine.
- SQLite installed on your machine.

### Setup

1. Clone the repository or download the files to your local machine.
2. Navigate to the `demo1108` folder in your terminal.
3. Install the required Node.js packages by running:
   ```sh
   npm install
   ```

### Running the Server

Start the server by running:

```sh
node server_sql.js
```

The server will start on port 3000. You can access it at `http://localhost:3000`.

### Endpoints

* **GET /get-feedback/:assignmentId** : Retrieves feedback for a specific assignment, grouped by teacher and sorted by timestamp.
* **Parameters** :

  * `assignmentId` (URL parameter): The ID of the assignment for which feedback is being retrieved.
* **Response** : A JSON object containing the feedback data.
* **POST /update-feedback** : Saves updated feedback for a specific assignment and teacher.
* **Request Body** :

  * `assignment_id` (string): The ID of the assignment.
  * `feedback` (object): An object containing feedback data, where keys are teacher names and values are feedback details.
* **Response** : A JSON object indicating the success or failure of the operation, with a JSON body like:

  ```
  {
    "assignment_id": "A123",
    "feedback": {
      "teacher1": {
        "comment": "Great work!",
        "timestamp": "2023-10-01T12:34:56Z"
      }
    }
  }
  ```
