# Learnity Platform

## Project Overview

Learnity is an educational platform that allows users to create, manage, and access courses. Users can create personal courses or public courses, view available courses, and manage their profiles. The application is built using React for the frontend, Firebase for authentication and database management, and integrates with the YouTube Data API for course content.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **Firebase**: A platform for building web and mobile applications, providing services like authentication, Firestore database, and hosting.
- **JavaScript**: The programming language used for developing the application.
- **YouTube Data API**: Used to fetch course content from YouTube playlists.

## File Structure
learnity-platform/
├── public/
│ ├── index.html
│ └── favicon.ico
├── src/
│ ├── components/
│ │ ├── CourseCreation.js
│ │ ├── CoursesList.js
│ │ ├── CoursePage.js
│ │ ├── Header.js
│ │ └── LecturePage.js
│ ├── firebase.js
│ ├── UserContext.js
│ ├── App.js
│ ├── index.js
│ └── styles.css
├── .env
├── package.json
└── README.md

### File Descriptions

- **public/**: Contains static files, including the main HTML file and favicon.
- **src/**: Contains the source code for the application.
  - **components/**: Contains React components for different parts of the application.
    - **CourseCreation.js**: Component for creating new courses. Allows users to input course details and choose between public and personal courses.
    - **CoursesList.js**: Displays a list of public and personal courses. Filters courses based on their visibility.
    - **CoursePage.js**: Displays details of a specific course, including videos from a YouTube playlist.
    - **Header.js**: Displays the navigation header, including user information and logout functionality.
    - **LecturePage.js**: Displays individual lecture content from a selected course.
  - **firebase.js**: Initializes Firebase services, including Firestore and authentication.
  - **UserContext.js**: Manages user authentication state and provides context to the application.
  - **App.js**: Main application component that sets up routing and context providers.
  - **index.js**: Entry point of the application.
  - **styles.css**: Contains styles for the application.

## Firestore Rules

The following Firestore rules are implemented to manage access to the courses collection:
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /courses/{courseId} {
// Allow read access to public courses for everyone
allow read: if resource.data.isPublic == true || (request.auth != null && request.auth.uid == resource.data.userId);
// Allow write access only to the owner of the course
allow write: if request.auth != null && request.auth.uid == request.resource.data.userId;
}
// Example for a users collection
match /users/{userId} {
// Allow read and write access to the authenticated user only
allow read, write: if request.auth != null && request.auth.uid == userId;
}
}
}


### Explanation of Firestore Rules

- **Public Course Access**: Public courses can be read by anyone, while personal courses can only be accessed by their owners.
- **Write Access**: Only the user who created a course can modify it.
- **User Collection**: Each user can only read and write their own data.

## Implementation Details

### Course Creation

- Users can create a course by providing a title and a YouTube playlist URL.
- Users can choose to make the course public or personal.
- The course data is saved in Firestore, including the user's ID and the visibility status.

### Course Listing

- The application fetches and displays public courses for all users.
- Personal courses are displayed only to the logged-in user.

### User Authentication

- Firebase Authentication is used to manage user sign-up, login, and logout.
- User context is implemented to provide authentication state throughout the application.

### YouTube Data Integration

- The application uses the YouTube Data API to fetch playlist details based on the provided URL.

## Conclusion

The Learnity platform provides a robust solution for managing educational content, allowing users to create and access courses easily. The combination of React, Firebase, and the YouTube Data API creates a seamless user experience.

For further development, consider adding features such as user profiles, course ratings, and comments.
