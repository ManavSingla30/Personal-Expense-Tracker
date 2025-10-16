import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignUp.jsx'
import AddExpensePage from './pages/AddExpensePage.jsx'
import ExpenseListPage from './pages/ExpenseListPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import { Edit } from 'lucide-react'
import EditExpensePage from './pages/EditExpensepage.jsx'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/signup',
    element: <SignupPage />
  },
  {
    path: '/',
    element: (
        <App />
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />
      },
      {
        path: 'add-expense',
        element: <AddExpensePage/>
      },
      {
        path: 'expenses',
        element: <ExpenseListPage/>
      },
      {
        path: 'reports',
        element: <ReportsPage/>
      },
      {
        path: 'edit-expense',
        element: <EditExpensePage/>
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)