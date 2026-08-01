import Layout from "./components/common/Layout";
import { createBrowserRouter } from "react-router-dom";
import { AdminPanel } from "./components/admin/AdminPanel";
import LoginPage from "./components/auth/LoginPage";
import MovieDetailPage from "./components/movies/MovieDetailPage";
import MovieGrid from "./components/movies/MovieGrid";
import MyMovies from "./components/movies/MyPurchasedMovies";
import { ResetPassword } from "./components/auth/ResetPassword";
import { ResetPasswordConform } from "./components/auth/ResetPasswordConform";
import TvDetailPage from "./components/tv/TvDetailPage";
import TvGrid from "./components/tv/TvGrid";
import { AdminProtectedRoute } from "./servicies/AdminProtectedRoute";
import { RootLayout } from "./servicies/RootLayout";
import { ReceiptPage } from "./components/receipt/ReceiptPage";
import WatchlistPage from "./components/common/WatchListPage";
import HomePage from "./components/common/HomePage";
import HelpCenterPage from "./components/support/HelpCenterPage";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/", element: <HomePage />
      },
      {
        path: "/help", element: <HelpCenterPage />
      },
      {
        path: '/app',
        element: <Layout />,
        children: [
          { index: true, element: <MovieGrid /> },
          { path: 'discover/movie', element: <MovieGrid /> },
          { path: 'discover/tv', element: <TvGrid /> },
          { path: 'myMovies', element: <MyMovies /> },
          { path: 'watchlist', element: <WatchlistPage /> },
          { path: 'movieDetail/:id', element: <MovieDetailPage /> },
          { path: 'tvDetail/:id', element: <TvDetailPage /> },
        ],
      },
      { path: '/receipt/:paymentId', element: <ReceiptPage /> },
      {
        path: '/adminPanel',
        element: (
          <AdminProtectedRoute>
            <AdminPanel />
          </AdminProtectedRoute>
        ),
      },
    ],
  },
  { path: '/loginPage', element: <LoginPage /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/reset-password-conform', element: <ResetPasswordConform /> },
]);