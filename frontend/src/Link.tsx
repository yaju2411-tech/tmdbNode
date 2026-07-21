import Layout from "./components/Layout";
import { createBrowserRouter } from "react-router-dom";
import { AdminPanel } from "./components/admin/AdminPanel";
import LoginPage from "./components/LoginPage";
import MovieDetailPage from "./components/MovieDetailPage";
import MovieGrid from "./components/MovieGrid";
import MyMovies from "./components/MyPurchasedMovies";
import { ResetPassword } from "./components/ResetPassword";
import { ResetPasswordConform } from "./components/ResetPasswordConform";
import TvDetailPage from "./components/TvDetailPage";
import TvGrid from "./components/TvGrid";
import { AdminProtectedRoute } from "./servicies/AdminProtectedRoute";
import { RootLayout } from "./servicies/RootLayout";
import React from "react";
import { ReceiptPage } from './components/ReceiptPage'
import WatchlistPage from "./components/WatchListPage";
import HomePage from "./components/HomePage";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/", element: <HomePage />
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