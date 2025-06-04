# Resource Management System

A full-stack application for managing engineering team assignments across projects. Track who's working on what, their capacity allocation, and when they'll be available for new projects.

## Features

### Core Features

1. **Authentication & User Roles**

   - Login system with two roles: Manager and Engineer
   - Engineers can view their assignments
   - Managers can assign people to projects

2. **Engineer Management**

   - Engineer Profile: Name, skills (React, Node.js, Python, etc.), seniority level
   - Employment Type: Full-time (100% capacity) or Part-time (50% capacity)
   - Current Status: Available percentage (e.g., 60% allocated, 40% available)

3. **Project Management**

   - Basic Project Info: Name, description, start/end dates, required team size
   - Required Skills: What technologies/skills the project needs
   - Project Status: Active, Planning, Completed

4. **Assignment System**

   - Assign Engineers to Projects: Select engineer, project, allocation percentage
   - View Current Assignments: Who's working on which project and for how long
   - Capacity Tracking: Visual indicator of each engineer's current workload

5. **Dashboard Views**

   - Manager Dashboard: Team overview, who's overloaded/underutilized
   - Engineer Dashboard: My current projects and upcoming assignments
   - Availability Planning: When will engineers be free for new projects

6. **Search & Analytics**
   - Search & Filter: Find engineers by skills or projects by status
   - Analytics: Simple charts showing team utilization

## Tech Stack

### Frontend

- **React** with TypeScript
- **Vite** for build tooling
- **ShadCN UI** components with Tailwind CSS
- **React Hook Form** for form management
- **Recharts** for data visualization
- **React Router** for navigation
- **Axios** for API calls

### Backend

- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd resource-management-system
   \`\`\`

2. **Backend Setup**
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

3. **Frontend Setup**
   \`\`\`bash
   cd frontend
   npm install
   \`\`\`

4. **Environment Variables**
   Create a `.env` file in the backend directory:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/resource-management
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   PORT=5000
   \`\`\`

5. **Seed the Database**
   \`\`\`bash
   cd backend
   npm run seed
   \`\`\`

6. **Start the Application**

   Backend (Terminal 1):
   \`\`\`bash
   cd backend
   npm run dev
   \`\`\`

   Frontend (Terminal 2):
   \`\`\`bash
   cd frontend
   npm run dev
   \`\`\`

7. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Demo Credentials

After running the seed script, you can use these credentials:

**Manager:**

- Email: manager@company.com
- Password: password123

**Engineers:**

- Email: anita@company.com / Password: password123

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### Engineers

- `GET /api/engineers` - Get all engineers
- `GET /api/engineers/:id/capacity` - Get engineer capacity
- `PUT /api/engineers/:id` - Update engineer profile

### Projects

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project (managers only)
- `GET /api/projects/:id` - Get single project
- `PUT /api/projects/:id` - Update project (managers only)

### Assignments

- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create new assignment (managers only)
- `PUT /api/assignments/:id` - Update assignment (managers only)
- `DELETE /api/assignments/:id` - Delete assignment (managers only)

## Database Schema

### User

\`\`\`javascript
{
email: String,
name: String,
role: 'engineer' | 'manager',
skills: [String], // Array of skills
seniority: 'junior' | 'mid' | 'senior',
maxCapacity: Number, // 100 for full-time, 50 for part-time
department: String
}
\`\`\`

### Project

\`\`\`javascript
{
name: String,
description: String,
startDate: Date,
endDate: Date,
requiredSkills: [String],
teamSize: Number,
status: 'planning' | 'active' | 'completed',
managerId: ObjectId
}
\`\`\`

### Assignment

\`\`\`javascript
{
engineerId: ObjectId,
projectId: ObjectId,
allocationPercentage: Number, // 0-100
startDate: Date,
endDate: Date,
role: String // 'Developer', 'Tech Lead', etc.
}
\`\`\`

## Key Features Explained

### Capacity Management

The system automatically calculates available capacity for each engineer:

- Engineers have a maximum capacity (100% for full-time, 50% for part-time)
- Active assignments reduce available capacity
- Visual progress bars show current utilization
- Prevents over-allocation when creating assignments

### Skill Matching

- Projects define required skills
- Engineers list their skills
- System can find suitable engineers for projects
- Skill-based filtering and search

### Role-Based Access

- **Managers**: Full access to create projects, assignments, view all data
- **Engineers**: View their own assignments and profile, limited editing

### Real-time Calculations

- Capacity calculations happen in real-time
- Dashboard shows current team utilization
- Assignment conflicts are prevented

## Development

### Project Structure

\`\`\`
resource-management-system/
├── backend/
│ ├── models/ # Database models
│ ├── routes/ # API routes
│ ├── middleware/ # Authentication middleware
│ ├── scripts/ # Seed data script
│ └── server.js # Main server file
├── frontend/
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── pages/ # Page components
│ │ ├── contexts/ # React contexts
│ │ └── lib/ # Utilities
│ └── public/ # Static assets
└── README.md
\`\`\`

### Available Scripts

**Backend:**

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

**Frontend:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## AI Tools Used

I used ChatGPT (free version) to help me write code snippets, understand concepts, and get ideas on how to structure my project.

## How AI Helped Me

ChatGPT helped me write React components and backend routes faster.
It gave me examples of how to use libraries like React Hook Form and helped me write and understand TypeScript code throughout the project.
I used it to clarify difficult concepts and get solutions when I was stuck.

## Challenges with AI-Generated Code

Sometimes, the code suggestions were not fully correct or up-to-date.
At times, ChatGPT missed some important details or edge cases.

## How I Handled These Challenges

I checked the official documentation to verify the code.
I tested the code myself to make sure it worked as expected.
I learned to understand the code instead of just copying it.

## License

This project is licensed under the MIT License.
